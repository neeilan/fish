var mongoose = require('mongoose');
    
var FishSchema = new mongoose.Schema({
    order : { type : String, default : 'null' },
    family : { type : String, default : 'null' },
    genus : { type : String, default : 'null' },
    species : { type : String, default : 'null' },
    subspecies : { type : String, default : 'null' },
    initial_tube_label : { type : String, default : 'null' },
    lovejoy_lab_number : { type : Number, required : true, unique : true },
    individual : { type : String, default : 'null' },
    dna_prep_number : { type : String, default : 'null' },
    museum_voucher_cat_number : { type : String, default : 'null' },
    crampton_eod_number : { type : String, default : 'null' },
    country : { type : String, default : 'null' },
    locality : { type : String, default : 'null' },
    latitude : { type : String, default : 'null' },
    longitude : { type : String, default : 'null' },
    date_collected : { type : String, default : 'null' }, // Date 
    notes : { type : String, default : 'null' },
    added_by : { type : String, default : 'null' },
    files: [{ type: mongoose.Schema.Types.ObjectId, ref: 'File' }]
});

module.exports = mongoose.model('Fish', FishSchema);