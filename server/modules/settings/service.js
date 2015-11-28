var Errors = require('../../errors'),
    Q = require('q'),
    uuid = require('node-uuid'),
    moment = require('moment');

function SettingsService(config) {
    this.config = config;
}

SettingsService.prototype.get = function() {
    var response = {
        firmwares: [
            { codename: 'genesis', version: '0.5.0'},
            { codename: 'feniks', version: '1.0.0'},
            { codename: 'ember', version: '1.1.0'},
            { codename: 'gemini', version: '1.2.0'},
            { codename: 'v1.3', version: '1.3.0'}
        ],
        architectures: [
            'all',
            'x86_64',
            'armv7l'
        ]
    };

    if (this.config.ga)
        response.ga = this.config.ga;

    return Q(response);
};

module.exports = SettingsService;