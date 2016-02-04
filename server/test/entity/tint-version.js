var es = require('../../es'),
    eu = require('../../utils/entity-utils');

function TintVersionBuilder(profile, slug, name) {
    this.profile = profile;
    this.slug = slug;
    this.result = {
        name: name,
        architecture: 'x86_64',
        resources: [],
        services: []
    };
}

TintVersionBuilder.prototype.arch = function(arch) {
    this.result.architecture = arch;

    return this;
};

TintVersionBuilder.prototype.resource = function(resource) {
    if (typeof resource.build === 'function') resource = resource.build();

    this.result.resources.push(resource);

    return this;
};

TintVersionBuilder.prototype.service = function(service) {
    if (typeof service.build === 'function') service = service.build();

    this.result.services.push(service);

    return this;
};

TintVersionBuilder.prototype.store = function() {
    var id = eu.id(this.profile, this.slug, this.result.name);
    var parentId = eu.id(this.profile, this.slug);
    return es.create('tint_version', id, this.result, parentId, true).then(function() {
        console.log('The ' + id + ' tint version has been created');
    });
};

TintVersionBuilder.prototype.build = function() { return this.result; };

module.exports = TintVersionBuilder;