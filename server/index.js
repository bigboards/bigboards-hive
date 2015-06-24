var express = require('express');
var bodyParser     = require('body-parser');
var errorHandler   = require('error-handler');
var elasticsearch = require('elasticsearch');
var winston = require('winston');


var Context = require('./context');
var context = new Context();

/* -- Configuration -- */
context.register('settings', 'config', require('./config').lookupEnvironment());

/* -- Storage -- */
context.register('storage', 'storage', require('./storage')(
    new elasticsearch.Client(context.get('config').elasticsearch),
    'bigboards-hive-dev'
));

/* -- Modules -- */
context.module('auth', './services/auth');
context.module('library', './services/library');
context.module('api', './services/api');

context.run();
