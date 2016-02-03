module.exports = {
    id: toId
};

function toId(profile, slug, version) {
    var result = profile + ':' + slug;

    if (version) {
        result += (':' + version);
    }

    return result;
}