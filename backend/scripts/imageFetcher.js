const axios = require('axios');

// TMDB API configuration
const TMDB_API_KEY = process.env.TMDB_API_KEY || '';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

// OMDB API (free alternative)
const OMDB_API_KEY = process.env.OMDB_API_KEY || '';

/**
 * Search movie on TMDB and get poster
 */
async function getPosterFromTMDB(title, year) {
  if (!TMDB_API_KEY) {
    return null;
  }

  try {
    // Search for movie
    const searchResponse = await axios.get(`${TMDB_BASE_URL}/search/movie`, {
      params: {
        api_key: TMDB_API_KEY,
        query: title,
        year: year
      },
      timeout: 10000
    });

    if (searchResponse.data.results && searchResponse.data.results.length > 0) {
      const movie = searchResponse.data.results[0];
      
      // Get full movie details for better poster
      if (movie.id) {
        const detailsResponse = await axios.get(`${TMDB_BASE_URL}/movie/${movie.id}`, {
          params: {
            api_key: TMDB_API_KEY
          },
          timeout: 10000
        });

        if (detailsResponse.data.poster_path) {
          return {
            poster: `https://image.tmdb.org/t/p/w500${detailsResponse.data.poster_path}`,
            description: detailsResponse.data.overview || null,
            genres: detailsResponse.data.genres?.map(g => g.name) || [],
            director: null // Will be fetched separately if needed
          };
        }
      }

      // Fallback to search result poster
      if (movie.poster_path) {
        return {
          poster: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
          description: movie.overview || null,
          genres: [],
          director: null
        };
      }
    }
    return null;
  } catch (error) {
    return null;
  }
}

/**
 * Get movie poster from OMDB (free alternative)
 */
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
      return {
        poster: response.data.Poster,
        description: response.data.Plot !== 'N/A' ? response.data.Plot : null,
        genres: response.data.Genre ? response.data.Genre.split(', ').map(g => g.trim()) : [],
        director: response.data.Director !== 'N/A' ? response.data.Director : null
      };
    }
    return null;
  } catch (error) {
    return null;
  }
}

/**
 * Get movie poster using multiple sources (best available)
 */
async function fetchMoviePoster(title, year) {
  // Try TMDB first (best quality)
  if (TMDB_API_KEY) {
    const tmdbResult = await getPosterFromTMDB(title, year);
    if (tmdbResult && tmdbResult.poster) {
      return tmdbResult;
    }
  }

  // Try OMDB as fallback
  if (OMDB_API_KEY) {
    const omdbResult = await getPosterFromOMDB(title, year);
    if (omdbResult && omdbResult.poster) {
      return omdbResult;
    }
  }

  // If no API keys, try a simple image search URL (last resort)
  // This uses a free service that searches for movie posters
  try {
    const encodedTitle = encodeURIComponent(`${title} ${year} movie poster`);
    // Using a placeholder service - in production, you'd want a proper image search API
    return null; // Return null if no APIs available
  } catch (error) {
    return null;
  }
}

/**
 * Get full movie details including director from TMDB
 */
async function getFullMovieDetailsFromTMDB(title, year) {
  if (!TMDB_API_KEY) {
    return null;
  }

  try {
    const searchResponse = await axios.get(`${TMDB_BASE_URL}/search/movie`, {
      params: {
        api_key: TMDB_API_KEY,
        query: title,
        year: year
      },
      timeout: 10000
    });

    if (searchResponse.data.results && searchResponse.data.results.length > 0) {
      const movieId = searchResponse.data.results[0].id;
      
      const detailsResponse = await axios.get(`${TMDB_BASE_URL}/movie/${movieId}`, {
        params: {
          api_key: TMDB_API_KEY,
          append_to_response: 'credits'
        },
        timeout: 10000
      });

      const movie = detailsResponse.data;
      const director = movie.credits?.crew?.find(c => c.job === 'Director')?.name || null;

      return {
        poster: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : null,
        description: movie.overview || null,
        genres: movie.genres?.map(g => g.name) || [],
        director: director
      };
    }
    return null;
  } catch (error) {
    return null;
  }
}

module.exports = {
  fetchMoviePoster,
  getPosterFromTMDB,
  getPosterFromOMDB,
  getFullMovieDetailsFromTMDB
};

