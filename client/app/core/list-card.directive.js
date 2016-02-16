angular.module('hive')
    .directive('bbListCard', ListCard);

function ListCard() {
    return {
        scope: {
            title: '=bbTitle',
            subtitle: '=bbSubTitle',
            img: '=bbImage',
            locked: '=bbLocked',
            removable: '=?bbRemovable',
            item: '=bbItem',
            onRemove: '&bbOnRemove',
            onClick: '&bbOnClick'
        },
        templateUrl: 'app/core/list-card.directive.html',
        controller: ListCardController,
        controllerAs: 'vm',
        bindToController: true
    };
}

ListCardController.$inject = [];

function ListCardController() {
    var vm = this;

    vm.remove = function(ev) {
        if (vm.onRemove) vm.onRemove();

        if (ev) {
            ev.stopPropagation();
            ev.preventDefault();
        }
    };

    vm.click = function(ev) {
        if (vm.onClick) vm.onClick();

        if (ev) {
            ev.stopPropagation();
            ev.preventDefault();
        }
    };
}
