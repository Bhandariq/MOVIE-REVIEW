# API Setup Guide for Automatic Movie Images

To automatically fetch movie posters and images, you can set up free API keys from these services:

## Option 1: TMDB API (Recommended - Best Quality)

**The Movie Database (TMDB)** provides high-quality movie posters and metadata.

### Steps:
1. Go to [TMDB](https://www.themoviedb.org/) and create a free account
2. Navigate to [API Settings](https://www.themoviedb.org/settings/api)
3. Click "Request an API Key"
4. Select "Developer" (free option)
5. Fill out the application form
6. Copy your API key
7. Add to `backend/.env`:
   ```
   TMDB_API_KEY=your_api_key_here
   ```

**Benefits:**
- High-quality posters (500px width)
- Movie descriptions
- Director information
- Genre information
- Free and unlimited for personal use

## Option 2: OMDB API (Free Alternative)

**Open Movie Database (OMDB)** is another free option.

### Steps:
1. Go to [OMDB API](http://www.omdbapi.com/apikey.aspx)
2. Choose "FREE" plan (1,000 requests per day)
3. Enter your email and verify
4. Copy your API key
5. Add to `backend/.env`:
   ```
   OMDB_API_KEY=your_api_key_here
   ```

**Benefits:**
- Free tier: 1,000 requests/day
- Movie posters
- Plot descriptions
- Director information

## Using Both APIs

You can use both APIs together for better coverage. The script will:
1. Try TMDB first (best quality)
2. Fall back to OMDB if TMDB doesn't have the movie
3. Use placeholder if neither has it

## Example .env Configuration

```env
PORT=5000
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/movie-review
JWT_SECRET=your_jwt_secret
TMDB_API_KEY=your_tmdb_api_key_here
OMDB_API_KEY=your_omdb_api_key_here
```

## Usage

Once API keys are set up:

1. **Import movies with automatic images:**
   ```bash
   npm run import-bollywood
   npm run import-movies
   ```

2. **Update existing movies with images:**
   ```bash
   npm run fetch-images
   ```

The scripts will automatically fetch posters for all movies!

## Notes

- TMDB API is free and recommended
- OMDB free tier has 1,000 requests/day limit
- Scripts include rate limiting to avoid hitting limits
- Images are stored as URLs (not downloaded locally)

