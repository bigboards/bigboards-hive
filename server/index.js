var express = require('express');
var bodyParser     = require('body-parser');
var errorHandler   = require('error-handler');
var elasticsearch = require('elasticsearch');
var winston = require('winston');
var Storage = require('./storage/storage');

var aop = require('./utils/aop-utils'),
    ResponseHandler = require('./utils/response-handler');


var Context = require('./context');
var context = new Context();

/* -- Configuration -- */
context.register('settings', 'config', require('./config').lookupEnvironment());

/* -- Storage -- */
context.registerFactory('default', 'es', function(context) {
    return new elasticsearch.Client(context.get('config').elasticsearch);
});

context.registerFactory('storage', 'auth-storage', function(context) { return new Storage(context.get('es'), context.get('config').index, 'auth'); });
context.registerFactory('storage', 'library-storage', function(context) { return new Storage(context.get('es'), context.get('config').index, 'library-item'); });
context.registerFactory('storage', 'profile-storage', function(context) { return new Storage(context.get('es'), context.get('config').index, 'profile'); });

context.registerFactory('response-handler', 'response-handler', function(context) {
    var OwnerEnricher = require('./enrichers/owner-enricher');
    var oe = new OwnerEnricher(context.get('profile-storage'));

    return new ResponseHandler(oe);
});

/* -- Modules -- */
context.module('auth', './modules/auth');
context.module('library', './modules/library');
context.module('profile', './modules/profile');
context.module('api', './modules/api');

context.run();
