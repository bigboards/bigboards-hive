var Errors = require('../errors');

module.exports = {
    param: {
        exists: checkParamExists
    }
};


function checkParamExists(parameter, value) {
    if (! value) throw new Errors.MissingParameterError('Parameter ' + parameter + ' was not found!');
}
