const passport = require('passport');
const local = require('./localStrategy');
const kakao = require('./kakaoStrategy');
const User = require('../models/user');

module.exports = () => {
    passport.serializeUser((user, done) => {
        //Decide which information to store in req.session
        done(null, user.id);
    });

    passport.deserializeUser((id, done) => {
        //Find user based on session id
        User.findOne({
            where: {id},
            include: [{
                model: User,
                attributes: ['id', 'nick'],
                as: 'Followers',
            }, {
                model: User,
                attributes: ['id', 'nick'],
                as:'Followings',
            }],
        })
            //Save user info into req.user
            .then(user => done(null, user))
            .catch(err => done(err));
    });

    local();
    kakao();
};