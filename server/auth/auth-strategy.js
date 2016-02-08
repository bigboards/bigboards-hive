var Q = require('q'),
    Constants = require('../constants'),
    log4js = require('log4js');

var logger = log4js.getLogger('auth');

module.exports = {
    check: check
};

function check(entity, requester, requestedType, requestedOperation) {
    var requesterId = (requester) ? requester.id : null;
    logger.info('access REQUESTER[' + requesterId + '] REQ[' + requestedType + ':' + requestedOperation + ']');
    logger.debug(JSON.stringify(entity, null, 2));

    // -- get the entity type and check that it actually exists
    var entityType = Constants.entityTypes[requestedType];
    if (! entityType) return Q.reject(new OperationNotAllowed('Illegal entity type'));

    var allowed = null;
    if (requesterId) {
        allowed = checkAuthenticatedUser(entityType, entity, requester, requestedOperation);
    } else {
        allowed = checkNonAuthenticatedUser(entityType, entity, requestedOperation);
    }

    if (!allowed) return Q.reject(new OperationNotAllowed('Insufficient rights.'));
    else return Q();
}

function checkNonAuthenticatedUser(entityType, entity, requestedOperation) {
    if (entityType.hasScope && entity.scope == 'public') return true;

    return false;
}

function checkAuthenticatedUser(entityType, entity, requester, requestedOperation) {
    // -- check if the requester has the permission to perform the requested operation
    //if (hasPermission(requester.permissions, entityType.name, requestedOperation)) {
        if (! shouldEntityBeChecked(requestedOperation)) return true;

        if (entityType.hasProfile && entity.profile == requester.id) return true;
        else logger.warn('not the owner');

        if (entityType.hasCollaborators && entity.collaborators && Array.isArray(entity.collaborators)) {
            for (var idx in entity.collaborators) {
                var profileMatches = entity.collaborators[idx].profile == requester.id;
                var permitted = hasPermission(entity.collaborators[idx].permissions, entityType.name, requestedOperation);

                if (profileMatches && permitted) return true;
                else logger.warn('Insufficient collaborator permissions');
            }
        }

        if (! isModifyingOperation(requestedOperation)) {
            if (entityType.hasScope && entity.scope == 'public') return true;
            else logger.warn('Insufficient entity scope');
        }
    //} else {
//        logger.warn('user ' + requester.id + ' wanted to ' + requestedOperation + ' a ' + entityType.name + ' but was denied to do so due to insufficient global permissions');
//    }

    if (requester.permissions)
        return hasPermission(requester.permissions, entityType.name, requestedOperation);

    return false;
}

function isModifyingOperation(operation) {
    return ['delete', 'remove', 'update', 'patch'].indexOf(operation) != -1;
}

function shouldEntityBeChecked(operation) {
    return ['add'].indexOf(operation) == -1;
}

function hasPermission(permissions, entityType, operation) {
    if (permissions) {
        if (permissions.indexOf('*') != -1) return true;
        if (permissions.indexOf(entityType + ':*')) return true;
        if (permissions.indexOf(entityType + ':' + operation)) return true;
    }

    return false;
}

function OperationNotAllowed(message, requester) {
    this.name = "OperationNotAllowed";
    this.message = message;
    this.stack = Error().stack;
    this.requester = requester;
}
OperationNotAllowed.prototype = Object.create(Error.prototype);
module.exports.OperationNotAllowed = OperationNotAllowed;