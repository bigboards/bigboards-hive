var es = require('../es'),
    su = require('../utils/service-utils'),
    eu = require('../utils/entity-utils'),
    shortId = require('shortid');

module.exports = {
    list: list,
    create: addStackVersion,
    get: getStackVersion,
    patch: patchStackVersion,
    remove: removeStackVersion
};

function list(requester, profile, slug, paging) {
    var req = {
        "query": {
            "has_parent": {
                "type": "stack",
                "query": {
                    "bool": {
                        "must": [
                            { term: { profile: profile } },
                            { term: { slug: slug } }
                        ]
                    }
                }
            }
        }
    };

    return es.lookup.raw('stack_version', req, ['name', 'architecture'], paging);
}

function getStackVersion(requester, profile, slug, version) {
    su.param.exists('profile', profile);
    su.param.exists('slug', slug);
    su.param.exists('version', version);

    var parentId = eu.id(profile, slug);
    var id = eu.id(profile, slug, version);

    return es.access('stack_version', id, requester, 'get', parentId).then(function() {
        return es.lookup.id('stack_version', id, parentId);
    });
}

function addStackVersion(requester, profile, slug,  data) {
    su.param.exists('profile', profile);
    su.param.exists('slug', slug);

    var parentId = eu.id(profile, slug);

    data.id = shortId.generate();
    var id = eu.id(profile, slug, data.id);

    return es.access('stack_version', id, requester, 'add', parentId).then(function() {
        return es.create('stack_version', id, data, parentId);
    });
}

function patchStackVersion(requester, profile, slug, versionId, patches) {
    su.param.exists('profile', profile);
    su.param.exists('slug', slug);
    su.param.exists('versionId', versionId);

    var parentId = eu.id(profile, slug);

    return es.access('stack_version', versionId, requester, 'patch', parentId).then(function() {
        return es.patch.id('stack_version', versionId, patches, parentId);
    });
}

function removeStackVersion(requester, profile, slug, versionId) {
    su.param.exists('profile', profile);
    su.param.exists('slug', slug);
    su.param.exists('versionId', versionId);

    var parentId = eu.id(profile, slug);

    return es.access('stack_version', versionId, requester, 'remove', parentId).then(function() {
        return es.remove.id('stack_version', versionId, parentId);
    });
}
