var fs = require('fs');
var should = require('should');
var assert = require('assert');
var Q = require('q');

var log4js = require('log4js');
var logger = log4js.getLogger();

var handler = require('../../../es/default.document-handler');

describe('default.document-handler', function() {
    it('should unwrap arrays if they only contain one element', function() {
        var data = {
            "_index": "bigboards-hive-dev-0",
            "_type": "technology_version",
            "_id": "hadoop:2.6.0",
            "_version": 7,
            "found": true,
            "_source": {
                "version": "2.6.0",
                "description": "Hadoop 2.6.0",
                "architecture": "x86_64",
                "services": [
                    {
                        "name": "HDFS",
                        "id": "hdfs",
                        "description": [
                            "The Hadoop Distributed File System"
                        ]
                    }
                ]
            }
        };

        return handler('technology_version', data).then(function(res) {
            res.should.have.a.property('id', "hadoop:2.6.0");
            res.should.have.a.property('type', "technology_version");
            res.should.have.a.property('data');
            res.data.should.have.a.property('version', "2.6.0");
            res.data.should.have.a.property('description', "Hadoop 2.6.0");
            res.data.should.have.a.property('architecture', "x86_64");
            res.data.should.have.a.property('services');
            res.data.services[0].should.have.a.property('name', "HDFS");
            res.data.services[0].should.have.a.property('id', "hdfs");
            res.data.services[0].should.have.a.property('description', "The Hadoop Distributed File System");
        });
    });
});