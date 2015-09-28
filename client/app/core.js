angular.module('hive.core', [])
    .constant('Firmwares', [
        { codename: 'genesis', version: '0.5.0'},
        { codename: 'feniks', version: '1.0.0'},
        { codename: 'ember', version: '1.1.0'},
        { codename: 'gemini', version: '1.2.0'},
        { codename: 'v1.3', version: '1.3.0'}
    ])
    .constant('Architectures', [
        'all',
        'x86_64',
        'armv7l'
    ]);
