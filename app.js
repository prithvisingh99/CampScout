if(process.env.NODE_env !== 'production'){
    require('dotenv').config();
}

const express = require('express');
const app = express();
const mongoose = require('mongoose');
const path = require('path');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const flash = require('connect-flash');
const crudRoutes = require('./routes/crudRoutes'); 
const reviewRoutes = require('./routes/reviewRoutes'); 
const userRoutes = require('./routes/userRoutes');
const { wrapAsync, ExpressError, isLoggedIn } = require('./utils/utils.js');
const User = require('./models/user.js');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy; 
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const dbUrl = process.env.DB_URL || //'mongodb://localhost:27017/yelpcamp';

// MongoDB Connection
mongoose.connect(dbUrl)
    .then(() => {
        console.log("MONGO CONNECTION OPEN!!!")
    })
    .catch(err => {
        console.log("OH NO MONGO CONNECTION ERROR!!!!")
        console.log(err)
    })

// Middlewares
app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

const secret = process.env.SECRET 

const store = MongoStore.create({
    mongoUrl: dbUrl,
    touchAfter: 24 * 60 * 60,
    crypto: {
        secret: secret
    }
});

store.on("error", (e)=>{
    console.log('SESSION STORE ERROR!', e);
})

const sessionconfig = {
    store: store,
    secret: secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        // secure: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
};
app.use(session(sessionconfig));
app.use(flash());
app.use(mongoSanitize({
    replaceWith: '_'
}));
const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    'https://api.tiles.mapbox.com/',
    'https://api.mapbox.com/',
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net"
  ];
  const styleSrcUrls = [
    'https://api.mapbox.com/',
    'https://api.tiles.mapbox.com/',
    'https://fonts.googleapis.com/',
    "https://stackpath.bootstrapcdn.com/",
    "https://use.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net"
  ];
  const connectSrcUrls = [
    'https://api.mapbox.com/',
    'https://a.tiles.mapbox.com/',
    'https://b.tiles.mapbox.com/',
    'https://events.mapbox.com/',
  ];
  const fontSrcUrls = ['fonts.googleapis.com', 'fonts.gstatic.com', "https://cdnjs.cloudflare.com/"];
  app.use(
    helmet.contentSecurityPolicy({
      directives: {
        defaultSrc: [],
        connectSrc: ["'self'", "'unsafe-inline'", ...connectSrcUrls],
        scriptSrc: ["'self'", "'unsafe-inline'", ...scriptSrcUrls],
        styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
        workerSrc: ["'self'", 'blob:'],
        objectSrc: [],
        imgSrc: ["'self'", 'blob:', 'data:', "https://res.cloudinary.com/dyg1vtjph/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
        "https://images.unsplash.com/",],
        fontSrc: ["'self'", ...fontSrcUrls],
      },
    })
  );

//Passport Setup
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate())); 

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    res.locals.currentuser = req.user;
    res.locals.success = req.flash('success');
    res.locals.delete = req.flash('delete');
    res.locals.reviewadded = req.flash('reviewadded');
    res.locals.error = req.flash('error');
    next();
});

// Routes
app.use('/', crudRoutes); 
app.use('/', reviewRoutes); 
app.use('/', userRoutes);

// Error Handling
app.all('*', wrapAsync(async(req, res, next) => {
    throw new ExpressError('Page not found', 404);
}));

app.use((err, req, res, next) => {
    console.error(err.stack);
    if (!err.message) {
        err.message = 'Oh no, Something went wrong';
    }
    res.status(err.statusCode || 500).render('error.ejs', { err });
});

// Server Setup
const port = process.env.PORT || 10000;
app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});
