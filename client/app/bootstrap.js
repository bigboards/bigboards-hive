function getUrlVars() {
    var vars = [], hash;
    var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
    for(var i = 0; i < hashes.length; i++)
    {
        hash = hashes[i].split('=');
        vars.push(hash[0]);
        vars[hash[0]] = hash[1];
    }
    return vars;
}

function getSettings() {
    switch (window.location.hostname) {
        case 'hive.test.bigboards.io':
            return {
                api: 'http://hive-api-test-env.elasticbeanstalk.com'
            };
        default:
            return {
                api: 'http://localhost:8081'
            };
    }
}

angular.element(document).ready(function() {
    var tokenParameter = getUrlVars()['token'];
    if (tokenParameter) sessionStorage.token = JSON.stringify(tokenParameter);

    // -- read the settings based on the url
    var settings = getSettings();

    sessionStorage.settings = JSON.stringify(settings);

    //if (sessionStorage.token) {
    //    $.getJSON(settings.api + '/api/v1/auth/' + JSON.parse(sessionStorage.token))
    //        .done(function( data ) {
    //            sessionStorage.user = JSON.stringify(data.data);
    //            angular.bootstrap(document, ['hive']);
    //        })
    //        .fail(function() {
    //            // -- remove the token from the web storage
    //            delete sessionStorage.token;
    //            delete sessionStorage.user;
    //
    //            // -- redirect to the login page
    //            window.location.href = '/#/login?reason=InvalidToken';
    //            angular.bootstrap(document, ['hive']);
    //        })
    //} else {
    //    if (window.location.href.indexOf('/#/login') == -1) window.location.href = '/#/login';
        angular.bootstrap(document, ['hive']);
    //}
});
