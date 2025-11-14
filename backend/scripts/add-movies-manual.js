const mongoose = require('mongoose');
const axios = require('axios');
const dotenv = require('dotenv');
const Movie = require('../models/Movie');

dotenv.config();

// Connect to MongoDB
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/movie-review';
mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// TMDB API configuration (optional)
const TMDB_API_KEY = process.env.TMDB_API_KEY || '';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

// Sample movies from dotmovies.onl (you can add more)
const sampleMovies = [
  { title: "Gabby's Dollhouse: The Movie", year: 2025, genre: ["Animation", "Family"] },
  { title: "The Draft!", year: 2023, genre: ["Drama", "Sports"] },
  { title: "The Girlfriend", year: 2025, genre: ["Thriller"] },
  { title: "Phullwanti", year: 2024, genre: ["Drama"] },
  { title: "Freakier Friday", year: 2025, genre: ["Comedy", "Family"] },
  { title: "Chidiya", year: 2025, genre: ["Drama"] },
  { title: "Playdate", year: 2025, genre: ["Thriller"] },
  { title: "A Merry Little Ex-Mas", year: 2025, genre: ["Comedy", "Romance"] },
  { title: "Roofman", year: 2025, genre: ["Action", "Thriller"] },
  { title: "Mystery", year: 2023, genre: ["Mystery", "Thriller"] },
  { title: "Jarann", year: 2025, genre: ["Drama"] },
  { title: "Bachelor Prasad", year: 2025, genre: ["Comedy"] },
  { title: "Black Phone 2", year: 2025, genre: ["Horror", "Thriller"] },
  { title: "Dies Irae", year: 2025, genre: ["Drama"] },
  { title: "Bone Lake", year: 2025, genre: ["Horror", "Thriller"] },
  { title: "Badaa Karara Pudna", year: 2025, genre: ["Comedy"] },
  { title: "Jatadhara", year: 2025, genre: ["Drama"] },
  { title: "Good Fortune", year: 2025, genre: ["Comedy", "Drama"] },
  { title: "Jombieland", year: 2025, genre: ["Action", "Comedy"] },
  { title: "Predator: Badlands", year: 2025, genre: ["Action", "Horror", "Sci-Fi"] },
  { title: "HAQ", year: 2025, genre: ["Drama"] },
  { title: "Mango", year: 2025, genre: ["Drama"] },
  { title: "Frankenstein", year: 2025, genre: ["Horror", "Sci-Fi"] },
  { title: "Baramulla", year: 2025, genre: ["Action", "Drama"] },
  { title: "Mirai", year: 2025, genre: ["Drama", "Sci-Fi"] }
];

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
      return response.data.results[0];
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
        api_key: TMDB_API_KEY,
        append_to_response: 'credits'
      }
    });

    const movie = response.data;
    const director = movie.credits?.crew?.find(c => c.job === 'Director')?.name || 'Unknown Director';

    return {
      director,
      genres: movie.genres?.map(g => g.name) || [],
      description: movie.overview || 'No description available',
      poster: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : null
    };
  } catch (error) {
    console.error(`Error getting TMDB details:`, error.message);
    return null;
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
      if (searchResult) {
        const details = await getMovieDetailsFromTMDB(searchResult.id);
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
      description: tmdbData?.description || `A ${movieData.year} ${movieData.genre.join(', ')} film.`,
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
  console.log('🚀 Starting movie import...\n');

  let added = 0;
  let skipped = 0;

  for (const movie of sampleMovies) {
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

