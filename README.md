# Redux - Request Middleware

Simple Redux middleware that allows your api calls to be configured.

## Overview

Any action that is dispatched using the middleware's provided Symbol which can be imported via `import { symbols } from '@fanai/redux-request-middleware'`

The middleware then picks up those actions and makes an async request to
the endpoint specified in the options config using axios.

The config can be either an object representing a single request but an array of config objects is aslo supported and will internally call `axios.all()` which resolves with an array of values similar to `Promise.all()`.

Each configured lifecycle, e.g. PENDING, SETTLED, FULFILLED, REJECTED, is expected to return a flux standard action so a type key is required. The payload can either be of any type. If a function is provided then that function will receive the action, state, and response of the async call and
can optionally hook into those to formulate the final payload that is dispatched at each stage in the respective lifecycle for the Promise.

In addition, the middleware supports short-polling and additional configuration options can be provided to poll a given endpoint at a set interval with an optional timeout. More information on the options for the middleware configuration can be found below.

### Usage

```javascript
// dispatch an action with a type of [REQUEST]: Symbol(@@request)

[REQUEST]: {
  options: {}, // axios request options
  pollUntil?: (response) => true, // conditional to exit polling
  pollInterval?: 2000, // time between polls
  timeout?: 10000 * 2, // bail from polling
  concurrent?: false, // allow same endpoint to be hit concurrently
  namespace?: (options, uid) => options.url, // unique request type
  statusCodes?: new Map([
    [[400], {
      payload: (action, state, response) => {},
      type: 'SOME_ACTION_TYPE',
    }]
  ]),
  lifecycle: {
    [SETTLED]: {
      payload: (action, state, response) => {},
      type: 'SETTLED'
    },
    [FULFILLED]: {
      payload: (action, state, response) => {},
      type: 'FULFILLED'
    },
    [REJECTED]: {
      payload: (action, state, response) => {},
      type: 'REJECTED'
    },
    [PENDING]: {
      payload: (action, state) => {},
      type: 'PENDING',
    }
  }
}
```

### Options

|Name|Required|Default|Description|
|:--:|:------:|:-----:|:----------|
|options|✅|n/a|[axios configuration](https://github.com/axios/axios#request-config)|
|concurrent|❌|false|Allow requests against the same endpoint to happen concurrently|
|namespace|❌|undefined|Caches concurrent requests against a namespace in-order to cancel when concurrent is set to false|
|pollUntil|❌|undefined|Function used to enabled polling. If supplied it receives the response and should return true/false in-order to exit or continue polling|
|pollInterval|❌|5000|Number of milliseconds to wait between polls|
|timeout|❌|undefined|Number of milliseconds to wait before bailing out of an active poll|
|statusCodes|❌|undefined|Map of http status codes to perform a lookup against when a request succeeds or fails|
|lifecycle|❌|undefined|If not provided then the request will happen and simple return a Promise that resolves with the fetch's success or rejects with a failure error|

## License

Redux-middleware is open source software [licensed as Apache License, Version 2.0](https://github.com/fanai-inc/firestore-utils/blob/develop/LICENSE.md).