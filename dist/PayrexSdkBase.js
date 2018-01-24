'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var PayrexApiError = require('./PayrexApiError');

var PayrexSdkBase = function () {
  /**
   * PayrexSdkBase constructor
   * @param {object} options
   * @param {string} options.publicKey
   * @param {string} options.secretKey
   * @param {string} options.baseUrl
   * @param {function} options.fetch [Fetch class](https://fetch.spec.whatwg.org/)
   * @param {function} options.Url [Url class](https://url.spec.whatwg.org/)
   * @param {function} options.base64Encode Function to encode string (utf-8) in base64
   */
  function PayrexSdkBase(options) {
    _classCallCheck(this, PayrexSdkBase);

    var _options$publicKey = options.publicKey,
        publicKey = _options$publicKey === undefined ? '' : _options$publicKey,
        _options$secretKey = options.secretKey,
        secretKey = _options$secretKey === undefined ? '' : _options$secretKey,
        _options$baseUrl = options.baseUrl,
        baseUrl = _options$baseUrl === undefined ? 'http://localhost:3000/' : _options$baseUrl,
        fetch = options.fetch,
        Url = options.Url,
        base64Encode = options.base64Encode;
    // TODO: Update validation

    if (typeof publicKey !== 'string') {
      throw new Error('PayrexSdkBase required option "publicKey"');
    }
    if (typeof fetch !== 'function') {
      throw new Error('PayrexSdkBase required option "fetch"');
    }
    if (typeof Url !== 'function') {
      throw new Error('PayrexSdkBase required option "Url"');
    }
    if (typeof base64Encode !== 'function') {
      throw new Error('PayrexSdkBase required option "base64Encode"');
    }
    this.publicKey = publicKey;
    this.secretKey = secretKey;
    this.baseUrl = baseUrl;
    this.fetch = fetch;
    this.Url = Url;
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

      var url = new this.Url(path, this.baseUrl);
      if (typeof queryParams === 'object') {
        Object.entries(queryParams).forEach(function (_ref5) {
          var _ref6 = _slicedToArray(_ref5, 2),
              key = _ref6[0],
              value = _ref6[1];

          url.searchParams.set(key, value);
        });
      }
      var options = {
        method,
        headers: new this.fetch.Headers({
          Accept: 'application/json',
          Authorization: `Basic ${this.base64Encode(`${this.publicKey}:${this.secretKey}`)}`,
          'Content-type': 'application/json'
        }),
        body
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

      return this.fetch(url, options).then(function (response) {
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