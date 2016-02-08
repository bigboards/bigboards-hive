function getSettings(cb) {
    var api = 'http://localhost:8081';
    switch (window.location.hostname) {
        case 'hive.test.bigboards.io':
            api = 'http://hive-api-test-env.elasticbeanstalk.com';
            break;
        case 'hive.bigboards.io':
            api = 'http://api.hive.bigboards.io';
            break;
    }

    $.ajax({
        url: api + '/v1/settings',
        method: 'GET',
        dataType: 'json'
    })
    .done(function( data ) {
        data.api = api;
        cb(null, data);
    })
    .fail(function(error) { cb(error, null); })
}

angular.element(document).ready(function() {
    // -- read the settings based on the url
    getSettings(function(error, settings) {
        if (error) {
            window.location.pathname='/errors/no-settings.html';
            return;
        }

        if (settings.ga) {
            (function (i, s, o, g, r, a, m) {
                i['GoogleAnalyticsObject'] = r;
                i[r] = i[r] || function () {
                        (i[r].q = i[r].q || []).push(arguments)
                    }, i[r].l = 1 * new Date();
                a = s.createElement(o),
                    m = s.getElementsByTagName(o)[0];
                a.async = 1;
                a.src = g;
                m.parentNode.insertBefore(a, m)
            })(window, document, 'script', '//www.google-analytics.com/analytics.js', 'ga');

            ga('create', settings.ga, 'auto');
            ga('send', 'pageview');
        }

        sessionStorage.settings = JSON.stringify(settings);
        angular.bootstrap(document, ['hive']);
    });
});
