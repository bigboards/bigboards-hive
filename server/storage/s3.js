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
var Q = require('q');

/**
 * Create a new Storage implementation.
 *
 * @param aws           the aws object from the aws api
 * @param storeId       the name of the store
 *
 * @constructor
 */
function StoreStream(aws, storeId) {
    this.store = storeId;

    this.s3 = new aws.S3();
}

// -- Streaming -------------------------------------------------------------------------------------------------------

StoreStream.prototype.upload = function(id, stream) {
    var defer = Q.defer();

    if (! stream.hasOwnProperty('pipe')) defer.reject(new Error("The given stream isn't actually a stream!"));

    var key = this.store + '/' + id;
    var body = stream.pipe(zlib.createGzip());

    this.s3.upload({ Bucket: 'blonde-cs-upload', Key: key, Body: body })
        .on('httpUploadProgress', function(evt) { defer.progress(evt); })
        .send(function(err, data) { return (err) ? defer.reject(err) : defer.resolve(data); });

    return defer.promise;
};

StoreStream.prototype.download = function(id) {
    var defer = Q.defer;

    var params = { Bucket: 'blonde-cs-content', Key: id };

    this.s3.getObject(params)
        .on('httpData', function(chunk) { defer.proceed(chunk); })
        .on('httpEnd', function() { defer.resolve(); })
        .send();

    return defer.promise;
};

StoreStream.prototype.removeStream = function(id) {
    var defer = Q.defer();

    var params = { Bucket: 'blonde-cs-content', Key: id };

    this.s3.deleteObject(params, function(err, data) { return (err) ? defer.reject(err) : defer.resolve(data); });

    return defer.promise;
};

StoreStream.prototype.getObject = function(id) {
    var params = { Bucket: 'blonde-cs-content', Key: id };

    return this.s3.getObject(params);
};

module.exports = StoreStream;
