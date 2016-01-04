angular.module('hive')
    .factory('Logger', Logger)
    .controller('ToastServerCtrl', ToastServerCtrl);

Logger.$inject = [ 'settings', '$mdToast' ];
ToastServerCtrl.$inject = [ '$mdToast' ];

function Logger(settings, $mdToast) {
    function logServer(level, message, error) {
        $mdToast.show({
            controller: 'ToastServerCtrl',
            templateUrl: 'toast-server.part.html',
            parent : $document[0].querySelector('#content'),
            hideDelay: 6000,
            locals: {
                level: level,
                message: message,
                error: error
            }
        });
    }

    return {
        server: {
            ok: function(message) {
                logServer('ok', message, null);
            },
            warn: function(message, error) {
                logServer('warn', message, error);
            },
            fail: function(message, error) {
                logServer('fail', message, error);
            }
        }
    }
}

function ToastServerCtrl($mdToast) {
    var vm = this;

    vm.close = close;

    function close() {
        $mdToast.hide();
    }
}