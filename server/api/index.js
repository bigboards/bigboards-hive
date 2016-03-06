var API = require('./api-helper');

var resources = {
    stack: require('./stack.resource'),
    settings: require('./settings.resource'),
    cluster: require('./cluster.resource'),
    node: require('./node.resource'),
    technology: require('./technology.resource'),
    profile: require('./profile.resource')
};

module.exports = function(app) {
    API.register.get(app, '/v1/settings', resources.settings.get);

    registerTechnologyEndpoints(app);
    registerStackEndpoints(app);
    registerClusterEndpoints(app);
    registerNodeEndpoints(app);
    registerSocialEndpoints(app);
};

function registerTechnologyEndpoints(app) {
    API.register.get(app, '/v1/technologies', resources.technology.filter);

    API.register.get(app, '/v1/technologies/:id', resources.technology.get);
    API.register.post(app, '/v1/technologies/:id', resources.technology.add);
    API.register.patch(app, '/v1/technologies/:id', resources.technology.patch);
    API.register.delete(app, '/v1/technologies/:id', resources.technology.remove);

    API.register.get(app, '/v1/technologies/:id/versions', resources.technology.versions.list);
    API.register.get(app, '/v1/technologies/:id/versions/:version', resources.technology.versions.get);
    API.register.post(app, '/v1/technologies/:id/versions/:version', resources.technology.versions.add);
    API.register.patch(app, '/v1/technologies/:id/versions/:version', resources.technology.versions.patch);
    API.register.delete(app, '/v1/technologies/:id/versions/:version', resources.technology.versions.remove);
}

function registerStackEndpoints(app) {
    API.register.get(app, '/v1/stacks', resources.stack.filter.all);
    API.register.post(app, '/v1/stacks', resources.stack.add);

    API.register.get(app, '/v1/stacks/:profile', resources.stack.filter.profile);

    API.register.get(app, '/v1/stacks/:profile/:slug', resources.stack.get);
    API.register.patch(app, '/v1/stacks/:profile/:slug', resources.stack.patch);
    API.register.delete(app, '/v1/stacks/:profile/:slug', resources.stack.remove);

    API.register.get(app, '/v1/stacks/:profile/:slug/versions', resources.stack.versions.list);
    API.register.post(app, '/v1/stacks/:profile/:slug/versions', resources.stack.versions.add);

    API.register.get(app, '/v1/stacks/:profile/:slug/versions/:version', resources.stack.versions.get);
    API.register.patch(app, '/v1/stacks/:profile/:slug/versions/:version', resources.stack.versions.patch);
    API.register.delete(app, '/v1/stacks/:profile/:slug/versions/:version', resources.stack.versions.remove);
}

function registerClusterEndpoints(app) {
    API.register.get(app, '/v1/clusters', resources.cluster.filter);
    API.register.post(app, '/v1/clusters', resources.cluster.add);

    API.register.get(app, '/v1/clusters/:id', resources.cluster.get);
    API.register.patch(app, '/v1/clusters/:id', resources.cluster.patch);
    API.register.delete(app, '/v1/clusters/:id', resources.cluster.remove);

    API.register.get(app, '/v1/clusters/:id/nodes', resources.cluster.nodes.list);
}

function registerNodeEndpoints(app) {
    API.register.get(app, '/v1/nodes', resources.node.list.filter);
    API.register.post(app, '/v1/nodes', resources.node.add);

    API.register.get(app, '/v1/nodes/:slug', resources.node.list.get);
    API.register.delete(app, '/v1/nodes/:slug', resources.node.remove);

    API.register.post(app, '/v1/nodes/link/:pin', resources.node.link);

    //// -- todo: this is currently quite a security hole. We need to figure something out for this.
    //api.registerPut('/api/v1/devices', function(req, res) { return resource.addDevice(req, res); });
    //api.registerDelete('/api/v1/devices/:deviceId', function(req, res) { return resource.removeDevice(req, res); });
    //
    //// -- TODO: the following line is considered to be a security loophole! We will need to fix this once we have the new version online
    //api.registerPatch('/api/v1/devices/:deviceId', function(req, res) { return resource.updateDevice(req, res); });
    //
    //api.registerSecureGet('/api/v1/devices', api.onlyIfUser(), function(req, res) { return resource.listDevices(req, res); });
    //api.registerSecureGet('/api/v1/devices/filter', api.onlyIfUser(), function(req, res) { return resource.filterDevices(req, res); });
    //api.registerSecureGet('/api/v1/devices/:deviceId', api.onlyIfUser(), function(req, res) { return resource.getDevice(req, res); });
}

function registerSocialEndpoints(app) {
    API.register.get(app, '/v1/profiles', resources.profile.filter);
    API.register.post(app, '/v1/profiles', resources.profile.add);

    API.register.get(app, '/v1/profiles/:id', resources.profile.get);
    API.register.patch(app, '/v1/profiles/:id', resources.profile.patch);
    API.register.delete(app, '/v1/profiles/:id', resources.profile.remove);
}