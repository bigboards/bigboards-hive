var _ = require('underscore');


var fragmentPattern = /([a-zA-Z][a-zA-Z0-9]*)\[(.*)\]/;
var filterPattern = /([a-zA-Z][a-zA-Z0-9]*)=['"](.*)["']/;

module.exports.patch = function(doc, patches) {
    patches.forEach(function(patch) {
        applyPatch(doc, patch);
    });

    return doc;
};

function applyPatch(doc, patch) {
    if (! patch.op) throw new Error('No patch operation has been provided');
    if (! patch.fld) throw new Error('No patch field has been provided');

    var root = doc;
    if (patch.ent) {
        root = getValue(doc, patch.ent);
    }

    // -- we will initialize the doc field as an array if needed
    if (!root.hasOwnProperty(patch.fld) || !root[patch.fld]) root[patch.fld] = [];
    else if (! isArray(root[patch.fld])) root[patch.fld] = [root[patch.fld]];

    switch (patch.op) {
        case 'set':
            doSet(root, patch);

            break;
        case 'add':
            doAdd(root, patch);
            break;

        case 'upd':
            doUpdate(root, patch);
            break;

        case 'remove':
            doRemove(root, patch);

            break;
        case 'purge':
            doPurge(root, patch);

            break;
    }
}

function doSet(doc, patch) {
    if (patch.old) {
        // -- if an old value is given, we will first look that one up since that is the one we need to
        // -- replace
        var i = -1;
        for (var j = 0; j < doc[patch.fld].length; j++) {
            if (_.isEqual(doc[patch.fld][j], patch.old)) {
                i = j;
                break;
            }
        }

        if (i == -1) doc[patch.fld].push(patch.val);
        else doc[patch.fld][i] = patch.val;
    } else {
        doc[patch.fld] = patch.val;
    }
}

function doAdd(doc, patch) {
    if (! doc[patch.fld]) {
        doc[patch.fld] = [ patch.val ];
    } else {
        if (!patch.unq) {
            doc[patch.fld].push(patch.val);
        } else {
            // -- check if there is already a value like this
            var idx = doc[patch.fld].indexOf(patch.val);
            if (idx == -1) doc[patch.fld].push(patch.val);
        }
    }
}

function doRemove(doc, patch) {
    // -- in case of an array
    var i = -1;
    for (var j = 0; j < doc[patch.fld].length; j++) {
        if (_.isEqual(doc[patch.fld][j], patch.val)) {
            i = j;
            break;
        }
    }

    if (i > -1) doc[patch.fld].splice(i, 1);

    if (doc[patch.fld].length == 0) delete doc[patch.fld];
}

function doPurge(doc, patch) {
    doc[patch.fld] = null;
}

function isArray(obj) {
    return ( Object.prototype.toString.call( obj ) === '[object Array]' )
}

function isEmpty(obj) {
    return obj.length == 0;
}

function getValue(doc, expression) {
    var i = expression.indexOf('.');

    var parts = [];

    if (i == -1) {
        parts.push(expression);
    } else {
        parts.push(expression.substring(0, i));
        parts.push(expression.substring(i + 1));
    }

    // -- requesting an array
    var newDoc = null;

    if (parts[0].indexOf('[') != -1) {
        if (! fragmentPattern.test(parts[0]))
            throw new Error('Invalid entity filter pattern "' + parts[0] + '"');

        var fragments = fragmentPattern.exec(parts[0]);
        if (doc[fragments[1]] === undefined) doc[fragments[1]] = [];
        var tmpDoc = doc[fragments[1]];

        if (! Array.isArray(tmpDoc))
            throw new Error('Fragment "' + fragments[1] + '" should point to an array in order to apply a filter');

        if (filterPattern.test(fragments[2])) {
            var filterParts = filterPattern.exec(fragments[2]);

            for (var idx in tmpDoc) {
                if (! tmpDoc.hasOwnProperty(idx)) continue;

                if (tmpDoc[idx][filterParts[1]] == filterParts[2]) {
                    newDoc = tmpDoc[idx];
                    break;
                }
            }

        } else {
            newDoc = newDoc[fragments[2]]
        }

    } else {
        if (doc[parts[0]] === undefined) {
            doc[parts[0]] = {}
        }

        newDoc = doc[parts[0]];
    }

    if (parts.length == 2) return getValue(newDoc, parts[1]);
    else return newDoc;
}