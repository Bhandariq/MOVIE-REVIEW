# Movie Review - MERN Stack Application

A full-stack movie review website built with MongoDB, Express, React, and Node.js. Features include user authentication, movie browsing, and review system with a flashy, modern UI including particle effects and RGB rotating borders.

## Features

- 🎬 **User Authentication** - Sign up and login functionality
- 🎭 **Movie Browsing** - Browse popular movies with ratings
- ⭐ **Review System** - Write and read movie reviews
- 🎨 **Modern UI** - Flashy design with particle effects
- 🌈 **RGB Effects** - Rotating RGB border on login/signup boxes
- 📱 **Responsive Design** - Works on all devices

## Tech Stack

### Frontend
- React 18
- React Router DOM
- Axios
- React Particles (tsparticles)
- CSS3 with animations

### Backend
- Node.js
- Express.js
- MongoDB (Mongoose)
- JWT Authentication
- Bcrypt for password hashing

## Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v14 or higher)
- npm or yarn
- MongoDB (local installation or MongoDB Atlas account)

## Installation

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd "SUMMER INTERN"
```

### 2. Install Backend Dependencies

```bash
cd backend
npm install
```

### 3. Install Frontend Dependencies

```bash
cd ../frontend
npm install
```

### 4. Environment Setup

Create a `.env` file in the `backend` directory:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/movie-review
JWT_SECRET=your_jwt_secret_key_here_change_this_in_production
```

For MongoDB Atlas, use:
```env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/movie-review
```

## Running the Application

### Start MongoDB

Make sure MongoDB is running on your system. If installed locally:

```bash
# Windows
net start MongoDB

# macOS/Linux
sudo systemctl start mongod
```

### Start the Backend Server

```bash
cd backend
npm start
# or for development with auto-reload
npm run dev
```

The backend server will run on `http://localhost:5000`

### Start the Frontend Development Server

```bash
cd frontend
npm start
```

The frontend will run on `http://localhost:3000`

## Project Structure

```
SUMMER INTERN/
├── backend/
│   ├── models/
│   │   ├── User.js
│   │   ├── Movie.js
│   │   └── Review.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── movies.js
│   │   └── reviews.js
│   ├── middleware/
│   │   └── auth.js
│   ├── server.js
│   └── package.json
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── HomePage.js
│   │   │   ├── HomePage.css
│   │   │   ├── Login.js
│   │   │   ├── Signup.js
│   │   │   ├── Auth.css
│   │   │   ├── Dashboard.js
│   │   │   ├── Dashboard.css
│   │   │   ├── MovieDetail.js
│   │   │   └── MovieDetail.css
│   │   ├── context/
│   │   │   └── AuthContext.js
│   │   ├── App.js
│   │   ├── index.js
│   │   └── index.css
│   └── package.json
└── README.md
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (protected)

### Movies
- `GET /api/movies` - Get all movies
- `GET /api/movies/:id` - Get single movie
- `POST /api/movies` - Create movie (for admin/seeding)

### Reviews
- `GET /api/reviews/movie/:movieId` - Get reviews for a movie
- `POST /api/reviews` - Create a review (protected)
- `PUT /api/reviews/:id` - Update a review (protected)
- `DELETE /api/reviews/:id` - Delete a review (protected)

## Usage

1. **Homepage**: Browse available movies without logging in
2. **Sign Up**: Create a new account to write reviews
3. **Login**: Access your account
4. **Dashboard**: View all movies after logging in
5. **Movie Detail**: Click on any movie to view details and reviews
6. **Write Review**: Logged-in users can write reviews on movie detail pages

## Adding Movies

You can add movies via:
1. Postman/Insomnia - POST to `/api/movies`
2. MongoDB directly
3. Create a seed script

Example movie data:
```json
{
  "title": "Inception",
  "year": 2010,
  "genre": ["Sci-Fi", "Action", "Thriller"],
  "director": "Christopher Nolan",
  "description": "A mind-bending thriller about dreams within dreams.",
  "poster": "https://example.com/poster.jpg"
}
```

## Customization

### Changing Colors
Edit the CSS files to change color schemes:
- Primary gradient: `#ff0080` (pink) and `#00ff80` (green)
- Secondary: `#8000ff` (purple)

### Particle Settings
Edit `particlesConfig` in `Login.js` and `Signup.js` to customize particle effects.

### RGB Border Speed
Edit the `animation` duration in `Auth.css`:
```css
animation: rgb-rotate 3s linear infinite;
```

## Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running
- Check your `MONGO_URI` in `.env`
- Verify network settings if using MongoDB Atlas

### Port Already in Use
- Change `PORT` in backend `.env`
- Change proxy in `frontend/package.json`

### CORS Issues
- Ensure backend CORS middleware is configured
- Check that frontend proxy is set correctly

## License

This project is open source and available under the MIT License.

## Author

Created as a full-stack MERN application for movie reviews.

