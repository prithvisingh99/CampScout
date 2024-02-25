const express = require('express');
const router = express.Router();
const Campground = require('../models/campg.js');
const Review = require('../models/reviews.js');
const { wrapAsync, ExpressError, isLoggedIn, validateReview, isReviewAuthor} = require('../utils/utils.js');
const reviews = require('../controller/reviews.js');

router.post('/campground/:id/reviews', isLoggedIn, validateReview, reviews.addReview);

router.delete('/campground/:campid/reviews/:reviewid', isLoggedIn, isReviewAuthor, reviews.deleteReview);

module.exports = router;

