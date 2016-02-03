var builders = {
    tint: require('./tint'),
    version: require('./tint-version'),
    service: require('./service'),
    task: require('./task'),
    resource: require('./resource')
};

module.exports = {
    tint: function(profile, slug) { return new builders.tint(profile, slug); },
    version: function(profile, slug, name) { return new builders.version(profile, slug, name); },
    resource: function(id, provider) { return new builders.resource(id, provider); },
    service: function(id) { return new builders.service(id); },
    task: function(id) { return new builders.task(id); }
};
