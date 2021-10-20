const express = require('express');
const router = express.Router();
const shoes = require('../controllers/shoes');
const catchAsync = require('../utils/catchAsync');
const {
   isLoggedIn,
   isAuthor,
   validateCampground
} = require('../utils/middleware');
const multer = require('multer');
const { storage } = require('../cloudinary');
const upload = multer({ storage });

const ExpressError = require('../utils/ExpressError');
const Shoes = require('../models/shoes');

router
   .route('/')
   .get(catchAsync(shoes.index))
   .post(
      isLoggedIn,
      upload.array('image'),
      validateCampground,
      catchAsync(shoes.createCampground)
   );

module.exports = router;
