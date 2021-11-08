const mongoose = require('mongoose');
const { brands, descriptors } = require('./seedHelpers');
const Shoes = require('../models/shoes');
const Review = require('../models/review');

mongoose.connect('mongodb://localhost:27017/shoesdb', {
   useNewUrlParser: true,
   useUnifiedTopology: true
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
   console.log('DB Connected');
});

const sample = (array) => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
   await Shoes.deleteMany({});
   await Review.deleteMany({});
   for (let i = 0; i < 10; i++) {
      let tempSample = sample(brands);
      const random1000 = Math.floor(Math.random() * 1000);
      const price = Math.floor(Math.random() * 20) + 10;
      const camp = new Shoes({
         author: '617073a61d1908d189ca4ed0',
         title: `${sample(descriptors)} ` + tempSample,
         images: [
            {
               url: 'https://res.cloudinary.com/darkharg/image/upload/v1631070958/YelpCamp/qxyplkwarx06q9u6oizt.jpg',
               filename: 'YelpCamp/qxyplkwarx06q9u6oizt'
            },
            {
               url: 'https://res.cloudinary.com/darkharg/image/upload/v1631070982/YelpCamp/s7kztbabk3pe8vlwnbxt.jpg',
               filename: 'YelpCamp/s7kztbabk3pe8vlwnbxt'
            }
         ],
         // 'https://source.unsplash.com/collection/483251',
         description:
            'Lorem, ipsum dolor sit amet consectetur adipisicing elit. Unde voluptates dicta magni et nisi explicabo excepturi aperiam ducimus fugit accusamus accusantium ipsum obcaecati tempore maiores enim, officia facere non! Eos ab doloribus nulla. Eaque quo atque, animi quas, officia ex et deleniti quia, dolor quis commodi fuga voluptas magni aliquid?',
         price,
         brand: tempSample,
         size: '38, 39, 40',
         colors: ['black', 'blue', 'white'],
         model: tempSample + random1000,
         category: ['tennis', 'outsite']
      });
      await camp.save();
   }
};

seedDB().then(() => {
   mongoose.connection.close();
});
