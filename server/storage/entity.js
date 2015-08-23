/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
var Q = require('q'),
    esUtils = require('../utils/es-utils');

/**
 * Create a new Storage implementation.
 *
 * @param esClient      the elasticsearch client
 * @param storeId
 * @param type          the type inside the elasticsearch store
 *
 * @constructor
 */
function Entity(esClient, storeId, type) {
    this.esClient = esClient;
    this.storeId = storeId;
    this.type = type;
}

Entity.prototype.search = function(query, fields, paging) {
    var req = {
        index: this.storeId,
        type: this.type,
        fields: fields,
        body: query
    };

    if (paging) {
        if (paging.size) req.size = paging.size;
        if (paging.offset) req.from = paging.offset;
    } else {
        req.size = 25;
    }

    return Q(this.esClient.search(req));
};

Entity.prototype.get = function(id, fields) {
    var self = this;

    var metadata = {
        index: this.storeId,
        type: this.type,
        id: id
    };

    if (fields) metadata.fields = fields;

    return Q(this.esClient
        .get(metadata)
        .then(function(data) {
            return esUtils.formatResponse(data);
        }));
};

Entity.prototype.multiGet = function(ids) {
    return Q(this.esClient.mget({ index: this.storeId, type: this.type, body: { ids: ids } })
        .then(function(data) {
            return esUtils.formatResponse(data);
        }));
};

Entity.prototype.set = function(id, data) {
    var self = this;
    return Q(this.esClient.index({ index: this.storeId, type: this.type, id: id, body: data }))
        .then(function(response) {
            return self.get(response._id);
        });
};

Entity.prototype.add = function(data, id) {
    var request = {
        index: this.storeId,
        type: this.type,
        body: data
    };

    if (id) request.id = id;

    var self = this;
    return Q(this.esClient.create(request))
        .then(function(response) {
            return self.get(response._id);
        });
};

Entity.prototype.addImmediately = function(data) {
    var self = this;
    return Q(this.esClient.index({ index: this.storeId, type: this.type, body: data, refresh: true }))
        .then(function(response) {
            return self.get(response._id);
        });
};

Entity.prototype.multiAdd = function(data) {
    var body = [];

    for (var i in data) {
        body.push({ index:  { _index: this.storeId, _type: this.type } });
        body.push(data[i]);
    }

    return Q(this.esClient.bulk({
        body: body
    }));
};

Entity.prototype.update = function(id, data) {
    var self = this;
    return Q(this.esClient.update({ index: this.storeId, type: this.type, id: id, body: { doc: data } }))
        .then(function(response) {
            return self.get(response._id);
        });
};

Entity.prototype.remove = function(id) {
    var self = this;

    return self
        .get(id)
        .then(function(obj) {
            return Q(self.esClient.delete({ index: self.storeId, type: self.type, id: id }))
                .then(function() {
                    return true;
                });
        }).fail(function(error) {
            if (error.message == 'Not Found') {
                return false;
            } else {
                throw error;
            }
        });
};

module.exports = Entity;


