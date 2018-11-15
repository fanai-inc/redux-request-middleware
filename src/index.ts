import { Store, Dispatch } from "redux/index.d";
import { AxiosResponse } from "axios/index.d";
import {
  RequestAction,
  FluxStandardPayload,
  PayloadInterceptor
} from "./index.d";

import to from "await-to-js";
import { SimpleCache } from "./simpleCache";
import { poll } from "./poll";
import * as Symbols from "./symbols";

const axios = require("axios");

let requestCache = new SimpleCache();

/**
 * Take the current state of the application and returns a function that receives the Dispatcher
 * which then returns another function which receives the action. Any action that is dispatched with
 * the symbol `Symbols.REQUEST` will be picked up and handled by the function.
 *
 * If any of the lifecycle methods are configured for the request, namely PENDING, SETTLED, REJECTED or FULFILLED
 * then each lifecycle can either return a flux standard payload or alternatively they can be a function that
 * can perform some side-effects and ultimately return a flux standard action that will eventually be dispatched.
 *
 * Each request that is made is given a uuid and is cached using the SimpleCache cache. Requests that are given
 * a namespace are cached against that namespace and can be used to handle concurrent requests.
 *
 * @param {object} store - database object paths reference to perform the query
 * @returns {function(): function(): Promise<any>} - Promise
 */
const requestMiddleware = (store: Store) => (next: Dispatch) => (
  action: RequestAction
): Promise<any> | RequestAction => {
  if (action[Symbols.REQUEST]) {
    const {
      [Symbols.REQUEST]: { lifecycle = {}, options, namespace }
    } = action;

    if (!options) {
      throw new Error(
        `Options is required but either none were provided or they do not match the correct signature.
         To find out what options are supported see: https://github.com/axios/axios`
      );
    }

    // store the current request
    requestCache.options = options;
    const uid: string = requestCache.cacheRequest(action[Symbols.REQUEST]);
    // if pending lifecycle is configured then create a request id that is used to cache this specific request
    if (lifecycle[Symbols.PENDING]) {
      next(
        formPayload(lifecycle[Symbols.PENDING], uid, action, store.getState())
      );
    }

    return new Promise(async (resolve, reject) => {
      let [err, response]: [any, any] = [null, null];

      if (action[Symbols.REQUEST].pollUntil) {
        const { pollUntil, pollInterval, timeout } = action[Symbols.REQUEST];
        [err, response] = await to(
          poll(
            pollUntil,
            () => axios({ ...action[Symbols.REQUEST].options }),
            pollInterval,
            timeout
          )
        );

        console.log(err.response, response);
      } else {
        [err, response] = Array.isArray(options)
          ? await to(axios.all(options.map(o => axios({ ...o }))))
          : await to(axios({ ...action[Symbols.REQUEST].options }));
      }

      if (
        lifecycle[Symbols.SETTLED] ||
        lifecycle[Symbols.FULFILLED] ||
        lifecycle[Symbols.REJECTED]
      ) {
        // dispatch actions for success or error once the response(s) have been settled and the
        // response was not cancelled at some point during its lifespan
        if (
          requestCache.getRequestStatus(namespace, uid) !== Symbols.CANCELLED
        ) {
          // if the SETTLED lifecycle method is configured then disregard the
          // REJECTED and FULFILLED do avoid duplicate dispatches
          const lifecycleInterceptor = lifecycle[Symbols.SETTLED]
            ? lifecycle[Symbols.SETTLED]
            : err
            ? lifecycle[Symbols.REJECTED]
            : lifecycle[Symbols.FULFILLED];
          // call the next middleware
          next(
            onComplete(
              action,
              store,
              uid,
              lifecycleInterceptor,
              err ? err.response : response
            )
          );
        }
      } else {
        // when no lifecycle handlers have been specified then we simply resolve or reject
        // and the code that dispatched the action can handle it without the using the middleware
        !err ? resolve(response) : reject(err);
      }
      // clear the cache for the response
      requestCache.clearRequest(action[Symbols.REQUEST], uid);
    });
  } else {
    return next(action);
  }
};

/**
 * Function take the lifecycle action and normalizes it so that each action's type and payload
 * are consistent for each lifecycle hook
 *
 * @param {object} lifecycle - flux action to be dispatched
 * @param {string} uid       - request identifier
 * @param {object} action    - original action that was dispatched to the request middleware
 * @param {object} state     - application state of the redux store
 * @param {object} response  - either the error or success result of the async request
 * @returns {object}         - action used to be dispatched to the next middleware
 */
const formPayload = (
  lifecycle: {
    type: string;
    payload?: PayloadInterceptor | any;
  },
  uid: string,
  action: RequestAction,
  state: any,
  response?: AxiosResponse
): FluxStandardPayload => {
  return {
    ...{
      ...lifecycle,
      payload: {
        data:
          typeof lifecycle.payload === "function"
            ? lifecycle.payload(action, state, response)
            : lifecycle.payload,
        requestId: uid
      }
    }
  };
};

/**
 * Function that is called when either the SETTLED or REJECTED or FULFILLED lifecycle hooks are called.
 * The function returns the payload and type object that is dispatched when each stage of the lifecycle
 * is reached. The payload configured can return any static data or it can optionally be a function
 * that can operate on the response of the async request before being dispatched.
 *
 * @param {object} action    - original action that was dispatched to the request middleware
 * @param {object} store     - application state of the redux store
 * @param {string} uid       - request identifier
 * @param {object} lifecycle - object used to decorate the action that will eventually be dispatched
 * @param {object} response  - either the error or success result of the async request
 * @returns {object}         - action used to be dispatched to the next middleware
 */
const onComplete = (
  action: RequestAction,
  store: Store,
  uid: string,
  lifecycle: {
    type: string;
    payload?: PayloadInterceptor | any;
  },
  response: AxiosResponse
): FluxStandardPayload => {
  const {
    [Symbols.REQUEST]: { statusCodes = new Map() }
  } = action;

  const statCodes = statusCodes.keys();
  // check for messaging or status code handlers
  for (const codes of statCodes) {
    if (codes.includes(response.status)) {
      // each code may either return a payload to be dispatched or a function
      // that is executed and returns a payload
      return formPayload(
        statusCodes.get(codes) || {},
        uid,
        action,
        store.getState(),
        response
      );
    }
  }

  return formPayload(lifecycle, uid, action, store.getState(), response);
};

export { Symbols as symbols };
export { requestMiddleware as RequestReduxMiddleware };
