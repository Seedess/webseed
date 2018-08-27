var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var debug = require('debug')('torrent-webseed:app')

var routes = require('./routes/index');
var torrent = require('./routes/torrent');
var file = require('./routes/file');

var app = express();

var env = process.env.NODE_ENV || 'development';
app.locals.ENV = env;
app.locals.ENV_DEVELOPMENT = env == 'development';

// cors
app.use(function(req, res, next) {
  console.log(req.headers.host)
  res.header("Access-Control-Allow-Origin", req.headers.origin);
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Range");
  res.header("Access-Control-Allow-Credentials", "true");
  next();
});

// view engine setup


// app.use(favicon(__dirname + '/public/img/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// precedence is important
app.use('/', routes);
app.use('/torrent', torrent);
app.use('/file', file);

/// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/// error handlers

// development error handler
// will print stacktrace
app.showError = function(err, req, res, next) {
  res.status(err.status || 500);
  res.json(err)
}


if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    app.showError(err, req, res, next)
  })
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500)
    res.json(err)
});


module.exports = app;
