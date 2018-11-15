import { Action } from "redux/index.d";
import { AxiosRequestConfig, AxiosResponse } from "axios/index.d";
import * as Symbols from "./symbols";

export interface RequestCacheStatus {
  requestedAt: number;
  status: symbol;
  uid: string;
}

export interface RequestCacheOptions {
  concurrent?: boolean;
  namespace?: any;
}

export type RequestCache = Map<string, Map<string, RequestCacheStatus>>;

export interface RequestInterface {
  concurrent?: boolean;
  // fetch: object | string;
  statusCodes?: Map<
    number[],
    FluxStandardPayload | FluxStandardPayloadInterceptor
  >;
  lifecycle: {
    [Symbols.PENDING]?: {
      type: string;
      payload: FluxStandardPayload | FluxStandardPayloadInterceptor;
    };
    [Symbols.REJECTED]?: {
      type: string;
      payload: FluxStandardPayload | FluxStandardPayloadInterceptor;
    };
    [Symbols.FULFILLED]?: {
      type: string;
      payload: FluxStandardPayload | FluxStandardPayloadInterceptor;
    };
    [Symbols.SETTLED]?: {
      type: string;
      payload: FluxStandardPayload | FluxStandardPayloadInterceptor;
    };
    [Symbols.CANCELLED]?: {
      type: string;
      payload: FluxStandardPayload | FluxStandardPayloadInterceptor;
    };
  };
  pollUntil?: (response: AxiosResponse) => any;
  pollInterval?: number;
  timeout?: number;
  namespace?: (
    request: AxiosRequestConfig | AxiosRequestConfig[],
    uid: string
  ) => string | string;
  options: AxiosRequestConfig | AxiosRequestConfig[];
}

export interface RequestAction extends Action {
  [Symbols.REQUEST]: RequestInterface;
}

export interface PayloadInterceptor {
  (action: RequestAction, state: any, response?: AxiosResponse): any;
}

export interface FluxStandardPayloadInterceptor {
  (
    action: RequestAction,
    state: any,
    response?: AxiosResponse
  ): FluxStandardPayload;
}

export interface FluxStandardPayload {
  type: string;
  payload?: any;
}
