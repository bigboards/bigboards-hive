var ProfileService = require('../services/profile.service'),
    au = require('../utils/api-utils');

module.exports = {
    filter: filterProfiles,
    get: getProfile,
    add: addProfile,
    patch: patchProfile,
    remove: removeProfile
};

function filterProfiles(req, res) {
    return au.handle(res, ProfileService.filter(req.requester, req.body, au.paging(req)));
}

function getProfile(req, res) {
    return au.handle(res, ProfileService.get(req.requester, req.params.id));
}

function addProfile(req, res) {
    return au.handle(res, ProfileService.add(req.requester, req.body));
}

function patchProfile(req, res) {
    return au.handle(res, ProfileService.patch(req.requester, req.params.id, req.body));
}

function removeProfile(req, res) {
    return au.handle(res, ProfileService.remove(req.requester, req.params.id));
}