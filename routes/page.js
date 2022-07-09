const express = require('express');
const {isLoggedIn, isNotLoggedIn} = require('./middlewares');
const {Post, User, Hashtag} = require('../models');

const router = express.Router();

router.use((req,res,next) => {
    //Can approach user info via user object
    res.locals.user = req.user;
    res.locals.followerCount = req.user? req.user.Followers.length : 0;
    res.locals.followingCount = req.user? req.user.Followings.length: 0;
    res.locals.followerIdList = req.user? req.user.Followings.map(f=>f.id) : [];
    next();
});

//Can only view profile if in logged in status: Use middleware to verify
router.get('/profile', isLoggedIn, (req, res) => {
    res.render('profile', {title: 'Personal info - NodeBird'});
});

router.get('/join', isNotLoggedIn,(req, res) => {
    res.render('join', {title: 'Sign in - NodeBird'});
});

router.get('/', async (req, res, next)=> {
    try {
        //Find posts from database
        const posts = await Post.findAll({
            include: {
                model: User,
                attributes: ['id', 'nick'],
            },
            //Order in how posts will be viewed
            order: [['createdAt', 'DESC']],
        })
        res.render('main', {
            title: 'NodeBird',
            //Insert the founded posts
            twits: posts,
        });
    } catch(err) {
        console.error(err);
        next(err);
    }
});

router.get('/hashtag', async(req, res, next) => {
    //Receive hashtag in query string
    const query = req.query.hashtag;
    if(!query) {
        return res.redirect('/');
    }
    try {
        //Find hashtag based on hashtag
        const hashtag = await Hashtag.findOne({where: {title: query}});
        let posts = [];
        if(hashtag) {
            //get all posts from hashtag: add user info
            posts = await hashtag.getPosts({include: [{model:User}]});
        }

        return res.render('main', {
            title: `${query} | NodeBird`,
            //Render posts to twits
            twits: posts,
        });
    } catch(err) {
        console.error(err);
        return next(err);
    }
});

module.exports = router;