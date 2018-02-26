/* eslint-disable no-restricted-syntax, no-prototype-builtins */
const { URL } = require('whatwg-url');
const PayrexApiError = require('./PayrexApiError');

const REQUIRED_FIELDS = ['fetch', 'Headers', 'credentials'];

function addQueryParams(searchParams, obj, prefix = '') {
  if (typeof obj === 'object') {
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const val = obj[key];
        const newPrefix = prefix ? `${prefix}[${key}]` : key;
        if (typeof val === 'object') {
          addQueryParams(searchParams, val, newPrefix);
        } else {
          searchParams.set(newPrefix, val);
        }
      }
    }
  }
}

class PayrexSdkBase {
  /**
   * PayrexSdkBase constructor
   * @param {object} options
   * @param {string} options.credentials
   * @param {string} options.baseUrl
   * @param {function} options.fetch [Fetch function](https://fetch.spec.whatwg.org/)
   * @param {function} options.Headers [Fetch Headers](https://fetch.spec.whatwg.org/)
   */
  constructor(options = {}) {
    REQUIRED_FIELDS
      .forEach((value) => {
        if (!options[value]) {
          throw new Error(`Option "${value}" is required`);
        }
      });

    const {
      credentials = '',
      baseUrl = 'http://localhost:3000/',
      fetch,
      Headers,
    } = options;
    if (!baseUrl) {
      throw new Error('Option "baseUrl" is required');
    }

    this.credentials = credentials;
    this.baseUrl = baseUrl;
    this.fetch = fetch;
    this.Headers = Headers;
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
    const url = new URL(path, this.baseUrl);
    if (typeof queryParams === 'object') {
      addQueryParams(url.searchParams, queryParams);
    }
    const options = {
      method,
      headers: new this.Headers({
        Accept: 'application/json',
        Authorization: `Bearer ${this.credentials}`,
        'Content-type': 'application/json',
      }),
      body: body ? JSON.stringify(body) : undefined,
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
      .fetch
      .call(null, url, options)
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
