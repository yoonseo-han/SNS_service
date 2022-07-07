//Middleware to classify if user is logged in or not
exports.isLoggedIn = (req, res, next) => {
    //USe isAuthenticated() middleware
    if(req.isAuthenticated()) {
        //Can only move to next state only if logged in
        next();
    }
    else {
        req.status(403).send('Login required');
    }
};

exports.isNotLoggedIn = (req, res, next) => {
    if(!req.isAuthenticated()) {
        next();
    }
    else {
        const message = encodeURIComponent('Already Logged in');
        res.redirect(`/?error=${message}`);
    }
};
