const mongoose = require('mongoose')
const express = require('express')
app = express();
const User = require('./user');

const reviewSchema = new mongoose.Schema({
    body:{
        type: String,
        required: true
    },
    rating:{
        type: Number,
        required: true
    },
    author:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}) 

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;