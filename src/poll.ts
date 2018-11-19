import to from "await-to-js";

interface YieldUntil {
  (response: any): boolean;
}

interface Request {
  (): Promise<any>;
}

/**
 * Function simply wraps a generator and calls that generator's next method each time it's executed
 *
 */
function tick(generator: any) {
  return async function next() {
    return generator.next();
  };
}

/**
 * Function that returns a Promise that resolves after a specified amount of time
 *
 * @param {number} amount - amount of time to wait until resolving the promise
 * @returns {} - Promise
 */
async function delay(amount: number): Promise<any> {
  return new Promise(resolve => {
    setTimeout(resolve, amount);
  });
}

/**
 * Async generator function that calls a provided endpoint and continues to yield the response
 * from the given endpoint until the yieldUntilCondition callback returns true.
 *
 * @param {function} endpoint - function that returns a Promise
 * @param {function} yieldUntilCondition - callback that receives the fetch response and returns a boolean
 * @returns {} - Promise
 */
async function* fetch(
  endpoint: Request,
  yieldUntilCondition: YieldUntil
): AsyncIterableIterator<any> {
  while (true) {
    // call the intended api
    const [err, response] = await to(endpoint());
    // throw on error from ajax request
    if (err) {
      throw err;
    }
    // break out of the iterator when the condition is met
    if (yieldUntilCondition(response)) {
      return response;
    }
    // else simply yield the value so we can continue to poll
    yield response;
  }
}

/**
 * Function that polls a generator's next() method until a provided callback's condition has been met.
 *
 * @param {function} condition - function that true or false based on the condition being tested
 * @param {endpoint} endpoint - function that when executes calls an async api endpoint and returns the promise that resolves with the error or response from the service
 * @param {number} pollInterval - time between polling the api
 * @param {number} timeout - time to bail if the condition callback is never met
 * @returns {any} - response from the api
 */
async function poll(
  condition: YieldUntil,
  endpoint: Request,
  pollInterval: number = 5000,
  timeout: number
) {
  let gen: AsyncIterableIterator<any> = fetch(endpoint, condition);
  let timesUp: boolean = false;
  let response: { done: boolean; value: any } = { done: false, value: null };

  if (typeof timeout === "number" && !Number.isNaN(timeout)) {
    setTimeout(() => (timesUp = true), timeout);
  }

  while (!response.done && !timesUp) {
    response = await delay(pollInterval).then(tick(gen));
  }

  // if the response has yet to resolve after polling for a duration that exceeds the
  // specified timeout then throw an error that matches the
  if (timesUp) {
    throw { response: { status: 418, statusText: "request timeout" } };
  }

  return response.value;
}

export { poll };
