var Q = require('q');

function Config(argv)  {
    this.arguments = argv;
}

Config.prototype.load = function() {
    if (process.env.BB_STAGE ==  'test') {
        return Q({
            port: process.env.PORT,
            web: {
                url: 'http://cs.blonde.eu',
                whitelist: ['http://cs.blonde.eu', 'http://localhost:8080']
            },
            elasticsearch: {
                "host": [{
                    host: '30a52c4001f7bb9e30ccc4db9f0b346b.eu-west-1.aws.found.io',
                    auth: 'readwrite:eux9152mdbnxxacg1x'
                }],
                log: 'debug',
                index: 'bigboards-test'
            },
            auth: {
                google: {
                    clientID: '791326363259-duo5st3vtq011vqk1pr2ojnje34gi8vb.apps.googleusercontent.com',
                    clientSecret: 'qDQfbb1DwOlbU3cGQya0i-Yv',
                    callbackURL: 'http://api.test.cs.blonde.eu/auth/google/callback',
                    passReqToCallback: true
                }
            }
        });
    } else {
        return Q({
            port: process.env.PORT,
            web: {
                url: 'http://localhost:8080',
                whitelist: ['http://localhost:8080']
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