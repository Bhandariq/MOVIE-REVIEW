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

// TMDB API configuration
const TMDB_API_KEY = process.env.TMDB_API_KEY || '';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

// OMDB API (free alternative, requires free API key from omdbapi.com)
const OMDB_API_KEY = process.env.OMDB_API_KEY || '';

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
      },
      timeout: 10000
    });

    if (response.data.results && response.data.results.length > 0) {
      const movie = response.data.results[0];
      return {
        tmdbId: movie.id,
        poster: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : null
      };
    }
    return null;
  } catch (error) {
    return null;
  }
}

// Function to get movie poster from TMDB
async function getPosterFromTMDB(tmdbId) {
  if (!TMDB_API_KEY || !tmdbId) {
    return null;
  }

  try {
    const response = await axios.get(`${TMDB_BASE_URL}/movie/${tmdbId}`, {
      params: {
        api_key: TMDB_API_KEY
      },
      timeout: 10000
    });

    if (response.data.poster_path) {
      return `https://image.tmdb.org/t/p/w500${response.data.poster_path}`;
    }
    return null;
  } catch (error) {
    return null;
  }
}

// Function to get movie poster from OMDB
async function getPosterFromOMDB(title, year) {
  if (!OMDB_API_KEY) {
    return null;
  }

  try {
    const response = await axios.get('http://www.omdbapi.com/', {
      params: {
        apikey: OMDB_API_KEY,
        t: title,
        y: year,
        type: 'movie'
      },
      timeout: 10000
    });

    if (response.data && response.data.Poster && response.data.Poster !== 'N/A') {
      return response.data.Poster;
    }
    return null;
  } catch (error) {
    return null;
  }
}

// Function to search for poster using Google Custom Search (requires API key)
async function searchPosterGoogle(title, year) {
  const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY || '';
  const GOOGLE_CX = process.env.GOOGLE_CX || '';

  if (!GOOGLE_API_KEY || !GOOGLE_CX) {
    return null;
  }

  try {
    const query = `${title} ${year} movie poster`;
    const response = await axios.get('https://www.googleapis.com/customsearch/v1', {
      params: {
        key: GOOGLE_API_KEY,
        cx: GOOGLE_CX,
        q: query,
        searchType: 'image',
        imgSize: 'large',
        num: 1
      },
      timeout: 10000
    });

    if (response.data.items && response.data.items.length > 0) {
      return response.data.items[0].link;
    }
    return null;
  } catch (error) {
    return null;
  }
}

// Function to fetch poster using multiple sources
async function fetchMoviePoster(title, year) {
  console.log(`   🔍 Searching for poster: ${title} (${year})`);

  // Try TMDB first (best quality)
  if (TMDB_API_KEY) {
    const tmdbResult = await searchMovieOnTMDB(title, year);
    if (tmdbResult && tmdbResult.poster) {
      console.log(`   ✅ Found on TMDB`);
      return tmdbResult.poster;
    }
    if (tmdbResult && tmdbResult.tmdbId) {
      const poster = await getPosterFromTMDB(tmdbResult.tmdbId);
      if (poster) {
        console.log(`   ✅ Found on TMDB`);
        return poster;
      }
    }
  }

  // Try OMDB as fallback
  if (OMDB_API_KEY) {
    const omdbPoster = await getPosterFromOMDB(title, year);
    if (omdbPoster) {
      console.log(`   ✅ Found on OMDB`);
      return omdbPoster;
    }
  }

  // Try Google Custom Search as last resort
  const googlePoster = await searchPosterGoogle(title, year);
  if (googlePoster) {
    console.log(`   ✅ Found on Google`);
    return googlePoster;
  }

  console.log(`   ⚠️  No poster found`);
  return null;
}

// Function to update movie with poster
async function updateMoviePoster(movie) {
  try {
    // Skip if already has a valid poster (not placeholder)
    if (movie.poster && !movie.poster.includes('placeholder') && !movie.poster.includes('No+Poster')) {
      return null;
    }

    const poster = await fetchMoviePoster(movie.title, movie.year);
    
    if (poster) {
      movie.poster = poster;
      await movie.save();
      console.log(`   ✅ Updated: ${movie.title}`);
      return true;
    } else {
      console.log(`   ⏭️  No poster available for: ${movie.title}`);
      return false;
    }
  } catch (error) {
    console.error(`   ❌ Error updating ${movie.title}:`, error.message);
    return false;
  }
}

// Main function
async function main() {
  console.log('🚀 Starting movie poster update...\n');

  // Get all movies without proper posters
  const movies = await Movie.find({
    $or: [
      { poster: { $exists: false } },
      { poster: { $regex: /placeholder/i } },
      { poster: { $regex: /No\+Poster/i } },
      { poster: '' }
    ]
  });

  if (movies.length === 0) {
    console.log('✅ All movies already have posters!');
    mongoose.connection.close();
    process.exit(0);
  }

  console.log(`📊 Found ${movies.length} movies without posters\n`);

  let updated = 0;
  let failed = 0;

  for (let i = 0; i < movies.length; i++) {
    const movie = movies[i];
    console.log(`\n[${i + 1}/${movies.length}] Processing: ${movie.title} (${movie.year})`);
    
    const result = await updateMoviePoster(movie);
    if (result) {
      updated++;
    } else {
      failed++;
    }

    // Rate limiting - wait between requests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log(`\n✨ Update complete!`);
  console.log(`   ✅ Updated: ${updated} movies`);
  console.log(`   ⏭️  Failed: ${failed} movies`);

  mongoose.connection.close();
  process.exit(0);
}

// Run the script
main().catch(error => {
  console.error('❌ Fatal error:', error);
  mongoose.connection.close();
  process.exit(1);
});

