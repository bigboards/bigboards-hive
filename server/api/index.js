var API = require('./api-helper');

var resources = {
    stack: require('./stack.resource'),
    settings: require('./settings.resource'),
    cluster: require('./cluster.resource'),
    node: require('./node.resource'),
    technology: require('./technology.resource')
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
    API.register.get(app, '/v1/stacks/:profile', resources.stack.filter.profile);

    API.register.get(app, '/v1/stacks/:profile/:slug', resources.stack.get);
    API.register.post(app, '/v1/stacks/:profile/:slug', resources.stack.add);
    API.register.patch(app, '/v1/stacks/:profile/:slug', resources.stack.patch);
    API.register.delete(app, '/v1/stacks/:profile/:slug', resources.stack.remove);

    API.register.get(app, '/v1/stacks/:profile/:slug/versions', resources.stack.versions.list);
    API.register.get(app, '/v1/stacks/:profile/:slug/versions/:version', resources.stack.versions.get);
    API.register.post(app, '/v1/stacks/:profile/:slug/versions/:version', resources.stack.versions.add);
    API.register.patch(app, '/v1/stacks/:profile/:slug/versions/:version', resources.stack.versions.patch);
    API.register.delete(app, '/v1/stacks/:profile/:slug/versions/:version', resources.stack.versions.remove);
}

function registerClusterEndpoints(app) {
    API.register.get(app, '/v1/clusters', resources.cluster.filter);
    API.register.post(app, '/v1/clusters/:profile/:slug', resources.cluster.add);

    API.register.get(app, '/v1/clusters/:profile/:slug', resources.cluster.get);
    API.register.patch(app, '/v1/clusters/:profile/:slug', resources.cluster.patch);
    API.register.delete(app, '/v1/clusters/:profile/:slug', resources.cluster.remove);

    API.register.get(app, '/v1/clusters/:profile/:slug/nodes', resources.cluster.nodes.list);

    //API.register.post(app, '/v1/clusters/:profile/:slug/nodes/:nodeProfile/:nodeSlug', resources.cluster.nodes.add);
    //API.register.delete(app, '/v1/clusters/:profile/:slug/nodes/:nodeProfile/:nodeSlug', resources.cluster.nodes.remove);



    //
    //api.registerSecureGet('/api/v1/link', api.onlyIfUser(), function(req, res) { return resource.get(req, res); });
    //
    //api.registerPost('/api/v1/link/:code', function(req, res) { return resource.connectNodeToDevice(req, res); });
}

function registerNodeEndpoints(app) {
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
    //api.registerGet('/api/v1/people', function(req, res) { return resource.search(req, res); });
    //api.registerPut('/api/v1/people/', function(req, res) { return resource.add(req, res); });
    //
    //api.registerGet('/api/v1/people/:id', function(req, res) { return resource.get(req, res); });
    //api.registerSecurePut('/api/v1/people/:id', api.onlyIfMe, function(req, res) { return resource.update(req, res); });
    //api.registerSecureDelete('/api/v1/people/:id', api.onlyIfMe, function(req, res) { return resource.remove(req, res); });
}