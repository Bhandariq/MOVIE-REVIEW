const mongoose = require('mongoose');
const axios = require('axios');
const cheerio = require('cheerio');
const dotenv = require('dotenv');
const Movie = require('../models/Movie');
const { fetchMoviePoster, getFullMovieDetailsFromTMDB } = require('./imageFetcher');

dotenv.config();

// Connect to MongoDB
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/movie-review';
mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// TMDB API configuration (optional - for getting movie details)
const TMDB_API_KEY = process.env.TMDB_API_KEY || '';

// Function to parse movie title and year from text
function parseMovieInfo(text) {
  // Clean up the text - remove quality indicators and extra info
  let cleanText = text
    .replace(/\[.*?\]/g, '') // Remove [BRRip], [DVDRip], etc.
    .replace(/\(.*?\)/g, '') // Remove (Hindi), (ORG-DD5.1), etc.
    .replace(/WEB-DL|HDRip|CAMRip|720p|480p|1080p|WEBRip/gi, '') // Remove quality indicators
    .replace(/\s+/g, ' ') // Multiple spaces to single
    .trim();

  // Patterns to extract title and year
  const patterns = [
    /^(.+?)\s+(\d{4})\s*$/,  // "Title 2024"
    /^(.+?)\s+\((\d{4})\)/,  // "Title (2024)"
    /^(.+?)\s+(\d{4})/,       // "Title 2024" with more text
  ];

  for (const pattern of patterns) {
    const match = cleanText.match(pattern);
    if (match) {
      return {
        title: match[1].trim(),
        year: parseInt(match[2])
      };
    }
  }

  // Try to extract year from anywhere in the string
  const yearMatch = cleanText.match(/\b(19|20)\d{2}\b/);
  if (yearMatch) {
    const year = parseInt(yearMatch[0]);
    const title = cleanText.replace(/\s*\d{4}.*$/, '').trim();
    if (title.length > 0) {
      return { title, year };
    }
  }

  return null;
}

// Function to scrape Bollywood movies from dotmovies.onl
async function scrapeBollywoodMovies(url, limit = 50) {
  try {
    console.log(`🌐 Fetching Bollywood movies from ${url}...`);
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      },
      timeout: 30000
    });

    const $ = cheerio.load(response.data);
    const movies = [];
    const seen = new Set();

    // Look for movie titles in h2, h3, h4 tags and article titles
    $('h2, h3, h4, .entry-title, .post-title, article h2, article h3').each((i, elem) => {
      if (movies.length >= limit) return false;

      const text = $(elem).text().trim();
      const movieInfo = parseMovieInfo(text);

      if (movieInfo && movieInfo.title && movieInfo.year) {
        const key = `${movieInfo.title.toLowerCase()}_${movieInfo.year}`;
        if (!seen.has(key)) {
          seen.add(key);
          movies.push({
            title: movieInfo.title,
            year: movieInfo.year,
            genre: ['Drama'] // Default for Bollywood, will be enriched by TMDB if available
          });
        }
      }
    });

    // Also check for links
    $('a').each((i, elem) => {
      if (movies.length >= limit) return false;

      const text = $(elem).text().trim();
      const movieInfo = parseMovieInfo(text);

      if (movieInfo && movieInfo.title && movieInfo.year) {
        const key = `${movieInfo.title.toLowerCase()}_${movieInfo.year}`;
        if (!seen.has(key) && movieInfo.title.length > 2) {
          seen.add(key);
          movies.push({
            title: movieInfo.title,
            year: movieInfo.year,
            genre: ['Drama']
          });
        }
      }
    });

    console.log(`✅ Found ${movies.length} unique Bollywood movies`);
    return movies;
  } catch (error) {
    console.error('❌ Error scraping movies:', error.message);
    if (error.response) {
      console.error(`   Status: ${error.response.status}`);
    }
    return [];
  }
}

// Function to add movie to database
async function addMovieToDatabase(movieData) {
  try {
    // Check if movie already exists
    const existing = await Movie.findOne({
      title: { $regex: new RegExp(`^${movieData.title}$`, 'i') },
      year: movieData.year
    });

    if (existing) {
      console.log(`⏭️  Skipping ${movieData.title} (${movieData.year}) - already exists`);
      return null;
    }

    // Try to get movie data with poster automatically
    let movieInfo = null;
    
    // First try to get full details from TMDB
    if (TMDB_API_KEY) {
      movieInfo = await getFullMovieDetailsFromTMDB(movieData.title, movieData.year);
    }
    
    // If no TMDB data or no poster, try fetching poster from multiple sources
    if (!movieInfo || !movieInfo.poster) {
      const posterData = await fetchMoviePoster(movieData.title, movieData.year);
      if (posterData) {
        movieInfo = {
          ...movieInfo,
          poster: posterData.poster,
          description: movieInfo?.description || posterData.description,
          genres: movieInfo?.genres || posterData.genres,
          director: movieInfo?.director || posterData.director
        };
      }
    }

    // Create movie object
    const movie = new Movie({
      title: movieData.title,
      year: movieData.year,
      genre: movieInfo?.genres?.length > 0 ? movieInfo.genres : movieData.genre,
      director: movieInfo?.director || 'Unknown Director',
      description: movieInfo?.description || `A ${movieData.year} Bollywood ${movieData.genre[0]} film.`,
      poster: movieInfo?.poster || 'https://via.placeholder.com/300x450?text=No+Poster'
    });

    await movie.save();
    console.log(`✅ Added: ${movie.title} (${movie.year})`);
    return movie;
  } catch (error) {
    console.error(`❌ Error adding ${movieData.title}:`, error.message);
    return null;
  }
}

// Main function
async function main() {
  const url = process.argv[2] || 'https://dotmovies.onl/bollywood-movies/1080p-bollywood-movies-dvdrip-brrip/';
  const limit = parseInt(process.argv[3]) || 50;

  console.log('🚀 Starting Bollywood movie import from dotmovies.onl...\n');
  console.log(`📄 URL: ${url}`);
  console.log(`📊 Limit: ${limit} movies\n`);

  // Scrape movies from the website
  const movies = await scrapeBollywoodMovies(url, limit);

  if (movies.length === 0) {
    console.log('❌ No movies found. Please check the website structure.');
    process.exit(1);
  }

  console.log(`\n📝 Processing ${movies.length} movies...\n`);

  // Add movies to database
  let added = 0;
  let skipped = 0;

  for (const movie of movies) {
    const result = await addMovieToDatabase(movie);
    if (result) {
      added++;
    } else {
      skipped++;
    }
    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log(`\n✨ Import complete!`);
  console.log(`   ✅ Added: ${added} movies`);
  console.log(`   ⏭️  Skipped: ${skipped} movies (already exist)`);

  mongoose.connection.close();
  process.exit(0);
}

// Run the script
main().catch(error => {
  console.error('❌ Fatal error:', error);
  mongoose.connection.close();
  process.exit(1);
});

