var Q = require('q');

function Config(argv)  {
    this.arguments = argv;
}

Config.prototype.load = function() {
    if (process.env.BB_STAGE ==  'test') {
        return Q({
            port: process.env.PORT,
            web: {
                url: 'http://hive.test.bigboards.io',
                whitelist: ['http://hive.test.bigboards.io', 'http://localhost:8080', 'http://localhost:7000']
            },
            elasticsearch: {
                "host": [{
                    host: '469c3fcba4d983641ddd30557d30b356.us-east-1.aws.found.io',
                    auth: 'readwrite:tcsss4frsejb429qk2'
                }],
                log: 'info',
                index: 'bigboards-hive-test'
            },
            auth: {
                google: {
                    clientID: '621821238576-3m8jioiujth1fv9qsggsan7ui5krprbg.apps.googleusercontent.com',
                    clientSecret: 'K-P3xIQb8hGCEMbzaXSjEGy6',
                    callbackURL: 'http://hive-api-test-env.elasticbeanstalk.com/auth/google/callback',
                    passReqToCallback: true
                }
            }
        });
    } else {
        return Q({
            port: process.env.PORT,
            web: {
                url: 'http://localhost:8080',
                whitelist: ['http://localhost:8080', 'http://localhost:7000']
            },
            elasticsearch: {
                "host": [{
                    host: '469c3fcba4d983641ddd30557d30b356.us-east-1.aws.found.io',
                    auth: 'readwrite:tcsss4frsejb429qk2'
                }],
                log: 'debug',
                index: 'bigboards-hive-dev'
            },
            auth: {
                google: {
                    clientID: '621821238576-tnjnega04njg2n5jd7knlt5kpjkkivp3.apps.googleusercontent.com',
                    clientSecret: 'hC7wxQB_ECplWCR-kUs_iJbm',
                    callbackURL: 'http://localhost:8081/auth/google/callback',
                    passReqToCallback: true
                }
            }
        });
    }
};

module.exports = Config;