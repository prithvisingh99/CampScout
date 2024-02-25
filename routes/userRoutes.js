const express = require('express')
app = express();
const mongoose = require('mongoose')
const router = express.Router();
const User = require('../models/user');
const { wrapAsync, isLoggedIn, storeReturnTo } = require('../utils/utils');
const passport = require('passport');
const users = require('../controller/users');

router.get('/register', users.renderRegisterForm);

router.post('/register', users.registerUser);

router.get('/login', users.renderLoginForm);

router.post('/login', storeReturnTo, passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), users.loginUser);

router.post('/logout', users.logoutUser);

module.exports = router;