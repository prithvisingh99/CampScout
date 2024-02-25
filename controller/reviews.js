const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();
const Campground = require('../models/campg.js');
const Review = require('../models/reviews.js');
const { wrapAsync, ExpressError, isLoggedIn, validateReview, isReviewAuthor} = require('../utils/utils.js');

// Function to handle adding a review
module.exports.addReview = wrapAsync(async (req, res, next) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    review.author = req.user._id;
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    console.log(review);
    req.flash('reviewadded', 'Review Added!!')
    res.redirect(`/campground/${campground._id}`);
});

// Function to handle deleting a review
module.exports.deleteReview = wrapAsync(async (req, res, next) => {
    const { campid, reviewid } = req.params
    await Campground.findByIdAndUpdate(campid, { $pull: { reviews: reviewid } })
    const review = await Review.findByIdAndDelete(reviewid);
    console.log(review)
    req.flash('error', 'Review Deleted!')
    res.redirect(`/campground/${campid}`)
});