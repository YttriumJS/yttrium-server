const queryparse = require('url').parse;
const jsdom = require('jsdom');
const dom = new jsdom.JSDOM(`<!DOCTYPE html>`);
const $ = require('jquery')(dom.window);

// attach the default index route to the RouterDOM
$('html').append('<index>');

// Holds query string params
$('html').append('<querystring>');

/**
 *
 * Helper Functions
 *  send404 -- triggers the not-found route
 *  checkMethod -- checks to see if method was specified in route
 *    and if so, that the client request method matches the spec
 */

const send404 = (req, res) => {
  // trigger a custom not-found route if there is one
  if ($('not-found').length) {
    $('not-found').trigger('route', [req, res]);
  } else {
  // otherwise, just close out with a 404
    res.writeHead(404, 'Not Found');
    res.end();
  }
};

const checkMethod = (route, req) => {
  // returns true if method was unspecified
  // returns false if method was specified but didn't match request
  // returns true if method specified and matched by request
  if ($(route).data('method')) {
    return $(route).data('method').toUpperCase() === req.method;
  }
  return true;
};

// the router needs access to a jQuery instance tied to the RouterDOM
// it is meant to be used like $(server).on('request', router);
const router = (server, req, res) => {
  const parsedURL = queryparse(req.url, true);
  const method = req.method;

  const route = parsedURL.pathname
    .replace(/\./g, '\\.') // paths referencing file names have to be escaped
    .split('/')
    .filter(r => r.length > 0);

  // handle default route (index)
  if (!route.length) {
    return $('index').trigger('route', [req, res]);
  }
  route.unshift('index');

  // Get the route selector
  const routeTree = route.join(' > ');

  // Inject querystring params into the dom
  $.each(parsedURL.query, (key, val) => {
    $('querystring').append(`<${key}>${val}</${key}>`);
  });

  // full route was found
  if ($(routeTree).length) {
    // check if method was specified
    if (checkMethod(routeTree, req)) {
      $(routeTree).trigger('route', [req, res]);
    } else {
      send404(req, res);
    }
  // possibly a dynamic route
  } else if ($(route[route.length - 2]).length && $(route[route.length - 2]).data('dynamic')) {
    if (checkMethod($(route[route.length - 2]))) {
      $(route[route.length - 2])
        .data($(route[route.length - 2]).data('dynamic'), route[route.length - 1]);
      $(route[route.length - 2]).trigger('route', [req, res]);
    } else {
      send404(req, res);
    }
  // route not found and not a dynamic route
  } else {
    send404(req, res);
  }
};

module.exports = {
  routes: $,
  router
};
