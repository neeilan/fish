var mongoose = require('mongoose');

var Fish = require('./fishModel'),
    User = require('./userModel');

var FishGroup = new mongoose.Schema({
    name: { type: String, required: true },
    owner : { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    fish : [{ type: mongoose.Schema.Types.ObjectId, ref: 'Fish' }]
}, {
    timestamps: true
});

module.exports = mongoose.model('FishGroup', FishGroup);