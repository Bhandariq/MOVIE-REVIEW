# Quick Setup Guide

## Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or MongoDB Atlas)

## Step-by-Step Setup

### 1. Install Backend Dependencies
```bash
cd backend
npm install
```

### 2. Install Frontend Dependencies
```bash
cd ../frontend
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the `backend` directory:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/movie-review
JWT_SECRET=your_super_secret_jwt_key_12345
```

**For MongoDB Atlas:**
```env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/movie-review
```

### 4. Start MongoDB

**Windows:**
```bash
net start MongoDB
```

**macOS:**
```bash
brew services start mongodb-community
```

**Linux:**
```bash
sudo systemctl start mongod
```

**Or use MongoDB Atlas (cloud):**
No local installation needed, just use your Atlas connection string in `.env`

### 5. Start Backend Server

In the `backend` directory:
```bash
npm start
# or for development with auto-reload:
npm run dev
```

Backend will run on `http://localhost:5000`

### 6. Start Frontend Server

In a new terminal, navigate to `frontend` directory:
```bash
cd frontend
npm start
```

Frontend will run on `http://localhost:3000` and automatically open in your browser.

## Adding Sample Movies

You can add movies via API call:

**Using cURL:**
```bash
curl -X POST http://localhost:5000/api/movies \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Inception",
    "year": 2010,
    "genre": ["Sci-Fi", "Action", "Thriller"],
    "director": "Christopher Nolan",
    "description": "A mind-bending thriller about dreams within dreams.",
    "poster": "https://image.tmdb.org/t/p/w500/oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg"
  }'
```

**Using Postman/Insomnia:**
- Method: POST
- URL: `http://localhost:5000/api/movies`
- Body (JSON):
```json
{
  "title": "The Matrix",
  "year": 1999,
  "genre": ["Sci-Fi", "Action"],
  "director": "The Wachowskis",
  "description": "A computer hacker learns about the true nature of reality.",
  "poster": "https://image.tmdb.org/t/p/w500/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg"
}
```

## Features Implemented

✅ Full MERN Stack
✅ User Authentication (Signup/Login)
✅ Movie Browsing
✅ Review System
✅ Particle Effects on Login/Signup pages
✅ RGB Rotating Border on Auth boxes
✅ Modern, Flashy UI
✅ Responsive Design
✅ Logo in top left corner
✅ Signup/Login buttons in top right corner

## Troubleshooting

**Port 5000 already in use:**
- Change `PORT` in backend `.env` file
- Update proxy in `frontend/package.json` if changed

**MongoDB connection error:**
- Ensure MongoDB is running
- Check `MONGO_URI` in `.env` file
- Verify network settings for MongoDB Atlas

**Frontend not connecting to backend:**
- Check that backend is running on port 5000
- Verify proxy setting in `frontend/package.json`
- Check browser console for CORS errors

## Ready to Use!

Once both servers are running, visit `http://localhost:3000` to see your Movie Review website!

