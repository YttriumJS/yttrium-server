const Y = require('../index');
const routes = require('./routes');

const { $, server, router } = Y({ notFound: 'oh-noes' });

// import routes
routes($);

// send requests to the router
$(server).on('request', router);

// start up server
$.listen(server, 8000);
$(server).on('listening', (e) => {
  console.log('Server is listening on port:', e.target.address().port);
});

