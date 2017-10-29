var File = require('../models/file.js'),
  Fish = require('../models/fishModel.js'),
  fs = require('fs'),
  csv = require('csv'),
  formidable = require('formidable'),
  path = require('path');

exports.upload = (req, res) => {
  // create an incoming form object
  var form = new formidable.IncomingForm();
  // specify that we want to allow the user to upload multiple files in a single request
  form.multiples = true;
  // store all uploads in the /uploads/fishId directory
  const saveDir = path.join(__dirname, '/uploads', `/${req.params.id||'test'}/`);
  if (!fs.existsSync(saveDir)) {
      fs.mkdirSync(saveDir);
  }
  form.uploadDir = saveDir;
  // every time a file has been uploaded successfully,
  // rename it to it's orignal name
  form.on('file', function(field, file) {
      fs.rename(file.path, path.join(form.uploadDir, file.name));
  });
  // log any errors that occur
  form.on('error', function(err) {
      console.log('An error has occured: \n' + err);
  });
  // once all the files have been uploaded, send a response to the client
  form.on('end', function() {
      res.end('success');
  });

  // parse the incoming request containing the form data
  form.parse(req, function(err, fields, files) {
      console.log("files")
      console.log("files");
      console.log(files['uploads[]'])
      if (err) throw err;
      var file = new File();
      file.type = files['uploads[]'].type;
      file.name = files['uploads[]'].name;
      file.fish = req.params.id;
      file.save().then(() => console.log('file added.'))
          .catch((e) => console.error(e));
  });

};

exports.csvUpload = (req, res) => {
  if (!req.user) {
      return res.end("Not authenticated");
  }
  if (!req.file) {
      return res.end("Please select a file to upload");
  }
  csv.parse(req.file.buffer.toString(), {
          columns: true,
          delimiter: ',',
          skip_empty_lines: true
      },
      function(err, rows) {
          if (err) throw err;

          rows.forEach(function(row) {
              let fish = new Fish();
              row['Order'] ? fish.order = row['Order'].trim() || null : null;
              row['Family'] ? fish.family = row['Family'].trim() || null : null;
              row['Genus'] ? fish.genus = row['Genus'].trim() || null : null;
              row['Species'] ? fish.species = row['Species'].trim() || null : null;
              row['Subspecies'] ? fish.subspecies = row['Subspecies'].trim() || null : null;
              row['Initial Tube Label'] ? fish.initial_tube_label = row['Initial Tube Label'].trim() || null : null;
              row['Lovejoy Lab Fishlist #'] ? fish.lovejoy_lab_number = row['Lovejoy Lab Fishlist #'] || null : null;
              row['Individual'] ? fish.individual = row['Individual'].trim() || null : null;
              row['DNA Prep #'] ? fish.dna_prep_number = row['DNA Prep #'].trim() || null : null;
              row['Museum Voucher Cat #'] ? fish.museum_voucher_cat_number = row['Museum Voucher Cat #'].trim() || null : null;
              row['Crampton EOD #'] ? fish.crampton_eod_number = row['Crampton EOD #'].trim() || null : null;
              row['Country'] ? fish.country = row['Country'].trim() || null : null;
              row['Locaility'] ? fish.locality = row['Locaility'].trim() || null : null;
              row['Latitude'] ? fish.latitude = row['Latitude'].trim() || null : null;
              row['Longitude'] ? fish.longitude = row['Longitude'].trim() || null : null;
              row['Date Collected'] ? fish.date_collected = row['Date Collected'].trim() || null : null;
              row['Notes'] ? fish.notes = row['Notes'].trim() || null : null;
              row['Added by:'] ? fish.added_by = row['Added by:'].trim() || null : null;
              fish.save().then((err, fish) => {
                  if (err) throw err;
              });
          })
      })
};

exports.download = (req, res) => {
  res.download(path.join(__dirname, 'uploads', req.params.id, req.params.fileName), function(err) {
      if (err) res.end("Sorry, an error occurred");
  });
};

exports.getFiles = (req, res) => {
  switch (req.query.field) {
      case 'Order':
      case 'Family':
      case 'Genus':
      case 'Species':
      case 'Subspecies':
          {
              var queryStr = `{"${req.query.field.toLowerCase().trim()}":"${req.query.value}"}`;
              // File.find(JSON.parse(queryStr))
              //     .exec()
              //     .then((fishList)=>{
              //         res.render('fishList.ejs', {fishList:fishList})
              //     })
              break;
          }
      default:
        {
            File.find().populate('fish').exec().then((filesList) => {

                if (req.query.json)
                    res.json(filesList);
                else
                    res.render('filesList.ejs', {
                        filesList: filesList
                    });
            })
        }
  }
};
