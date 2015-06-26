var os = require('os');

module.exports = {
    lookupEnvironment: function() {
        if (os.platform() === 'linux') {
            console.log('Loading Production Settings');
            return this.environments.production;
        } else {
            console.log('Loading Development Settings');
            return this.environments.development;
        }
    },
    environments: {
        development: {
            is_dev: true,
            is_prod: false,
            port: 3010,
            content: '../client',
            frontend_url: 'http://localhost:8080',
            elasticsearch: {
                host: 'hive.bigboards.io:9200',
                log: 'debug',
                apiVersion: '1.5'
            },
            index: 'bigboards-hive-dev',
            oauth: {
                bitbucket: {
                    consumerKey: '5TW6nj5PkXkm7HBcaK',
                    consumerSecret: 'sESt49pqh7Ue6KUJDsEmJ57vzzfxnG2g',
                    callbackURL: "http://localhost:3010/auth/bitbucket/callback"
                },
                google: {
                    clientID: '621821238576-tnjnega04njg2n5jd7knlt5kpjkkivp3.apps.googleusercontent.com',
                    clientSecret: 'hC7wxQB_ECplWCR-kUs_iJbm',
                    callbackURL: "http://localhost:3010/auth/google/callback"
                },
                github: {
                    clientID: 'f5f370eb712a04fbc592',
                    clientSecret: '21a0befbf0501d30c00979341f4c44322bb444e1',
                    callbackURL: "http://localhost:8080/auth/github/callback"
                }
            },
            firmwares: [ "genesis", "feniks", "ember" ]
        },
        production: {
            is_dev: false,
            is_prod: true,
            port: 3010,
            content: '../client',
            elasticsearch: {
                host: 'hive.bigboards.io:9200',
                apiVersion: '1.5'
            },
            frontend_url: 'http://localhost:8080',
            index: 'bigboards-hive-dev',
            oauth: {
                bitbucket: {
                    consumerKey: '5TW6nj5PkXkm7HBcaK',
                    consumerSecret: 'sESt49pqh7Ue6KUJDsEmJ57vzzfxnG2g',
                    callbackURL: "http://localhost:3010/auth/bitbucket/callback"
                },
                google: {
                    clientID: '621821238576-tnjnega04njg2n5jd7knlt5kpjkkivp3.apps.googleusercontent.com',
                    clientSecret: 'hC7wxQB_ECplWCR-kUs_iJbm',
                    callbackURL: "http://localhost:3010/auth/google/callback"
                },
                github: {
                    clientID: 'f5f370eb712a04fbc592',
                    clientSecret: '21a0befbf0501d30c00979341f4c44322bb444e1',
                    callbackURL: "http://localhost:3010/auth/github/callback"
                }
            },
            firmwares: [ "genesis", "feniks", "ember" ]
        }
    }
};