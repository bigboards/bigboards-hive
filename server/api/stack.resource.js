var StackService = require('../services/stack.service'),
    StackVersionService = require('../services/stack-version.service'),
    au = require('../utils/api-utils');

module.exports = {
    filter: {
        all: filterStacks,
        profile: filterProfileStacks
    },
    get: getStack,
    add: addStack,
    patch: patchStack,
    remove: removeStack,
    versions: {
        list: listStackVersions,
        get: getStackVersion,
        add: createStackVersion,
        patch: patchStackVersion,
        remove: removeStackVersion
    }
};

function filterStacks(req, res) {
    return au.handle(res, StackService.filter(req.requester, req.body, au.paging(req)));
}

function filterProfileStacks(req, res) {
    return au.handle(res, StackService.filter(req.requester, req.body, au.paging(req)));
}

function getStack(req, res) {
    return au.handle(res, StackService.get(req.requester, req.params.profile, req.params.slug));
}

function addStack(req, res) {
    return au.handle(res, StackService.add(req.requester, req.body));
}

function patchStack(req, res) {
    return au.handle(res, StackService.patch(req.requester, req.params.profile, req.params.slug, req.body));
}

function removeStack(req, res) {
    return au.handle(res, StackService.remove(req.requester, req.params.profile, req.params.slug));
}

function listStackVersions(req, res) {
    return au.handle(res, StackVersionService.list(req.requester, req.params.profile, req.params.slug, au.paging(req)));
}

function getStackVersion(req, res) {
    return au.handle(res, StackVersionService.get(req.requester, req.params.profile, req.params.slug, req.params.version));
}

function createStackVersion(req, res) {
    return au.handle(res, StackVersionService.create(req.requester, req.params.profile, req.params.slug, req.params.version, req.body));
}

function patchStackVersion(req, res) {
    return au.handle(res, StackVersionService.patch(req.requester, req.params.profile, req.params.slug, req.params.version, req.body));
}

function removeStackVersion(req, res) {
    return au.handle(res, StackVersionService.remove(req.requester, req.params.profile, req.params.slug, req.params.version));
}