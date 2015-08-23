var argv = require('minimist')(process.argv.slice(2));
var Storage = require('./storage');
var express = require('express');
var elasticsearch = require('elasticsearch');
var AWS = require('aws-sdk');

var API = require('./api');

/* -- Configuration -- */
var Config = require('./config');
var config = new Config(argv);

return config.load().then(function(configuration)  {
    // -- elasticsearch connection
    var esConfig = {
        "host": configuration.elasticsearch.host,
        "log": configuration.elasticsearch.log,
        "auth": configuration.elasticsearch.username + ':' + configuration.elasticsearch.password
    };

    var es = new elasticsearch.Client(esConfig);

    AWS.config.region = 'us-east-1b';

    var api = new API(configuration);

    /* -- Storage -- */
    api.storage(new Storage(es, AWS));

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