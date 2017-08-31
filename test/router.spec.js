/* global describe, it */
const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const Router = require('../src/router');

const expect = chai.expect;
chai.use(sinonChai);

describe('Router', () => {
  describe('#constructor', () => {
    it('should define Router DOM jQuery property', () => {
      const router = new Router();
      expect(router).to.haveOwnProperty('$');
    });
    it('should set the notFound property with provided option', () => {
      const router = new Router({ notFound: 'hello' });
      expect(router.notFound).to.equal('hello');
    });
    it('should append the index route to the Router DOM', () => {
      const router = new Router();
      const $ = router.$;
      expect($('index').length).to.not.equal(0);
    });
    it('should append the notFound route to the Router DOM index route', () => {
      const router = new Router({ notFound: 'hello' });
      const $ = router.$;
      expect($('hello').length).to.not.equal(0);
      expect($('index').children('hello').length).to.not.equal(0);
    });
  });
  describe('#router', () => {
    it('should return true if nothing is passed in', () => {
      const router = new Router();
      expect(router.router()).to.equal(true);
    });
    it('should trigger the index route if no path is specified', () => {
      const router = new Router();

      sinon.spy(router, 'routeTo');
      router.router({}, { url: 'http://localhost/' }, {});

      expect(router.routeTo).to.have.been.calledWith({
        to: 'index',
        req: { url: 'http://localhost/' },
        res: {},
        query: {},
      });
    });
    it('should parse the query string and pass it to the route trigger', () => {
      const router = new Router();

      sinon.spy(router, 'routeTo');
      router.router({}, { url: 'http://localhost/?test=yes' }, {});

      expect(router.routeTo).to.have.been.calledWith({
        to: 'index',
        req: { url: 'http://localhost/?test=yes' },
        res: {},
        query: { test: 'yes' },
      });
    });
    it('should trigger the 404 route if route is not in Router DOM', () => {
      const router = new Router();

      sinon.spy(router, 'send404');
      const fakeRes = {
        writeHead: () => {},
        end: () => {},
      };
      router.router({}, { url: 'http://localhost/idontexist' }, fakeRes);

      expect(router.send404).to.have.been.calledWith({ url: 'http://localhost/idontexist' }, fakeRes);
    });
    it('should trigger a named route if route exists in Router DOM', () => {
      const router = new Router();
      const $ = router.$;

      $('index').append('<hello>');

      sinon.spy(router, 'routeTo');
      router.router({}, { url: 'http://localhost/hello' }, {});

      expect(router.routeTo).to.have.been.calledWith({
        to: 'index > hello',
        req: { url: 'http://localhost/hello' },
        res: {},
        query: {},
      });
    });
    it('should trigger a route with a dynamic parameter', () => {
      const router = new Router();
      const $ = router.$;

      $('index').append('<hello data-dynamic="name">');

      sinon.spy(router, 'routeTo');
      router.router({}, { url: 'http://localhost/hello/peter' }, {});

      expect($('hello').data('name')).to.equal('peter');
      expect(router.routeTo).to.have.been.calledWith({
        to: 'index > hello',
        req: { url: 'http://localhost/hello/peter' },
        res: {},
        query: {},
      });
    });
  });
  describe('#routeTo', () => {
    it('should check the method first', () => {
      const router = new Router();

      sinon.spy(router, 'checkMethod');
      router.routeTo({ to: 'index', req: { url: 'http://localhost' }, res: {}, query: {} });
      expect(router.checkMethod).to.have.been.calledWith('index', { url: 'http://localhost' });
    });
    it('should send 404 if method does not match request', () => {
      const router = new Router();
      const $ = router.$;

      $('index').append('<test data-method="post">');

      sinon.spy(router, 'send404');
      const fakeRes = {
        writeHead: () => {},
        end: () => {},
      };
      router.routeTo({
        to: 'index > test',
        req: { url: 'http://localhost/test', method: 'GET' },
        res: fakeRes,
        query: {},
      });

      expect(router.send404).to.have.been.calledWith({ url: 'http://localhost/test', method: 'GET' }, fakeRes);
    });
    it('should add the query params to the query data object', () => {
      const router = new Router();
      const $ = router.$;

      router.routeTo({
        to: 'index',
        req: { url: 'http://localhost?test=yes' },
        res: {},
        query: { test: 'yes' },
      });

      expect($('index').data('query')).to.deep.equal({ test: 'yes' });
    });
    it('should trigger the route handler', (done) => {
      const router = new Router();
      const $ = router.$;

      $('index').on('route', (e, req, res) => {
        expect(req).to.deep.equal({ url: 'http://localhost' });
        expect(res).to.deep.equal({});
        done();
      });

      router.routeTo({
        to: 'index',
        req: { url: 'http://localhost' },
        res: {},
        query: {},
      });
    });
  });
  describe('#checkMethod', () => {
    it('should return true if method was unspecified', () => {
      const router = new Router();

      const checkMethod = router.checkMethod('index', { method: 'POST' });
      expect(checkMethod).to.equal(true);
    });
    it('should return false if method was specified but did not match request', () => {
      const router = new Router();
      const $ = router.$;

      $('index').append('<test data-method="get">');

      const checkMethod = router.checkMethod('index > test', { method: 'POST' });
      expect(checkMethod).to.equal(false);
    });
    it('should return true if method was specified and matched by request', () => {
      const router = new Router();
      const $ = router.$;

      $('index').append('<test data-method="post">');

      const checkMethod = router.checkMethod('index > test', { method: 'POST' });
      expect(checkMethod).to.equal(true);
    });
  });
  describe('#send404', () => {
    it('should send a 404 response if no custom 404 route was specified', () => {
      const router = new Router();

      const res = {
        writeHead: (number, string) => ({ number, string }),
        end: () => {},
      };
      sinon.spy(res, 'writeHead');
      sinon.spy(res, 'end');

      router.send404({}, res);
      expect(res.writeHead).to.have.been.calledWith(404, 'Not Found');
      expect(res.end).to.have.been.calledWith();
    });
    it('should trigger the custom 404 route if specified', (done) => {
      const router = new Router({ notFound: 'fourOhfour' });
      const $ = router.$;

      $('fourOhFour').on('route', (e, req, res) => {
        expect(req).to.deep.equal({});
        expect(res).to.deep.equal({});
        done();
      });

      router.send404({}, {});
    });
  });
});
