angular.module('hive')
    .directive('bbTechnologyVersionSelect', TechnologyVersionSelect);

function TechnologyVersionSelect() {
    return {
        scope: {
            label: '@bbLabel',
            hint: '@bbHint',
            data: '=bbData',
            onChange: '&bbOnChange',
            showHints: '=?bbShowHints'
        },
        templateUrl: 'app/core/technology-version/technology-version-selector.directive.html',
        controller: TechnologyVersionSelectController,
        controllerAs: 'vm',
        bindToController: true
    };
}

TechnologyVersionSelectController.$inject = ['TechnologyService'];

function TechnologyVersionSelectController(TechnologyService) {
    var vm = this;

    if (vm.showHints == null) vm.showHints = true;

    vm.change = function(ev) {
        if (vm.onChange)
            vm.onChange({newValue: vm.data});
    };

    vm.searchTechnologies = searchTechnologies;
    vm.searchTechnologyVersions = searchTechnologyVersions;

    function searchTechnologies(searchString) {
        return TechnologyService.suggest(searchString).then(function(data) {
            return data.hits;
        })
    }

    function searchTechnologyVersions(searchString) {
        return TechnologyService.versions.suggest(vm.selectedTechnology.id, searchString).then(function(data) {
            return data.hits;
        })
    }
}

