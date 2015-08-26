module.exports.toTintId = function(type, owner, slug) {
    if (type == null) throw new Error('No type has been provided for constructing a tint id!');
    if (owner == null) throw new Error('No owner has been provided for constructing a tint id!');
    if (slug == null) throw new Error('No slug has been provided for constructing a tint id!');

    return '[' + type + ']' + owner + '$' + slug;
};

module.exports.isValidType = function(type) {
    if (type == 'stack') return true;
    if (type == 'tutorial') return true;

    return false;
};