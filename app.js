var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var debug = require('debug')('seedess:server')

var app = express();

app.set('env', process.env.NODE_ENV || 'development')
debug('env', app.get('env'))

// cors
app.use(function(req, res, next) {
  const origin = req.headers.origin || '*'
  debug('Sending cors headers', origin)
  res.header("Access-Control-Allow-Origin", origin);
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Range");
  res.header("Access-Control-Allow-Credentials", "true");
  next();
});

app.use(favicon(__dirname + '/public/images/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(cookieParser());
app.use((req, res, next) => {
  res.header('Accept-Ranges', 'bytes')
  next()
})
app.use(express.static(path.join(__dirname, 'public')));

/**
 * add routes
 */
app.addRoutes = () => {
  app.use('/', require('./routes/index'));
  app.use('/torrent', require('./routes/torrent'));
  app.use('/file', require('./routes/file'));
  app.use('/url', require('./routes/url'))
}

/**
 * catch 404 and forward to error handler
 */
app.catch404 = () => {
  app.use(function(req, res, next) {
    debug('404 Error')
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
  });
}

/**
 * in production error handler no stacktraces leaked to user
 */
app.catchErrors = () => {
  app.use(function(error, req, res, next) {
    error = error || {}
    const { status, message, stack } = error
    error.status = error.status || 500;
    const env = app.get('env')

    debug('Error', env, error)
    res.status(error.status || 500)
    if (env === 'development') {
      res.json({ error: { status, message, stack } })
    } else {
      res.json({ error: { status, message } })
    }
  });
}


module.exports = app;
