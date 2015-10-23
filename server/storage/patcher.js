module.exports.patch = function(doc, patches) {
    patches.forEach(function(patch) {
        applyPatch(doc, patch);
    });

    return doc;
};

function applyPatch(doc, patch) {
    switch (patch.op) {
        case 'set':
            doc[patch.fld] = patch.val;
            break;
        case 'add':
            if (! doc.hasOwnProperty(patch.fld)) doc[patch.fld] = patch.val;

            // -- in case the document has the field but it is empty, set the value
            else if (! doc[patch.fld])
                doc[patch.fld] = patch.val;

            // -- in case of an array, add the value to the array
            else if ( Object.prototype.toString.call( doc[patch.fld] ) === '[object Array]' )
                doc[patch.fld].push(patch.val);

            else
                doc[patch.fld] = [doc[patch.fld], patch.val];

            break;
        case 'remove':
            if (! doc.hasOwnProperty(patch.fld)) break;

            // -- in case the document has the field but it is empty, set the value
            else if (! doc[patch.fld]) break;

            // -- in case of an array
            else if ( Object.prototype.toString.call( doc[patch.fld] ) === '[object Array]' ) {
                var idx = doc[patch.fld].indexOf(patch.val);

                if (idx > -1) doc[patch.fld].splice(idx, 1);

                if (doc[patch.fld].length == 1) doc[patch.fld] = doc[patch.fld][0];
                if (doc[patch.fld].length == 0) doc[patch.fld] = null;
            }

            else
                doc[patch.fld] = null;

            break;
        case 'purge':
            doc[patch.fld] = null;

            break;
    }
}