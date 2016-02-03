var Errors = require('../errors');
var log4js = require('log4js');
var Q = require('q');

var logger = log4js.getLogger('auth');

module.exports = {
    accessLevel: accessLevel,
    paging: handlePaging,
    respond: handleResponse,
    handle: handle,
    requireParam: requireParameter,
    guard: {
        access: guardAccess,
        me: guardIfMe,
        user: guardIfUser,
        any: guardAny
    }
};

function requireParameter(parameterName, obj) {
    if (! obj) throw new Errors.MissingParameterError('No ' + parameterName + ' has been provided');
}

function handle(res, guard, promise, privacyEnforcer, requestedScope) {
    guard.then(function() {
        return promise.then(function (result) {
            if (privacyEnforcer && requestedScope) {
                res.status(200).json(privacyEnforcer.enforce(result, requestedScope));
                return;
            }

            res.status(200).json(result);
        });
    }).fail(function(error) {
        logger.error(error);

        if (error.code && error.message) {
            res.status(error.code).json(error);
        } else {
            res.status(500).json({
                code: 'STRANGE_ERROR',
                message: JSON.stringify(error)
            });
        }
    });
}

function handleResponse(res, promise) {
    promise.then(function(obj) {
        res.status(200).json(obj);
    }).fail(function(err) {
        if (error.code && error.message) {
            res.status(error.code).json(error);
        } else {
            res.status(500).json(error);
        }
    })
}

function handlePaging(req) {
    var offset = req.swagger.params.o.value;
    var size = req.swagger.params.s.value;

    if (offset || size) {
        return {
            size: size,
            offset: offset
        };
    } else {
        return null;
    }
}

function guardAccess(accessPromise) {
    return accessPromise.then(function(outcome) {
        if (outcome === false) {
            return Q.reject({
                code: 403,
                message: 'Not Authorized!'
            });
        } else {
            return Q();
        }
    });
}

function guardIfMe(req, profileId) {
    if (! req.requester) {
        logger.warn('The requester has not logged in');
        return Q.reject({
            code: 403,
            message: 'Not Authorized!'
        });
    }

    if (req.requester.id != profileId) {
        logger.warn('The requester is not the owner of the resource');
        return Q.reject({
            code: 403,
            message: 'Not Authorized!'
        });
    }

    return Q();
}

function guardIfUser(req) {
    if (! req.requester) {
        logger.warn('The requester has not logged in');
        return Q.reject({
            code: 403,
            message: 'Not Authorized!'
        });
    }

    return Q();
}

function guardAny(req) {
    return Q();
}

/**
 * Determine the access level the requester has on the member.
 *
 *  private:
 *      if the requester is the member herself
 *
 *  restricted:
 *      if the requester has a relationship with the member
 *
 *  public:
 *      all other cases
 *
 * @param requester   the requester
 * @param memberId    the member
 */
function accessLevel(requester, memberId) {
    if (requester == memberId) return Q('private');
    else return Q('public');
}