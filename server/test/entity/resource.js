function ResourceBuilder(id, provider) {
    this.result = {
        provider: provider,
        id: id,
        settings: {}
    };
}

ResourceBuilder.prototype.setting = function(key, value) {
    this.result.settings[key] = value;

    return this;
};

ResourceBuilder.prototype.build = function() { return this.result; };

module.exports = ResourceBuilder;