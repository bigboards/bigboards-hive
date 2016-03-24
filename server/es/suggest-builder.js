var constants = require('../constants');

module.exports = {
    build: build
};

function build(type, requester, filters, query, hasScope, hasProfile, hasCollaborators) {
    var entityType = constants.entityTypes[type];

    var criteriaFilter = parseCriteria(filters, entityType.suggestField, query);
    var userFilter = parseUser(requester, hasScope, hasProfile, hasCollaborators);

    var req = {
        "query": { "filtered": { } }
    };

    if (criteriaFilter && userFilter) {
        req.query.filtered.filter = { bool: { must:[ criteriaFilter, userFilter]}};
    } else if (criteriaFilter) {
        req.query.filtered.filter = criteriaFilter;
    } else if (userFilter) {
        req.query.filtered.filter = userFilter;
    } else {
        req.query.filtered.filter = { match_all: {}};
    }

    return req;
}

function parseUser(requester, hasScope, hasProfile, hasCollaborators) {
    var userFilterList = [];
    if (hasScope)
        userFilterList.push({term: { scope: 'public' }});

    if (requester && requester.id && hasProfile)
        userFilterList.push({term: { profile: requester.id }});

    if (requester && requester.id && hasCollaborators)
        userFilterList.push({
            nested: {
                path: "collaborators",
                query: {
                    bool: { must: [
                        { term: { "collaborators.profile": requester.id }},
                        { bool: { should: [
                            { term: { "collaborators.permissions": '*' }},
                            { term: { "collaborators.permissions": 'filter' }}
                        ]}}
                    ]}
                }
            }
        });

    if (userFilterList.length == 0) return null;
    if (userFilterList.length == 1) return userFilterList[0];

    return { bool: { should: userFilterList }};
}

function parseCriteria(criteria, queryField, query) {
    var criteriaList = [];

    // -- add the criteria
    for (var key in criteria) {
        if (! criteria.hasOwnProperty(key)) continue;

        var fb = { term: {} };
        fb.term[key] = criteria[key];
        criteriaList.push(fb);
    }

    if (query) {
        var fb2 = { prefix: {} };
        fb2.prefix[queryField] = query;
        criteriaList.push(fb2);
    }

    if (criteriaList.length == 0) return null;
    if (criteriaList.length == 1) return criteriaList[0];

    return {bool: { must: criteriaList }};
}