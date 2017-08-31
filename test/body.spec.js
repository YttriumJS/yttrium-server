/* global describe, it */
/* eslint no-underscore-dangle: off */
const Readable = require('stream').Readable;
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const body = require('../src/body');

const expect = chai.expect;
chai.use(chaiAsPromised);

describe('body parser', () => {
  it('should return a stringified body', () => {
    const fakeReq = new Readable();

    fakeReq._read = () => {};

    const bodyParser = body(fakeReq);

    fakeReq.emit('data', Buffer.from('hello'));
    fakeReq.emit('end');

    return expect(bodyParser).to.eventually.equal('hello');
  });
  it('should reject on a stream error', () => {
    const fakeReq = new Readable();

    fakeReq._read = () => {};

    const bodyParser = body(fakeReq);

    fakeReq.emit('error');

    return expect(bodyParser).to.eventually.be.rejected;
  });
});
