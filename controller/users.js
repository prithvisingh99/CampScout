const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();
const User = require('../models/user');
const { wrapAsync, isLoggedIn, storeReturnTo } = require('../utils/utils');
const passport = require('passport');

// Function to render registration form
module.exports.renderRegisterForm = (req, res) => {
    res.render('auth/register.ejs');
};

// Function to handle user registration
module.exports.registerUser = wrapAsync(async (req, res, next) => {
    try {
        const { username, email, password } = req.body;
        const newuser = await new User({ email, username });
        const registeredUser = await User.register(newuser, password);
        req.login(registeredUser, err => {
            if (err) return next(err);
            req.flash('success', 'Welcome to Campgrounds');
            return res.redirect('/campground');
        });
    } catch (e) {
        req.flash('error', e.message);
        res.redirect('/register');
    }
});

// Function to render login form
module.exports.renderLoginForm = (req, res) => {
    res.render('auth/login.ejs');
};

// Function to handle user login
module.exports.loginUser = wrapAsync(async (req, res, next) => {
    req.flash('success', 'Welcome Back')
    const redirectUrl = res.locals.returnTo || '/campground';
    res.redirect(redirectUrl);
});

// Function to handle user logout
module.exports.logoutUser = wrapAsync(async (req, res, next) => {
    req.logout(() => {
        req.flash('success', 'Goodbye!');
        res.redirect('/campground');
    });
});
