'use strict';

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var PayrexApiError = function (_Error) {
  _inherits(PayrexApiError, _Error);

  function PayrexApiError() {
    var code = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
    var message = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';

    _classCallCheck(this, PayrexApiError);

    var _this = _possibleConstructorReturn(this, (PayrexApiError.__proto__ || Object.getPrototypeOf(PayrexApiError)).call(this, message));

    _this.code = code;
    return _this;
  }

  return PayrexApiError;
}(Error);

module.exports = PayrexApiError;
//# sourceMappingURL=PayrexApiError.js.map