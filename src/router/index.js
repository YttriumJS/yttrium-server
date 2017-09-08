const queryparse = require('url').parse;
const domino = require('domino');
const jQuery = require('jquery');

/**
 * Yttrium Router
 * @type {module.Router}
 */
module.exports = class Router {
  constructor(options) {
    this.dom = domino.createWindow('<!DOCTYPE html>'); // new jsdom.JSDOM('<!DOCTYPE html>');
    this.$ = jQuery(this.dom);
    this.notFound = (options && options.notFound);

    this.$ = this.$.bind(this);
    this.router = this.router.bind(this);
    this.routeTo = this.routeTo.bind(this);
    this.send404 = this.send404.bind(this);
    this.checkMethod = this.checkMethod.bind(this);

    // attach the default index route to the RouterDOM
    this.$('html').append('<index>');

    // if a custom 404 route was specified, attach it to the DOM at no charge
    if (this.notFound) this.$('index').append(`<${this.notFound}>`);
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
    if (req && res) {
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

      if (this.$(routeTree).length) {
        // full route was found
        return this.routeTo({ to: routeTree, req, res, query });
      }

      const possibleParam = route.pop();
      const paramRouteTree = route.join(' > ');

      if (this.$(paramRouteTree).length && this.$(paramRouteTree).data('dynamic')) {
        // a route with a dynamic parameter
        // set the data-[something] with what the route had specified in data-dynamic='something'
        this.$(paramRouteTree).data(this.$(paramRouteTree).data('dynamic'), possibleParam);
        return this.routeTo({ to: paramRouteTree, req, res, query });
      }

      // route not found and not a dynamic route
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
    if (this.checkMethod(to, req)) {
      this.$(to)
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
  checkMethod(route, req) {
    // returns true if method was unspecified
    // returns false if method was specified but didn't match request
    // returns true if method specified and matched by request
    if (this.$(route).data('method')) {
      return this.$(route).data('method').toUpperCase() === req.method;
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
    if (this.notFound && this.$(`index > ${this.notFound}`)) {
      this.$(this.$(`index > ${this.notFound}`)).trigger('route', [req, res]);
    } else {
      // otherwise, just close out with a 404
      res.writeHead(404, 'Not Found');
      res.end();
    }
  }
};
