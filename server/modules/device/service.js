var Errors = require('../../errors'),
    Q = require('q'),
    ShortId = require('shortid'),
    moment = require('moment'),
    esUtils = require('../../utils/es-utils'),
    log = require('winston');
var AWS = require('aws-sdk');

function DeviceService(storage, services, config) {
    this.storage = storage;
    this.services = services;
    this.r53 = new AWS.Route53();
    this.hostedZoneId = config.aws.route53.hexZoneId;

    if (!this.hostedZoneId) throw new Error('No hosted zone id has been set for registering node DNS records!')
}

DeviceService.prototype.listDevices = function(user, criteria, paging) {
    criteria['owner'] = user.hive_id;
    var request = esUtils.criteriaToFilter('device', criteria);

    return this.storage.search(request, null, paging);
};

DeviceService.prototype.getDevice = function(deviceId) {
    return this.storage.get(deviceId);
};

DeviceService.prototype.addDevice = function(user, data) {
    var me = this;
    if (! data.short_id) throw new Errors.BadPayloadError("No device owner short-id provided");
    if (! data.mac) throw new Errors.BadPayloadError("No mac address provided");
    if (! data.name) throw new Errors.BadPayloadError("No device name provided");
    if (! data.hostname) throw new Errors.BadPayloadError("No device hostname provided");
    if (! data.arch) throw new Errors.BadPayloadError("No device architecture provided");
    if (! data.memory) throw new Errors.BadPayloadError("No device memory provided");
    if (! data.cpus) throw new Errors.BadPayloadError("No device cpus provided");
    if (! data.disks) throw new Errors.BadPayloadError("No device disks provided");

    // -- try to get the owner first
    return this.services.people.getByShortId(data.short_id).then(function(owner) {
        if (! owner) throw new Errors.IllegalParameterError("No profile found for the given shortId");


        var id = data.mac.replace(/\:/g, '').toLowerCase();
        var req = {
            name: data.name,
            owner: owner.id,
            owner_name: owner.data.name,
            mac: data.mac,
            device_id: id,
            firmware: data.firmware | 'unknown',
            hostname: data.hostname,
            arch: data.arch,
            memory: data.memory,
            cpus: data.cpus,
            disks: data.disks
        };

        if (data.ipv4) req.ipv4 = data.ipv4;
        if (data.ipv6) req.ipv6 = data.ipv6;

        return me.storage.set(id, req).then(function(data) {
            return data.id;
        });
    });
};

DeviceService.prototype.removeDevice = function(deviceId) {
    return this.storage.remove(deviceId);
};

DeviceService.prototype.setNodeDNS = function(deviceId, nodeId, data) {
    var me = this;

    // -- check if we can find a device with the given id
    return this.storage.get(deviceId).then(function(device) {
        if (device.data.nodes) {
            device.data.nodes.forEach(function (node) {
                if (node.hostname != nodeId) return;

                var changes = [
                    {
                        "Action":"UPSERT",
                        "ResourceRecordSet":{
                            "ResourceRecords":[
                                {
                                    "Value": data.ip
                                }
                            ],
                            "Name": data.hostname + "." + device.data.name + ".device.bigboards.io",
                            "Type":"A",
                            "TTL":300
                        }
                    }
                ];

                if (data.sequence) {
                    changes.push({
                        "Action":"UPSERT",
                        "ResourceRecordSet":{
                            "ResourceRecords":[
                                {
                                    "Value": data.hostname + "." + device.data.name + ".device.bigboards.io"
                                }
                            ],
                            "Name": "node-" + data.sequence + "." + device.data.name + ".device.bigboards.io",
                            "Type":"CNAME",
                            "TTL":300
                        }
                    });
                }

                var params = {
                    ChangeBatch: {
                        Changes: changes
                    },
                    HostedZoneId: me.hostedZoneId
                };

                me.r53.changeResourceRecordSets(params, function(err, data) {
                    if (err) console.log(err, err.stack);
                });
            });
        }

        return Q({ok: true});
    });
};

module.exports = DeviceService;