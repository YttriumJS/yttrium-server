const jsdom = require('jsdom');
const dom = new jsdom.JSDOM(`<!DOCTYPE html>`);
const $ = require('jquery')(dom.window);

// attach the default index route to the RouterDOM
$('html').append('<index>');

// the router needs access to a jQuery instance tied to the RouterDOM
// it is meant to be used like $(server).on('request', router);
const router = (server, req, res) => {
  const route = req.url
    .replace(/\./g, '\\.') // paths referencing file names have to be escaped
    .split('/')
    .filter(r => r.length > 0);

  // handle default route (index)
  if (!route.length) {
    return $('index').trigger('route', [req, res]);
  }
  route.unshift('index');

  const routeTree = route.join(' > ');

  // full route was found
  if ($(routeTree).length) {
    $(routeTree).trigger('route', [req, res]);
  // possibly a dynamic route
  } else if ($(route[route.length - 2]).length && $(route[route.length - 2]).data('dynamic')) {
    $(route[route.length - 2])
      .data($(route[route.length - 2]).data('dynamic'), route[route.length - 1]);
    $(route[route.length - 2]).trigger('route', [req, res]);
  // route not found and not a dynamic route
  } else {
    $('not-found').trigger('route', [req, res]);
  }
};

module.exports = {
  routes: $,
  router
};
