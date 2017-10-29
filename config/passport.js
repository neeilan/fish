var passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy;

var User = require('../models/userModel.js');

passport.serializeUser(function (user, done) {
    done(null, user.id);
});

passport.deserializeUser(function (id, done) {
    User.findById(id, '-password', function (err, user) { 
        if (err){
            return done(err);
        }
        done(null, user);
    });
});

passport.use('local-signup', new LocalStrategy({
    usernameField: 'email',
    passReqToCallback : true
}, 
function (req, email, password, done) {
    process.nextTick(function() {
        User.findOne({ 'email': email }, function (err, user) {
            if (err) {
                return done(err);
            }
            if (user) {
                return done(null, false, { 'message': 'Email is already taken' });
            }
            // create a new user
            user = new User({
                email: email,
                password: password
            });
            user.save(function (err) {
                if (err) {
                    return done(err);
                }
                return done(null, user);
            });
        });
    });
}));

passport.use('local-login', new LocalStrategy({
    usernameField: 'email',
    passReqToCallback: true,
    failureFlash: true
}, function (req, email, password, done) {
    User.findOne({ 'email': email }, function (err, user) {
        if (err || !user) {
            return done(null, false, { message: 'Invalid email' });
        }
        user.checkPassword(password, function (err, res) {
            if (err || !res) {
                return done(null, false, { message: 'Invalid password' });
            }
            done(null, user);
        });
    });
}));


module.exports = passport;