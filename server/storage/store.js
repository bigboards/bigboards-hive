
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
    esUtils = require('../utils/es-utils'),
    Entity = require('./entity'),
    Search = require('./search'),
    S3 = require('./s3'),
    mapping = require('./mapping');

/**
 * Create a new Storage implementation.
 *
 * @param esClient      the elasticsearch client
 * @param aws
 * @param storeId
 *
 * @constructor
 */
function Store(esClient, aws, storeId) {
    this.esClient = esClient;
    this.aws = aws;
    this.storeId = storeId;
}

Store.prototype.conceive = function() {
    var self = this;
    var createIndexBody = {
        "settings" : {
            "index" : {
                "number_of_shards" : 1,
                "number_of_replicas" : 0
            }
        },
        mappings:  mapping
    };

    // -- create the index
    return Q(this.esClient.indices
        .create({ index: this.storeId, body: createIndexBody }));
};

Store.prototype.destroy = function() {
    return Q(this.esClient.indices.delete({ index: this.storeId }));
};

Store.prototype.entity = function(entityName) {
    return new Entity(this.esClient, this.storeId, entityName);
};

Store.prototype.search = function() {
    return new Search(this.esClient, this.storeId);
};

Store.prototype.stream = function() {
    return new S3(this.aws, this.storeId);
};

module.exports = Store;


