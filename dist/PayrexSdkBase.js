'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _require = require('whatwg-url'),
    URL = _require.URL;

var PayrexApiError = require('./PayrexApiError');

var REQUIRED_FIELDS = ['fetch', 'Headers', 'base64Encode'];

var PayrexSdkBase = function () {
  /**
   * PayrexSdkBase constructor
   * @param {object} options
   * @param {string} options.publicKey
   * @param {string} options.secretKey
   * @param {string} options.baseUrl
   * @param {function} options.fetch [Fetch function](https://fetch.spec.whatwg.org/)
   * @param {function} options.Headers [Fetch Headers](https://fetch.spec.whatwg.org/)
   * @param {function} options.base64Encode Function to encode string (utf-8) in base64
   */
  function PayrexSdkBase() {
    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, PayrexSdkBase);

    REQUIRED_FIELDS.forEach(function (value) {
      if (!options[value]) {
        throw new Error(`Option "${value}" is required`);
      }
    });

    var _options$publicKey = options.publicKey,
        publicKey = _options$publicKey === undefined ? '' : _options$publicKey,
        _options$secretKey = options.secretKey,
        secretKey = _options$secretKey === undefined ? '' : _options$secretKey,
        _options$baseUrl = options.baseUrl,
        baseUrl = _options$baseUrl === undefined ? 'http://localhost:3000/' : _options$baseUrl,
        fetch = options.fetch,
        Headers = options.Headers,
        base64Encode = options.base64Encode;

    if (!baseUrl) {
      throw new Error('Option "baseUrl" is required');
    }

    this.publicKey = publicKey;
    this.secretKey = secretKey;
    this.baseUrl = baseUrl;
    this.fetch = fetch;
    this.Headers = Headers;
    this.base64Encode = base64Encode;
  }

  /**
   * Make GET request
   * @param {string} path Path (ex. "/users")
   * @param {object} queryParams  Additional query params to merge
   * @return {Promise}
   */


  _createClass(PayrexSdkBase, [{
    key: 'get',
    value: function get() {
      var path = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';

      var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
          _ref$queryParams = _ref.queryParams,
          queryParams = _ref$queryParams === undefined ? {} : _ref$queryParams;

      return this.fetchRequest('GET', path, queryParams, null);
    }

    /**
     * Make POST request
     * @param {string} path Path (ex. "/users")
     * @param {object} body Body data
     * @param {object} queryParams  Additional query params to merge
     * @return {Promise}
     */

  }, {
    key: 'post',
    value: function post() {
      var path = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
      var body = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

      var _ref2 = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {},
          _ref2$queryParams = _ref2.queryParams,
          queryParams = _ref2$queryParams === undefined ? {} : _ref2$queryParams;

      return this.fetchRequest('POST', path, queryParams, body);
    }

    /**
     * Make PUT request
     * @param {string} path Path (ex. "/users")
     * @param {object} body Body data
     * @param {object} queryParams  Additional query params to merge
     * @return {Promise}
     */

  }, {
    key: 'put',
    value: function put() {
      var path = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
      var body = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

      var _ref3 = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {},
          _ref3$queryParams = _ref3.queryParams,
          queryParams = _ref3$queryParams === undefined ? {} : _ref3$queryParams;

      return this.fetchRequest('PUT', path, queryParams, body);
    }

    /**
     * Make DELETE request
     * @param {string} path Path (ex. "/users")
     * @param {object} queryParams  Additional query params to merge
     * @return {Promise}
     */

  }, {
    key: 'remove',
    value: function remove() {
      var path = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';

      var _ref4 = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
          _ref4$queryParams = _ref4.queryParams,
          queryParams = _ref4$queryParams === undefined ? {} : _ref4$queryParams;

      return this.fetchRequest('DELETE', path, queryParams, null);
    }

    /**
     * Build options for fetch
     * @param method
     * @param path
     * @param queryParams
     * @param body
     * @private
     */

  }, {
    key: 'buildFetchOptions',
    value: function buildFetchOptions() {
      var method = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'GET';
      var path = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';
      var queryParams = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
      var body = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};

      var url = new URL(path, this.baseUrl);
      if (typeof queryParams === 'object') {
        Object.keys(queryParams).forEach(function (key) {
          url.searchParams.set(key, queryParams[key]);
        });
      }
      var options = {
        method,
        headers: new this.Headers({
          Accept: 'application/json',
          Authorization: `Basic ${this.base64Encode(`${this.publicKey}:${this.secretKey}`)}`,
          'Content-type': 'application/json'
        }),
        body: body ? JSON.stringify(body) : undefined
      };
      return { url: url.toString(), options };
    }

    /**
     * Parse response
     * @param {number} status Status code
     * @param {object} body JSON body object
     * @private
     * @return {{err: null, body: {object}}}
     */

  }, {
    key: 'fetchRequest',
    value: function fetchRequest(method, path, queryParams, body) {
      var _this = this;

      var _buildFetchOptions = this.buildFetchOptions(method, path, queryParams, body),
          url = _buildFetchOptions.url,
          options = _buildFetchOptions.options;

      return this.fetch.call(null, url, options).then(function (response) {
        var status = response.status;

        var contentType = response.headers.get('content-type');
        if (!(contentType && contentType.includes('application/json'))) {
          throw new TypeError('Expected to recieve JSON');
        }
        return response.json().then(function (json) {
          return _this.constructor.parseResponse(status, json);
        });
      });
    }
  }], [{
    key: 'parseResponse',
    value: function parseResponse(status, body) {
      if (status === 200 || status === 304) {
        return body;
      }
      var code = body && body.code ? body.code : null;
      var message = body && body.message ? body.message : '';
      if (status === 400) {
        throw new PayrexApiError(code === null ? 'ValidationFailed' : code, message);
      }
      if (status === 404) {
        throw new PayrexApiError(code === null ? 'NotFound' : code, message);
      }
      if (status === 403) {
        throw new PayrexApiError(code === null ? 'Forbidden' : code, message);
      }
      if (status === 500) {
        throw new PayrexApiError(code === null ? 'ServerError' : code, message);
      }
      throw new PayrexApiError('UnexpectedStatusCode', 'UnexpectedStatusCode');
    }
  }]);

  return PayrexSdkBase;
}();

PayrexSdkBase.PayrexApiError = PayrexApiError;

module.exports = PayrexSdkBase;
//# sourceMappingURL=PayrexSdkBase.js.map