function ServiceBuilder(id) {
    this.result = {
        id: id,
        name: id,
        instances: 1,
        tasks: []
    };
}

ServiceBuilder.prototype.instances = function(value) {
    this.result.instances = value;

    return this;
};

ServiceBuilder.prototype.task = function(task) {
    if (typeof task.build === 'function') task = task.build();

    this.result.tasks.push(task);

    return this;
};

ServiceBuilder.prototype.build = function() { return this.result; };

module.exports = ServiceBuilder;