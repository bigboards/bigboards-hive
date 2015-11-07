var Errors = require('../../errors'),
    Q = require('q'),
    ShortId = require('shortid'),
    moment = require('moment'),
    log = require('winston');

function DeviceService(storage) {
    this.storage = storage;
}

DeviceService.prototype.get = function(user) {
    var body = {
        "_source" : fields,
        "query": {
            "filtered": {
                "query": { "match_all": {} },
                "filter": {"term": {"owner": user}}
            }
        }
    };

    return this.storage.search(body, paging);
};

DeviceService.prototype.getByCode = function(code) {
    var body = {
        "query": {
            "filtered": {
                "query": { "match_all": {} },
                "filter": {"term": {"secret_code": code}}
            }
        }
    };

    return this.storage.search(body).then(function(response) {
        if (response.data.length == 0)
            return null;
        else if (response.data.length > 1) {
            log.log('error', 'More then one device was found with code "' + code + '"');
            return null;
        } else {
            return response.data[0];
        }
    });
};

DeviceService.prototype.addDevice = function(user, deviceData) {
    var data = {
        name: deviceData.name,
        secret_code: ShortId.generate(),
        owner: user.hive_id
    };

    return this.storage.add(data);
};

DeviceService.prototype.updateDevice = function(deviceId, patches) {
    return this.storage.patch(deviceId, patches);
};

DeviceService.prototype.removeDevice = function(deviceId) {
    return this.storage.remove(deviceId);
};

module.exports = DeviceService;