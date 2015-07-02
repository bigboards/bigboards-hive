var argv = require('minimist')(process.argv.slice(2));
if (! argv['consul-host']) {
    console.error('Oh bugger, I seem to have missed that consul-host parameter. Please specify it like --consul-host=<my-consul-host>');
    process.exit(1);
}

var Storage = require('./storage');

var express = require('express');
var bodyParser     = require('body-parser');
var errorHandler   = require('error-handler');
var elasticsearch = require('elasticsearch');
var winston = require('winston');

var API = require('./api');

var consul = require('consul')({
    host: argv['consul-host']
});

/* -- Configuration -- */
var Config = require('./config');
var config = new Config('hive', consul);

return config.load().then(function(configuration)  {
    // -- elasticsearch connection
    var es = new elasticsearch.Client(configuration.elasticsearch);

    var api = new API(configuration);

    /* -- Storage -- */
    api.storage('auth', new Storage(es, configuration.index, 'auth'));
    api.storage('profile', new Storage(es, configuration.index, 'profile'));
    api.storage('library', new Storage(es, configuration.index, 'library-item'));

    /* -- Modules -- */
    api.module('auth', './modules/auth');
    api.module('library', './modules/library');
    api.module('profile', './modules/profile');

    // -- response enricher
    api.enrich('./enrichers/owner-enricher');

    api.listen();
}).fail(function(error) {
    console.log(error, error.stack.split("\n"));
    throw error;
});