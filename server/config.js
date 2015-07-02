var os = require('os'),
    Q = require('q');

function Config(app, consul)  {
    this.consul = consul;

    this.kvPrefix = app + '/config/';

    var clusterPattern = /(cl[0-9]+)(n[0-9]+)/m;
    if (clusterPattern.test(os.hostname())) {
        var clusterName = os.hostname().match(clusterPattern)[1];

        // --  we are dealing with a cluster. This means we need to get the configuration from consul.
        this.kvPrefix += (clusterName);
    } else {
        this.kvPrefix += 'dev';
    }

    this.kv = {
        get: Q.nbind(consul.kv.get, consul.kv),
        keys: Q.nbind(consul.kv.keys, consul.kv)
    };
}

Config.prototype.get = function(key) {
    return this.kv.get(key).then(function(response) {
        if (!response) return null;
        else return response.Value;
    });
};

Config.prototype.load = function(prefix) {
    var self = this;

    var key = (prefix) ?  this.kvPrefix + prefix : this.kvPrefix;

    return this.kv.keys(key).then(function(keys) {
        var promises = [];
        keys[0].forEach(function(key) {
            promises.push(self.kv.get(key));
        });

        return Q.all(promises).then(function(responses) {
            var result = {};

            responses.forEach(function(response)  {
                if (! response[0].Value) return;

                result[response[0].Key.substring(self.kvPrefix.length + 1)] = JSON.parse(response[0].Value);
            });

            return result;
        });
    });
};

module.exports = Config;