const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();
const Campground = require('../models/campg.js');
const { wrapAsync, ExpressError, isLoggedIn, isAuthor, validateCampground } = require('../utils/utils.js');
const {cloudinary} = require('../cloudinary/index.js')
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding.js')
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });


// Function to get all campgrounds
module.exports.getAllCampgrounds = wrapAsync(async (req, res, next) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/showAll.ejs', { campgrounds });
});

// Function to render form for adding a new campground
module.exports.renderAddCampgroundForm = (req, res) => {
    res.render('campgrounds/add.ejs');
};

// Function to handle adding a new campground
module.exports.addCampground = wrapAsync(async (req, res, next) => {
    const {location} = req.body;
    const geodata = await geocoder.forwardGeocode({
        query: location,
        limit: 1
    }).send()
    const campground = await new Campground(req.body);
    campground.geometry = geodata.body.features[0].geometry
    campground.image = req.files.map(o => ({url: o.path, filename: o.filename}))
    campground.author = req.user._id;
    await campground.save();
    console.log(campground);
    req.flash('success', 'Successfully made a new campground!!');
    res.redirect(`/campground/${campground._id}`);
});

// Function to render form for editing a campground
module.exports.renderEditCampgroundForm = wrapAsync(async (req, res, next) => {
    const {id} = req.params;
    const campground = await Campground.findById(id);
    if(!campground){
        req.flash('error', 'Campground not Found');
        return res.redirect('/campground');
    }
    res.render('campgrounds/edit.ejs', { campground });
});

// Function to update a campground
module.exports.updateCampground = wrapAsync(async (req, res, next) => {
    const { id } = req.params;
    const updated = await Campground.findByIdAndUpdate(id, req.body);
    if(req.files){
        const imgs = req.files.map(o => ({url: o.path, filename: o.filename}));
        updated.image.push(...imgs);
    }
    await updated.save();
    if(req.body.deleteImage){
        for(let filename of req.body.deleteImage){
            await cloudinary.uploader.destroy(filename);
        }
        await updated.updateOne({$pull: {image: {filename: {$in: req.body.deleteImage}}}})
    }
    req.flash('success', 'Campground Updated!!');
    res.redirect(`/campground/${id}`);
});

// Function to delete a campground
module.exports.deleteCampground = wrapAsync(async (req, res, next) => {
    const { id } = req.params;
    const deleted = await Campground.findByIdAndDelete(id);
    req.flash('error', 'Campground Deleted!!');
    res.redirect('/campground');
});

// Function to get a single campground
module.exports.getCampgroundById = wrapAsync(async (req, res, next) => {
    const { id } = req.params;
    const campground = await Campground.findById(id).populate({path: 'reviews', populate:{path:'author'}}).populate('author');
    res.render('campgrounds/showById.ejs', { campground });
});


