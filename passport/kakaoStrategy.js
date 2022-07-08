const passport = require('passport');
const KakaoStrategy = require('passport-kakao').Strategy;

const User = require('../models/user');

module.exports = () => {
    //For first param, settings configured
    passport.use(new KakaoStrategy({
        //ID generated from KAKAO: for security insert in .env file
        clientID: process.env.KAKAO_ID,
        //Router address to receive the result from kakao
        callbackURL: '/auth/kakao/callback',
    }, async(accessToken, refreshToken, profile, done) => {
        console.log('kakao profile', profile);
        try {
            const exUser = await User.findOne({
                where: {snsId: profile.id, provider:'kakao'},
            });
            if(exUser) {
                //If user already singed up
                done(null, exUser);
            } else {
                //No user: Do sign in process
                //profile object consists of user data
                const newUser = await User.create({
                    email: profile._json&&profile._json.kako_account_email,
                    nick: profile.displayName,
                    snsId:profile.id,
                    provider: 'kakao',
                });
                done(null, newUser);
            }
        } catch(err) {
            console.error(err);
            done(err);
        }
    }));
};