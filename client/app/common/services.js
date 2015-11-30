app.factory('People', ['$resource', 'settings', function($resource, settings) {
    return $resource(settings.api + '/api/v1/people/:username', { username: '@username' },
        {
            'save': { method: 'PUT'}
        }
    );
}]);

app.factory('Feedback', ['$mdToast', function($mdToast) {
    var Feedback = function() {};

    Feedback.prototype.ok = function(message) {
        // TODO: show a toast if needed
        //$mdToast.show(
        //    $mdToast.simple()
        //        .textContent(message)
        //        .hideDelay(3000)
        //);
    };

    Feedback.prototype.error = function(message) {
        // TODO: show a toast if needed
        //$mdToast.show(
        //    $mdToast.simple()
        //        .textContent(message)
        //        .hideDelay(3000)
        //);
    };

    return new Feedback();
}]);

app.factory('Ping', [function() {
    var Ping = function() {};

    Ping.prototype.ping = function(ip, callback) {
        var me = this;
        var busy = true;
        var img = new Image();

        img.onload = function () {
            busy = false;
            callback(null, true);

        };

        img.onerror = function (e) {
            if (busy) {
                busy = false;
                callback(e, true);
            }

        };

        img.src = "http://" + ip;

        setTimeout(function () {
            if (busy) {
                busy = false;
                callback(null, false);
            }
        }, 1500);
    };

    return new Ping();
}]);