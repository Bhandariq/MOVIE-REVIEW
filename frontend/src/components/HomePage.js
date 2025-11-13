import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Particles from 'react-particles';
import { loadSlim } from 'tsparticles-slim';
import './HomePage.css';

const HomePage = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchMovies();
  }, []);

  const particlesInit = async (engine) => {
    await loadSlim(engine);
  };

  const particlesConfig = {
    particles: {
      number: {
        value: 120,
        density: {
          enable: true,
          value_area: 800
        }
      },
      color: {
        value: ['#ffffff', '#a0c4ff', '#ffff99', '#ffb3ba', '#b19cd9']
      },
      shape: {
        type: 'circle'
      },
      opacity: {
        value: 0.7,
        random: true,
        animation: {
          enable: true,
          speed: 0.5,
          opacity_min: 0.2,
          sync: false
        }
      },
      size: {
        value: 3,
        random: {
          enable: true,
          minimumValue: 1
        },
        animation: {
          enable: true,
          speed: 1,
          size_min: 0.5,
          sync: false
        }
      },
      line_linked: {
        enable: false
      },
      move: {
        enable: true,
        speed: 2,
        direction: 'bottom',
        random: true,
        straight: false,
        out_mode: 'out',
        bounce: false,
        attract: {
          enable: false,
          rotateX: 600,
          rotateY: 1200
        }
      }
    },
    interactivity: {
      detect_on: 'canvas',
      events: {
        onhover: {
          enable: true,
          mode: 'repulse'
        },
        onclick: {
          enable: true,
          mode: 'push'
        },
        resize: true
      }
    },
    retina_detect: true
  };

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

  return (
    <div className="homepage">
      <Particles
        id="tsparticles-homepage"
        init={particlesInit}
        options={particlesConfig}
        className="particles-bg"
      />
      <div className="content-wrapper">
        <nav className="navbar">
        <div className="logo">
          <span className="logo-icon">🎬</span>
          <span className="logo-text">MOVIE REVIEW</span>
        </div>
        <div className="nav-buttons">
          <Link to="/signup" className="btn btn-signup">Sign Up</Link>
          <Link to="/login" className="btn btn-login">Login</Link>
        </div>
      </nav>

      <div className="hero-section">
        <h1 className="hero-title">Discover & Review Movies</h1>
        <p className="hero-subtitle">Share your thoughts on the latest films</p>
        <Link to="/signup" className="btn btn-primary">Get Started</Link>
      </div>

      <div className="movies-section">
        <h2 className="section-title">Popular Movies</h2>
        {loading ? (
          <div className="loading">Loading movies...</div>
        ) : movies.length === 0 ? (
          <div className="no-movies">
            <p>No movies available yet. Be the first to add one!</p>
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
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

        <footer className="footer">
          <p>&copy; 2024 Movie Review. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
};

export default HomePage;

