const mongoose = require('mongoose')
const express = require('express')
app = express()
const Campground = require('../models/campg.js')
const cities = require('./cities.js')
const titles = require('./seedHelpers.js')

mongoose.connect('mongodb://localhost:27017/yelpcamp', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log("MONGO CONNECTION OPEN!!!")
    })
    .catch(err => {
        console.log("OH NO MONGO CONNECTION ERROR!!!!")
        console.log(err)
    })

const array = array => array[Math.floor(Math.random() * array.length)];
const seedDB = async () => {
    await Campground.deleteMany({});
    for (let i = 0; i <= 200; i++) {
        const rand = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 500) + 500;
        const newground = await new Campground({
            author: '65d2436e1f25f2d2d6a1ea2c', 
            location: `${cities[rand].city}, ${cities[rand].state}`,
            name: `${array(titles.descriptors)} ${array(titles.places)}`,
            price,
            geometry:{
              type: 'Point',
              coordinates: [cities[rand].longitude, cities[rand].latitude]
            },
            image: [
                {
                  fieldname: 'image',
                  originalname: '1305067.jpeg',
                  encoding: '7bit',
                  mimetype: 'image/jpeg',
                  url: 'https://res.cloudinary.com/dyg1vtjph/image/upload/v1708806993/YELPCAMP/m6tumtejyirmvko198gn.jpg',
                  size: 1167533,
                  filename: 'YELPCAMP/jdhj66jeqc7qxu0wulfk'
                },
                {
                  fieldname: 'image',
                  originalname: 'iexe3uqdtyo61.png',
                  encoding: '7bit',
                  mimetype: 'image/png',
                  url: 'https://res.cloudinary.com/dyg1vtjph/image/upload/v1708806994/YELPCAMP/lj2fxk4oe4frrrpyqqq6.png',
                  size: 2501631,
                  filename: 'YELPCAMP/r8njpgbuinrfsyszy94t'
                }
              ],
            description: 'Lorem ipsum dolor sit amet consectetur, adipisicing elit. Iure error accusantium eveniet quidem iste minima, aspernatur nulla, sapiente nobis earum sit unde. Consequatur non porro eaque. Incidunt, pariatur quo. Dicta.'
        })
        console.log('New Campground:', newground);
        await newground.save()
    }
}

seedDB();

