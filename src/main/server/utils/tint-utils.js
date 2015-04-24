module.exports.toTintId = function(type, owner, slug) {
    return type + '#' + owner + '/' + slug;
};

module.exports.isValidType = function(type) {
    if (type == 'stack') return true;
    if (type == 'tutorial') return true;

    return false;
};