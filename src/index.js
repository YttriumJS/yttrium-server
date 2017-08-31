const http = require('http');
const jsdom = require('jsdom');
const jQuery = require('jquery');
const Router = require('./router/index');
const body = require('./body/index');

/**
 * The jQuerate Class
 *
 * Patches the emitter and listen handler
 * to allow max jQuery gainz
 */
class Yttrium {
  constructor(options) {
    this.dom = new jsdom.JSDOM('<!DOCTYPE html>');
    this.$ = jQuery(this.dom.window);
    this.$ = this.$.bind(this);

    const r = new Router(options);
    const router = r.router;

    this.server = http.createServer();
    const oldEmit = this.server.emit;

    const emit = (type, ...data) => {
      this.$(this.server).trigger(type, data);
      oldEmit.apply(this.server, [type, ...data]);
    };

    this.server.emit = emit.bind(this);

    this.$.listen = (s, ...args) => s.listen(...args);

    this.$.route = r.$;
    this.$.body = body;
    this.router = router;
  }
}

module.exports = options => new Yttrium(options);
