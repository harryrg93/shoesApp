const mongoose = require('mongoose');
const Review = require('./review');
const Schema = mongoose.Schema;
const { cloudinary } = require('../cloudinary');

let schemaOptions = {
   toObject: {
      virtuals: true
   },
   toJSON: {
      virtuals: true
   }
};

const ImageSchema = new Schema({
   url: String,
   filename: String
});

ImageSchema.virtual('thumbnail').get(function () {
   return this.url.replace('/upload', '/upload/w_200');
});

const ShoeSchema = new Schema({
   title: String,
   images: [ImageSchema],
   model: String,
   brand: String,
   size: [Number],
   colors: [String],
   price: Number,
   description: String,
   author: {
      type: Schema.Types.ObjectId,
      ref: 'User'
   },
   reviews: [
      {
         type: Schema.Types.ObjectId,
         ref: 'Review'
      }
   ],
   category: [String]
});

ShoeSchema.post('findOneAndDelete', async function (shoe) {
   if (shoe.reviews) {
      await Review.deleteMany({
         _id: { $in: shoe.reviews }
      });
   }
   if (shoe.images) {
      for (let img of shoe.images) {
         await cloudinary.uploader.destroy(img.filename);
      }
   }
});

module.exports = mongoose.model('Shoes', ShoeSchema);
