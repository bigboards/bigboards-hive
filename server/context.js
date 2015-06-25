var Errors = require('./context-errors'),
    meld = require('meld'),
    winston = require('winston');

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

Context.prototype.prototypeAroundAspect = function(cls, functionName, advise) {
    meld.around(cls.prototype, functionName, advise);
};

Context.prototype.get = function(id) {
    var obj = this.registry[id];
    if (obj) {
        return obj.obj;
    }

    obj = this.registry['&' + id];
    if (obj) {
        var instance = obj.obj(this);

        this.registry[id] = {
            type: obj.type,
            obj: instance
        };

        return instance;
    }
};

module.exports = Context;