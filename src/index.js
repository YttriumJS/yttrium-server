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

    const r = new Router(options);
    const router = r.router;

    this.server = ((httpServer, jQueryInstance) => {
      const ser = httpServer;
      const jq = jQueryInstance;
      const oldEmit = ser.emit;

      ser.emit = function emit(type, ...data) {
        jq(ser).trigger(type, data);
        oldEmit.apply(ser, [type, ...data]);
      };

      jq.listen = (s, ...args) => s.listen(...args);

      return ser;
    })(http.createServer(), this.$);


    this.$.route = r.$;
    this.$.body = body;
    this.router = router;
  }
}

module.exports = options => new Yttrium(options);
