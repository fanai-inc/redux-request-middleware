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

export interface PollingOptions {
  pollInterval?: number;
  pollUntil?: (response: AxiosResponse) => any;
  timeout?: number;
}

export type RequestCache = Map<string, Map<string, RequestCacheStatus>>;

export interface RequestInterface {
  concurrent?: boolean;
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
  namespace?: (
    request: AxiosRequestConfig | AxiosRequestConfig[],
    uid: string
  ) => string | string;
  options: AxiosRequestConfig | AxiosRequestConfig[];
  poll?: PollingOptions;
  statusCodes?: Map<
    number[],
    FluxStandardPayload | FluxStandardPayloadInterceptor
  >;
}

export interface RequestAction extends Action {
  payload: RequestInterface,
  type: symbol,
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
  payload?: any;
  type: string;
}
