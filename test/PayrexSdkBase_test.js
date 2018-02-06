const assert = require('assert');
const sinon = require('sinon');
const fetch = require('node-fetch');
const PayrexSdkBase = require('../src/PayrexSdkBase');

// Base64 mock function
const base64Encode = str => Buffer.from(str, 'utf-8').toString('base64');

// Get error
const getError = (statusCode = 500, code = 'ERROR_CODE', message = 'Message...') => {
  const fetchSpy = sinon.spy(() => {
    const body = `{"code":"${code}","message":"${message}"}`;
    return Promise.resolve(new fetch.Response(body, {
      status: statusCode,
      headers: { 'Content-Type': 'application/json' },
    }));
  });
  fetchSpy.Headers = fetch.Headers;
  const sdk = new PayrexSdkBase({
    publicKey: 'PUBLIC-XXXXXXXX',
    secretKey: 'SECRET-XXXXXXXXXXXXXXXXXXXX',
    baseUrl: 'http://localhost/',
    fetch: fetchSpy,
    Headers: fetch.Headers,
    base64Encode,
  });
  return { fetchSpy, sdk };
};

describe('PayrexSdkBase', () => {
  describe('#constructor()', () => {
    it('should create success', () => {
      const sdk = new PayrexSdkBase({
        publicKey: 'PUBLIC-XXXXXXXX',
        secretKey: 'SECRET-XXXXXXXXXXXXXXXXXXXX',
        baseUrl: 'http://localhost/',
        fetch,
        Headers: fetch.Headers,
        base64Encode,
      });
      assert.strictEqual(typeof sdk, 'object');
      assert.strictEqual(sdk.publicKey, 'PUBLIC-XXXXXXXX');
      assert.strictEqual(sdk.secretKey, 'SECRET-XXXXXXXXXXXXXXXXXXXX');
      assert.strictEqual(sdk.baseUrl, 'http://localhost/');
      assert.strictEqual(typeof sdk.get, 'function');
      assert.strictEqual(typeof sdk.post, 'function');
      assert.strictEqual(typeof sdk.put, 'function');
      assert.strictEqual(typeof sdk.remove, 'function');
    });
    it('should throw validation error', () => {
      assert.throws(() => {
        new PayrexSdkBase({
          publicKey: 'PUBLIC-XXXXXXXX',
          secretKey: 'SECRET-XXXXXXXXXXXXXXXXXXXX',
          baseUrl: 'http://localhost/',
          Headers: fetch.Headers,
          base64Encode,
        });
      }, /Option "fetch" is required/);
    });
    it('should create with minimum options', () => {
      new PayrexSdkBase({
        fetch,
        Headers: fetch.Headers,
        base64Encode,
      });
    });
  });
  describe('#get()', function () {
    it('should return data successful', function (done) {
      const fetchSpy = sinon.spy(() => {
        const body = '{"id":101}';
        return Promise.resolve(new fetch.Response(body, {
          headers: { 'Content-Type': 'application/json' },
        }));
      });
      fetchSpy.Headers = fetch.Headers;
      const sdk = new PayrexSdkBase({
        publicKey: 'PUBLIC-XXXXXXXX',
        secretKey: 'SECRET-XXXXXXXXXXXXXXXXXXXX',
        baseUrl: 'http://localhost/',
        fetch: fetchSpy,
        Headers: fetch.Headers,
        base64Encode,
      });
      sdk
        .get('/users')
        .then((data) => {
          assert.strictEqual(typeof data, 'object');
          assert.deepStrictEqual(data, { id: 101 });
          // Check fetch
          assert(fetchSpy.calledOnce);
          const callArgs = fetchSpy.getCall(0).args;
          assert.strictEqual(callArgs[0], 'http://localhost/users');
          assert.strictEqual(callArgs[1].method, 'GET');
          assert.strictEqual(callArgs[1].headers.get('Accept'), 'application/json');
          assert.strictEqual(callArgs[1].headers.get('Authorization'), 'Basic UFVCTElDLVhYWFhYWFhYOlNFQ1JFVC1YWFhYWFhYWFhYWFhYWFhYWFhYWA==');
          assert.strictEqual(callArgs[1].headers.get('Content-type'), 'application/json');
          assert(!callArgs[1].body);
          done();
        })
        .catch(done);
    });
    it('should return error (500 - detailed)', function (done) {
      const { fetchSpy, sdk } = getError(500);
      sdk
        .get('/users')
        .then(() => {
          done(new Error('Must not be executed!'));
        })
        .catch((err) => {
          assert.strictEqual(err.code, 'ERROR_CODE');
          assert.strictEqual(err.message, 'Message...');
          assert(err.toString().includes('Message...'));
          // Check fetch
          assert(fetchSpy.calledOnce);
          const callArgs = fetchSpy.getCall(0).args;
          assert.strictEqual(callArgs[0], 'http://localhost/users');
          assert.strictEqual(callArgs[1].method, 'GET');
          assert.strictEqual(callArgs[1].headers.get('Accept'), 'application/json');
          assert.strictEqual(callArgs[1].headers.get('Authorization'), 'Basic UFVCTElDLVhYWFhYWFhYOlNFQ1JFVC1YWFhYWFhYWFhYWFhYWFhYWFhYWA==');
          assert.strictEqual(callArgs[1].headers.get('Content-type'), 'application/json');
          assert(!callArgs[1].body);
          done();
        });
    });
    it('should return error (400)', function (done) {
      getError(400, code = '', message = 'ERR_400')
        .sdk
        .get('/users')
        .then(() => {
          done(new Error('Must not be executed!'));
        })
        .catch((err) => {
          assert.strictEqual(err.code, 'ValidationFailed');
          assert.strictEqual(err.message, 'ERR_400');
          assert(err.toString().includes('ERR_400'));
          done();
        });
    });
    it('should return error (404)', function (done) {
      getError(404, code = '', message = 'ERR_404')
        .sdk
        .get('/users')
        .then(() => {
          done(new Error('Must not be executed!'));
        })
        .catch((err) => {
          assert.strictEqual(err.code, 'NotFound');
          assert.strictEqual(err.message, 'ERR_404');
          assert(err.toString().includes('ERR_404'));
          done();
        });
    });
    it('should return error (403)', function (done) {
      getError(403, code = '', message = 'ERR_403')
        .sdk
        .get('/users')
        .then(() => {
          done(new Error('Must not be executed!'));
        })
        .catch((err) => {
          assert.strictEqual(err.code, 'Forbidden');
          assert.strictEqual(err.message, 'ERR_403');
          assert(err.toString().includes('ERR_403'));
          done();
        });
    });
    it('should return error (unexpected)', function (done) {
      getError(501, code = '', message = '')
        .sdk
        .get('/users')
        .then(() => {
          done(new Error('Must not be executed!'));
        })
        .catch((err) => {
          assert.strictEqual(err.code, 'UnexpectedStatusCode');
          assert.strictEqual(err.message, 'UnexpectedStatusCode');
          assert(err.toString().includes('UnexpectedStatusCode'));
          done();
        });
    });
    it('should return error (broken json)', function (done) {
      getError(200, code = '', message = '"')
        .sdk
        .get('/users')
        .then(() => {
          done(new Error('Must not be executed!'));
        })
        .catch(() => {
          done();
        });
    });
  });
  describe('#post()', function () {
    it('should return data successful', function (done) {
      const fetchSpy = sinon.spy(() => {
        const body = '{"id":102,"name":"test","enabled":true}';
        return Promise.resolve(new fetch.Response(body, {
          headers: { 'Content-Type': 'application/json' },
        }));
      });
      fetchSpy.Headers = fetch.Headers;
      const sdk = new PayrexSdkBase({
        publicKey: 'PUBLIC-XXXXXXXX',
        secretKey: 'SECRET-XXXXXXXXXXXXXXXXXXXX',
        baseUrl: 'http://localhost/',
        fetch: fetchSpy,
        Headers: fetch.Headers,
        base64Encode,
      });
      sdk
        .post('/users', { name: 'test', enabled: true }, { queryParams: { action: 'create' } })
        .then((data) => {
          assert.strictEqual(typeof data, 'object');
          assert.deepStrictEqual(data, { id: 102, name: 'test', enabled: true });
          // Check fetch
          assert(fetchSpy.calledOnce);
          const callArgs = fetchSpy.getCall(0).args;
          assert.strictEqual(callArgs[0], 'http://localhost/users?action=create');
          assert.strictEqual(callArgs[1].method, 'POST');
          assert.strictEqual(callArgs[1].headers.get('Accept'), 'application/json');
          assert.strictEqual(callArgs[1].headers.get('Authorization'), 'Basic UFVCTElDLVhYWFhYWFhYOlNFQ1JFVC1YWFhYWFhYWFhYWFhYWFhYWFhYWA==');
          assert.strictEqual(callArgs[1].headers.get('Content-type'), 'application/json');
          assert.strictEqual(callArgs[1].body, '{"name":"test","enabled":true}');
          done();
        })
        .catch(done);
    });
  });
  describe('#put()', function () {
    it('should return data successful', function (done) {
      const fetchSpy = sinon.spy(() => {
        const body = '{"id":102,"name":"test","enabled":true}';
        return Promise.resolve(new fetch.Response(body, {
          headers: { 'Content-Type': 'application/json' },
        }));
      });
      fetchSpy.Headers = fetch.Headers;
      const sdk = new PayrexSdkBase({
        publicKey: 'PUBLIC-XXXXXXXX',
        secretKey: 'SECRET-XXXXXXXXXXXXXXXXXXXX',
        baseUrl: 'http://localhost/',
        fetch: fetchSpy,
        Headers: fetch.Headers,
        base64Encode,
      });
      sdk
        .put('/users?action=update', { name: 'test', enabled: true }, { queryParams: { id: 102 } })
        .then((data) => {
          assert.strictEqual(typeof data, 'object');
          assert.deepStrictEqual(data, { id: 102, name: 'test', enabled: true });
          // Check fetch
          assert(fetchSpy.calledOnce);
          const callArgs = fetchSpy.getCall(0).args;
          assert.strictEqual(callArgs[0], 'http://localhost/users?action=update&id=102');
          assert.strictEqual(callArgs[1].method, 'PUT');
          assert.strictEqual(callArgs[1].headers.get('Accept'), 'application/json');
          assert.strictEqual(callArgs[1].headers.get('Authorization'), 'Basic UFVCTElDLVhYWFhYWFhYOlNFQ1JFVC1YWFhYWFhYWFhYWFhYWFhYWFhYWA==');
          assert.strictEqual(callArgs[1].headers.get('Content-type'), 'application/json');
          assert.strictEqual(callArgs[1].body, '{"name":"test","enabled":true}');
          done();
        })
        .catch(done);
    });
  });
  describe('#remove()', function () {
    it('should return data successful', function (done) {
      const fetchSpy = sinon.spy(() => {
        const body = '{"response":"OK"}';
        return Promise.resolve(new fetch.Response(body, {
          headers: { 'Content-Type': 'application/json' },
        }));
      });
      fetchSpy.Headers = fetch.Headers;
      const sdk = new PayrexSdkBase({
        publicKey: 'PUBLIC-XXXXXXXX',
        secretKey: 'SECRET-XXXXXXXXXXXXXXXXXXXX',
        baseUrl: 'http://localhost/',
        fetch: fetchSpy,
        Headers: fetch.Headers,
        base64Encode,
      });
      sdk
        .remove('/users?id=1')
        .then((data) => {
          assert.strictEqual(typeof data, 'object');
          assert.deepStrictEqual(data, { response: 'OK' });
          // Check fetch
          assert(fetchSpy.calledOnce);
          const callArgs = fetchSpy.getCall(0).args;
          assert.strictEqual(callArgs[0], 'http://localhost/users?id=1');
          assert.strictEqual(callArgs[1].method, 'DELETE');
          assert.strictEqual(callArgs[1].headers.get('Accept'), 'application/json');
          assert.strictEqual(callArgs[1].headers.get('Authorization'), 'Basic UFVCTElDLVhYWFhYWFhYOlNFQ1JFVC1YWFhYWFhYWFhYWFhYWFhYWFhYWA==');
          assert.strictEqual(callArgs[1].headers.get('Content-type'), 'application/json');
          assert(!callArgs[1].body);
          done();
        })
        .catch(done);
    });
  });
});
