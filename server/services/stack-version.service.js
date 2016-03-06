var es = require('../es'),
    eu = require('../utils/entity-utils');

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

    var id = eu.id(profile, slug, version);

    return es.access('stack_version', id, requester, 'get').then(function() {
        return es.lookup.id('stack_version', id);
    });
}

function addStackVersion(requester, profile, slug, version, data) {
    su.param.exists('profile', profile);
    su.param.exists('slug', slug);
    su.param.exists('version', version);

    var id = eu.id(profile, slug, version);

    return es.access('stack_version', id, requester, 'add').then(function() {
        return es.create('stack_version', id, data);
    });
}

function patchStackVersion(requester, profile, slug, version, patches) {
    su.param.exists('profile', profile);
    su.param.exists('slug', slug);
    su.param.exists('version', version);

    var id = eu.id(profile, slug, version);

    return es.access('stack_version', id, requester, 'patch').then(function() {
        return es.patch.id('stack_version', id, patches);
    });
}

function removeStackVersion(requester, profile, slug, version) {
    su.param.exists('profile', profile);
    su.param.exists('slug', slug);
    su.param.exists('version', version);

    var id = eu.id(profile, slug, version);

    return es.access('stack_version', id, requester, 'remove').then(function() {
        return es.remove.id('stack_version', id);
    });
}
