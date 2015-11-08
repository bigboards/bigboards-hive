#!/bin/node

var fs = require('fs');
var log = require('winston');
var elasticSearch = require('elasticsearch');

// Set up elasticSearch
var client = new elasticSearch.Client({
    host: 'localhost:9200'
});

var libraryContent = __dirname + '/library.json';

fs.readFile(libraryContent, 'utf8', function (err, data) {
    if (err) {
        log.error('Error: ' + err);
        return;
    }

    data = JSON.parse(data);

    var bulkData = data.map(function(document) {
        return [
            {"index" : {"_index":"bigboards", "_type": "tints"}},
            document
        ];
    }).reduce(function(prev, next){return prev.concat(next);});

    client.bulk({body: bulkData}, function(err, resp) {
        if (err) {
            log.error('Error: ' + err);
            console.log(bulkData);
            return;
        }
        log.info(resp);
    })
});
