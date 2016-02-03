var Q = require('q'),
    constants = require('../constants'),
    config = require('../config/config.manager').lookup();

module.exports = {
    get: getSettings
};

function getSettings() {
    var data = {
        firmwares: constants.firmwares,
        architectures: constants.architectures
    };

    if (config.ga) data.ga = config.ga;

    return Q(data);
}