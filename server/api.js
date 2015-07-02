var express         = require('express');
var bodyParser      = require('body-parser');
var errorHandler    = require('error-handler');
var elasticsearch   = require('elasticsearch');
var AuthMiddleware  = require('./auth-middleware');
var winston         = require('winston');
var cors            = require('cors');
var OAuth           = require('./oauth'),
    Errors          = require('./api-errors'),
    ResponseHandler = require('./utils/response-handler');

function API(config) {
    this.config = config;

    this.modules = {};
    this.storages = {};
    this.enricher = null;

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
    this.pp.use(OAuth.strategies.google(this.config['oauth/google'], onUserLogin));
    this.pp.use(OAuth.strategies.github(this.config['oauth/github'], onUserLogin));

    this.app.use(this.pp.initialize());

    this.app.use(AuthMiddleware.auth(this.authService));
    this.app.use(bodyParser.urlencoded({ extended: false }));
    this.app.use(bodyParser.json());
    this.app.use(errorHandler);
}

API.prototype.passport = function() {
    return this.pp;
};

API.prototype.module = function(name, module) {
    this.modules[name] = require(module);
};

API.prototype.storage = function(name, storage) {
    this.storages[name] = storage;
};

API.prototype.enrich = function(enricher) {
    var Enricher = require(enricher);
    this.enricher = new Enricher(this.storages);
};

API.prototype.listen = function() {
    var self = this;

    var services = {};
    for (var moduleName in this.modules) {
        if (! this.modules.hasOwnProperty(moduleName)) continue;

        var moduleServices = this.modules[moduleName].services(this.config, this.storages);
        for (var moduleServiceName in moduleServices) {
            if (! moduleServices.hasOwnProperty(moduleServiceName)) continue;

            if (services[moduleServiceName])
                throw new Errors.NameAlreadyUsedError('The service name "' + moduleServiceName + '" has already been used.');

            services[moduleServiceName] = moduleServices[moduleServiceName];
        }
    }

    var responseHandler = new ResponseHandler(this.enricher);

    var resources = {};
    for (moduleName in this.modules) {
        if (! this.modules.hasOwnProperty(moduleName)) continue;

        moduleResources = this.modules[moduleName].resources(this.config, services, responseHandler);
        for (var moduleResourceName in moduleResources) {
            if (! moduleResources.hasOwnProperty(moduleResourceName)) continue;

            if (resources[moduleResourceName])
                throw new Errors.NameAlreadyUsedError('The resource name "' + moduleResourceName + '" has already been used.');

            resources[moduleResourceName] = moduleResources[moduleResourceName];
        }
    }

    for (moduleName in this.modules) {
        if (! this.modules.hasOwnProperty(moduleName)) continue;

        this.modules[moduleName].run(this.config, self, resources);
    }

    this.registerGet('/health', function(req, res) { return res.status(200).end(); });

    this.app.listen(this.config.port, function () {
        winston.info();
        winston.info('API listening on port ' + self.config.port);
        winston.info();
    });
};

API.prototype.onlyIfUser = function(req, res, next) {
    var user = req.user;

    if (! user) return res.status(403).send("Not Authorized");

    return next();
};

API.prototype.onlyIfOwner = function(req, res, next) {
    var owner = req.params['owner'];
    var user = req.user;

    if (! owner) return res.status(400).send("No owner has been defined");
    if (! user) return res.status(403).send("Not Authorized");

    if (user != owner) return res.status(403).send("Not Authorized");

    return next();
};

API.prototype.onlyIfMe = function(req, res, next) {
    var userId = req.params['id'];
    var user = req.user;

    if (! userId) return res.status(400).send("No user id has been defined");
    if (! user) return res.status(403).send("Not Authorized");

    if (user != userId) return res.status(403).send("Not Authorized");

    return next();
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