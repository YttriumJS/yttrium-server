/* global describe, it */
const chai = require('chai');
const http = require('http');
const Y = require('../src');

const expect = chai.expect;

describe('Yttrium', () => {
  describe('#constructor', () => {
    it('should create a server DOM, router, and jQuery instance', () => {
      const yt = Y();
      expect(yt).to.have.ownProperty('dom');
      expect(yt).to.have.ownProperty('$');
      expect(yt).to.have.ownProperty('router');
    });
    it('should create properties for the Router, body parser, and listener', () => {
      const yt = Y();
      expect(yt.$).to.have.ownProperty('route');
      expect(yt.$).to.have.ownProperty('listen');
      expect(yt.$).to.have.ownProperty('body');
    });
    describe('jQuerated server', () => {
      it('should create a jQuerated server', () => {
        const yt = Y();
        const httpServer = http.createServer();

        expect(yt.server).to.have.ownProperty('emit');
        expect(httpServer.emit).to.not.deep.equal(yt.server.emit);
      });
      it('should trigger jQuery events', (done) => {
        const yt = Y();
        yt.$(yt.server).on('test', (e, data) => {
          expect(data).to.equal('hello');
          done();
        });

        yt.server.emit('test', 'hello');
      });
    });
    it('should have a jQuery listen function', (done) => {
      const yt = Y();
      const testServer = {
        listen: (test) => {
          expect(test).to.equal('hello');
          done();
        },
      };

      yt.$.listen(testServer, 'hello');
    });
  });
});
