angular.module('hive')
    .factory('Feedback', Feedback);

Feedback.$inject = ['$mdDialog', '$mdToast'];

function Feedback($mdDialog, $mdToast) {
    return {
        ok: okToastFn,
        fail: failToastFn,

        added: okToastFn('Added!'),
        saved: okToastFn('Saved!'),
        removed: okToastFn('Removed!'),

        addFailed: function (entity) { return failed("add", entity) },
        saveFailed: function (entity) { return failed("save", entity) },
        removeFailed: function (entity) { return failed("remove", entity) }
    };

    function failed(operation, entity) {
        return failToastFn("Unable to " + operation + " the " + entity);
    }

    function okToastFn(message) {
        return function(data) {
            $mdToast.show($mdToast.simple()
                .content(message)
                .position('bottom left')
                .hideDelay(1000));

            return data;
        }
    }

    function failToastFn(message) {
        return function(data) {
            $mdToast.show($mdToast.simple()
                .content(message)
                .position('bottom left')
                .hideDelay(3000));

            return data;
        }
    }
}
