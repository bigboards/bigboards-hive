var Errors = require('../../errors'),
    Q = require('q'),
    uuid = require('node-uuid'),
    moment = require('moment');

function SettingsService() {

}

SettingsService.prototype.get = function() {
    return Q({
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
    })
};

module.exports = SettingsService;