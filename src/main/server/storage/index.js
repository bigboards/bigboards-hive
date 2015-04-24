var Storage = require('./storage');

module.exports = function(esClient, index) {
    return {
        auth: new Storage(esClient, index, 'auth'),
        profile: new Storage(esClient, index, 'profile'),
        library: new Storage(esClient, index, 'library-item'),
        stack: new Storage(esClient, index, 'stack'),
        tutorial: new Storage(esClient, index, 'tutorial')
    };
};