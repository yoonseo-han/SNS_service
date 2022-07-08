const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');

const User = require('../models/user');

module.exports = () => {
    passport.use(new LocalStrategy({
        //req.body attribute name inserted
        usernameField: 'email',
        passwordField: 'password'
    }, async(email, password, done) => {
        try {
            //Find user that matches email
            const exUser = await User.findOne({where: email});
            if(exUser) {
                //Compare the password inserted and the password stored in server
                const result = await bcrypt.compare(password, exUser.password);
                //If password is same, send user info
                if(result) {
                    //done() send to auth router: send parameters to passport.authenticate()
                    done(null, exUser);
                } else {
                    //If password does not match: false in 2nd parameter and message send in 3rd parameter
                    done(null, false, {message: 'Password does not match'});
                }
            } else {
                done(null, false, {message: 'No user found'});
            }
        } catch(err) {
            console.error(err);
            done(err);
        }
    }));
};