var argv = require('minimist')(process.argv.slice(2));
var fsu = require('../utils/fs-utils');

var configFile = __dirname + '/config.default.yaml';
if (typeof global.it === 'function') configFile = __dirname + '/config.test.yaml';
if (argv.config) configFile = argv.config;

var config = fsu.readYamlFile(configFile);

module.exports.lookup = function() { return config; };