var elasticsearch = require('elasticsearch'),
    log4js = require('log4js'),
    shortId = require('shortid'),
    fs = require('../../utils/fs-utils'),
    Q = require('q');

var logger = log4js.getLogger('es-test');
var mapping = fs.readJsonFile(__dirname + '/../../../es/v2/library-index.json');

var es = new elasticsearch.Client({
    host: [{
        host: '469c3fcba4d983641ddd30557d30b356.us-east-1.aws.found.io',
        port: 9243,
        protocol: 'https',
        auth: 'hive:1nktv1sjeS'
    }],
    log: 'debug'
});

module.exports = {
    setup: setup,
    teardown: teardown
};

function setup() {
    // -- check if the index already exists. If it already exits, we will fail since it indicates another test is
    // -- already running.
    return es.indices.exists({index: 'aut-hive'}).then(function() {
        logger.fatal('The index used for testing already exists, indicating another test is currently running.');
        process.exit(1);
    }, function() {
        logger.info('The testing index does not exist yet.');
        return es.indices.create({index: 'aut-hive'}).then(function() {
            logger.info('Testing index created');

            var promises = [];
            for (var key in mapping) {
                if (! mapping.hasOwnProperty(key)) continue;
                promises.push(es.indices.putMapping({index: 'aut-hive', type: key, body: mapping[key]}));
            }

            return Q.all(promises).then(function() {
                logger.info('testing index ready to be consumed');
            });

        }, function(error) {
            logger.fatal('Unable to create the index used for testing.', error);
            process.exit(3);
        });
    });
}

function teardown() {
    return es.indices.delete({index: 'aut-hive'});
}