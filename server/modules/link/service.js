var Errors = require('../../errors'),
    Q = require('q'),
    uuid = require('node-uuid'),
    moment = require('moment'),
    jwt = require('jsonwebtoken'),
    crypto = require('crypto');

function LinkService(config) {
    this.config = config;
    this.createToken = require('auth0-api-tokens')(this.config.auth0_api);
}

LinkService.prototype.get = function(user) {
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