const http = require('http');
const jsdom = require('jsdom');

const dom = new jsdom.JSDOM('<!DOCTYPE html>');
const $ = require('jquery')(dom.window);
const Router = require('./router');
const body = require('./body');

/**
 * The jQuerate Function
 *
 * Patches the emitter and listen handler
 * to allow max jQuery gainz
 */
const server = ((httpServer, jQuery) => {
  const ser = httpServer;
  const jq = jQuery;
  const oldEmit = ser.emit;

  ser.emit = function emit(type, ...data) {
    jq(ser).trigger(type, data);
    oldEmit.apply(ser, [type, ...data]);
  };

  jq.listen = (s, ...args) => s.listen(...args);

  return ser;
})(http.createServer(), $);


module.exports = (options) => {
  const r = new Router(options);
  const router = r.router;

  $.route = r.$;
  $.body = body;

  return {
    $,
    server,
    router,
  };
};
