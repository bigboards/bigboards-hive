var Q = require('q'),
    shortid = require('shortid'),
    esUtils = require('../../utils/es-utils'),
    unirest = require('unirest'),
    crypto = require('crypto'),
    errors = require('../../errors'),
    AWS = require('aws-sdk'),
    jwt = require('jsonwebtoken');

var log4js = require('log4js');
var logger = log4js.getLogger('cluster.service');

function ClusterService(clusterStorage, deviceStorage, incubationStorage, config) {
    this.clusterStorage = clusterStorage;
    this.deviceStorage = deviceStorage;
    this.incubationStorage = incubationStorage;
    this.config = config;
    this.r53 = new AWS.Route53();
}

ClusterService.prototype.getClusters = function(user, fields, paging) {
    var me = this;

    return this.clusterStorage.count()
        .then(function(count) {
            if (count == 0) return { hits: {total: 0, hits: [] }};
            else {
                if (user) {
                    var collabFilters = [
                        { "term": {"owner": user.hive_id }},
                        { "nested": { "path": "collaborators", "query": { "match": { "collaborators.id": user.hive_id }}}}
                    ];
                }

                var body = {
                    "query": {
                        "filtered": {
                            "query": { "match_all": {} },
                            "filter": {"bool": {"should": collabFilters }}
                        }
                    }
                };

                if (fields) {
                    body._source = fields;
                }

                return me.clusterStorage.search(body, fields, paging);
            }
        });
};

ClusterService.prototype.getCluster = function(clusterId) {
    return this.clusterStorage.get(clusterId, null, function(doc) {
        var data = esUtils.documentFields(doc);

        return Q({
            id: doc._id,
            data: data,
            type: doc._type
        });
    });
};

ClusterService.prototype.getClusterDevices = function(clusterId, paging) {
    var body = {
        "query": {
            "filtered": {
                "query": { "match_all": {} },
                "filter": {"term": {"cluster": clusterId }}
            }
        }
    };

    return this.deviceStorage.search(body, null, paging);
};

/**
 * Add the cluster as an incubated cluster.
 *  Incubated clusters are not yet real clusters, but they have the ability to become
 *  real clusters in the platform. The user can pull a cluster out of incubation by adding
 *  it to his/her profile using the short id.
 *
 * @param data  the data to associate with the cluster
 * @returns {*}
 */
ClusterService.prototype.incubateCluster = function(data) {
    var me = this;
    var id = shortid.generate();

    // -- validate the cluster data
    if (! data.id ) throw new errors.BadPayloadError("No cluster id has been provided!");
    if (! data.name ) throw new errors.BadPayloadError("No cluster name has been provided!");
    if (! data.callback ) throw new errors.BadPayloadError("No cluster callback url has been provided!");
    if (! data.nodes ) throw new errors.BadPayloadError("No cluster nodes have been provided!");

    var idx = 1;
    data.nodes.forEach(function(node) {
        if (! node.name) throw new errors.BadPayloadError("No node name has been provided for node " + idx);
        if (! node.arch) throw new errors.BadPayloadError("No node arch has been provided for node " + idx);
        if (! node.ipv4) throw new errors.BadPayloadError("No node ipv4 has been provided for node " + idx);
        if (! node.mac) throw new errors.BadPayloadError("No node mac has been provided for node " + idx);

        idx++;
    });

    return me.incubationStorage.exists(id).then(function(exists) {
        if (exists) {
            id = shortid.generate();
            return me.incubationStorage.exists(id).then(function(exists) {
                if (exists) throw new Error('Unable to generate a unique id for incubation.');
                else me.incubationStorage.add(data, id);
            });
        } else {
            // -- add the request to the incubation
            return me.incubationStorage.add(data, id);
        }
    }).then(function() {
        return { pair_code: id };
    });
};

ClusterService.prototype.pairCluster = function(user, pairCode) {
    var me = this;

    // -- look for the incubated cluster with the given pair code
    return me.incubationStorage.get(pairCode).then(function(incubatedCluster) {
        var promises = [];
        var nodes = [];

        // -- since now we have the cluster and all the details, we can create the real cluster and device entities
        if (incubatedCluster.data.nodes) {
            if (Array.isArray(incubatedCluster.data.nodes)) {
                incubatedCluster.data.nodes.forEach(function (node) {
                    node.cluster = incubatedCluster.data.id;

                    nodes.push(node.id);
                    promises.push(me.deviceStorage.add(node, node.id));
                });
            } else {
                var node = incubatedCluster.data.nodes;
                node.cluster = incubatedCluster.data.id;

                nodes.push(node.id);
                promises.push(me.deviceStorage.set(node.id, node));
            }
        }

        delete incubatedCluster.data.nodes;

        incubatedCluster.data.owner = user.hive_id;
        incubatedCluster.data.notified = false;
        incubatedCluster.data.nodes_ids = nodes;
        incubatedCluster.data.collaborators = [
            {
                id: user.hive_id,
                name: user.name,
                email: user.email,
                permissions: ['*']
            }
        ];

        return Q.all(promises).then(function() {
            return me.clusterStorage.set(incubatedCluster.data.id, incubatedCluster.data);
        }).then(function() {
            return me.incubationStorage.remove(pairCode);
        }).then(function() {
            incubatedCluster.owner = {
                id: user.hive_id,
                firstname: user.firstname,
                surname: user.surname,
                email: user.email
            };

            // -- generate an api token
            var token = generateAuthToken(
                me.config.auth0,
                user.iss,
                user.sub,
                {
                    hive_id: user.hive_id,
                    name: user.name,
                    email: user.email,
                    email_verified: user.email_verified
                }
            );


            return me.clusterStorage.patch(incubatedCluster.data.id, [
                { op: 'set', fld: 'token', val: token}
            ]).then(function() {
                incubatedCluster.data.token = token;

                return {
                    cluster: {
                        id: incubatedCluster.data.id,
                        type: 'cluster',
                        data: incubatedCluster.data
                    },
                    token: token
                };
            });
        });
    });
};

ClusterService.prototype.updateCluster = function(clusterId, patches) {
    return this.clusterStorage.patch(clusterId, patches);
};

ClusterService.prototype.removeCluster = function(clusterId) {
    var me = this;

    // -- remove all the cluster devices
    return this.getCluster(clusterId)
        .then(function(cluster) {
            return me.deviceStorage.multiRemoveDirect(cluster.data.nodes_ids);
        }).then(function() {
            return me.clusterStorage.removeDirect(clusterId);
        });
};

ClusterService.prototype.updateClusterDNS = function(clusterId, data) {
    var promises = [];
    var self = this;

    if (data.nodes) {
        for (var nodeId in data.nodes) {
            if (! data.nodes.hasOwnProperty(nodeId)) continue;

            if (data.nodes[nodeId].role == 'master' || data.nodes[nodeId].role == 'gateway') {
                promises.push(self.deviceStorage.patch(nodeId, [
                    {op: 'set', fld: 'ipv4', val: data.nodes[nodeId].ipv4},
                    {op: 'set', fld: 'firmware', val: data.nodes[nodeId].firmware}
                ]));
            }
        }
    }

    // -- update the device data
    return Q.all(promises)
        .then(function() {
            return updateDNSServer(self.r53, self.config.aws.route53.zones, clusterId, data);
        });
};

module.exports = ClusterService;

function generateAuthToken(credentials, issuer, subject, extra) {
    var payload = extra || {};
    payload.iat = Math.floor(Date.now() / 1000);

    payload.jti = crypto
        .createHash('md5')
        .update(JSON.stringify(payload))
        .digest('hex');

    return jwt.sign(payload,
        new Buffer(credentials.clientSecret, 'base64').toString('binary'), {
            subject: subject,
            issuer: issuer,
            audience: credentials.clientId,
            noTimestamp: true // we generate it before for the `jti`
        });
}

function updateDNSServer(r53, zones, clusterId, data) {
    var promises = [];
    zones.forEach(function(zone) {
        promises.push(updateClusterDnsForZone(r53, zone, clusterId, data));
    });

    return Q.all(promises);
}

function updateClusterDnsForZone(r53, zone, clusterId, data) {
    var defer = Q.defer();

    var changes = [];

    if (data.nodes) {
        for (var nodeId in data.nodes) {
            if (! data.nodes.hasOwnProperty(nodeId)) continue;

            changes.push({
                "Action":"UPSERT",
                "ResourceRecordSet":{
                    "ResourceRecords":[{ "Value": data.nodes[nodeId].ipv4 }],
                    "Name": data.nodes[nodeId].name + "." + clusterId + "." + zone.domain,
                    "Type":"A",
                    "TTL":300
                }
            });

            if (data.nodes[nodeId].role == 'master' || data.nodes[nodeId].role == 'gateway') {
                changes.push({
                    "Action":"UPSERT",
                    "ResourceRecordSet":{
                        "ResourceRecords":[{ "Value": data.nodes[nodeId].name + "." + clusterId + "." + zone.domain }],
                        "Name": clusterId + "." + zone.domain,
                        "Type":"CNAME",
                        "TTL":300
                    }
                });
            }
        }
    }

    var params = {
        ChangeBatch: {
            Changes: changes
        },
        HostedZoneId: zone.id
    };

    r53.changeResourceRecordSets(params, function(err, data) {
        if (err) {
            defer.resolve(err);
            logger.warn("error: " + err);
        }

        logger.trace("request: " + JSON.stringify(params, null, 2));

        defer.resolve({ok: true});
    });

    return defer.promise;
}