const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const {Post, Hashtag} = require('../models');
const {isLoggedIn} = require('./middlewares');
const { __esModule } = require('passport-kakao/dist/Strategy');

const router = express.Router();

try {
    //Read contents in given directory
    fs.readdirSync('uploads');
} catch(err) {
    console.error('No uploads folder. Generate folder');
    fs.mkdirSync('uploads');
}

const upload = multer({
    storage: multer.diskStorage({
        //Destination attribute setup
        destination(req, file, done) {
            //Second parameter: path passed
            done(null, 'uploads/');
        },
        //Filename attribute setup
        //file: consists of the information regarding uploaded file
        filename(req, file, done) {
            const ext = path.extname(file.originalname);
            //second parameter: file name passed (current time passed to prevent same file name)
            done(null, path.basename(file.originalname, ext) + Date.now() + ext);
        }
    }),
    //Limit file size for upload
    limits: {fileSize: 5*1024*1024},
})

//By the upload.single middleware, after uploading file: req.file object created (stores the result)
router.post('/img', isLoggedIn, upload.single('img'), (req, res) => {
    //Receive file img from client
    console.log(req.file);
    //respond with client: send the path of image file
    res.json({url: `/img/${req.file.filename}`});
});

const upload2 = multer();
router.post('/', isLoggedIn, upload2.none(), async(req, res, next) => {
    try {
        const post = await Post.create({
            content: req.body.content,
            //If router uploaded image, the address of image is sent in req.body.url
            img: req.body.url,
            UserId: req.user.id,
        });
        //Retrieve hashtags from main content
        const hashtags = req.body.content.match(/#[^\s#]+/g);
        if(hashtags) {
            const result = await Promise.all(
                //Map function to modify all hashtag quotes
                hashtags.map(tag => {
                    //findOrCreate method: If hashtag exist in DB retrieve it , else create and retrieve
                    return Hashtag.findOrCreate({
                        //Remove the # sign infront and change all letters to lowercase
                        where: {title: tag.slice(1).toLowerCase()},
                    })
                }),
            );
            //Return value of findOrCreate comes in structure of [Model, Create Success or not]
            //Use post.addHashtags method to connect post with hashtags in DB
            await post.addHashtags(result.map(r=>r[0]));
        }

    } catch(err) {
        console.error(err);
        next(err);
    }
});

module.exports = router;