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
        obj: obj,
        aspects: {}
    };
};

Context.prototype.registerFactory = function(type, id, obj) {
    if (this.registry[id]) throw new Errors.ExistingObjectError(id);

    this.registry['&' + id] = {
        isFactory: true,
        type: type,
        obj: obj,
        aspects: {}
    };
};

Context.prototype.typeAspect = function(instanceType, functionName, type, advise) {
    for (var id in this.registry) {
        if (! this.registry.hasOwnProperty(id)) continue;
        if (this.registry[id].type != instanceType) continue;

        this.instanceAspect(id, functionName, type, advise);
    }
};

Context.prototype.instanceAspect = function(componentId, functionName, type, advise) {
    // -- get the component
    var component = this.registry[componentId];
    if (!component) throw new Errors.NoSuchObjectError(componentId);

    // -- create a new empty aspects container for the given function
    if (! component.aspects[functionName])
        component.aspects[functionName] = { advices: {}, removers: {} };

    // -- check if an aspect has already been set
    if (component.aspects[functionName].advices[type])
        throw new Errors.ExistingAspectError(componentId, functionName, type);

    //  --  set the advise
    component.aspects[functionName].advices[type] = advise;
};

Context.prototype.get = function(id) {
    var applyAspects = function(instance, aspects) {
        for (var functionName in  aspects) {
            if (! aspects.hasOwnProperty(functionName)) continue;

            meld(instance, functionName, aspects[functionName]);
        }

        return instance;
    };

    var obj = this.registry[id];
    if (obj) {
        return applyAspects(obj.obj, obj.aspects);
    }

    obj = this.registry['&' + id];
    if (obj) {
        var instance = obj.obj(this);

        this.registry[id] = {
            type: obj.type,
            obj: instance,
            aspects: obj.aspects
        };

        return applyAspects(instance, obj.aspects);
    }
};

module.exports = Context;