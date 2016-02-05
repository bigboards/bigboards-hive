var eu = require('../utils/entity-utils'),
    es = require('../es'),
    su = require('../utils/service-utils'),
    filterBuilder = require('../es/filter-builder'),
    shortid = require('shortid');

module.exports = {
    filter: filter,
    add: addStack,
    get: getStack,
    patch: patchStack,
    remove: removeStack
};

function filter(requester, criteria, paging) {
    var filter = filterBuilder.build(requester, criteria, true, true, true);

    return es.lookup.raw('stack', filter, ['profile', 'slug', 'scope', 'name', 'logo', 'description'], paging);
}

function getStack(requester, profile, slug) {
    su.param.exists('profile', profile);
    su.param.exists('slug', slug);

    var id = eu.id(profile, slug);

    return es.access('stack', id, requester, 'get').then(function() {
        return es.lookup.id('stack', id);
    });
}

function addStack(requester, data) {
    su.param.exists('profile', data.profile);
    su.param.exists('slug', data.slug);

    var id = eu.id(data.profile, data.slug);

    return es.access('stack', id, requester, 'add').then(function() {
        // todo: add validation for the data
        return es.create('stack', id, data).then(function() {
            var version = shortid.generate();

            return es.create('stack_version', eu.id(data.profile, data.slug, version), { name: 'Default'}, id);
        });
    });
}

function patchStack(requester, profile, slug, patches) {
    su.param.exists('profile', profile);
    su.param.exists('slug', slug);

    var id = eu.id(profile, slug);

    return es.access('stack', id, requester, 'patch').then(function() {
        return es.patch.id('stack', id, patches);
    });
}

function removeStack(requester, profile, slug) {
    su.param.exists('profile', profile);
    su.param.exists('slug', slug);

    var id = eu.id(profile, slug);

    return es.access('stack', id, requester, 'patch').then(function() {
        return es.remove.id('stack', id);
    });
}