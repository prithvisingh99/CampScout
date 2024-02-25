const express = require('express');
const router = express.Router();
const Campground = require('../models/campg.js');
const { wrapAsync, ExpressError, isLoggedIn, isAuthor, validateCampground } = require('../utils/utils.js');
const campgrounds = require('../controller/campgrounds.js');
const multer = require('multer')
const {storage} = require('../cloudinary/index.js');
const upload = multer({storage})


router.get('/', wrapAsync(async(req,res,next)=>{
    res.render('home.ejs');
}));

router.get('/campground', campgrounds.getAllCampgrounds);

router.get('/campground/add', isLoggedIn, campgrounds.renderAddCampgroundForm);

router.post('/campground', isLoggedIn, upload.array('image'), validateCampground, campgrounds.addCampground);

router.get('/campground/:id/edit', isLoggedIn, isAuthor, campgrounds.renderEditCampgroundForm);

router.put('/campground/:id', isLoggedIn, isAuthor, upload.array('image'), validateCampground, campgrounds.updateCampground);

router.delete('/campground/:id', isLoggedIn, isAuthor, campgrounds.deleteCampground);

router.get('/campground/:id', campgrounds.getCampgroundById);

module.exports = router;
