var TintService = require('../services/tint.service'),
    TintVersionService = require('../services/tint-version.service'),
    au = require('../utils/api-utils'),
    Q = require('q');

module.exports = {
    tint: {
        filter: {
            all: filterTints,
            profile: filterProfileTints
        },
        get: getTint,
        add: addTint,
        patch: patchTint,
        remove: removeTint
    },
    tintVersion: {
        get: getTintVersion,
        add: createTintVersion,
        patch: patchTintVersion,
        remove: removeTintVersion
    }
};

function filterTints(req, res) {
    return au.handle(
        res,
        au.guard.any(req),
        TintService.search(req.requester, req.body, au.paging(req))
    );
}

function filterProfileTints(req, res) {
    var criteria = req.body;

    criteria.profile = req.params.profile;

    return au.handle(
        res,
        au.guard.any(req),
        TintService.search(req.requester, criteria, au.paging(req))
    );
}

function getTint(req, res) {
    return au.handle(
        res,
        au.guard.any(req),
        Q.all([
            TintService.get(req.params.profile, req.params.slug),
            TintVersionService.list(req.params.profile, req.params.slug)
        ]).then(function(responses) {
            var result = responses[0];
            result.versions = responses[1];
            return result;
        })
    );
}

function addTint(req, res) {
    return au.handle(
        res,
        au.guard.access(TintService.access(req.body.profile, req.body.slug, req.requester, 'tint:create')),
        TintService.create(req.body)
    );
}

function patchTint(req, res) {
    return au.handle(
        res,
        au.guard.access(TintService.access(req.params.profile, req.params.slug, req.requester, 'tint:patch')),
        TintService.patch(req.params.profile, req.params.slug, req.body)
    );
}

function removeTint(req, res) {
    return au.handle(
        res,
        au.guard.access(TintService.access(req.params.profile, req.params.slug, req.requester, 'tint:remove')),
        TintService.remove(req.params.profile, req.params.slug)
    );
}

function getTintVersion(req, res) {
    return au.handle(
        res,
        au.guard.any(req),
        TintVersionService.get(req.params.profile, req.params.slug, req.params.version)
    );
}

function createTintVersion(req, res) {
    return au.handle(
        res,
        au.guard.access(TintVersionService.access(req.params.profile, req.params.slug, req.requester, 'tint_version:create')),
        TintVersionService.create(req.params.profile, req.params.slug, req.params.version, req.body)
    );
}

function patchTintVersion(req, res) {
    return au.handle(
        res,
        au.guard.access(TintVersionService.access(req.params.profile, req.params.slug, req.requester, 'tint_version:patch')),
        TintVersionService.patch(req.params.profile, req.params.slug, req.params.version, req.body)
    );
}

function removeTintVersion(req, res) {
    return au.handle(
        res,
        au.guard.access(TintVersionService.access(req.params.profile, req.params.slug, req.requester, 'tint_version:remove')),
        TintVersionService.remove(req.params.profile, req.params.slug, req.params.version)
    );
}