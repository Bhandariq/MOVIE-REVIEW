const mongoose = require('mongoose');
const axios = require('axios');
const cheerio = require('cheerio');
const dotenv = require('dotenv');
const Movie = require('../models/Movie');

dotenv.config();

// Connect to MongoDB
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/movie-review';
mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// TMDB API configuration (optional - for getting movie details)
const TMDB_API_KEY = process.env.TMDB_API_KEY || ''; // You can get free API key from https://www.themoviedb.org/settings/api
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

// Function to search movie on TMDB
async function searchMovieOnTMDB(title, year) {
  if (!TMDB_API_KEY) {
    return null;
  }

  try {
    const response = await axios.get(`${TMDB_BASE_URL}/search/movie`, {
      params: {
        api_key: TMDB_API_KEY,
        query: title,
        year: year
      }
    });

    if (response.data.results && response.data.results.length > 0) {
      const movie = response.data.results[0];
      return {
        tmdbId: movie.id,
        poster: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : null,
        description: movie.overview || 'No description available',
        genre: movie.genre_ids || []
      };
    }
    return null;
  } catch (error) {
    console.error(`Error searching TMDB for ${title}:`, error.message);
    return null;
  }
}

// Function to get movie details from TMDB
async function getMovieDetailsFromTMDB(tmdbId) {
  if (!TMDB_API_KEY || !tmdbId) {
    return null;
  }

  try {
    const response = await axios.get(`${TMDB_BASE_URL}/movie/${tmdbId}`, {
      params: {
        api_key: TMDB_API_KEY
      }
    });

    const movie = response.data;
    const genreMap = {
      28: 'Action', 12: 'Adventure', 16: 'Animation', 35: 'Comedy',
      80: 'Crime', 99: 'Documentary', 18: 'Drama', 10751: 'Family',
      14: 'Fantasy', 36: 'History', 27: 'Horror', 10402: 'Musical',
      9648: 'Mystery', 10749: 'Romance', 878: 'Sci-Fi', 10770: 'TV Movie',
      53: 'Thriller', 10752: 'War', 37: 'Western'
    };

    return {
      director: movie.credits?.crew?.find(c => c.job === 'Director')?.name || 'Unknown Director',
      genres: movie.genres?.map(g => g.name) || [],
      description: movie.overview || 'No description available',
      poster: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : null
    };
  } catch (error) {
    console.error(`Error getting TMDB details for ${tmdbId}:`, error.message);
    return null;
  }
}

// Function to parse movie title and year from text
function parseMovieInfo(text) {
  // Pattern: "Movie Title YYYY" or "Movie Title (YYYY)"
  const patterns = [
    /^(.+?)\s+(\d{4})\s/,  // "Title 2025"
    /^(.+?)\s+\((\d{4})\)/, // "Title (2025)"
    /^(.+?)\s+(\d{4})$/,    // "Title 2025" at end
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      return {
        title: match[1].trim(),
        year: parseInt(match[2])
      };
    }
  }

  // Try to extract year from anywhere in the string
  const yearMatch = text.match(/\b(19|20)\d{2}\b/);
  if (yearMatch) {
    const year = parseInt(yearMatch[0]);
    const title = text.replace(/\s*\d{4}.*$/, '').trim();
    return { title, year };
  }

  return null;
}

// Function to extract genre from URL or text
function extractGenreFromText(text) {
  const genreKeywords = {
    'action': 'Action',
    'adventure': 'Adventure',
    'animation': 'Animation',
    'comedy': 'Comedy',
    'crime': 'Crime',
    'documentary': 'Documentary',
    'drama': 'Drama',
    'family': 'Family',
    'fantasy': 'Fantasy',
    'history': 'History',
    'horror': 'Horror',
    'musical': 'Musical',
    'mystery': 'Mystery',
    'romance': 'Romance',
    'sci-fi': 'Sci-Fi',
    'thriller': 'Thriller',
    'war': 'War'
  };

  const lowerText = text.toLowerCase();
  for (const [key, genre] of Object.entries(genreKeywords)) {
    if (lowerText.includes(key)) {
      return genre;
    }
  }
  return 'Drama'; // Default genre
}

// Function to scrape movies from dotmovies.onl
async function scrapeMoviesFromDotMovies(url = 'https://dotmovies.onl/', limit = 20) {
  try {
    console.log(`🌐 Fetching movies from ${url}...`);
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    const $ = cheerio.load(response.data);
    const movies = [];

    // Look for movie titles in various HTML structures
    $('h2, h3, h4, .entry-title, .post-title, article h2').each((i, elem) => {
      if (movies.length >= limit) return false;

      const text = $(elem).text().trim();
      const movieInfo = parseMovieInfo(text);

      if (movieInfo && movieInfo.title && movieInfo.year) {
        // Try to find genre from parent elements or URL
        const genre = extractGenreFromText(text);
        
        movies.push({
          title: movieInfo.title,
          year: movieInfo.year,
          genre: [genre]
        });
      }
    });

    // Also check for links that might contain movie info
    $('a').each((i, elem) => {
      if (movies.length >= limit) return false;

      const text = $(elem).text().trim();
      const href = $(elem).attr('href') || '';
      const movieInfo = parseMovieInfo(text);

      if (movieInfo && movieInfo.title && movieInfo.year) {
        // Check if we already have this movie
        const exists = movies.some(m => 
          m.title.toLowerCase() === movieInfo.title.toLowerCase() && m.year === movieInfo.year
        );

        if (!exists) {
          const genre = extractGenreFromText(text + ' ' + href);
          movies.push({
            title: movieInfo.title,
            year: movieInfo.year,
            genre: [genre]
          });
        }
      }
    });

    console.log(`✅ Found ${movies.length} movies`);
    return movies;
  } catch (error) {
    console.error('❌ Error scraping movies:', error.message);
    return [];
  }
}

// Function to add movie to database
async function addMovieToDatabase(movieData) {
  try {
    // Check if movie already exists
    const existing = await Movie.findOne({
      title: { $regex: new RegExp(movieData.title, 'i') },
      year: movieData.year
    });

    if (existing) {
      console.log(`⏭️  Skipping ${movieData.title} (${movieData.year}) - already exists`);
      return null;
    }

    // Try to get TMDB data
    let tmdbData = null;
    if (TMDB_API_KEY) {
      const searchResult = await searchMovieOnTMDB(movieData.title, movieData.year);
      if (searchResult && searchResult.tmdbId) {
        const details = await getMovieDetailsFromTMDB(searchResult.tmdbId);
        if (details) {
          tmdbData = details;
        }
      }
    }

    // Create movie object
    const movie = new Movie({
      title: movieData.title,
      year: movieData.year,
      genre: tmdbData?.genres?.length > 0 ? tmdbData.genres : movieData.genre,
      director: tmdbData?.director || 'Unknown Director',
      description: tmdbData?.description || `A ${movieData.year} ${movieData.genre[0]} film.`,
      poster: tmdbData?.poster || 'https://via.placeholder.com/300x450?text=No+Poster'
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
  console.log('🚀 Starting movie import from dotmovies.onl...\n');

  // Scrape movies from the website
  const movies = await scrapeMoviesFromDotMovies('https://dotmovies.onl/', 30);

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

