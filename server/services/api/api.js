var express         = require('express');
var bodyParser      = require('body-parser');
var errorHandler    = require('error-handler');
var elasticsearch   = require('elasticsearch');
var AuthMiddleware  = require('./auth-middleware');
var winston         = require('winston');

function API(config, authService) {
    this.config = config;
    this.authService = authService;

    this.app = express();
    this.pp = null;
}

API.prototype.passport = function() {
    if (! this.pp) {
        this.pp = require('passport');
        this.pp.serializeUser(function(user, done) { done(null, user); });
        this.pp.deserializeUser(function(obj, done) { done(null, obj); });
    }

    return this.pp;
};

API.prototype.listen = function() {
    var self = this;

    if (this.pp) {
        this.app.use(this.pp.initialize());
        this.app.use(AuthMiddleware.auth(this.authService));
    }

    this.app.use(bodyParser.urlencoded({ extended: false }));
    this.app.use(bodyParser.json());
    this.app.use(errorHandler);


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