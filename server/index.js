var express = require('express'),
    cors = require('cors'),
    params = require('express-params'),
    bodyParser = require('body-parser'),
    errorhandler = require('errorhandler'),
    http = require('http');

var log4js = require('log4js');
var logger = log4js.getLogger('server');

boot();

function boot() {
    var app = initializeExpress();
    var server = http.createServer(app);

    require('./api')(app);

    server.listen(app.get('port'), function () {
        logger.info('Hive listening on port ' + app.get('port'));
    });
}

function initializeExpress() {
    var app = express();

    //params.extend(app);

    var corsOptions = {
        origin: '*',
        methods: 'GET,PUT,POST,DELETE'
    };

    app.set('port', process.env.PORT || 10010);
    app.use(cors(corsOptions));
    app.use(bodyParser.json());

    // development only
    if (process.env.NODE_ENV === 'development') {
        // only use in development
        app.use(errorhandler())
    }

    return app;
}