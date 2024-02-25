const express = require('express')
app = express();
const Campground = require('../models/campg');
const Review = require('../models/reviews');
const { Campgroundschema, reviewschema } = require('../JoiSchemas/Schemas.js');

const wrapAsync = fn => {
    return function(req, res, next) {
        fn(req, res, next).catch(next);
    };
};

class ExpressError extends Error {
    constructor(message, statusCode) {
        super();
        this.message = message;
        this.statusCode = statusCode;
    }
}

const isLoggedIn = (req,res,next)=>{
    if(!req.isAuthenticated()){
        req.session.returnTo = req.originalUrl;
        req.flash('error', 'You must be signed in to continue!');
        return res.redirect('/login');
    }
    next();
}

const storeReturnTo = async (req,res,next)=>{
    if(req.session.returnTo){
        res.locals.returnTo = req.session.returnTo;
    }
    next();
}

const isAuthor = async (req,res,next)=>{
    const {id} = req.params;
    const campground = await Campground.findById(id);
    if(!campground.author.equals(req.user._id)){
        req.flash('error', "You don't have Permission to do that");
        return res.redirect(`/campground/${id}`);
    }
    next();
}

const isReviewAuthor = async (req,res,next)=>{
    const {campid, reviewid} = req.params;
    const review = await Review.findById(reviewid);
    if(!review.author.equals(req.user._id)){
        req.flash('error', "You don't have Permission to do that");
        return res.redirect(`/campground/${campid}`);
    }
    next();
}


const validateCampground = function(req, res, next) {
    const { error } = Campgroundschema.validate(req.body);
    if (error) {
        res.status(400).send('Invalid Campground data: ' + error.details[0].message);
    } else {
        next();
    }
}

const validateReview = function(req,res,next){
    const { error } = reviewschema.validate(req.body);
    if (error) {
        throw new ExpressError('Provide valid Review', 500);
    } else {
        next();
    }
}

module.exports = { wrapAsync, ExpressError, isLoggedIn, storeReturnTo, isAuthor, validateCampground, validateReview, isReviewAuthor};
