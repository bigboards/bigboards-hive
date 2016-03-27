var Q = require('q'),
    Patcher = require('../utils/patcher'),
    elasticsearch = require('elasticsearch'),
    log4js = require('log4js'),
    Bodybuilder = require('bodybuilder'),
    authStrategy = require('../auth/auth-strategy'),
    DefaultDocumentHandler = require('./default.document-handler'),
    SuggestDocumentHandler = require('./suggest.document-handler');



var constants = require('../constants');
var config = require('../config/config.manager').lookup();
var logger = log4js.getLogger("storage.elasticsearch");

var esConfig = {
    host: [{
        host: config.elasticsearch.host,
        port: config.elasticsearch.port,
        protocol: config.elasticsearch.protocol,
        auth: config.elasticsearch.username + ':' + config.elasticsearch.password
    }]
};
if (config.elasticsearch.log) esConfig.log = config.elasticsearch.log;
var esClient = new elasticsearch.Client(esConfig);
var index = config.elasticsearch.index;

var profileCache = require('./cache')(function(id) {
    return lookupById('profile', id, null, ['id', 'name', 'picture_url']);
});

var defaultDocumentHandler = DefaultDocumentHandler(profileCache);
var suggestDocumentHandler = SuggestDocumentHandler();

logger.debug('ElasticSearch Initialized!');

module.exports = {
    body: body,
    access: access,
    exists: exists,
    create: create,
    lookup: {
        suggest: suggest,
        raw: lookupRaw,
        id: lookupById,
        query: lookupByQuery,
        filter: lookupByFilter
    },
    patch: {
        id: patchById
    },
    remove: {
        id: removeById
    }
};

function body() {
    return new Bodybuilder();
}

function access(type, id, requester, operation, parent) {
    if (!type) Q.reject('No type has been provided');
    if (!id) Q.reject('No id has been provided');
    if (!requester) Q.reject('No requester has been provided');
    if (!operation) Q.reject('No operation has been provided');

    if (operation == 'add') {
        return Q(authStrategy.check(null, requester, type, operation));
    } else {
        var req = {
            index: index,
            type: type,
            id: id,
            fields: ['scope', 'profile']
        };

        if (parent) req.parent = parent;

        // -- check if the requester is allowed to perform the operation on the document
        return Q(esClient.get(req).then(function (entity) {
            return authStrategy.check(entity.fields, requester, type, operation);
        }));
    }
}

function exists(type, id) {
    if (!type) Q.reject('No type has been provided');
    if (!id) Q.reject('No id has been provided');

    logger.debug('checking if ' + type + ' with id ' + id + ' exists');

    try {
        return esClient.exists({
            index: index,
            type: type,
            id: id
        }).then(function (exists) {
            return (exists == true);
        });
    } catch (ex) {
        logger.error(ex);
    }
}

function create(type, id, data, parent, refresh) {
    if (!type) Q.reject('No type has been provided');
    if (!id) Q.reject('No id has been provided');

    var request = {
        index: index,
        type: type,
        id: id,
        body: data
    };

    var entityType = constants.entityTypes[type];
    var values = [];
    for (var idx in entityType.suggestFields) {
        if (! entityType.suggestFields.hasOwnProperty(idx)) continue;

        values.push(data[entityType.suggestFields[idx]])
    }

    request.body.suggest = { input: values };

    if (parent) {
        logger.debug('creating ' + type + ' with id ' + id + ' and parent ' + parent + ': ' + JSON.stringify(data, null, 2));
        request.parent = parent;
    } else {
        logger.debug('creating ' + type + ' with id ' + id + ': ' + JSON.stringify(data, null, 2));
    }

    if (refresh) request.refresh = refresh;

    return Q(esClient.create(request));
}

// TODO: Suggest does not take the limitations into account like scope, requester rights etc. This is a minor security breach but has to be fixed.
// I choose not to do so right now because I want to get the thing working first
function suggest(type, query) {
    if (!type) Q.reject('No type has been provided');
    if (!query) Q.reject('No query has been provided');

    var entityType = constants.entityTypes[type];

    var req = {
        index: index,
        type: type,
        fields: ['name', 'version', 'description'],
        size: 5,
        body: query
    };

    logger.debug('suggesting ' + type + ' using query ' + JSON.stringify(query, null, 2));

    return Q(esClient.search(req)).then(function(response) {
        return processSearchHits(type, response.hits, suggestDocumentHandler);
    });
}

function lookupById(type, id, parent, fields, documentHandler) {
    if (!type) Q.reject('No type has been provided');
    if (!id) Q.reject('No id has been provided');

    var metadata = {
        index: index,
        type: type,
        id: id
    };

    if (parent) metadata.parent = parent;
    if (fields) metadata.fields = fields;

    logger.debug('looking up ' + type + ' using id ' + id);

    if (!documentHandler) documentHandler = defaultDocumentHandler;
    return Q(esClient.get(metadata)).then(function(response) {
        logger.debug('lookup by id response: ' + JSON.stringify(response, null, 2));
        return documentHandler(type, response);
    });
}

function lookupByQuery(type, query, fields, paging, documentHandler) {
    if (!type) Q.reject('No type has been provided');
    if (!query) Q.reject('No query has been provided');

    var req = {
        index: index,
        type: type,
        fields: fields,
        body: query
    };

    if (paging) {
        if (paging.size) req.size = paging.size;
        if (paging.offset) req.from = paging.offset;
    } else {
        req.size = 25;
    }

    logger.debug('looking up ' + type + ' using query ' + JSON.stringify(query, null, 2));

    if (!documentHandler) documentHandler = defaultDocumentHandler;

    return Q(esClient.search(req)).then(function(response) {
        return processSearchHits(type, response.hits, documentHandler);
    });
}

function lookupByFilter(type, filters, fields, paging, documentHandler) {
    if (!type) Q.reject(new Error('No type has been provided'));
    if (!filters || filters.length == 0) Q.reject(new Error('No filters have been provided'));


    var filterBody = null;
    if (filters.length == 1) {
        filterBody = {term: {}};
        filterBody.term[filters[0].field] = filters[0].value;
    } else {
        var filterList = [];

        filters.forEach(function(filter) {
            var fb = {term: {}};
            fb.term[filter.field] = filter.value;
            filterList.push(fb);
        });

        filterBody = { bool: { must: filterList }};
    }

    var req = {
        index: index,
        type: type,
        body: {
            "query": {
                "filtered": {
                    "query": { "match_all": {} },
                    "filter": filterBody
                }
            }
        }
    };

    if (fields) {
        req.fields = fields;
        req.body._source = fields;
    }

    if (paging) {
        if (paging.size) req.size = paging.size;
        if (paging.offset) req.from = paging.offset;
    } else {
        req.size = 25;
    }

    logger.debug('looking up ' + type + ' using filter ' + JSON.stringify(filterBody, null, 2));

    if (!documentHandler) documentHandler = defaultDocumentHandler;

    return Q(esClient.search(req)).then(function(response) {
        return processSearchHits(type, response.hits, documentHandler);
    });
}

function lookupRaw(type, body, fields, paging, documentHandler) {
    var req = {
        index: index,
        type: type,
        body: body
    };

    if (fields) {
        req.fields = fields;
        req.body._source = fields;
    }

    if (paging) {
        if (paging.size) req.size = paging.size;
        if (paging.offset) req.from = paging.offset;
    } else {
        req.size = 25;
    }

    logger.debug('looking up ' + type + ' using body ' + JSON.stringify(req, null, 2));

    if (!documentHandler) documentHandler = defaultDocumentHandler;

    return esClient.search(req).then(function(response) {
        logger.debug('request resulted in ' + response.hits.total + ' results');

        return processSearchHits(type, response.hits, documentHandler);
    });
}

function patchById(type, id, patches, parent) {
    if (!type) Q.reject('No type has been provided');
    if (!id) Q.reject('No id has been provided');
    if (!patches || patches.length == 0) Q.reject('No patches have been provided');

    var metadata = {
        index: index,
        type: type,
        id: id
    };

    if (parent) metadata.parent = parent;

    logger.debug('patching ' + type + ' with id ' + id + ' applying ' + JSON.stringify(patches, null, 2));

    return Q(esClient.get(metadata).then(function(doc) {
        var resultDoc = Patcher.patch(doc._source, patches);

        metadata.retryOnConflict = 5;
        metadata.body = resultDoc;

        return esClient.index(metadata);
    }));
}

function removeById(type, id, parent) {
    if (!type) Q.reject('No type has been provided');
    if (!id) Q.reject('No id has been provided');

    logger.debug('removing ' + type + ' with id ' + id);

    var req = {
        index: index,
        type: type,
        id: id
    };

    if (parent) req.parent = parent;

    return Q(esClient.delete(req));
}

function processSearchHits(type, hits, documentHandler) {
    var promises = [];

    hits.hits.forEach(function(hit) {
        logger.debug("Processing " + type + " " + JSON.stringify(hit));
        promises.push(documentHandler(type, hit));
    });

    return Q.all(promises).then(function(results) {
        var res = [];

        results.forEach(function(result) {
            res.push(result);
        });

        var r =  {
            total: hits.total,
            hits: res
        };

        if (hits.max_score) {
            r.max_score = hits.max_score;
        }

        return r;
    });
}

