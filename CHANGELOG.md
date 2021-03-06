# Changelog

### 0.8.3 (Dec 11, 2018)

New Functionality:

- Add support for cancellation of all pending requests that have not been resolved at the time of cancellation. *NOTE* this only works for calls made with Axios which is used internally.


### 0.8.2 (Dec 5, 2018)

Fixes:

- when a fulfilled handler was provided but no reject handler and the promise fails then an uncaught error was being thrown as the payload was expected, the reverse was also true. Now if one is not provided and the outcome of the promise expects a handler and no settled handler is provided then the middleware simply resolves or rejects with the response. Nothing more is dispatched.

### 0.8.1 (Dec 4, 2018)

Fixes:

- request cache not cleared when the request namespace was supplied as a function.
- request namespace type not set to Symbol(@@generic) but as undefined

### 0.8.0 (Nov 28, 2018)

New Functionality:

- Add support for supplying your own promise to the middleware instead of using the options
  configuration and axios. You can now pass a `fetch` param which is simply a function that
  returns a Promise. This works well when you want to use the middleware with an external service
  that has its own mechanism for making requests but you still want to tap into lifecycle hooks
  and status codes. When used, the middleware will resolve or reject with the error or response
  when the promise is settled.

### 0.7.2 (Nov 26, 2018)

Fixes:

- Resolve promise when using the lifecycle hooks. Previously returning a new promise that was never
  resolved unless the middleware config used no lifecycle hooks and therefore running something after
  dispatching the action was not possible in your action creator.

### 0.7.0 (Nov 20, 2018)

New Functionality:

- Add support for axios instance so default values can be used across multiple requests
- Add support for multiple options configs when polling
- Add support Axios config optionally being a function that receives app state

Fixes:

- Fix poll timeout causing first request to be delayed the amount of the pollInterval
- Fix poll request not supporting `Axios.all()`
