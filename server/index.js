var express = require('express');
var bodyParser     = require('body-parser');
var errorHandler   = require('error-handler');
var elasticsearch = require('elasticsearch');
var winston = require('winston');
var Storage = require('./storage/storage');

var aop = require('./utils/aop-utils');


var Context = require('./context');
var context = new Context();

/* -- Configuration -- */
context.register('settings', 'config', require('./config').lookupEnvironment());

/* -- Storage -- */
context.registerFactory('default', 'es', function(context) {
    return new elasticsearch.Client(context.get('config').elasticsearch);
});

context.registerFactory('storage', 'auth-storage', function(context) { return new Storage(context.get('es'), context.get('config').index, 'auth'); });
context.registerFactory('storage', 'library-storage', function(context) { return new Storage(context.get('es'), context.get('config').index, 'library'); });
context.registerFactory('storage', 'profile-storage', function(context) { return new Storage(context.get('es'), context.get('config').index, 'profile'); });

context.registerFactory('enricher', 'es-enricher', function(context) { var ESEnricher = require('./enrichers/es-enricher'); return new ESEnricher(); });
context.registerFactory('enricher', 'owner-enricher', function(context) { var OwnerEnricher = require('./enrichers/owner-enricher'); return new OwnerEnricher(context.get('profile-storage')); });
context.typeAspect('storage',  /./, 'around', aop.esResponseAdvice(context));

/* -- Modules -- */
context.module('auth', './services/auth');
context.module('library', './services/library');
context.module('api', './services/api');

context.run();
