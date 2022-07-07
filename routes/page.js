const express = require('express');
const {isLoggedIn, isNotLoggedIn} = require('./middlewares');

const router = express.Router();

router.use((req,res,next) => {
    //Can approach user info via user object
    res.locals.user = req.user;
    res.locals.followerCount = 0;
    res.locals.followingCount = 0;
    res.locals.followerIdList = [];
    next();
});

//Can only view profile if in logged in status: Use middleware to verify
router.get('/profile', isLoggedIn, (req, res) => {
    res.render('profile', {title: 'Personal info - NodeBird'});
});

router.get('/join', isNotLoggedIn,(req, res) => {
    res.render('join', {title: 'Sign in - NodeBird'});
});

router.get('/', (req, res, next)=> {
    const twits = [];
    res.render('main', {
        title: 'NodeBird',
        twits,
    });
});

module.exports = router;