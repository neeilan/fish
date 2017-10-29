var mongoose = require('mongoose');
    
var IssueSchema = new mongoose.Schema({
    description : String
});

module.exports = mongoose.model('Issue', IssueSchema);