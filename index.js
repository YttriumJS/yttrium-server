const http = require('http');
const jsdom = require('jsdom');
const dom = new jsdom.JSDOM(`<!DOCTYPE html>`);
const $ = require('jquery')(dom.window);
const Router = require('./router');
const body = require('./body');

/**
 * The jQuerate Function
 *
 * Patches the emitter and listen handler
 * to allow max jQuery gainz
 */
const server = ((server, $) => {
  const oldEmit = server.emit;

  server.emit = function(type, ...data) {
    $(server).trigger(type, data);
    oldEmit.apply(server, [type, ...data]);
  };

  $.listen = (server, ...args) => server.listen.apply(server, args);

  return server;
})(http.createServer(), $);


module.exports = (options) => {
  const r = Router(options);
  const router = r.router;

  $.route = r.routes;
  $.body = body;

  return {
    $,
    server,
    router
  };
};
