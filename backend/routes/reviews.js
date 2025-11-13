const express = require('express');
const Review = require('../models/Review');
const Movie = require('../models/Movie');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all reviews for a movie
router.get('/movie/:movieId', async (req, res) => {
  try {
    const reviews = await Review.find({ movie: req.params.movieId })
      .sort({ createdAt: -1 })
      .populate('user', 'username');
    res.json(reviews);
  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create review
router.post('/', auth, async (req, res) => {
  try {
    const { movieId, rating, comment } = req.body;

    // Check if review already exists
    const existingReview = await Review.findOne({
      movie: movieId,
      user: req.user._id
    });

    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this movie' });
    }

    // Create review
    const review = new Review({
      movie: movieId,
      user: req.user._id,
      username: req.user.username,
      rating,
      comment
    });

    await review.save();

    // Update movie average rating
    const reviews = await Review.find({ movie: movieId });
    const averageRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

    await Movie.findByIdAndUpdate(movieId, {
      averageRating: averageRating.toFixed(1),
      totalReviews: reviews.length
    });

    res.status(201).json(review);
  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update review
router.put('/:id', auth, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    if (review.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    review.rating = req.body.rating;
    review.comment = req.body.comment;
    await review.save();

    // Update movie average rating
    const reviews = await Review.find({ movie: review.movie });
    const averageRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

    await Movie.findByIdAndUpdate(review.movie, {
      averageRating: averageRating.toFixed(1),
      totalReviews: reviews.length
    });

    res.json(review);
  } catch (error) {
    console.error('Update review error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete review
router.delete('/:id', auth, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    if (review.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const movieId = review.movie;
    await Review.findByIdAndDelete(req.params.id);

    // Update movie average rating
    const reviews = await Review.find({ movie: movieId });
    const averageRating = reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : 0;

    await Movie.findByIdAndUpdate(movieId, {
      averageRating: averageRating,
      totalReviews: reviews.length
    });

    res.json({ message: 'Review deleted' });
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

