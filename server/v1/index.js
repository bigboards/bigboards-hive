var winston = require('winston');

module.exports = function(app, esClient) {
    winston.log('info', 'Starting the legacy library server');

    var LegacyLibrary = require('./library');

    var Config = {
        elasticsearch: {
            host: 'hive.bigboards.io:9200',
            apiVersion: '1.5'
        }
    };

    /* -- Storage -- */
    var storage = require('./storage')(
        esClient,
        'bigboards-hive-dev'
    );

    var services = {};
    services.library = new LegacyLibrary.Service(storage, Config);

    LegacyLibrary.link(app, services);

};