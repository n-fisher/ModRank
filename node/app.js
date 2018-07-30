var express = require('express');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var ua = require('universal-analytics');
var sanitizer = require('sanitize')();

const app = express();
var index = require('./routes/index');
var item = require('./routes/item');
var compare = require('./routes/compare');
var chart = require('./routes/chart');

var router = express.Router();
var visitor = ua('UA-64719618-2');
var SteamAPIWorker = require('./SteamAPIWorker');

function SetupApp() {
    // view engine setup
    //app.set('SUPPORTED_APPS', SUPPORTED_APPS);
    app.set('visitor', visitor);
    app.set('views', path.join(__dirname, 'views'));
    app.set('view engine', 'jade');

    app.use(logger('dev'));
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({
        extended: false
    }));
    app.use(cookieParser());
    app.use(express.static(path.join(__dirname, '/public')));

    app.set('DBConnection', 'mongodb://mongodb:27017');

    app.use('/', index);
    app.use('/item', item);
    app.use('/compare', compare);
    app.use('/chart', chart);
    app.use('/api', router);

    //replace double slashes after URL
    app.use('//', function (req, res) {
        res.redirect(req.url.replace(/([^:]\/)\/+/g, "$1"));
    });

    router.get('/', function (req, res) {
        res.json({
            message: 'Connection succesful: ModRank API v1.0.0'
        });
        visitor.event("API", "Connection Test").send();
    });

    app.get('/robots.txt', function (req, res) {
        res.send("User-agent: *\nDisallow:\/*random*\nDisallow:\/*rand*\n");
    });


    router.route('items', function (req, res) {
        res.json({
            message: 'Connection succesful: ModRank Items API v1.0.0'
        });
        visitor.event("API", "Item Connection Test").send();
    });

    router.route('/items/:item_id').get(async function (req, res) {
        let cache = app.get('Cache');
        let item = await cache.getItem(sanitizer.value(req.params.item_id.substring(1), app.get('parserRegex')));
        visitor.event("API", "Item Lookup", req.params.item_id).send();
        //item not found
        item === null ?
          res.status(404).send({ error: "404 item not found" }) :
          res.json(doc);
    });

    // catch 404 and forward to error handler
    app.use(function (req, res, next) {
        var err = new Error('Not Found');
        err.status = 404;
        next(err);
    });

    // error handler
    app.use(function (err, req, res, next) {
        // set locals, only providing error in development
        res.locals.message = err.message;
        res.locals.error = req.app.get('env') === 'development' ? err : {};

        // render the error page
        res.status(err.status || 500);
        console.error(err);
        res.render('error');
    });

    let DBUpdater = new SteamAPIWorker(app, '294100');
    /*for (appid in ['294100']) {
       console.log(appid);
       //DBUpdater.Update(appid, true);
    }*/
    DBUpdater.keepUpToDate();

    // TODO: move the setinterval into DBUpdater.Update
    // check for update hourly, though only update if have waited > 12 hours
    

    app.set('parserRegex', /(https:\/\/steamcommunity\.com\/sharedfiles\/filedetails\/\?id=)?(\d+)|([Rr][Aa][Nn][Dd]([Oo][Mm])?)/);
    app.set('steamRegex', /https:\/\/steamcommunity\.com\/sharedfiles\/filedetails\/\?id=/);
    app.set('idRegex', /\d+/);
    module.exports = app;
}

SetupApp();