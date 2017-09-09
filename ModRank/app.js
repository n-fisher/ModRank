var express = require('express');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var fs = require('fs');
app = express();
var router = express.Router();
var sanitizer = require('sanitize')();

var index = require('./routes/index');
var item = require('./routes/item');
var compare = require('./routes/compare');
var discord = require('./discord');
var discordBot = new discord(app);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '/public')));

//api middleware
router.use(function (req, res, next) {
    console.log("API | Request made: " + req.url);
    next();
});

app.use('/', index);
app.use('/item', item);
app.use('/compare', compare);
app.use('/api', router);
//replace double slashes after URL
app.use('//', function (req, res) {
    res.redirect(req.url.replace(/([^:]\/)\/+/g, "$1"));
});

router.get('/', function (req, res) {
    res.json({ message: 'Connection succesful: ModRank API v1.0.0' })
});
router.route('item', function (req, res) {
    res.json({ message: 'Connection succesful: ModRank Item API v1.0.0' })
});

router.route('/item/:item_id').get(function (req, res) {
    cache = app.get('Cacher');
    var item = cache.getItem(sanitizer.value(req.params.item_id.substring(1), app.get('parserRegex')));
    //item not found
    if (item === null) {
        res.status(404).send({error: "404 item not found"});
        return;
    }
    else {
        res.json(item);
        return;
    }
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});


require('./UpdateDB')(app, true);
app.set('parserRegex', /(https:\/\/steamcommunity\.com\/sharedfiles\/filedetails\/\?id=)?(\d+)|([Rr][Aa][Nn][Dd]([Oo][Mm])?)/);
app.set('steamRegex', /https:\/\/steamcommunity\.com\/sharedfiles\/filedetails\/\?id=/);
app.set('idRegex', /\d+/);
module.exports = app; module.exports = app;