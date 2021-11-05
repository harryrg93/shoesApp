const { shoesSchema, reviewSchema } = require('../schemas.js');
const ExpressError = require('../utils/ExpressError');
const Shoes = require('../models/shoes');
const Review = require('../models/review');

module.exports.isLoggedIn = (req, res, next) => {
   const { id } = req.params;
   if (!req.isAuthenticated()) {
      req.flash('error', 'you must be signed in');
      return res.redirect('/login');
   }
   next();
};

module.exports.validateShoes = (req, res, next) => {
   const { error } = shoesSchema.validate(req.body);
   if (error) {
      const msg = error.details.map((el) => el.message).join(',');
      throw new ExpressError(msg, 400);
   } else {
      next();
   }
};

module.exports.isAuthor = async (req, res, next) => {
   const { id } = req.params;
   const shoes = await Shoes.findById(id);
   if (!shoes.author.equals(req.user._id)) {
      req.flash('error', 'You need permission to do that!');
      return res.redirect(`/shoes/${id}`);
   }
   next();
};

module.exports.isReviewAuthor = async (req, res, next) => {
   const { id, reviewId } = req.params;
   const review = await Review.findById(reviewId);
   if (!review.author.equals(req.user._id)) {
      req.flash('error', 'You need permission to do that!');
      return res.redirect(`/campgrounds/${id}`);
   }
   next();
};

module.exports.validateReview = (req, res, next) => {
   const { error } = reviewSchema.validate(req.body);
   if (error) {
      const msg = error.details.map((el) => el.message).join(',');
      throw new ExpressError(msg, 400);
   } else {
      next();
   }
};
