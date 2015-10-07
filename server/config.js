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
            },
            auth0_api: {
                clientId: 'khkGC7q7Sj0Vco3U0hkOxaG5TvdG6eIl',
                clientSecret: 'AcPLd2mCiq3IYUTJt_D0Xff8XXIa145kcQ9aU3_unUW5hshMriCQiEtnJc9oKq9z'
            },
            auth0: {
                clientId: 'CWAxX5WLJ3kYtD33QmnO7ElppHeN6opy',
                clientSecret: 'C0llD1Lm5UpFAagR-NCl7Ckvery95uGlmrIE80VQq_yAzmAJrwsmtT99dIdpXGng'
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
            },
            auth0_api: {
                clientId: 'khkGC7q7Sj0Vco3U0hkOxaG5TvdG6eIl',
                clientSecret: 'AcPLd2mCiq3IYUTJt_D0Xff8XXIa145kcQ9aU3_unUW5hshMriCQiEtnJc9oKq9z'
            },
            auth0: {
                clientId: 'CWAxX5WLJ3kYtD33QmnO7ElppHeN6opy',
                clientSecret: 'C0llD1Lm5UpFAagR-NCl7Ckvery95uGlmrIE80VQq_yAzmAJrwsmtT99dIdpXGng'
            }
        });
    }
};

module.exports = Config;