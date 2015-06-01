app.directive('sidebarMenuItem', function() {
    return {
        scope: {
            caption: '@',
            href: '@',
            iconClass: '@'
        },
        templateUrl: 'app/common/sidebar-menu-item.html'
    };
});