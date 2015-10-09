/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
var express         = require('express');
var bodyParser      = require('body-parser');
var errorHandler    = require('error-handler');
var elasticsearch   = require('elasticsearch');
var winston         = require('winston');
var cors            = require('cors');
    Errors          = require('./api-errors'),
    ResponseHandler = require('./utils/response-handler'),
    jwt             = require('express-jwt');

function API(config) {
    this.config = config;

    this.middlewares = [];

    this.modules = {};
    this._storage = null;
    this.enricher = null;

    this.app = express();

    // -- passport
    this.pp = require('passport');
    this.pp.serializeUser(function(user, done) { done(null, user); });
    this.pp.deserializeUser(function(obj, done) { done(null, obj); });

    this.jwtCheck = jwt({
        secret: new Buffer('C0llD1Lm5UpFAagR-NCl7Ckvery95uGlmrIE80VQq_yAzmAJrwsmtT99dIdpXGng', 'base64'),
        audience: 'CWAxX5WLJ3kYtD33QmnO7ElppHeN6opy'
    });
}

API.prototype.passport = function() {
    return this.pp;
};

API.prototype.module = function(name, module) {
    this.modules[name] = require(module);
};

API.prototype.storage = function(storage) {
    this._storage = storage;
};

API.prototype.enrich = function(enricher) {
    var Enricher = require(enricher);
    this.enricher = new Enricher(this._storage.store(this.config.elasticsearch.index));
};

API.prototype.middleware = function(middleware) {
    this.middlewares.push(middleware);
    return this;
};

API.prototype.listen = function() {
    var self = this;

    // -- Services ----------------------------------------------------------------------------------------------------
    var services = {};
    for (var moduleName in this.modules) {
        if (! this.modules.hasOwnProperty(moduleName)) continue;

        var moduleServices = this.modules[moduleName].services(this.config, this._storage.store(this.config.elasticsearch.index));
        for (var moduleServiceName in moduleServices) {
            if (! moduleServices.hasOwnProperty(moduleServiceName)) continue;

            if (services[moduleServiceName])
                throw new Errors.NameAlreadyUsedError('The service name "' + moduleServiceName + '" has already been used.');

            services[moduleServiceName] = moduleServices[moduleServiceName];

            winston.info('Loaded service ' + moduleName + '::' + moduleServiceName);
        }
    }

    // -- Express -----------------------------------------------------------------------------------------------------
    var corsOptions = {
        methods: ['GET', 'PUT', 'POST', 'DELETE']
    };

    if (self.config.web.whitelist) {
        corsOptions.origin = function(origin, callback){
            var originIsWhitelisted = self.config.web.whitelist.indexOf(origin) !== -1;
            callback(null, originIsWhitelisted);
        }
    } else {
        corsOptions.origin = "*";
    }

    this.app.use(cors(corsOptions));

    // -- passport
    this.app.use(this.pp.initialize());

    for (var idx in this.middlewares) {
        if (! this.middlewares.hasOwnProperty(idx)) continue;
        this.app.use(this.middlewares[idx]);
    }

    this.app.use(bodyParser.urlencoded({ extended: false }));
    this.app.use(bodyParser.json());
    this.app.use(errorHandler);

    // -- Resources ----------------------------------------------------------------------------------------------------
    var responseHandler = new ResponseHandler(this.enricher);
    var resources = {};
    for (moduleName in this.modules) {
        if (! this.modules.hasOwnProperty(moduleName)) continue;

        moduleResources = this.modules[moduleName].resources(this.config, this._storage.store(this.config.elasticsearch.index), services, responseHandler);
        for (var moduleResourceName in moduleResources) {
            if (! moduleResources.hasOwnProperty(moduleResourceName)) continue;

            if (resources[moduleResourceName])
                throw new Errors.NameAlreadyUsedError('The resource name "' + moduleResourceName + '" has already been used.');

            resources[moduleResourceName] = moduleResources[moduleResourceName];

            winston.info('Loaded resource ' + moduleName + '::' + moduleResourceName);
        }
    }

    // -- Modules ----------------------------------------------------------------------------------------------------
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

// ====================================================================================================================
// == Authorization Roles
// ====================================================================================================================
API.prototype.onlyIfOwner = function() {
    return function(req, res, next) {
        var owner = req.params['owner'];
        var user = req.user;

        if (! owner) {
            winston.warn('No owner has been specified as a parameter on the request. It is needed to verify if the user is actually the owner of the called resource.');

            return res.status(400).send("No owner has been defined");
        }

        if (! user) {
            winston.warn('Not allowed to execute an api call for which a user has to be authenticated.');

            return res.status(401).send("Not Authorized");
        }

        if (user.hive_id != owner) {
            winston.warn('Only the owner of the resource (which you are not) is allowed to call the endpoint.');

            return res.status(403).send("Not Authorized");
        }

        return next();
    }
};

API.prototype.onlyIfMe = function(req, res, next) {
    var userId = req.params['id'];
    var user = req.user;

    if (! userId) {
        winston.warn('No user id has been specified as a parameter on the request. It is needed to verify if the user is actually the owner of the called resource.');

        return res.status(400).send("No user id has been defined");
    }

    if (! user) {
        winston.warn('Not allowed to execute an api call for which a user has to be authenticated.');

        return res.status(401).send("Not Authorized");
    }

    if (user != userId) {
        winston.warn('Only the owner of the resource (which you are not) is allowed to call the endpoint.');

        return res.status(403).send("Not Authorized");
    }

    return next();
};

API.prototype.onlyIfUser = function() {
    return function(req, res, next) {
        var user = req.user;

        if (! user) {
            return res.status(401).send("Not Authenticated");
        }

        return next();
    };
};

API.prototype.onlyIfRole = function(role) {
    return function(req, res, next) {
        var user = req.user;

        if (! user) {
            return res.status(401).send("Not Authenticated");
        }

        if (! user.roles && user.roles.indexOf(role) === -1) return res.status(403).send('Not Authorized');

        return next();
    };
};

// ====================================================================================================================
// == API METHODS
// ====================================================================================================================

API.prototype.registerHead = function(path, fn) {
    this.app.head(path, fn);
    winston.info('   [HEAD] ' + path);
};

API.prototype.registerSecureHead = function(path, guard, fn) {
    this.app.head(path, this.jwtCheck, guard, fn);
    winston.info('  [sHEAD] ' + path);
};

API.prototype.registerGet = function(path, fn) {
    this.app.get(path, fn);
    winston.info('   [GET] ' + path);
};

API.prototype.registerSecureGet = function(path, guard, fn) {
    this.app.get(path, this.jwtCheck, guard, fn);
    winston.info('  [sGET] ' + path);
};

API.prototype.registerPut = function(path, fn) {
    this.app.put(path, function(req, res) { return fn(req, res); });
    winston.info('    [PUT] ' + path);
};

API.prototype.registerSecurePut = function(path, guard, fn) {
    this.app.put(path, this.jwtCheck, guard, function(req, res) { return fn(req, res); });
    winston.info('   [sPUT] ' + path);
};

API.prototype.registerPost = function(path, fn) {
    this.app.post(path, function(req, res) { return fn(req, res); });
    winston.info('   [POST] ' + path);
};

API.prototype.registerSecurePost = function(path, guard, fn) {
    this.app.post(path, this.jwtCheck, guard, function(req, res) { return fn(req, res); });
    winston.info('  [sPOST] ' + path);
};

API.prototype.registerDelete = function(path, fn) {
    this.app.delete(path, function(req, res) { return fn(req, res); });
    winston.info('[sDELETE] ' + path);
};

API.prototype.registerSecureDelete = function(path, guard, fn) {
    this.app.delete(path, this.jwtCheck, guard, function(req, res) { return fn(req, res); });
    winston.info('[DELETE] ' + path);
};

module.exports = API;