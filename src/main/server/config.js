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
            port: 3020,
            content: 'src/main/client',
            elasticsearch: {
                host: 'https://469c3fcba4d983641ddd30557d30b356.us-east-1.aws.found.io:9243',
                auth: 'searchonly:23c42x4bkegoghmw8h',
                log: 'debug',
                apiVersion: '1.5'
            },
            oauth: {
                bitbucket: {
                    consumerKey: '5TW6nj5PkXkm7HBcaK',
                    consumerSecret: 'sESt49pqh7Ue6KUJDsEmJ57vzzfxnG2g',
                    callbackURL: "http://localhost:3010/auth/bitbucket/callback"
                },
                github: {
                    clientID: 'f5f370eb712a04fbc592',
                    clientSecret: '21a0befbf0501d30c00979341f4c44322bb444e1',
                    callbackURL: "http://localhost:3010/auth/github/callback"
                }
            },
            firmwares: [ "genesis", "feniks", "feniks-wip" ]
        },
        production: {
            is_dev: false,
            is_prod: true,
            port: 3020,
            content: 'client',
            elasticsearch: {
                host: 'localhost:9200',
                log: 'debug',
                apiVersion: '1.5'
            },
            oauth: {
                bitbucket: {
                    consumerKey: '5TW6nj5PkXkm7HBcaK',
                    consumerSecret: 'sESt49pqh7Ue6KUJDsEmJ57vzzfxnG2g',
                    callbackURL: "http://localhost:3010/auth/bitbucket/callback"
                },
                github: {
                    clientID: 'f5f370eb712a04fbc592',
                    clientSecret: '21a0befbf0501d30c00979341f4c44322bb444e1',
                    callbackURL: "http://localhost:3010/auth/github/callback"
                }
            },
            firmwares: [ "genesis", "feniks", "feniks-wip" ]
        }
    }
};