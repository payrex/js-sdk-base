class PayrexApiError extends Error {
  constructor(code = null, message = '') {
    super(message);
    this.code = code;
  }
}

module.exports = PayrexApiError;
