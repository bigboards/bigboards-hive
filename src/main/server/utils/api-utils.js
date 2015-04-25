var winston = require('winston');

/**
 * Get the paging query parameters from the request if they are there.
 *
 * @param req   the request to examine for paging parameters
 */
module.exports.parsePaging = function(req) {
    var result = {};
    var hasPaging = false;

    if (req.param.o) {
        result.offset = req.param.o;
        hasPaging = true;
    }

    if (req.param.s) {
        result.size = req.param.s;
        hasPaging = true;
    }

    return (hasPaging) ? result : null;
};

module.exports.handleError = function(res, error) {
    winston.info(error);
    winston.info(error.stack);

    if (!error) return res.send(500, 'No reason given');

    if (error.name == 'NotFoundError') {
        return res.send(404, error);
    } else if (error.name == 'IllegalParameterError') {
        return res.send(400, error);
    } else {
        return res.send(500, error);
    }
};

module.exports.handlePromise = function(res, promise, privacyEnforcer, requestedScope) {
    return promise
        .then(function(results) {
            var response = results;

            if (privacyEnforcer && requestedScope) {
                response = privacyEnforcer.enforce(results, requestedScope);
            }

            return res.json(response);
        })
        .fail(function(error) {
            var msg = JSON.stringify(error, ['stack', 'message', 'inner'], 4);

            if (error.name == 'AlreadyExistsError') {
                res.status(400).send(msg);
            } else if (error.name == 'IllegalParameterError') {
                res.status(400).send(msg);
            } else if (error.name == 'BadPayloadError') {
                res.status(400).send(msg);
            } else if (error.name == 'MissingParameterError') {
                res.status(400).send(msg);
            } else if (error.name == 'NotFoundError') {
                res.status(404).send(msg);
            } else {
                res.status(500).send(msg);
            }
        });
};

module.exports.scopeLevel = function(scope) {
    if (scope == 'restricted') return 1;
    else if (scope == 'private') return 2;
    return 0;
};

module.exports.scopeName = function(scopeLevel) {
    if (scopeLevel == 1) return 'restricted';
    else if (scope == 2) return 'private';
    return 'global';
};

module.exports.registerHead = function(app, path, fn) {
    app.head(path, fn);
    winston.info('   [HEAD] ' + path);
};

module.exports.registerSecureHead = function(app, path, guard, fn) {
    app.head(path, guard, fn);
    winston.info('   [HEAD] ' + path);
};

module.exports.registerGet = function(app, path, fn) {
    app.get(path, fn);
    winston.info('   [GET] ' + path);
};

module.exports.registerSecureGet = function(app, path, guard, fn) {
    app.get(path, guard, fn);
    winston.info('   [GET] ' + path);
};

module.exports.registerPut = function(app, path, fn) {
    app.put(path, function(req, res) { return fn(req, res); });
    winston.info('   [PUT] ' + path);
};

module.exports.registerSecurePut = function(app, path, guard, fn) {
    app.put(path, guard, function(req, res) { return fn(req, res); });
    winston.info('   [PUT] ' + path);
};

module.exports.registerPost = function(app, path, fn) {
    app.post(path, function(req, res) { return fn(req, res); });
    winston.info('  [POST] ' + path);
};

module.exports.registerSecurePost = function(app, path, guard, fn) {
    app.post(path, guard, function(req, res) { return fn(req, res); });
    winston.info('  [POST] ' + path);
};

module.exports.registerDelete = function(app, path, fn) {
    app.delete(path, function(req, res) { return fn(req, res); });
    winston.info('[DELETE] ' + path);
};

module.exports.registerSecureDelete = function(app, path, guard, fn) {
    app.delete(path, guard, function(req, res) { return fn(req, res); });
    winston.info('[DELETE] ' + path);
};

module.exports.onlyIfUser = function(req, res, next) {
    var user = req.user;

    if (! user) return res.status(403).send("Not Authorized");

    return next();
};

module.exports.onlyIfOwner = function(req, res, next) {
    var owner = req.param['owner'];
    var user = req.user;

    if (! owner) return res.status(400).send("No owner has been defined");
    if (! user) return res.status(403).send("Not Authorized");

    if (user != owner) return res.status(403).send("Not Authorized");

    return next();
};