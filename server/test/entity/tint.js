var es = require('../../es'),
    eu = require('../../utils/entity-utils');

function TintBuilder(profile, slug) {
    this.result = {
        profile: profile,
        slug: slug,
        logo: null,
        scope: 'public',
        name: slug + ' name',
        description: slug + ' description',
        collaborators: []
    };
}

TintBuilder.prototype.scope = function(scope) {
    this.result.scope = scope;

    return this;
};

TintBuilder.prototype.collaborator = function(profile, permissions) {
    this.result.collaborators.push({profile: profile, permissions: permissions});

    return this;
};

TintBuilder.prototype.store = function() {
    var id = eu.id(this.result.profile, this.result.slug);
    es.create('tint', id, this.result).then(function() {
        console.log('The ' + id + ' tint has been created');
    });
};

TintBuilder.prototype.build = function() { return this.result; };

module.exports = TintBuilder;