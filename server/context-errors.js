function NoSuchObjectError(id) {
    this.name = "NoSuchObjectError";
    this.message = "No object could be found with id '" + id + "'";
    this.stack = Error().stack;
}
NoSuchObjectError.prototype = Object.create(Error.prototype);
module.exports.NoSuchObjectError = NoSuchObjectError;

function ExistingObjectError(id) {
    this.name = "ExistingObjectError";
    this.message = "The registry already contains an object with id '" + id + "'";
    this.stack = Error().stack;
}
ExistingObjectError.prototype = Object.create(Error.prototype);
module.exports.ExistingObjectError = ExistingObjectError;