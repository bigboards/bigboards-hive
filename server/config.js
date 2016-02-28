var Q = require('q');

function Config(argv)  {
    this.arguments = argv;
}

Config.prototype.load = function() {
    if (process.env.BB_STAGE ==  'prod') {
        return Q({
            port: process.env.PORT,
            web: {
                url: 'http://hive.bigboards.io'
            },
            ga: 'UA-41959720-6',
            elasticsearch: {
                "host": [{
                    host: '469c3fcba4d983641ddd30557d30b356.us-east-1.aws.found.io',
                    auth: 'hive:1nktv1sjeS'
                }],
                log: 'info',
                index: 'bigboards-hive-prod'
            },
            aws: {
                route53: {
                    hexZoneId: 'Z3IPHVXI746CAA'
                }
            },
            auth0_api: {
                clientId: 'khkGC7q7Sj0Vco3U0hkOxaG5TvdG6eIl',
                clientSecret: 'AcPLd2mCiq3IYUTJt_D0Xff8XXIa145kcQ9aU3_unUW5hshMriCQiEtnJc9oKq9z'
            },
            auth0: {
                domain: 'bigboards.auth0.com',
                clientId: 'CWAxX5WLJ3kYtD33QmnO7ElppHeN6opy',
                clientSecret: 'C0llD1Lm5UpFAagR-NCl7Ckvery95uGlmrIE80VQq_yAzmAJrwsmtT99dIdpXGng'
            }
        });
    } else  if (process.env.BB_STAGE ==  'test') {
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
            aws: {
                route53: {
                    hexZoneId: 'Z3IPHVXI746CAA'
                }
            },
            auth0_api: {
                clientId: 'ToHg4C5ElFal2nxYv4CO4uGJwYKYQJVm',
                clientSecret: '1xWfimaPVz-fdrC66JhRiPqUyZlqi-s5oNTKQcrRJQ3yfv_m848p5Go0MGvFzJly'
            },
            auth0: {
                domain: 'bigboards-io.auth0.com',
                clientId: '0AKJzSvPvEOuMM4LTJCDvAiHwUFFa1Vd',
                clientSecret: 'eDhasv9bVEdGKnnR2VYptKwjc7mMcBoM4bdqahxOtaeXEenbhFQ4je5z2zhjfciB'
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
            aws: {
                route53: {
                    hexZoneId: 'Z3IPHVXI746CAA'
                }
            },
            auth0_api: {
                clientId: 'ToHg4C5ElFal2nxYv4CO4uGJwYKYQJVm',
                clientSecret: '1xWfimaPVz-fdrC66JhRiPqUyZlqi-s5oNTKQcrRJQ3yfv_m848p5Go0MGvFzJly'
            },
            auth0: {
                domain: 'bigboards.auth0.com',
                clientId: 'CWAxX5WLJ3kYtD33QmnO7ElppHeN6opy',
                clientSecret: 'C0llD1Lm5UpFAagR-NCl7Ckvery95uGlmrIE80VQq_yAzmAJrwsmtT99dIdpXGng'
            }
        });
    }
};

module.exports = Config;