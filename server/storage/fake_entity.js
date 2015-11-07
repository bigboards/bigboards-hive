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
    uuid = require('node-uuid'),
    esUtils = require('../utils/es-utils'),
    Patcher = require('./patcher');

function Entity() {
    this.store = {};
}

Entity.prototype.search = function(query, fields, paging, documentHandler) {
    var res = [];

    for (var id in this.store) {
        if (! this.store.hasOwnProperty(id)) continue;

        var term = query.query.filtered.filter.term;
        for (var k in term) {
            if (! query.query.filtered.filter.term.hasOwnProperty(k)) continue;

            if (this.store[id][k] && this.store[id][k] == term[k]) {
                res.push(this.store[id]);
            }
        }
    }

    return Q(res);
};

Entity.prototype.exists = function(id) {
    return Q(this.store[id] != null);
};

Entity.prototype.get = function(id, fields, documentHandler) {
    return Q(this.store[id]);
};

Entity.prototype.multiGet = function(ids, documentHandler) {
    var res = [];
    var self = this;

    ids.forEach(function(id) {
        res.push(self.store[id]);
    });

    return Q(res);
};

Entity.prototype.set = function(id, data, documentHandler) {
    return this.add(data);
};

Entity.prototype.add = function(data, id, documentHandler) {
    if (!id) id = uuid.v4();
    this.store[id] = data;

    return Q(this.store[id]);
};

Entity.prototype.addImmediately = function(data, documentHandler) {
    return this.add(data);
};

Entity.prototype.multiAdd = function(data) {
    for (var i in data) {
        this.store[data.id] = data;
    }

    return Q(null);
};

Entity.prototype.update = function(id, data, documentHandler) {
    this.store[id] = data;

    return Q(this.store[id]);
};

Entity.prototype.patch = function(id, patches, documentHandler) {
    this.store[id] = Patcher.patch(this.store[id], patches);
    return Q(this.store[id]);
};

Entity.prototype.remove = function(id) {
    var data = this.store[id];

    delete this.store[id];

    return Q(data);
};

module.exports = Entity;


