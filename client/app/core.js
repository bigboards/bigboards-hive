angular.module('hive.core', [])
    .service('Session', [function() {
        this.create = function(token, user) {
            this.token = token;
            this.user = user;
        };

        this.destroy = function() {
            this.token = null;
            this.user = null;
        };
    }])
    .constant('Firmwares', [
        { codename: 'genesis', version: '0.5.0'},
        { codename: 'feniks', version: '1.0.0'},
        { codename: 'ember', version: '1.1.0'},
        { codename: 'gemini', version: '1.2.0'}
    ])
    .constant('Architectures', [
        'all',
        'x86_64',
        'armv7l'
    ]);
