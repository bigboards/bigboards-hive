module.exports.clone = function(obj) {
    return JSON.parse(JSON.stringify(obj));
};

module.exports.isArray = isArray;
module.exports.isObject = isObject;
module.exports.replaceNulls = replaceNulls;

function replaceNulls(obj) {
    for (var key in obj) {
        if (! obj.hasOwnProperty(key)) continue;

        if (isArray(obj[key])) {
            for (var idx = 0; idx < obj[key].length; idx++) {
                replaceNulls(obj[key][idx]);
            }

        } else if (isObject(obj[key])) {
            replaceNulls(obj[key]);

        } else {
            if (obj[key] == "null") delete obj[key];
            if (obj[key] == "") delete obj[key];
        }
    }
}

function isArray(obj) {
    if (! obj) return false;
    return Object.prototype.toString.call( obj ) === '[object Array]';
}

function isObject(obj) {
    if (! obj) return false;

    return (typeof obj == 'object');
}
