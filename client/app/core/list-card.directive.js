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
}
