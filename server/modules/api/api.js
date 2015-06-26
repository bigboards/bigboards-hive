var express         = require('express');
var bodyParser      = require('body-parser');
var errorHandler    = require('error-handler');
var elasticsearch   = require('elasticsearch');
var AuthMiddleware  = require('./auth-middleware');
var winston         = require('winston');
var cors            = require('cors');
var OAuth           = require('./oauth');

function API(config, authService) {
    this.config = config;
    this.authService = authService;

    var corsOptions = {
        origin: this.config.frontend_url,
        methods: ['GET', 'PUT', 'POST', 'DELETE']
    };

    this.app = express();
    this.app.use(cors(corsOptions));

    var self = this;
    var onUserLogin = function(accessToken, profileId, profileData, done) {
        return self.authService.login(profileId, accessToken, profileData)
            .then(function(user) {
                return done(null, user);
            })
            .fail(function(error) {
                return done(error, null);
            });
    };

    // -- passport
    this.pp = require('passport');
    this.pp.serializeUser(function(user, done) { done(null, user); });
    this.pp.deserializeUser(function(obj, done) { done(null, obj); });
    this.pp.use(OAuth.strategies.google(this.config, onUserLogin));
    this.pp.use(OAuth.strategies.github(this.config, onUserLogin));

    this.app.use(this.pp.initialize());

    this.app.use(AuthMiddleware.auth(this.authService));
    this.app.use(bodyParser.urlencoded({ extended: false }));
    this.app.use(bodyParser.json());
    this.app.use(errorHandler);
}

API.prototype.passport = function() {
    return this.pp;
};

API.prototype.listen = function() {
    var self = this;

    this.app.listen(this.config.port, function () {
        winston.info();
        winston.info('API listening on port ' + self.config.port);
        winston.info();
    });
};

// ====================================================================================================================
// == API METHODS
// ====================================================================================================================

API.prototype.registerHead = function(path, fn) {
    this.app.head(path, fn);
    winston.info('   [HEAD] ' + path);
};

API.prototype.registerSecureHead = function(path, guard, fn) {
    this.app.head(path, guard, fn);
    winston.info('   [HEAD] ' + path);
};

API.prototype.registerGet = function(path, fn) {
    this.app.get(path, fn);
    winston.info('   [GET] ' + path);
};

API.prototype.registerSecureGet = function(path, guard, fn) {
    this.app.get(path, guard, fn);
    winston.info('   [GET] ' + path);
};

API.prototype.registerPut = function(path, fn) {
    this.app.put(path, function(req, res) { return fn(req, res); });
    winston.info('   [PUT] ' + path);
};

API.prototype.registerSecurePut = function(path, guard, fn) {
    this.app.put(path, guard, function(req, res) { return fn(req, res); });
    winston.info('   [PUT] ' + path);
};

API.prototype.registerPost = function(path, fn) {
    this.app.post(path, function(req, res) { return fn(req, res); });
    winston.info('  [POST] ' + path);
};

API.prototype.registerSecurePost = function(path, guard, fn) {
    this.app.post(path, guard, function(req, res) { return fn(req, res); });
    winston.info('  [POST] ' + path);
};

API.prototype.registerDelete = function(path, fn) {
    this.app.delete(path, function(req, res) { return fn(req, res); });
    winston.info('[DELETE] ' + path);
};

API.prototype.registerSecureDelete = function(path, guard, fn) {
    this.app.delete(path, guard, function(req, res) { return fn(req, res); });
    winston.info('[DELETE] ' + path);
};

module.exports = API;