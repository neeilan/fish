var User = require('../models/userModel.js');

exports.renderLogin = function(req, res) {
  if (req.isAuthenticated()) {
      return res.redirect('/fishlist');
  }
  res.render('login.ejs');
};

exports.login =  null;

exports.createAdmin = (req, res) => {
  User.findOne({
      'email': 'admin'
  }, function(err, user) {
      if (!user) {
          var newUser = new User();
          newUser.email = 'admin';
          newUser.password = 'admin';
          newUser.role = 'admin';
          newUser.name = {
              first: 'admin'
          };
          newUser.save(function(user, e) {
              console.log(user);
              console.log(e);
              res.end('Created new admin');
          })
      } else {
          res.end('Admin already exists');
      }
  });
};

exports.logout = (req, res) => {
  req.logout();
  res.redirect('/login');
};

exports.viewUsers = (req, res) => {
  User.find({}, function(err, users) {
      if (err) {
          res.end('Error fetching users');
      }
      res.render('usersList', {
          users: users,
          isAdmin: req.user && req.user.role == 'admin'
      });
  })
};

exports.deleteUser = (req, res) => {
  if (!req.user || req.user.role != 'admin') return res.end("You do not have credentials to delete a user");
  User.findByIdAndRemove(req.params.id)
      .then(() => {
          return res.redirect('/users');
      }).catch((e) => {
          res.end("There was an error while deleting the user");
      })
};

exports.accountInfo = (req, res) => {
  res.end('No account info');
};

exports.createUser = (req, res) => {
  if (!req.user || req.user.role != 'admin') return res.end("You do not have credentials to create a user");
  if (!(req.body.firstName && req.body.lastName && req.body.email && req.body.password)) {
      return res.end("Please complete all the fields");
  }

  var user = new User();
  user.name.first = req.body.firstName;
  user.name.last = req.body.lastName;
  user.role = 'member';
  user.email = req.body.email;
  user.password = req.body.password;
  user.save().then(() => {
      res.redirect('/users');
  }).catch((e) => {
      res.end("There was an error creating the user.");
  })
};