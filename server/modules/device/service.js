var Errors = require('../../errors'),
    Q = require('q'),
    ShortId = require('shortid'),
    moment = require('moment'),
    esUtils = require('../../utils/es-utils'),
    log = require('winston');
var AWS = require('aws-sdk');

function DeviceService(storage, config) {
    this.storage = storage;
    this.r53 = new AWS.Route53();
    this.hostedZoneId = config.aws.route53.hexZoneId;

    if (!this.hostedZoneId) throw new Error('No hosted zone id has been set for registering node DNS records!')
}

DeviceService.prototype.getDevice = function(deviceId) {
    return this.storage.get(deviceId);
};

DeviceService.prototype.addDevice = function(user, data) {
    var id = ShortId.generate();

    var req = {
        name: data.name,
        device_id: id,
        firmware: data.firmware,
        hostname: data.hostname,
        arch: data.arch,
        memory: data.memory,
        cpus: data.cpus,
        disks: data.disks
    };

    if (data.ipv4) req.ipv4 = data.ipv4;
    if (data.ipv6) req.ipv6 = data.ipv6;

    return this.storage.add(req, id).then(function(data) {
        return data.id;
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