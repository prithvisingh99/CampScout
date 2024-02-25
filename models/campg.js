const mongoose = require('mongoose')
const Review = require('./reviews.js')
const User = require('./user.js')

const opts = { toJSON: {virtuals: true}};

const campgSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    price: {
        type: Number
    },
    description: {
        type: String
    },
    location: {
        type: String,
        required: true
    },
    geometry:{
        type: {
            type: String, 
            enum: ['Point'],
            required: true
          },
          coordinates: {
            type: [Number],
            required: true
          }
    },
    image: [
        {
            url: String,
            filename: String
        }
    ],
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    reviews:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Review'
    }]
}, opts);

campgSchema.virtual('properties.popupMarkup').get(function(){
    return `<a href="/campground/${this._id}">${this.name}</a>`
})

campgSchema.post('findOneAndDelete', async function (campground) {
    if (campground) {
        // If campground is found and deleted, delete associated reviews
        await Review.deleteMany({ _id: { $in: campground.reviews } });
    }
});

const Campground = mongoose.model('Campground', campgSchema);

module.exports = Campground;