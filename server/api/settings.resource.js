var SettingsService = require('../services/settings.service'),
    au = require('../utils/api-utils');

module.exports = {
    get: getSettings
};

function getSettings(req, res) {
    return au.handle(res, SettingsService.get());
}