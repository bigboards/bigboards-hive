var Errors = require('../../errors'),
    Q = require('q'),
    ShortId = require('shortid'),
    moment = require('moment'),
    esUtils = require('../../utils/es-utils'),
    jwt = require('jsonwebtoken'),
    Patcher = require('../../storage/patcher'),
    crypto = require('crypto'),
    unirest = require('unirest'),
    AWS = require('aws-sdk');

function DeviceService(storage, services, config) {
    this.config = config;
    this.storage = storage;
    this.services = services;
    this.r53 = new AWS.Route53();
    this.hostedZoneId = config.aws.route53.hexZoneId;
    this.createToken = require('auth0-api-tokens')(this.config.auth0_api);

    if (!this.hostedZoneId) throw new Error('No hosted zone id has been set for registering node DNS records!')
}

DeviceService.prototype.listDevices = function(user, criteria, paging) {
    var request = esUtils.criteriaToQuery('device', criteria, user.hive_id);

    return this.storage.search(request, null, paging);
};

DeviceService.prototype.filterDevices = function(user, criteria, paging) {
    criteria['owner'] = user.hive_id;
    var request = esUtils.criteriaToFilter('device', criteria);

    return this.storage.search(request, null, paging);
};

DeviceService.prototype.getDevice = function(deviceId) {
    return this.storage.get(deviceId);
};

/**
 * Link the device with the given deviceId to the requester.
 *
 * The device will be contacted and the owner information will
 * be sent to it. That way the device will always be able to identify
 * itself.
 *
 * @param requester     the requester to which to link the device
 * @param pairCode      the code used for the pairing
 */
DeviceService.prototype.pair = function(requester, pairCode) {
    var me = this;

    return me.storage.patch(deviceId, [
        { op: 'set', fld: 'owner', val: requester.id },
        { op: 'set', fld: 'owner_name', val: requester.name },
        { op: 'purge', fld: 'link_id' }
    ]).then(function() {
        return me.storage.get(deviceId).then(function(device) {
            var hiveToken = generateAuthToken(
                me.config.auth0,
                requester.iss,
                requester.sub,
                {
                    hive_id: requester.hive_id,
                    name: requester.name,
                    email: requester.email,
                    email_verified: requester.email_verified
                }
            );

            var defer = Q.defer();
            var gateway = device.gateway;
            var called = false;
            device.nodes.forEach(function(node) {
                if (node.id == gateway) {
                    unirest.post('http://' + node.ipv4 + ':7000/api/v1/hex/pair/callback')
                        .headers({'Accept': 'application/json', 'Content-Type': 'application/json'})
                        .send({ token: hiveToken })
                        .end(function (response) {
                            if (response.info || response.ok ) defer.resolve();
                            else defer.reject(new Error(response.body));
                        });
                    called = true;
                }
            });

            if (! called) {
                defer.reject(new Error('Unable to inform the device that it has been paired. No gateway node could be found.'));
            }

            return defer.promise;
        });
    })
};

/**
 * Add a new device (hex or cube) to the hive.
 *
 * @param data  the data corresponding to the device to add
 * @returns a promise eventually returning the token to be used by the device to authenticate with the
 *          hive in name of the user.
 */
DeviceService.prototype.registerDevice = function(data) {
    var me = this;
    if (! data.link_id) throw new Errors.BadPayloadError("No link id provided");
    if (! data.device_id) throw new Errors.BadPayloadError("No device id provided");
    if (! data.device_name) throw new Errors.BadPayloadError("No device name provided");
    if (! data.nodes) throw new Errors.BadPayloadError("No nodes provided");

    var deviceData = {
        device_id: data.device_id,
        device_name: data.device_name,
        firmware: data.firmware | 'unknown',
        link_id: data.link_id,
        nodes: []
    };

    var gatewayId = null;

    if (data.nodes) {
        data.nodes.forEach(function(node) {
            if (node.role == 'master') gatewayId = node.mac.replace(/\:/g, '').toLowerCase();

            deviceData.nodes.push({
                id: node.mac.replace(/\:/g, '').toLowerCase(),
                role: node.role,
                mac: node.mac,
                ipv4: node.ipv4,
                hostname: node.hostname,
                arch: node.arch
            })
        });
    }

    if (! gatewayId)
        return Q.reject(new Error('No gateway node has been defined. A single node is considered the gateway since it provides a way to access the device.'));

    deviceData.gateway = gatewayId;

    return me.storage.set(data.device_id, deviceData);
};

DeviceService.prototype.removeDevice = function(deviceId) {
    return this.storage.remove(deviceId);
};

DeviceService.prototype.updateDevice = function(deviceId, patches) {
    var me = this;

    return this.storage.exists(deviceId, function(exists) {
        if (exists) {
            return me.storage.patch(deviceId, patches);
        } else {
            // -- send word to the device that it needs to register itself before updating the status
        }
    });


        null.then(function(response) {
            if (response.ok) {
                return me.storage.get(deviceId).then(function (device) {
                    if (!device.data.cluster) return device;

                    return me.updateDeviceDNS(device.data.cluster, deviceId, device);
                });
            } else {
                throw new Errors.BadPayloadError("Unable to update the device!");
            }
        });
};

DeviceService.prototype.updateDeviceDNS = function(clusterId, deviceId, data) {
    var me = this;

    // -- check if we can find a device with the given id
    return this.services.cluster.getCluster(clusterId).then(function(cluster) {
        var defer = Q.defer();

        var changes = [
            {
                "Action":"UPSERT",
                "ResourceRecordSet":{
                    "ResourceRecords":[
                        {
                            "Value": data.data.ipv4
                        }
                    ],
                    "Name": data.data.hostname + "." + cluster.data.name + ".device.bigboards.io",
                    "Type":"A",
                    "TTL":300
                }
            }
        ];

        var params = {
            ChangeBatch: {
                Changes: changes
            },
            HostedZoneId: me.hostedZoneId
        };

        me.r53.changeResourceRecordSets(params, function(err, data) {
            if (err) defer.resolve(err);

            defer.resolve({ok: true});
        });

        return defer.promise;
    }, function(error) {
        if (error.status == 404) {
            return {ok: false, reason: "Unable to get the cluster linked to the device"};
        } else {
            return {ok: false, reason: error};
        }
    });
};

module.exports = DeviceService;

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