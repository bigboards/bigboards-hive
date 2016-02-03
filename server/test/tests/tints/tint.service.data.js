var e = require('../../entity');

// -- the elasticsearch tint
e.tint('daan', 'elasticsearch').store();
e.version('daan', 'elasticsearch', 'test')
    .service(e.service('es-service').task(e.task('es-task')))
    .store();