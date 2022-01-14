const express = require('express');
const router = express.Router();
const shoes = require('../controllers/shoes');
const catchAsync = require('../utils/catchAsync');
const {
   isLoggedIn,
   isAuthor,
   validateShoes,
   isAdmin
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
      isAdmin,
      upload.array('image'),
      validateShoes,
      catchAsync(shoes.createShoes)
   );

router.get('/new', isLoggedIn, isAdmin, shoes.renderNewForm);

router
   .route('/:id')
   .get(catchAsync(shoes.showShoes))
   .put(
      isLoggedIn,
      isAdmin,
      upload.array('image'),
      validateShoes,
      catchAsync(shoes.updateShoes)
   )
   .delete(isLoggedIn, isAdmin, catchAsync(shoes.deleteShoes));

router.get('/:id/edit', isLoggedIn, isAdmin, catchAsync(shoes.renderEdit));

module.exports = router;
