const Shoes = require('../models/shoes');
const { cloudinary } = require('../cloudinary');
const ObjectID = require('mongodb').ObjectID;

module.exports.index = async (req, res) => {
   const shoes = await Shoes.find({});
   res.render('shoes/index', { shoes });
};
