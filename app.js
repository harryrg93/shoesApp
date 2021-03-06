if (process.env.NODE_ENV !== 'production') {
   require('dotenv').config();
}

const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const session = require('express-session');
const flash = require('connect-flash');
const ExpressError = require('./utils/ExpressError');
const methodOverride = require('method-override');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');
const helmet = require('helmet');

const mongoSanitize = require('express-mongo-sanitize');

const userRoutes = require('./routes/users');
const shoesRoutes = require('./routes/shoes');
const reviewsRoutes = require('./routes/reviews');

const MongoStore = require('connect-mongo');

const dbUrl = 'mongodb://localhost:27017/shoesdb';
// process.env.DB_URL ||
mongoose.connect(dbUrl, {
   useNewUrlParser: true,
   useUnifiedTopology: true
});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
   console.log('DB Connected');
});

const app = express();

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(mongoSanitize());

const secret = process.env.SECRET || 'thisshouldbeabettersecret';

const store = MongoStore.create({
   mongoUrl: dbUrl,
   touchAfter: 24 * 60 * 60,
   crypto: {
      secret
   }
});

const sessionConfig = {
   store,
   name: 'sessionApp',
   secret,
   resave: false,
   saveUninitialized: true,
   cookie: {
      httpOnly: true,
      //secure: true,
      expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
      maxAge: 1000 * 60 * 60 * 24 * 7
   }
};
app.use(session(sessionConfig));
app.use(flash());
app.use(helmet({ contentSecurityPolicy: false }));

const scriptSrcUrls = [
   'https://stackpath.bootstrapcdn.com',
   'https://kit.fontawesome.com',
   'https://cdnjs.cloudflare.com',
   'https://cdn.jsdelivr.net'
];
const styleSrcUrls = [
   'https://kit-free.fontawesome.com',
   'https://stackpath.bootstrapcdn.com',
   'https://fonts.googleapis.com',
   'https://use.fontawesome.com',
   'https://cdn.jsdelivr.net',
   'https://maxcdn.bootstrapcdn.com'
];
const connectSrcUrls = [];
const fontSrcUrls = ['https://maxcdn.bootstrapcdn.com'];
app.use(
   helmet.contentSecurityPolicy({
      directives: {
         defaultSrc: [],
         connectSrc: ["'self'", ...connectSrcUrls],
         scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
         styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
         workerSrc: ["'self'", 'blob:'],
         childSrc: ['blob:'],
         objectSrc: [],
         imgSrc: [
            "'self'",
            'blob:',
            'data:',
            `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/`, //SHOULD MATCH YOUR CLOUDINARY ACCOUNT!
            'https://images.unsplash.com',
            'https://martialartsplusinc.com/wp-content/uploads/2017/04/default-image-620x600.jpg'
         ],
         fontSrc: ["'self'", ...fontSrcUrls]
      }
   })
);

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
   if (!['/login', '/'].includes(req.originalUrl)) {
      req.session.previousReturnTo = req.session.returnTo;
      req.session.returnTo = req.originalUrl;
   }
   res.locals.currentUser = req.user;
   res.locals.success = req.flash('success');
   res.locals.error = req.flash('error');
   next();
});

app.use('/', userRoutes);
app.use('/shoes', shoesRoutes);
app.use('/shoes/:id/reviews', reviewsRoutes);

app.get('/', (req, res) => {
   res.render('home');
});

app.get('/contact', (req, res) => {
   res.render('contact');
});

app.all('*', (req, res, next) => {
   req.session.returnTo = req.session.previousReturnTo;
   next(new ExpressError('Page Not Found', 404));
});

app.use((err, req, res, next) => {
   const { statusCode = 500 } = err;
   if (!err.message) err.message = 'Something went wrong';
   // req.flash('error', err.message);
   req.flash('error', err.message);
   const redirecUrl = req.session.returnTo || '/shoes';
   delete req.session.returnTo;
   res.status(statusCode).redirect(redirecUrl);
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
   console.log(`Serving on port ${port}`);
});
