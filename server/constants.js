module.exports = {
    firmwares: [
        { codename: 'v1.3', version: '1.3.0'},
        { codename: 'v1.4', version: '1.4.0'}
    ],
    architectures: [
        'all',
        'x86_64',
        'armv7l'
    ],
    entityTypes: {
        technology: {
            name: 'technology',
            hasScope: true,
            hasProfile: false,
            hasCollaborators: false,
            collections: [ ],
            suggestField: 'name'
        },
        technology_version: {
            name: 'technology_version',
            hasScope: false,
            hasProfile: false,
            hasCollaborators: false,
            collections: [ 'services', 'daemons' ],
            suggestField: 'version'
        },
        cluster: {
            name: 'cluster',
            hasScope: false,
            hasProfile: true,
            hasCollaborators: true,
            collections: [ ],
            suggestField: 'name'
        },
        node: {
            name: 'node',
            hasScope: false,
            hasProfile: true,
            hasCollaborators: false,
            collections: [ ],
            suggestField: 'name'
        },
        profile: {
            name: 'profile',
            hasScope: false,
            hasProfile: false,
            hasCollaborators: false,
            collections: [ ],
            suggestField: 'name'
        },
        stack: {
            name: 'stack',
            hasScope: true,
            hasProfile: true,
            hasCollaborators: true,
            collections: [ 'collaborators' ],
            suggestField: 'name'
        },
        stack_version: {
            name: 'stack_version',
            hasScope: false,
            hasProfile: false,
            hasCollaborators: false,
            collections: [ 'technology_versions', 'resources' ],
            suggestField: 'name'
        }
    }
};