var eu = require('../utils/entity-utils'),
    es = require('../es'),
    au = require('../utils/api-utils');

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

function filter(profile, criteria, paging) {
    var filterList = [];

    criteria.forEach(function(filter) {
        var fb = {term: {}};
        fb.term[filter.field] = filter.value;
        filterList.push(fb);
    });

    if (profile) {
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
                                {"term": {"owner": profile}},
                                {
                                    "nested": {
                                        "path": "collaborators",
                                        "query": {
                                            "match": {"collaborators.id": profile}
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

function getTint(profile, slug) {
    return es.lookup.id('tint', eu.id(profile, slug));
}

function addTint(data) {
    return es.create('tint', eu.id(data.profile, data.slug), data).then(function(tint) {
        //var version = shortid.generate();

        //return crateVersions.create(profile, slug, version, {
        //    name: 'Default'
        //});
    });
}

function patchTint(profile, slug, patches) {
    return es.patch.id('tint', eu.id(profile, slug), patches);
}

function removeTint(profile, slug) {
    return es.remove.id('tint', eu.id(profile, slug));
}