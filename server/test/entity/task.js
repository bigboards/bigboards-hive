function TaskBuilder(id) {
    this.result = {
        id: id,
        name: id,
        driver: 'docker',
        configuration: {}
    };
}

TaskBuilder.prototype.config = function(key, value) {
    this.result.configuration[key] = value;

    return this;
};

TaskBuilder.prototype.build = function() { return this.result; };

module.exports = TaskBuilder;