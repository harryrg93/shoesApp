const Shoes = require('../models/shoes');
const { cloudinary } = require('../cloudinary');
const ObjectID = require('mongodb').ObjectID;

module.exports.index = async (req, res) => {
   const shoes = await Shoes.find({});
   res.render('shoes/index', { shoes });
};

module.exports.renderNewForm = (req, res) => {
   res.render('shoes/new');
};

module.exports.createShoes = async (req, res, next) => {
   const shoes = new Shoes(req.body.shoes);
   shoes.images = req.files.map((f) => ({
      url: f.path,
      filename: f.filename
   }));
   shoes.author = req.user._id;
   await shoes.save();
   req.flash('success', 'Successfully made a new campgorund');
   //res.send('hello');
   res.redirect(`/shoes/${shoes._id}`);
};

module.exports.showShoes = async (req, res) => {
   if (!ObjectID.isValid(req.params.id)) {
      req.session.returnTo = req.session.previousReturnTo;
      console.log(
         'Invalid shoes show id, returnTo reset to:',
         req.session.returnTo
      );
   }

   const shoes = await Shoes.findById(req.params.id)
      .populate({ path: 'reviews', populate: { path: 'author' } })
      .populate('author');
   if (!shoes) {
      req.flash('error', 'Cannot find that shoes');
      return res.redirect('/shoes');
   }

   res.render('shoes/show', { shoes });
};
