import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import './MovieDetail.css';

const MovieDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [movie, setMovie] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    comment: ''
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchMovieData();
  }, [id]);

  const fetchMovieData = async () => {
    try {
      const [movieRes, reviewsRes] = await Promise.all([
        axios.get(`/api/movies/${id}`),
        axios.get(`/api/reviews/movie/${id}`)
      ]);
      setMovie(movieRes.data);
      setReviews(reviewsRes.data);
    } catch (error) {
      console.error('Error fetching movie data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    
    if (!user) {
      navigate('/login');
      return;
    }

    setSubmitting(true);
    try {
      await axios.post('/api/reviews', {
        movieId: id,
        rating: reviewForm.rating,
        comment: reviewForm.comment
      });
      
      setReviewForm({ rating: 5, comment: '' });
      fetchMovieData();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!movie) {
    return <div className="error">Movie not found</div>;
  }

  const userReview = reviews.find(r => user && r.user && r.user._id === user.id);

  return (
    <div className="movie-detail">
      <nav className="detail-navbar">
        <div className="logo">
          <span className="logo-icon">🎬</span>
          <Link to="/" className="logo-text-link">
            <span className="logo-text">MOVIE REVIEW</span>
          </Link>
        </div>
        <div className="nav-buttons">
          {user ? (
            <Link to="/dashboard" className="btn btn-dashboard">Dashboard</Link>
          ) : (
            <>
              <Link to="/signup" className="btn btn-signup">Sign Up</Link>
              <Link to="/login" className="btn btn-login">Login</Link>
            </>
          )}
        </div>
      </nav>

      <div className="movie-detail-content">
        <div className="movie-header">
          <div className="movie-poster-large">
            <img src={movie.poster} alt={movie.title} />
          </div>
          <div className="movie-info-large">
            <h1>{movie.title}</h1>
            <div className="movie-meta">
              <span className="movie-year">{movie.year}</span>
              <span className="movie-director">Director: {movie.director}</span>
            </div>
            <div className="movie-genres">
              {movie.genre.map((g, i) => (
                <span key={i} className="genre-tag">{g}</span>
              ))}
            </div>
            <div className="movie-rating-large">
              <span className="rating-stars">⭐ {movie.averageRating || 'N/A'}</span>
              <span className="rating-count">({movie.totalReviews || 0} reviews)</span>
            </div>
            <p className="movie-description">{movie.description}</p>
          </div>
        </div>

        <div className="reviews-section">
          <h2>Reviews</h2>
          
          {user && !userReview && (
            <div className="add-review-form">
              <h3>Write a Review</h3>
              <form onSubmit={handleReviewSubmit}>
                <div className="form-group">
                  <label>Rating</label>
                  <select
                    value={reviewForm.rating}
                    onChange={(e) => setReviewForm({ ...reviewForm, rating: parseInt(e.target.value) })}
                  >
                    <option value={5}>5 ⭐</option>
                    <option value={4}>4 ⭐</option>
                    <option value={3}>3 ⭐</option>
                    <option value={2}>2 ⭐</option>
                    <option value={1}>1 ⭐</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Comment</label>
                  <textarea
                    value={reviewForm.comment}
                    onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                    required
                    rows="4"
                    placeholder="Share your thoughts..."
                  />
                </div>
                <button type="submit" disabled={submitting} className="submit-review-btn">
                  {submitting ? 'Submitting...' : 'Submit Review'}
                </button>
              </form>
            </div>
          )}

          {!user && (
            <div className="login-prompt">
              <Link to="/login" className="btn btn-primary">Login to write a review</Link>
            </div>
          )}

          <div className="reviews-list">
            {reviews.length === 0 ? (
              <p className="no-reviews">No reviews yet. Be the first to review!</p>
            ) : (
              reviews.map((review) => (
                <div key={review._id} className="review-card">
                  <div className="review-header">
                    <span className="review-username">{review.username}</span>
                    <span className="review-rating">⭐ {review.rating}/5</span>
                  </div>
                  <p className="review-comment">{review.comment}</p>
                  <span className="review-date">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieDetail;

