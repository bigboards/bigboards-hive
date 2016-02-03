var es = require('../es'),
    eu = require('../utils/entity-utils');

module.exports = {
    access: checkAccess,
    list: list,
    create: addTintVersion,
    get: getTintVersion,
    patch: patchTintVersion,
    remove: removeTintVersion
};

function checkAccess(profile, slug, requester, operation) {
    return es.access('tint', eu.id(profile, slug), requester, operation);
}

function list(profile, slug, paging) {
    var req = {
        "query": {
            "has_parent": {
                "type": "tint",
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

    return es.lookup.raw('tint_version', req, ['name'], paging);
}

function getTintVersion(profile, slug, version) {
    return es.lookup.id('tint_version', eu.id(profile, slug, version));
}

function addTintVersion(profile, slug, version, data) {
    return es.create('tint_version', eu.id(profile, slug, version), data);
}

function patchTintVersion(profile, slug, version, patches) {
    return es.patch.id('tint_version', eu.id(profile, slug, version), patches);
}

function removeTintVersion(profile, slug, version) {
    return es.remove.id('tint_version', eu.id(profile, slug, version));
}
