function getSettings(cb) {
    var api = 'http://localhost:8081';
    switch (window.location.hostname) {
        case 'hive.test.bigboards.io':
            api = 'http://hive-api-test-env.elasticbeanstalk.com';
            break;
    }

    $.ajax({
        url: api + '/api/v1/settings',
        method: 'GET',
        dataType: 'json'
    })
    .done(function( data ) { cb(null, data); })
    .fail(function(error) { cb(error, null); })
}

angular.element(document).ready(function() {
    // -- read the settings based on the url
    getSettings(function(error, settings) {
        if (error) {
            window.location.pathname='/errors/no-settings.html';
            return;
        }

        sessionStorage.settings = JSON.stringify(settings);
        angular.bootstrap(document, ['hive']);
    });
});
