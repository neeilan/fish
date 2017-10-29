var bcrypt = require('bcryptjs'),
    mongoose = require('mongoose');
    
var UserSchema = new mongoose.Schema({
    email: { 
        type: String,
        lowercase: true
    },
    password: {
        type: String,
        set: function (password) {
            return password || this.password;
        }
    },
    name: {
        first: String,
        last: String
    },
    role: {
        type: String,
        enum: ['admin', 'owner', 'member']
    }
});

// hook: hash password if one is given
UserSchema.pre('save', function (next) {
    var user = this;
    if (!user.isModified('password')) 
        return next();
    bcrypt.genSalt(function (err, salt) {
        if (err) 
            return next(err);
        bcrypt.hash(user.password, salt, function (err, hash) {
            if (err) 
                return next(err);
            user.password = hash;
            next();
        });
    });
});

// check password given is valid
UserSchema.methods.checkPassword = function (password, callback) {
    bcrypt.compare(password, this.password, callback);
};

// check user's role
UserSchema.methods.hasRole = function (role) {
    return this.role == role;
};

module.exports = mongoose.model('User', UserSchema);