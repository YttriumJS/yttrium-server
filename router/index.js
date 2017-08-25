const queryparse = require('url').parse;
const jsdom = require('jsdom');

const dom = new jsdom.JSDOM('<!DOCTYPE html>');
const $ = require('jquery')(dom.window);

/**
 * Yttrium Router
 * @type {module.Router}
 */
module.exports = class Router {
  constructor(options) {
    this.notFound = (options && options.notFound) || 'not-found';
    this.routes = $;

    this.router = this.router.bind(this);
    this.routeTo = this.routeTo.bind(this);
    this.send404 = this.send404.bind(this);

    // attach the default index route to the RouterDOM
    $('html').append('<index>');
    $('index').append(`<${this.notFound}>`);
  }

  /**
   * The main Yttrium router function
   *  it needs access to a jQuery instance tied to the RouterDOM
   *  it is meant to be used like $(server).on('request', router);
   * @param server
   * @param req
   * @param res
   * @returns {*}
   */
  router(server, req, res) {
    const parsedURL = queryparse(req.url, true);
    const query = parsedURL.query;

    const route = parsedURL.pathname
      .replace(/\./g, '\\.') // paths referencing file names have to be escaped
      .split('/')
      .filter(r => r.length > 0);

    // handle default route (index)
    if (!route.length) {
      return this.routeTo({ to: 'index', req, res, query });
    }
    route.unshift('index');

    // Get the route selector
    const routeTree = route.join(' > ');

    if ($(routeTree).length) {
      // full route was found
      this.routeTo({ to: routeTree, req, res, query });
    } else if ($(route[route.length - 2]).length && $(route[route.length - 2]).data('dynamic')) {
      // possibly a dynamic route
      $(route[route.length - 2])
        .data($(route[route.length - 2])
          .data('dynamic'), route[route.length - 1]);
      this.routeTo({ to: route[route.length - 2], req, res, query });
      // route not found and not a dynamic route
    } else {
      this.send404(req, res);
    }
    return true;
  }

  /**
   * Adds any query params to the query data object and triggers the route
   * @param to
   * @param req
   * @param res
   * @param query
   */
  routeTo({ to, req, res, query }) {
    // checks method and adds query params
    if (Router.checkMethod(to, req)) {
      $(to)
        .data('query', query)
        .trigger('route', [req, res]);
    } else {
      this.send404(req, res);
    }
  }

  /**
   * Checks to see if method was specified on route and if so, that the request method matches
   * @param route
   * @param req
   * @returns {boolean}
   */
  static checkMethod(route, req) {
    // returns true if method was unspecified
    // returns false if method was specified but didn't match request
    // returns true if method specified and matched by request
    if ($(route).data('method')) {
      return $(route).data('method').toUpperCase() === req.method;
    }
    return true;
  }

  /**
   * Triggers route function for the not-found route
   * @param req
   * @param res
   */
  send404(req, res) {
    // trigger a custom not-found route if there is one
    if ($(this.notFound).length) {
      $(this.notFound).trigger('route', [req, res]);
    } else {
      // otherwise, just close out with a 404
      res.writeHead(404, 'Not Found');
      res.end();
    }
  }
};
