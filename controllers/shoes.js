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

module.exports.renderEdit = async (req, res) => {
   const { id } = req.params;
   const shoes = await Shoes.findById(id);
   if (!shoes) {
      req.flash('error', 'Cannot find that shoes');
      return res.redirect('/shoes');
   }
   res.render('shoes/edit', { shoes });
};

module.exports.updateShoes = async (req, res) => {
   const { id } = req.params;
   const shoes = await Shoes.findByIdAndUpdate(id, {
      ...req.body.shoes
   });
   const imgs = req.files.map((f) => ({
      url: f.path,
      filename: f.filename
   }));
   shoes.images.push(...imgs);
   await shoes.save();

   if (req.body.deleteImages) {
      for (let filename of req.body.deleteImages) {
         await cloudinary.uploader.destroy(filename);
      }
      await shoes.updateOne({
         $pull: { images: { filename: { $in: req.body.deleteImages } } }
      });
   }
   req.flash('success', 'Successfully updated campgorund');
   res.redirect(`/shoes/${shoes._id}`);
};

module.exports.deleteShoes = async (req, res) => {
   const { id } = req.params;
   await Shoes.findByIdAndDelete(id);
   req.flash('success', 'Successfully deleted campground!');
   res.redirect('/shoes');
};
