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
    console.log('Loaded the configuration from consul:', JSON.stringify(configuration));

    // -- elasticsearch connection
    var esConfig = {
        "host": configuration['api/storage/host'],
        "log": configuration['api/storage/log'],
        "apiVersion": configuration['api/storage/version']
    };

    var es = new elasticsearch.Client(esConfig);

    var api = new API(configuration);

    /* -- Storage -- */
    api.storage('auth', new Storage(es, configuration['api/storage/index'], 'auth'));
    api.storage('profile', new Storage(es, configuration['api/storage/index'], 'profile'));
    api.storage('library', new Storage(es, configuration['api/storage/index'], 'library-item'));

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