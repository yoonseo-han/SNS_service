//Router for Sign in, Log in and Log out

const express = require('express');
const passport = require('passport');
const bcrypt = require('bcrypt');
const {isLoggedIn, isNotLoggedIn} = require('./middlewares');
const User = require('../models/user');

const router = express.Router();

//Sign in router
router.post('/join', isNotLoggedIn, async(req, res, next) => {
    const {email, nick, password} = req.body;
    try {
        //Find if email already exist
        const exUser = await User.findOne({where: {email}});
        //If user with email exist
        if(exUser) {
            //Redirect to signup page
            return res.redirect('/join?error=exist');
        }
        //If no user with email exist: password is encrypted
        const hash = await bcrypt.hash(password, 12);
        //create new user based on generated password
        await User.create({
            email,
            nick,
            password: hash,
        });
        return res.redirect('/');
    } catch(err) {
        console.error(err);
        return next(err);
    }
});

//Log in router
router.post('/login', isNotLoggedIn, (req, res, next) => {
    //Consists of a middleware to deal with login function
    //Add middleware inside middleware to add
    passport.authenticate('local', (authError, user, info) => {
        //if authError exist: method is failed
        if(authError) {
            console.error(authError);
            return next(authError);
        }
        //If user doesnt exist, error caused
        if(!user) {
            return res.redirect(`/?loginError=${info.message}`);
        }
        //If no error, return req.login method
        //req.login method calls passport.serializeUser
        return req.login(user, (loginError) => {
            if(loginError) {
                console.error(loginError);
                return next(loginError);
            }
            //Redirect to main page
            return res.redirect('/');
        });
    }) (req, res, next); //Middleware inside a middleware consists of (req, res, next)
});

//Log out router
router.get('/logout', isLoggedIn, (req, res) => {
    //Remove req.user object
    req.logout();
    //remove req.session object info
    req.session.destroy();
    //Return to main page
    res.redirect('/');
});

//Kakao login router
router.get('/kakao', passport.authenticate('kakao'));

//Get login status result
router.get('/kakao/callback', passport.authenticate('kakao', {
    failureRedirect: '/',
}), (req,res) => {
    res.redirect('/');
}); 

module.exports = router;