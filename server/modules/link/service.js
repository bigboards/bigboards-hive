var Errors = require('../../errors'),
    Q = require('q'),
    uuid = require('node-uuid'),
    moment = require('moment'),
    jwt = require('jsonwebtoken'),
    crypto = require('crypto');

function LinkService(config, services) {
    this.config = config;
    this.createToken = require('auth0-api-tokens')(this.config.auth0_api);
    this.services = services;
}

LinkService.prototype.get = function(user) {
    var hiveToken = generateAuthToken(
        this.config.auth0,
        user.iss,
        user.sub,
        {
            hive_id: user.hive_id,
            name: user.name,
            email: user.email,
            email_verified: user.email_verified
        }
    );

    var token = this.createToken({
        "scopes": {
            "users_app_metadata": [
                "create",
                "update",
                "delete",
                "read"
            ],
            "users": [
                "update",
                "read"
            ],
            "tokens": [
                "blacklist"
            ]
        },
        extra_claims: {
            "sub": user.sub,
            "hive_token": hiveToken
        },
        lifetimeInSeconds: 36000
    });

    return Q({link_token: token});
};

LinkService.prototype.connectNodeToDevice = function(code, nodeData) {
    var self = this;
    return this.services.device.getByCode(code).then(function(device) {
        if (! device) throw new Errors.NotFoundError('The short-code "' + code + '" is not linked to a device');

        var deviceLinkData = {
            hostname: nodeData.hostname,
            ipv4: nodeData.ipv4,
            ipv6: nodeData.ipv6,
            arch: nodeData.arch,
            memory: nodeData.memory,
            cpus: nodeData.cpus,
            disks: nodeData.disks,
            linkedOn: new Date()
        };

        // -- link the device
        return self.services.device.updateDevice(device.id, [
            {op: 'add', fld: 'nodes', unq: true, val: deviceLinkData}
        ]).then(function() {
            // -- get the owner of the device
            return self.services.people.get(device.data.owner).then(function(owner) {
                var hiveToken = generateAuthToken(
                    self.config.auth0,
                    'https://bigboards.auth0.com/',
                    owner.data.id,
                    {
                        hive_id: owner.data.hive_id,
                        name: owner.data.name,
                        email: owner.data.email,
                        email_verified: owner.data.email_verified
                    }
                );

                var otherNodes = [];
                if (device.data.nodes) {
                    var i = 0;
                    for (var idx in device.data.nodes) {
                        if (! device.data.nodes.hasOwnProperty(idx)) continue;
                        var node = device.data.nodes[idx];

                        otherNodes.push({hostname: node.hostname, ipv4: node.ipv4, ipv6: node.ipv6});
                        if (i++ > 6) break;
                    }
                }

                return {
                    device_id: device.id,
                    device_name: device.data.name,
                    device_firmware: device.data.firmware,
                    owner: {
                        id: owner.id,
                        name: owner.data.name,
                        email: owner.data.email
                    },
                    hive_token: hiveToken,
                    first: otherNodes.length == 0,
                    others: otherNodes
                }
            });
        });
    });
};

LinkService.prototype.remove = function(user) {
    var hiveToken = generateAuthToken(
        this.config.auth0,
        user.iss,
        user.sub,
        {
            name: user.name,
            email: user.email,
            email_verified: user.email_verified
        }
    );

    var token = this.createToken({
        scopes: {
            users: ['read', 'update']
        },
        extra_claims: {
            "sub": user.sub,
            "hive_token": hiveToken
        },
        lifetimeInSeconds: 36000
    });

    return Q({link_token: token});
};

module.exports = LinkService;

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