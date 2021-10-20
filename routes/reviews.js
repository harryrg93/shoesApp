const express = require('express');
const router = express.Router({ mergeParams: true });
const reviews = require('../controllers/reviews');
const {
   validateReview,
   isLoggedIn,
   isReviewAuthor
} = require('../utils/middleware');
const Review = require('../models/review');
const Shoes = require('../models/shoes');

const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');

router.post('/', validateReview, isLoggedIn, catchAsync(reviews.createReview));

router.delete(
   '/:reviewId',
   isLoggedIn,
   isReviewAuthor,
   catchAsync(reviews.deleteReview)
);

module.exports = router;
