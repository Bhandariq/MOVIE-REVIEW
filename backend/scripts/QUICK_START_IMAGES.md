# Quick Start: Automatic Movie Images

## ✅ System Ready!

The automatic image fetching system is now set up. To start getting movie posters automatically, you just need to add a free API key.

## 🚀 Quick Setup (2 minutes)

### Step 1: Get Free TMDB API Key

1. Visit: https://www.themoviedb.org/settings/api
2. Click "Request an API Key"
3. Choose "Developer" (free)
4. Fill the form (just basic info)
5. Copy your API key

### Step 2: Add to .env File

Open `backend/.env` and add:
```
TMDB_API_KEY=your_api_key_here
```

### Step 3: Run the Scripts

Now when you import movies, images will be added automatically:

```bash
# Import movies with automatic images
npm run import-bollywood

# Or update existing movies with images
npm run fetch-images
```

## 📋 What's Included

✅ **Automatic poster fetching** - Gets high-quality movie posters  
✅ **Multiple API support** - TMDB (recommended) and OMDB (backup)  
✅ **Smart fallback** - Tries multiple sources automatically  
✅ **Update existing movies** - Add images to movies already in database  
✅ **Rate limiting** - Prevents API overuse  

## 🎯 Features

- **TMDB API** (Free, unlimited for personal use)
  - High-quality 500px posters
  - Movie descriptions
  - Director information
  - Genre information

- **OMDB API** (Free, 1,000 requests/day)
  - Alternative poster source
  - Plot descriptions
  - Director information

## 📝 Example

Once API key is added, importing movies will automatically include:

```javascript
{
  title: "Bhool Bhulaiyaa 3",
  year: 2024,
  poster: "https://image.tmdb.org/t/p/w500/abc123.jpg", // ✅ Auto-fetched!
  description: "A horror-comedy film...", // ✅ Auto-fetched!
  director: "Anees Bazmee", // ✅ Auto-fetched!
  genre: ["Horror", "Comedy"] // ✅ Auto-fetched!
}
```

## 🔄 Update Existing Movies

To add images to movies already in your database:

```bash
npm run fetch-images
```

This will:
- Find all movies without posters
- Fetch posters from TMDB/OMDB
- Update the database automatically

## ⚡ That's It!

Once you add the TMDB API key, all future movie imports will automatically include posters and movie details!

