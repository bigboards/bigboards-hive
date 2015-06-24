var Errors = require('./context-errors');

function Context() {
    this.modules = {};
    this.registry = {};
}

Context.prototype.run = function() {
    for (var module in this.modules) {
        if (! this.modules.hasOwnProperty(module)) continue;

        this.modules[module].run(this);
    }
};

Context.prototype.module = function(name, module) {
    this.modules[name] = require(module);
    this.modules[name].wire(this);

};

Context.prototype.register = function(type, id, obj) {
    if (this.registry[id]) throw new Errors.ExistingObjectError(id);

    this.registry[id] = {
        isFactory: false,
        type: type,
        obj: obj
    };
};

Context.prototype.registerFactory = function(type, id, obj) {
    if (this.registry[id]) throw new Errors.ExistingObjectError(id);

    this.registry['&' + id] = {
        isFactory: true,
        type: type,
        obj: obj
    };
};

Context.prototype.get = function(id) {
    var obj = this.registry[id];
    if (obj) return obj.obj;

    obj = this.registry['&' + id];
    if (obj) {
        var instance = obj.obj(this);

        this.registry[id] = {
            type: obj.type,
            obj: instance
        };

        return instance;
    }

    throw new Errors.NoSuchObjectError(id);
};

Context.prototype.getByType = function(type) {
    var results = [];

    var self = this;
    this.registry.forEach(function(item) {
        if (item.type != type) return;

        results.push(self.get(item.id));
    });

    return results;
};

module.exports = Context;