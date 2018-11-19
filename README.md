# Redux - Request Middleware

Simple Redux middleware that allows your dispatched actions to be piped through.

## Overview

Any action that is dispatched using the middleware's provided Symbol which can be imported via `import { symbols } from '@fanai/redux-request-middleware'`

The middleware then picks up those actions and makes an async request to
the endpoint specified in the options config using axios.

The config for axios can be either an object representing a single request, or alternatively it can be an array of config objects which internally calls `axios.all()` and resolves with an array of values similar to `Promise.all()`.

Each configured lifecycle, e.g. PENDING, SETTLED, FULFILLED, REJECTED, is expected to return a flux standard action so a `type` property is required. The `payload` is simply the data you want to be dispatched just like any other action in your application. If a function is provided for the `payload` then that function will receive the `response` of the async request, the original dispatched `action`, and `state` which comes from Redux's `getState()` method. You can optionally use these to build the payload that is dispatched at each stage in the respective lifecycle for the request that was made, therefore allowing your payloads to be dynamically built.

_Note:_ The `SETTLED` lifecycle functions similar to `Promise.finally() and will receive the error or the response depending on which is returned by axios`.

In addition, the middleware supports short-polling in-order to poll a given endpoint at a set interval with an optional timeout.

More information on the options and their default values for the middleware's configuration can be found below.

For more on Redux and middleware checkout the [redux docs](https://redux.js.org/advanced/middleware)

### Usage

```javascript

// hook up the middleware
import { createStore, combineReducers, applyMiddleware } from 'redux'
import { RequestReduxMiddleware, symbols } from '@fanai/redux-request-middleware';
const { PENDING, SETTLED, FULFILLED, REJECTED, REQUEST } = symbols;

const store = createStore(
  MyApp,
  // applyMiddleware() tells createStore() how to handle middleware
  applyMiddleware(RequestReduxMiddleware)
);

// in your action creator...
import { Dispatch } from 'redux';

// then dispatch an action with a type of REQUEST: Symbol(@@request)
dispatch({
  payload: {
    concurrent?: false, // allow same endpoint to be hit concurrently
    // async request lifecycle hooks
    lifecycle?: {
      [SETTLED]: {
        payload: (response: AxiosResponse, action: RequestAction, state: any): any => {},
        type: 'SETTLED'
      },
      [FULFILLED]: {
        payload: (response: AxiosResponse, action: RequestAction, state: any): any => {},
        type: 'FULFILLED'
      },
      [REJECTED]: {
        payload: (response: AxiosResponse, action: RequestAction, state: any): any => {},
        type: 'REJECTED'
      },
      [PENDING]: {
        payload: (response: undefined, action: RequestAction, state: any): any => {},
        type: 'PENDING',
      }
    },
    namespace?: (options, uid) => options.url, // unique request type
    options: {}, // axios request options
    poll?: {
      pollInterval?: 2000, // time between polls
      pollUntil?: (response) => true, // conditional to exit polling
     timeout?: 10000 * 2, // bail from polling if pollUntil condition is never met
    },
    // configurable action based on HTTP status
    statusCodes?: new Map([
      [[400], {
        payload: (response: AxiosResponse | AxiosError, action: RequestAction, state: any) => {},
        type: 'SOME_ACTION_TYPE',
      }]
    ]),
  },
  type: REQUEST
})
```

### Options

|     Name     | Required |      Default      | Description                                                                                                                                     |
| :----------: | :------: | :---------------: | :---------------------------------------------------------------------------------------------------------------------------------------------- |
|   options    |    ✅    |        n/a        | [axios configuration](https://github.com/axios/axios#request-config)                                                                            |
|  concurrent  |    ❌    |       true        | Allow requests against the same endpoint to happen concurrently                                                                                 |
|  namespace   |    ❌    | Symbol(@@generic) | Caches concurrent requests against a namespace in-order to cancel when concurrent is set to false                                               |
|  pollUntil   |    ❌    |     undefined     | Function used to enabled polling. If supplied it receives the response and should return true/false in-order to exit or continue polling        |
| pollInterval |    ❌    |       5000        | Number of milliseconds to wait between polls                                                                                                    |
|   timeout    |    ❌    |     undefined     | Number of milliseconds to wait before bailing out of an active poll                                                                             |
| statusCodes  |    ❌    |     undefined     | Map of http status codes to perform a lookup against when a request succeeds or fails                                                           |
|  lifecycle   |    ❌    |     undefined     | If not provided then the request will happen and simple return a Promise that resolves with the fetch's success or rejects with a failure error |

## License

Redux-middleware is open source software [licensed as Apache License, Version 2.0](https://github.com/fanai-inc/firestore-utils/blob/develop/LICENSE.md).
