var argv = require('minimist')(process.argv.slice(2));
var Storage = require('./storage');
var express = require('express');
var elasticsearch = require('elasticsearch');
var AWS = require('aws-sdk');

var ProfileMiddleware = require('./middlewares/profile-middleware'),
    API = require('./api');

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
    var storage = new Storage(es, AWS);

    if (argv.bootstrap) {
        return storage.store(configuration.elasticsearch.index).conceive()
            .then(function() {
                return loadAPI(configuration, storage);
            });
    } else {
        return loadAPI(configuration, storage);
    }


}).fail(function(error) {
    console.log(error, error.stack.split("\n"));
    throw error;
});

function loadAPI(configuration, storage) {
    var api = new API(configuration);

    /* -- Middlewares -- */
    api.middleware(ProfileMiddleware.profile(
        configuration, storage.store(configuration.elasticsearch.index).entity('people')
    ));

    /* -- Storage -- */
    api.storage(storage);

    /* -- Modules -- */
    api.module('settings', './modules/settings');
    api.module('library', './modules/library');
    api.module('people', './modules/people');
    api.module('link', './modules/link');
    api.module('cluster', './modules/cluster');

    // -- response enricher
    api.enrich('./enrichers/owner-enricher');

    // -- start listening for requests
    api.listen();

    return api;
}