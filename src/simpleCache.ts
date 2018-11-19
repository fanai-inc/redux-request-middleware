import { RequestCacheStatus, RequestCacheOptions } from "./index.d";
import * as Symbols from "./symbols";
import { uuid } from "./uuid";

class SimpleCache {
  private _cache: Map<string, Map<string, RequestCacheStatus>>;
  private _options: any;
  private static readonly generic: unique symbol = Symbol("@@generic");

  constructor(options?: any) {
    this._cache = new Map();
    this._options = options;
  }

  get cache(): Map<string, Map<string, RequestCacheStatus>> {
    return this._cache;
  }

  set options(options: any) {
    this._options = options;
  }

  /**
   *  Clear the request cache either by a namespaced requestType or the uid of the request
   *
   * @param {object} options - options object specifying the location and the data to be stored in the cache
   * @param {string} uid     - unique identifier of the specific request
   * @returns                - void
   */
  public cacheRequest({ namespace, concurrent }: RequestCacheOptions): string {
    const uid: string = uuid();
    const requestType = this.getNamespace(namespace, uid);
    // the requestType is used as a top level mechanism to define which api endpoint is being hit
    // @ts-ignore
    const existingCache = this._cache.get(requestType);
    const requestStatus: RequestCacheStatus = {
      requestedAt: Date.now(),
      status: Symbols.PENDING,
      uid
    };
    // if there is not a request pending for this request type or this request type allows concurrent requests
    // then add the request data to the cache at that specific request type namespace
    if (!existingCache) {
      const requestTypeMap: Map<string, RequestCacheStatus> = new Map().set(
        uid,
        requestStatus
      );
      // ts not allowing a symbol as an indexer
      // @ts-ignore
      this._cache.set(requestType, requestTypeMap);
    } else {
      // requests that have no origin and use the default @@generic type are always allowed to
      // cache multiple requests
      // Those that are namespaced can allow or disallow requests to made multiple times against the same endpoint
      // in parallel or not.
      if (requestType !== SimpleCache.generic) {
        if (concurrent !== undefined && !concurrent) {
          // concurrent request of the same type are not allowed so either cancel existing
          // or simply ignore this cache request and allow the first to take precedence
          // TODO allow for more advanced options, right now simply cancel existing request
          this.markCacheValueAsCancelled(existingCache);
        }
      }
      // cache most recent request
      existingCache.set(uid, requestStatus);
    }

    return uid;
  }

  /**
   *  Clear the request cache either by a namespaced requestType or the default namespace of @@generic
   *
   * @param {object} options - options object specifying the location in the cache that needs to be cleared
   * @param {string} uid     - unique identifier of the specific request
   * @returns                - void
   */
  public clearRequest({ namespace }: RequestCacheOptions, uid: string): void {
    const requestType = namespace || SimpleCache.generic;
    const currentRequest = this._cache.get(requestType);
    // clear request cache once request is complete
    if (currentRequest) {
      currentRequest.delete(uid);
      // clear the request cache at the request type if there are no request left of the given type
      if (currentRequest.size === 0) {
        this._cache.delete(requestType);
      }
    }
  }

  /**
   *  Clear the entire cache
   *
   * @returns - void
   */
  public cleanCache(): void {
    this._cache.clear();
  }

  /**
   *  Get current request status
   *
   * @param {any} requestType - key used to namespace the request type
   * @param {string} uid      - unique id of the specific request
   * @returns - symbol
   */
  public getRequestStatus(
    requestType: string | ((options: any, uid: string) => string),
    uid: string
  ): symbol {
    // @ts-ignore
    return this._cache.get(this.getNamespace(requestType, uid)).get(uid).status;
  }

  /**
   *  Cancel request
   *
   * @returns - void
   */
  private markCacheValueAsCancelled(
    cache: Map<string, RequestCacheStatus>
  ): void {
    for (let value of cache.values()) {
      value.status = Symbols.CANCELLED;
    }
  }

  private getNamespace(
    namespace: string | ((options: any, uid: string) => string),
    uid: string
  ): string | symbol {
    return namespace
      ? typeof namespace === "function"
        ? namespace(this._options, uid)
        : namespace
      : SimpleCache.generic;
  }
}

export { SimpleCache };
