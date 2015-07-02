function NameAlreadyUsedError(message) {
    this.name = "NameAlreadyUsedError";
    this.message = message;
    this.stack = Error().stack;
}
NameAlreadyUsedError.prototype = Object.create(Error.prototype);
module.exports.NameAlreadyUsedError = NameAlreadyUsedError;