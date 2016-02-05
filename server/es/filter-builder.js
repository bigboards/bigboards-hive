module.exports = {
    build: build
};

function build(requesterId, criteria, hasScope, hasProfile, hasCollaborators) {
    var criteriaFilter = parseCriteria(criteria);
    var userFilter = parseUser(requesterId, hasScope, hasProfile, hasCollaborators);

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

function parseUser(requesterId, hasScope, hasProfile, hasCollaborators) {
    var userFilterList = [];
    if (hasScope)
        userFilterList.push({term: { scope: 'public' }});

    if (requesterId && hasProfile)
        userFilterList.push({term: { profile: requesterId }});

    if (requesterId && hasCollaborators)
        userFilterList.push({
            nested: {
                path: "collaborators",
                query: {
                    bool: { must: [
                        { term: { "collaborators.profile": requesterId }},
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

function parseCriteria(criteria) {
    var criteriaList = [];

    // -- add the criteria
    for (var key in criteria) {
        if (! criteria.hasOwnProperty(key)) continue;

        var fb = { term: {} };
        fb.term[key] = criteria[key];
        criteriaList.push(fb);
    }

    if (criteriaList.length == 0) return null;
    if (criteriaList.length == 1) return criteriaList[0];

    return {bool: { must: criteriaList }};
}