# Movie Import Scripts

Scripts to import movies from dotmovies.onl into your Movie Review database.

## Available Scripts

### 1. `add-movies-manual.js`
Imports a predefined list of movies from dotmovies.onl. This is the recommended script as it's more reliable.

**Usage:**
```bash
cd backend
node scripts/add-movies-manual.js
```

**Features:**
- Adds 25+ movies from dotmovies.onl
- Automatically checks for duplicates
- Uses TMDB API (if configured) to enrich movie data with posters, descriptions, and directors

### 2. `add-movies-from-dotmovies.js`
Scrapes movies directly from the dotmovies.onl website.

**Usage:**
```bash
cd backend
node scripts/add-movies-from-dotmovies.js
```

**Features:**
- Scrapes movie titles and years from the website
- Extracts genre information
- Uses TMDB API (if configured) to get full movie details
- Can be configured to scrape more movies by modifying the `limit` parameter

## TMDB API Setup (Optional but Recommended)

To get movie posters, descriptions, and director information:

1. Sign up for a free account at [The Movie Database (TMDB)](https://www.themoviedb.org/)
2. Go to [API Settings](https://www.themoviedb.org/settings/api)
3. Request an API key (free)
4. Add it to your `backend/.env` file:
   ```
   TMDB_API_KEY=your_api_key_here
   ```

Without TMDB API key, movies will be added with:
- Default placeholder poster
- Basic description
- "Unknown Director"

## Adding More Movies

### Option 1: Edit the Manual Script
Edit `add-movies-manual.js` and add more movies to the `sampleMovies` array:

```javascript
const sampleMovies = [
  { title: "Movie Title", year: 2025, genre: ["Action", "Thriller"] },
  // Add more movies here...
];
```

### Option 2: Use the API Directly
You can add movies via API calls:

```bash
curl -X POST http://localhost:5000/api/movies \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Movie Title",
    "year": 2025,
    "genre": ["Action", "Thriller"],
    "director": "Director Name",
    "description": "Movie description here",
    "poster": "https://image.tmdb.org/t/p/w500/poster.jpg"
  }'
```

## Notes

- Scripts automatically skip movies that already exist in the database
- Movies are checked by title and year to avoid duplicates
- The scraping script may need updates if the website structure changes
- Rate limiting is built-in to avoid overwhelming APIs

