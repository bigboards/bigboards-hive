var Q = require('q'),
    Patcher = require('../utils/patcher'),
    elasticsearch = require('elasticsearch'),
    log4js = require('log4js'),
    Bodybuilder = require('bodybuilder'),
    authStrategy = require('../auth/auth-strategy');

var config = require('../config/config.manager').lookup();
var logger = log4js.getLogger();

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
    return lookupById('profile', id, ['id', 'name', 'picture_url']);
});

logger.debug('ElasticSearch Initialized!');

module.exports = {
    body: body,
    access: access,
    exists: exists,
    create: create,
    lookup: {
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

function access(type, id, requesterId, operation) {
    if (!type) Q.reject('No type has been provided');
    if (!id) Q.reject('No id has been provided');
    if (!requester) Q.reject('No requester has been provided');
    if (!operation) Q.reject('No operation has been provided');

    // -- check if the requester is allowed to perform the operation on the document
    return Q(esClient.exists({
        index: index,
        type: type,
        id: id,
        fields: ['collaborators', 'profile']
    }).then(function(entity) {
        return authStrategy.check(entity, requesterId, type, operation);
    }))
}

function exists(type, id) {
    if (!type) Q.reject('No type has been provided');
    if (!id) Q.reject('No id has been provided');

    logger.debug('checking if ' + type + ' with id ' + id + ' exists');

    return Q(esClient.exists({
        index: index,
        type: type,
        id: id
    }, function (error, exists) {
        return (exists === true);
    }));
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

    if (parent) {
        logger.debug('creating ' + type + ' with id ' + id + ': ' + JSON.stringify(data, null, 2));
        request.parent = parent;
    } else {
        logger.debug('creating ' + type + ' with id ' + id + ' and parent ' + parent + ': ' + JSON.stringify(data, null, 2));
    }

    if (refresh) request.refresh = refresh;

    return Q(esClient.index(request));
}

function lookupById(type, id, fields, documentHandler) {
    if (!type) Q.reject('No type has been provided');
    if (!id) Q.reject('No id has been provided');

    var metadata = {
        index: index,
        type: type,
        id: id
    };

    if (fields) metadata.fields = fields;

    logger.debug('looking up ' + type + ' using id ' + id);

    if (!documentHandler) documentHandler = defaultDocumentHandler;
    return Q(esClient.get(metadata)).then(function(response) {
        return documentHandler(response);
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
        return processSearchHits(response.hits, documentHandler);
    });
}

function lookupByFilter(type, filters, fields, paging, documentHandler) {
    if (!type) Q.reject('No type has been provided');
    if (!filters || filters.isEmpty()) Q.reject('No filters have been provided');


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
        return processSearchHits(response.hits, documentHandler);
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
        return processSearchHits(response.hits, documentHandler);
    });
}

function patchById(type, id, patches) {
    if (!type) Q.reject('No type has been provided');
    if (!id) Q.reject('No id has been provided');
    if (!patches || patches.isEmpty()) Q.reject('No patches have been provided');

    var metadata = {
        index: index,
        type: type,
        id: id
    };

    logger.debug('patching ' + type + ' with id ' + id + ' applying ' + JSON.stringify(patches, null, 2));

    return Q(esClient.get(metadata).then(function(doc) {
        var resultDoc = Patcher.patch(doc._source, patches);

        return esClient.index({ index: index, type: type, id: id, retryOnConflict: 5, body: resultDoc});
    }));
}

function removeById(type, id) {
    if (!type) Q.reject('No type has been provided');
    if (!id) Q.reject('No id has been provided');

    logger.debug('removing ' + type + ' with id ' + id);

    return Q(esClient.delete({
        index: index,
        type: type,
        id: id
    }));
}

function processSearchHits(hits, documentHandler) {
    var promises = [];

    hits.hits.forEach(function(hit) {
        promises.push(documentHandler(hit));
    });

    return Q.allSettled(promises).then(function(results) {
        var res = [];

        results.forEach(function(result) {
            res.push(result.value);
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

function defaultDocumentHandler(doc) {
    var data = (doc.fields) ? doc.fields :  doc._source;

    var promises = [];

    for (var key in data) {
        if (!data.hasOwnProperty(key)) continue;

        // -- unwrap redundant arrays
        if (Array.isArray(data[key]) && data[key].length == 1) {
            if (key == 'collaborators') continue;
            data[key] = data[key][0];
        }

        // -- replace the profile if found
        if (key == 'profile') {
            promises.push(profileCache.get(data[key]).then(function(profile) {
                data.profile = profile;
            }));
        } else if (key == 'collaborators') {
            if (Array.isArray(data.collaborators)) {
                data.collaborators.forEach(function(collaborator) {
                    promises.push(profileCache.get(collaborator.profile).then(function(profile) {
                        collaborator.profile = profile;
                    }));
                });
            }
        }
    }

    if (promises.length > 0) {
        return Q.allSettled(promises).then(function() {
            return {
                id: doc._id,
                data: data,
                type: doc._type
            };
        });
    } else {
        return Q({
            id: doc._id,
            data: data,
            type: doc._type
        });
    }
}