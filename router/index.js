const queryparse = require('url').parse;
const jsdom = require('jsdom');
const dom = new jsdom.JSDOM(`<!DOCTYPE html>`);
const $ = require('jquery')(dom.window);

let notFound; // the 404 page name variable

// attach the default index route to the RouterDOM
$('html').append('<index>');

/**
 *
 * Helper Functions
 *  send404 -- triggers the not-found route
 *  checkMethod -- checks to see if method was specified in route
 *    and if so, that the client request method matches the spec
 *  routeTo -- handles properly triggering a route
 */

const send404 = (req, res) => {
  // trigger a custom not-found route if there is one
  if ($(notFound).length) {
    $(notFound).trigger('route', [req, res]);
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

const routeTo = ({ to, req, res, query }) => {
  // checks method and adds query params
  if (checkMethod(to, req)) {
    $(to)
      .data('query', query)
      .trigger('route', [req, res]);
  } else {
    send404(req, res);
  }
};

// the router needs access to a jQuery instance tied to the RouterDOM
// it is meant to be used like $(server).on('request', router);
const router = (server, req, res) => {
  const parsedURL = queryparse(req.url, true);
  const query = parsedURL.query;

  const route = parsedURL.pathname
    .replace(/\./g, '\\.') // paths referencing file names have to be escaped
    .split('/')
    .filter(r => r.length > 0);

  // handle default route (index)
  if (!route.length) {
    return routeTo({ to: 'index', req, res, query });
  }
  route.unshift('index');

  // Get the route selector
  const routeTree = route.join(' > ');

  // full route was found
  if ($(routeTree).length) {
    routeTo({ to: routeTree, req, res, query });
  }
  // possibly a dynamic route
  else if ($(route[route.length - 2]).length && $(route[route.length - 2]).data('dynamic')) {
    $(route[route.length - 2])
      .data($(route[route.length - 2])
        .data('dynamic'), route[route.length - 1]);
    routeTo({ to: route[route.length - 2], req, res, query });
  // route not found and not a dynamic route
  } else {
    send404(req, res);
  }
};

module.exports = (options) => {
  notFound = options && options.notFound || 'not-found';

  // graciously add the 404 route so all they have to worry about is the handler
  $('index').append(`<${notFound}>`);

  return {
    routes: $,
    router
  };
};
