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
        technology: { name: 'technology', hasScope: true, hasProfile: false, hasCollaborators: false},
        technology_version: { name: 'technology_version', hasScope: false, hasProfile: false, hasCollaborators: false}
    }
};