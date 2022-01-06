const express = require('express');
const router = express.Router();
const shoes = require('../controllers/shoes');
const catchAsync = require('../utils/catchAsync');
const { isLoggedIn, isAuthor, validateShoes } = require('../utils/middleware');
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
      validateShoes,
      catchAsync(shoes.createShoes)
   );

router.get('/new', isLoggedIn, shoes.renderNewForm);

router
   .route('/:id')
   .get(catchAsync(shoes.showShoes))
   .put(
      isLoggedIn,
      isAuthor,
      upload.array('image'),
      validateShoes,
      catchAsync(shoes.updateShoes)
   )
   .delete(isLoggedIn, isAuthor, catchAsync(shoes.deleteShoes));

router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(shoes.renderEdit));

module.exports = router;
