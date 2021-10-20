const Review = require('../models/review');
const Shoes = require('../models/shoes');

module.exports.createReview = async (req, res) => {
   const shoe = await Shoes.findById(req.params.id);
   const review = new Review(req.body.review);
   review.author = req.user._id;
   shoe.reviews.push(review);
   await review.save();
   await shoe.save();
   req.flash('success', 'Created New Review!');
   res.redirect(`/shoes/${shoe._id}`);
};

module.exports.deleteReview = async (req, res) => {
   const { id, reviewId } = req.params;
   await Shoes.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
   await Review.findByIdAndDelete(req.params.reviewId);
   req.flash('success', 'Successfully deleted review!');
   res.redirect(`/shoes/${id}`);
};
