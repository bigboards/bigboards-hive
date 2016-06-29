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
                    zones: [
                        { domain: 'device.bigboards.io', id: 'Z3IPHVXI746CAA'},
                        { domain: 'cluster.bigboards.io', id: 'Z22H6QKBV4R4FE'},
                        { domain: 'hex.bigboards.io', id: 'Z3OJ8P3GH8AAHU'}
                    ]
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
                    host: 'bd98887cfe3cd9594b742d1e91be5149.us-east-1.aws.found.io',
                    auth: 'hive:1nktv1sjeS'
                }],
                log: 'info',
                index: 'bigboards-hive-test'
            },
            aws: {
                route53: {
                    zones: [
                        { domain: 'device.bigboards.io', id: 'Z3IPHVXI746CAA'},
                        { domain: 'cluster.bigboards.io', id: 'Z22H6QKBV4R4FE'},
                        { domain: 'hex.bigboards.io', id: 'Z3OJ8P3GH8AAHU'}
                    ]
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
    } else {
        return Q({
            port: process.env.PORT,
            web: {
                url: 'http://localhost:8080'
            },
            elasticsearch: {
                "host": [{
                    host: 'bd98887cfe3cd9594b742d1e91be5149.us-east-1.aws.found.io',
                    auth: 'readwrite:tcsss4frsejb429qk2'
                }],
                log: 'debug',
                index: 'bigboards-hive-test'
            },
            aws: {
                route53: {
                    zones: [
                        { domain: 'device.bigboards.io', id: 'Z3IPHVXI746CAA'},
                        { domain: 'cluster.bigboards.io', id: 'Z22H6QKBV4R4FE'},
                        { domain: 'hex.bigboards.io', id: 'Z3OJ8P3GH8AAHU'}
                    ]
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