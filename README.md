PAYREX-JS-SDK-BASE
==================

[![Build Status](https://travis-ci.org/payrex/js-sdk-base.svg?branch=master)](https://travis-ci.org/payrex/js-sdk-base)
[![codecov](https://codecov.io/gh/payrex/js-sdk-base/branch/master/graph/badge.svg)](https://codecov.io/gh/payrex/js-sdk-base)

Base class for Payrex JS SDK.


Install
-------

```bash
npm install --save payrex-js-sdk-base
```


Usage
-----

```javascript
const PayrexSdkBase = require('payrex-js-sdk-base');

const options = {/* ... options ... */};
const sdkBase = new PayrexSdkBase(options);
```

| Option | Type | Usage | Description |
|--------|------|-------|-------------|
| publicKey | string | *optional* | API public key |
| secretKey | string | *optional* | API secret key |
| baseUrl | string | *optional* | API base url (default "http://localhost:3000/") |
| fetch | function | *required* | [Fetch function](https://fetch.spec.whatwg.org/) |
| Url | object | *required* | [Url class](https://url.spec.whatwg.org/) |
| base64Encode | function | *required* | Function to encode string (utf-8) in base64 |
