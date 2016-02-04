var eu = require('../utils/entity-utils'),
    es = require('../es'),
    au = require('../utils/api-utils'),
    su = require('../utils/service-utils'),
    shortid = require('shortid');

module.exports = {
    access: checkAccess,
    filter: filter,
    create: addTint,
    get: getTint,
    patch: patchTint,
    remove: removeTint
};

function checkAccess(profile, slug, requester, operation) {
    return es.access('tint', eu.id(profile, slug), requester, operation);
}

function filter(requesterId, criteria, paging) {
    var filterList = [];

    criteria.forEach(function(filter) {
        var fb = {term: {}};
        fb.term[filter.field] = filter.value;
        filterList.push(fb);
    });

    if (requesterId) {
        // -- add a filter to always show tints that are public
        var scopeFilters = [];
        scopeFilters.push({term: {scope: 'public'}});

        // -- and only show tints if they are private and the user is a collaborator
        scopeFilters.push({
            bool: {
                must: [
                    {term: {scope: 'private'}},
                    {
                        bool: {
                            should: [
                                {"term": {"profile": requesterId}},
                                {
                                    "nested": {
                                        "path": "collaborators",
                                        "query": {
                                            "match": {"collaborators.profile": requesterId}
                                        }
                                    }
                                }
                            ]
                        }
                    }
                ]
            }
        });

        filterList.push({ bool: { should: scopeFilters }});
    } else {
        filterList.push({term: {scope: 'public'}});
    }

    var req = {
        "query": { "filtered": { } }
    };

    if (filterList.length == 1) {
        req.query.filtered.filter = filterList[0];
    } else {
        req.query.filtered.filter = {
            bool: { must: filterList }
        };
    }

    return es.lookup.raw('tint', req, ['profile', 'slug', 'scope', 'name', 'logo', 'description'], paging);
}

function getTint(requesterId, profile, slug) {
    su.param.exists('profile', profile);
    su.param.exists('slug', slug);

    var id = eu.id(profile, slug);

    return es.access('tint', id, requesterId, 'get').then(function() {
        return es.lookup.id('tint', id);
    });
}

function addTint(requesterId, data) {
    su.param.exists('profile', data.profile);
    su.param.exists('slug', data.slug);

    var id = eu.id(data.profile, data.slug);

    return es.access('tint', id, requesterId, 'add').then(function() {
        // todo: add validation for the tint data
        return es.create('tint', id, data).then(function(tint) {
            var version = shortid.generate();

            return es.create('tint_version', eu.id(data.profile, data.slug, version), { name: 'Default'}, id);
        });
    });
}

function patchTint(requesterId, profile, slug, patches) {
    su.param.exists('profile', profile);
    su.param.exists('slug', slug);

    var id = eu.id(profile, slug);

    return es.access('tint', id, requesterId, 'patch').then(function() {
        return es.patch.id('tint', id, patches);
    });
}

function removeTint(requesterId, profile, slug) {
    su.param.exists('profile', profile);
    su.param.exists('slug', slug);

    var id = eu.id(profile, slug);

    return es.access('tint', id, requesterId, 'patch').then(function() {
        return es.remove.id('tint', id);
    });
}