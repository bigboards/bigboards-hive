var eu = require('../utils/entity-utils'),
    es = require('../es'),
    su = require('../utils/service-utils'),
    filterBuilder = require('../es/filter-builder'),
    shortid = require('shortid');

module.exports = {
    filter: filter,
    add: addProfile,
    get: getProfile,
    patch: patchProfile,
    remove: removeProfile
};

function filter(requester, criteria, paging) {
    var filter = filterBuilder.build(requester, criteria, true, true, true);

    return es.lookup.raw('profile', filter, ['name', 'email', 'picture_url', 'short_id'], paging);
}

function getProfile(requester, profileId) {
    su.param.exists('profileId', profileId);

    return es.access('profile', profileId, requester, 'get').then(function() {
        return es.lookup.id('profile', profileId);
    });
}

function addProfile(requester, data) {
    su.param.exists('id', data.id);

    return es.access('profile', data.id, requester, 'add').then(function() {
        return es.create('profile', data.id, data);
    });
}

function patchProfile(requester, profileId, patches) {
    su.param.exists('profileId', profileId);

    return es.access('profile', profileId, requester, 'patch').then(function() {
        return es.patch.id('profile', profileId, patches);
    });
}

function removeProfile(requester, profileId) {
    su.param.exists('profileId', profileId);

    return es.access('profile', profileId, requester, 'remove').then(function() {
        return es.remove.id('profile', profileId);
    });
}