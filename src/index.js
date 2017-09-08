const http = require('http');
const domino = require('domino');
const jQuery = require('jquery');
const Router = require('./router/index');

/**
 * The jQuerate Class
 *
 * Patches the emitter and listen handler
 * to allow max jQuery gainz
 */
class Yttrium {
  constructor(options) {
    const self = this;
    this.dom = domino.createWindow('<!DOCTYPE html>'); // new jsdom.JSDOM('<!DOCTYPE html>');
    this.$ = jQuery(this.dom);

    // add plugin installer and server listener
    this.$.fn.extend({
      use() {
        const plugin = this[0];
        const pluginName = plugin.name;
        const pluginFunc = plugin.func;
        self.$.fn.extend({
          [pluginName]: pluginFunc,
        });
        return this;
      },
      listen(...args) {
        const server = this[0];
        server.listen(...args);
        return this;
      },
    });

    // jQuerate an HTTP Server
    this.server = http.createServer();
    const oldEmit = this.server.emit;
    const emit = (type, ...data) => {
      this.$(this.server).trigger(type, data);
      oldEmit.apply(this.server, [type, ...data]);
    };
    this.server.emit = emit.bind(this);

    // set up Router and bindings
    const r = new Router(options);
    this.router = r.router;
    this.$.route = r.$;
  }
}

module.exports = options => new Yttrium(options);
