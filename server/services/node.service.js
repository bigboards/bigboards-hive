var eu = require('../utils/entity-utils'),
    es = require('../es'),
    au = require('../utils/api-utils');

module.exports = {
    access: checkAccess,
    filter: filter,
    create: add,
    get: get,
    patch: patch,
    remove: remove
};

function checkAccess(profile, id, requester, operation) {
    return es.access('node', eu.id(profile, id), requester, operation);
}

function filter(profile, criteria, paging) {
    var filterList = [];

    criteria.forEach(function(filter) {
        var fb = {term: {}};
        fb.term[filter.field] = filter.value;
        filterList.push(fb);
    });

    filterList.push({term: {profile: profile.id}});

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

    return es.lookup.raw('node', req, null, paging);
}

function get(profile, id) {
    return es.lookup.id('node', eu.id(profile, id));
}

function add(profile, id, data) {
    return es.create('node', eu.id(profile, id), data);
}

function patch(profile, id, patches) {
    return es.patch.id('node', eu.id(profile, id), patches);
}

function remove(profile, id) {
    return es.remove.id('node', eu.id(profile, id));
}