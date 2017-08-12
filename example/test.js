const yt = require('../index');

const { $, server, router } = yt;

// add a test route on the root (e.g. localhost/test)
$.route('index')
  .append('<get>')
  .append('<post>')
  .append('<test>')
  .append('<nested data-dynamic="name">');

// add handler to index route
$.route('index')
  .on('route', (e, req, res) => {
    return res.end('Index route!');
  });

// http://localhost:8000/get?poop=shoot
$.route('get')
  .on('route', (e, req, res) => {
    const poopParam = $.route('querystring').find('poop').text();
    return res.end(`Get params: poop is ${poopParam}`);
  });

// http://localhost:8000/post
// Body: 'cabbage'
$.route('post')
  .on('route', (e, req, res) => {
    // What is life?
    e.stopPropagation();

    // Parse the body
    $.body(req)
    .then((body) => {
      return res.end(`Post body: ${body}`);
    });
  });

// add handler to test route
$.route('test')
  .on('route', (e, req, res) => {
    // example of sending HTML template
    $('body').html('<div>Hello world!</div>');
    return res.end($('html').html());
  });

// this route responds to /nested/:name
$.route('nested')
  .on('route', (e, req, res) => {
    const param = $.route('nested').data('name');
    return res.end(`I found a name! ${param}`);
  });

// send requests to the router
$(server).on('request', router);

// start up server
$.listen(server, 8000);
$(server).on('listening', (e) => {
  console.log('Server is listening on port:', e.target.address().port);
});

