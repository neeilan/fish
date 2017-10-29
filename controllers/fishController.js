var Fish = require('../models/fishModel.js');
var FishGroup = require('../models/fishGroupModel.js');

exports.createFish = (req, res) => {
  if (!req.body.llnumber) {
      return res.end("Please enter a Lovejoy Lab Fishlist #");
  }
  console.log("Adding new fish");
  var fish = new Fish();
  fish.lovejoy_lab_number = req.body.llnumber;
  fish.save().then((fish) => {
      res.render('editFish.ejs', {
          fish: fish,
          groups: []
      });
  }).catch((e) => {
      res.end("There was an error creating this fish. Please ensure the Lovejoy lab number is unique");
  })
};

exports.deleteFish = (req, res) => {
  Fish.findByIdAndRemove(req.params.id)
      .then(() => {
          return res.redirect('/fishlist');
      }).catch((e) => {
          res.end("There was an error while deleting the fish");
      })
};

exports.update = (req, res) => {
  Fish.findByIdAndUpdate(req.params.id, req.body)
      .exec()
      .then(() => res.redirect('/fishlist'));
};


exports.getFishWithQuery = (req, res) => {
  var limit = 50;
  var queryStr1, queryStr2;

  if (req.query.value1 === 'null' || req.query.value1) {
      switch (req.query.field1) {
          case 'lovejoy_lab_number':
            queryStr1 = `{ "lovejoy_lab_number": "${req.query.value1}" } `;
            break;
          case 'Order':
          case 'Family':
          case 'Genus':
          case 'Species':
          case 'Individual':
          case 'Country':
          case 'Subspecies':
            {
                queryStr1 = `{ "${req.query.field1.toLowerCase().trim()}": { "$regex" : ".*${req.query.value1}.*"} } `;
                break;
            }
      }
  }

  if (req.query.value2 === 'null' || req.query.value2) {
      switch (req.query.field2) {
          case 'Order2':
          case 'Family2':
          case 'Genus2':
          case 'Individual2':
          case 'Country2':
          case 'Species2':
          case 'Subspecies2':
              {
                  queryStr2 = `{"${req.query.field2.slice(0, -1).toLowerCase().trim()}":"${req.query.value2}"}`;
                  break;
              }
      }
  }

  var queryStr = '{}';
  if (queryStr1 && queryStr2 && req.query.queryType) {
      if (req.query.queryType.toLowerCase() === 'and') {
          queryStr = `{ "$and" : [ ${queryStr1} , ${queryStr2} ] }`;
      }
      if (req.query.queryType.toLowerCase() === 'or') {
          queryStr = `{ "$or" : [ ${queryStr1} , ${queryStr2} ] }`;
      }
  } else if (queryStr1) {
      queryStr = queryStr1;
  } else {
      queryStr = queryStr2;
  }
  var count = queryStr ? Fish.count(JSON.parse(queryStr)) : Fish.count();
  var searchSummary = `${req.query.field1} = ${req.query.value1 || 'ANY'} ${req.query.queryType} ${req.query.field2} = ${req.query.value2 || 'ANY'}`;

  count.then((count) => {
    var skip = Math.abs((parseInt(req.query.page) - 1) * limit);
    var query = queryStr ? Fish.find(JSON.parse(queryStr), null, {
        skip: skip,
        limit: limit,
        sort: {
            lovejoy_lab_number: 1
        }
    }) : Fish.find(null, null, {
        limit: limit,
        skip: skip,
        sort: {
            lovejoy_lab_number: 1
        }
    });
    query.exec()
        .then((fishList) => {
            res.render('fishList.ejs', {
                fishList: fishList,
                search: !!queryStr,
                count: count,
                pages: Math.ceil(count / limit),
                currPage: req.query.page || 1,
                searchSummary: searchSummary
            });
        })
})
.catch((e) => {
    res.end('There was an error processing the query');
  })
};

exports.findFish = (req, res) => {
  FishGroup.find({
          owner: req.user.id
      })
      .exec(function(err, groups) {
          if (err) {
              throw new Error('Error fetching groups');
          }
          return groups;
      }).then(function(groups) {
          Fish.findById(req.params.id).exec().then((fish) => {
              if (fish)
                  res.render('editFish.ejs', {
                      fish: fish,
                      groups: groups
                  });
              else
                  throw new Error("Fish couldn't be found");
          })
      })
      .catch((e) => {
          res.json(e);
      })
};
