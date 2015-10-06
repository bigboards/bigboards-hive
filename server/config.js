var Q = require('q');

function Config(argv)  {
    this.arguments = argv;
}

Config.prototype.load = function() {
    if (process.env.BB_STAGE ==  'test') {
        return Q({
            port: process.env.PORT,
            web: {
                url: 'http://hive.test.bigboards.io'
            },
            elasticsearch: {
                "host": [{
                    host: '469c3fcba4d983641ddd30557d30b356.us-east-1.aws.found.io',
                    auth: 'readwrite:tcsss4frsejb429qk2'
                }],
                log: 'info',
                index: 'bigboards-hive-test'
            }
        });
    } else {
        return Q({
            port: process.env.PORT,
            web: {
                url: 'http://localhost:8080'
            },
            elasticsearch: {
                "host": [{
                    host: '469c3fcba4d983641ddd30557d30b356.us-east-1.aws.found.io',
                    auth: 'readwrite:tcsss4frsejb429qk2'
                }],
                log: 'debug',
                index: 'bigboards-hive-dev'
            }
        });
    }
};

module.exports = Config;