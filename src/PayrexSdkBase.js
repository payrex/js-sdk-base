const PayrexApiError = require('./PayrexApiError');

class PayrexSdkBase {
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
  constructor(options) {
    const {
      publicKey = '',
      secretKey = '',
      baseUrl = 'http://localhost:3000/',
      fetch,
      Url,
      base64Encode,
    } = options;
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
  get(path = '', { queryParams = {} } = {}) {
    return this.fetchRequest('GET', path, queryParams, null);
  }

  /**
   * Make POST request
   * @param {string} path Path (ex. "/users")
   * @param {object} body Body data
   * @param {object} queryParams  Additional query params to merge
   * @return {Promise}
   */
  post(path = '', body = {}, { queryParams = {} } = {}) {
    return this.fetchRequest('POST', path, queryParams, body);
  }

  /**
   * Make PUT request
   * @param {string} path Path (ex. "/users")
   * @param {object} body Body data
   * @param {object} queryParams  Additional query params to merge
   * @return {Promise}
   */
  put(path = '', body = {}, { queryParams = {} } = {}) {
    return this.fetchRequest('PUT', path, queryParams, body);
  }

  /**
   * Make DELETE request
   * @param {string} path Path (ex. "/users")
   * @param {object} queryParams  Additional query params to merge
   * @return {Promise}
   */
  remove(path = '', { queryParams = {} } = {}) {
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
  buildFetchOptions(method = 'GET', path = '', queryParams = {}, body = {}) {
    const url = new this.Url(path, this.baseUrl);
    if (typeof queryParams === 'object') {
      Object.entries(queryParams)
        .forEach(([key, value]) => {
          url.searchParams.set(key, value);
        });
    }
    const options = {
      method,
      headers: new this.fetch.Headers({
        Accept: 'application/json',
        Authorization: `Basic ${this.base64Encode(`${this.publicKey}:${this.secretKey}`)}`,
        'Content-type': 'application/json',
      }),
      body,
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
  static parseResponse(status, body) {
    if (status === 200 || status === 304) {
      return body;
    }
    const code = body && body.code ? body.code : null;
    const message = body && body.message ? body.message : '';
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

  fetchRequest(method, path, queryParams, body) {
    const { url, options } = this.buildFetchOptions(method, path, queryParams, body);
    return this
      .fetch(url, options)
      .then((response) => {
        const { status } = response;
        const contentType = response.headers.get('content-type');
        if (!(contentType && contentType.includes('application/json'))) {
          throw new TypeError('Expected to recieve JSON');
        }
        return response
          .json()
          .then(json => this.constructor.parseResponse(status, json));
      });
  }
}

PayrexSdkBase.PayrexApiError = PayrexApiError;

module.exports = PayrexSdkBase;