import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import './Dashboard.css';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchMovies();
  }, [user, navigate]);

  const fetchMovies = async () => {
    try {
      const res = await axios.get('/api/movies');
      setMovies(res.data);
    } catch (error) {
      console.error('Error fetching movies:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!user) {
    return null;
  }

  return (
    <div className="dashboard">
      <nav className="dashboard-navbar">
        <div className="logo">
          <span className="logo-icon">🎬</span>
          <Link to="/" className="logo-text-link">
            <span className="logo-text">MOVIE REVIEW</span>
          </Link>
        </div>
        <div className="nav-right">
          <span className="welcome-text">Welcome, {user.username}!</span>
          <button onClick={handleLogout} className="btn btn-logout">Logout</button>
        </div>
      </nav>

      <div className="dashboard-content">
        <h1 className="dashboard-title">Movie Dashboard</h1>
        <p className="dashboard-subtitle">Browse movies and share your reviews</p>

        {loading ? (
          <div className="loading">Loading movies...</div>
        ) : movies.length === 0 ? (
          <div className="no-movies">
            <p>No movies available yet. Check back soon!</p>
          </div>
        ) : (
          <div className="movies-grid">
            {movies.map((movie) => (
              <div
                key={movie._id}
                className="movie-card"
                onClick={() => navigate(`/movie/${movie._id}`)}
              >
                <div className="movie-poster">
                  <img src={movie.poster} alt={movie.title} />
                  <div className="movie-rating">
                    ⭐ {movie.averageRating || 'N/A'}
                  </div>
                </div>
                <div className="movie-info">
                  <h3>{movie.title}</h3>
                  <p className="movie-year">{movie.year}</p>
                  <p className="movie-genre">{movie.genre.join(', ')}</p>
                  <p className="movie-reviews">{movie.totalReviews || 0} reviews</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;

