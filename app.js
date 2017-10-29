'use strict'
const express = require('express'),
    app = express(),
    mongoose = require('mongoose'),
    multer = require('multer'),
    session = require('express-session'),
    MongoStore = require('connect-mongo')(session),
    bodyParser = require('body-parser'),
    csv = require('csv'),
    flash = require('connect-flash'),
    config = require('./config/config.js'),
    Issue = require('./models/issueModel.js'),
    passport = require('./config/passport.js');

var FishGroupController = require('./controllers/fishGroupController');
var FishController = require('./controllers/fishController');
var UserController = require('./controllers/userController');
var FileController = require('./controllers/fileController');

// ORM
mongoose.connect(config.db.url);

// Request body parsing
app.use(bodyParser.json({
    limit: '5mb'
}));
app.use(bodyParser.urlencoded({
    extended: true,
    limit: '5mb'
}));

var csvUpload = multer({
    storage: multer.MemoryStorage
});

// View setup
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');
app.use(flash());


// Auth
var sessionStore = new MongoStore({
    mongooseConnection: mongoose.connection
});
app.use(session({
    secret: config.session.secret,
    saveUninitialized: false,
    store: sessionStore,
    resave: false
}));
app.use(passport.initialize());
app.use(passport.session());


// pass the user object to all responses
app.use(function(req, res, next) {
    res.locals.flash = req.flash();
    res.locals.user = req.user;
    next();
});

// ROUTES
app.get('/upload', (req, res) => {
    res.render('index.ejs');
});

app.get('/', function(req, res) {
    if (req.isAuthenticated())
        return res.redirect('/fishlist');
    res.redirect('/login');
})

app.get('/fishlist', FishController.getFishWithQuery);
app.get('/fish/:id', FishController.findFish);
app.post('/fish/:id', FishController.update);
app.post('/', csvUpload.single('file'), FileController.csvUpload);


app.post('/fish/:id/fileupload', FileController.upload);
app.get('/files', FileController.getFiles);
app.get('/files/:id/:fileName', FileController.download);


app.get('/login', UserController.renderLogin);
app.post('/login', passport.authenticate('local-login', {
    successRedirect: '/fishlist',
    failureRedirect: '/login',
    failureFlash: true
}));

app.get('/createadmin', UserController.createAdmin);
app.get('/logout', UserController.logout);
app.get('/account', UserController.accountInfo);
app.get('/users', UserController.viewUsers);
app.post('/deleteuser/:id', UserController.deleteUser);
app.post('/newuser', UserController.createUser);


app.get('/fishgroups', FishGroupController.viewFishGroups);
app.post('/newgroup', FishGroupController.createFishGroup);
app.post('/addfish/:fishid', FishGroupController.addFishToGroup);
app.post('/removeFishFromGroup/:fishid', FishGroupController.removeFishFromGroup);
app.post('/deletefishgroup/:id', FishGroupController.deleteFishGroup);


app.post('/deletefish/:id', FishController.deleteFish);
app.post('/newfish', FishController.createFish);

// Dev issues
app.get('/issues', (req, res) => {
    Issue.find().then((issues) => {
        res.render('issues.ejs', {
            issues: issues
        });
    })
})

app.post('/issue', (req, res) => {
    var issue = new Issue();
    issue.description = req.body.description;
    issue.save().then(function() {
        res.redirect("/issues");
    })
})

app.listen(config.port, () => console.log('Listening on port ' + config.port ));