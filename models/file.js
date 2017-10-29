var async = require('async'),
    mongoose = require('mongoose');

var Fish = require('./fishModel');

var FileSchema = new mongoose.Schema({
    name: { type: String, required: true },
    type: String,
    fish : { type: mongoose.Schema.Types.ObjectId, ref: 'Fish' }
}, {
    timestamps: true
});
// Delete cascade
FileSchema.pre('remove', function (next) {
    var conditions = { files: { $in: [this._id] }},
        doc = { $pull: { files: this._id }},
        options = { multi: true };
    async.parallel([
        function delRef1(done) {
            Fish.update(conditions, doc, options).exec(done);
        }
    ], next);
});

// Check if file is an image
FileSchema.methods.isImage = function () {
    return this.type.indexOf('image') !== -1;
};
// Save file 
FileSchema.methods.store = function (obj, callback) {
    this.name = obj.filename;
    this.type = obj.mimetype;
    return this.save(function (err) {
        callback(err);
    });
};

module.exports = mongoose.model('File', FileSchema);