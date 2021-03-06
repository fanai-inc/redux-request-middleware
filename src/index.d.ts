import { Action } from "redux/index.d";
import {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  Canceler
} from "axios/index.d";
import * as Symbols from "./symbols";

export interface RequestCacheStatus {
  requestedAt: number;
  status: symbol;
  uid: string;
  cancel: Canceler;
}

export interface RequestCacheOptions {
  concurrent?: boolean;
  namespace?: any;
}

export interface PollingOptions {
  pollUntil: (response: AxiosResponse) => any;
  pollInterval?: number;
  timeout?: number;
}

export type RequestCache = Map<string, Map<string, RequestCacheStatus>>;

export interface RequestInterface {
  instance?: AxiosInstance;
  concurrent?: boolean;
  fetch?: (action: RequestAction, state: any) => Promise<any>;
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
  options:
    | AxiosRequestConfig
    | AxiosRequestConfig[]
    | ((state: any) => AxiosRequestConfig | AxiosRequestConfig[]);
  poll?: PollingOptions;
  statusCodes?: Map<
    number[],
    {
      payload?: FluxStandardPayloadInterceptor | any;
      type: string;
    }
  >;
}

export interface RequestAction extends Action {
  payload: RequestInterface;
  type: symbol;
}

export interface PayloadInterceptor {
  (response: AxiosResponse, action: RequestAction, state: any): any;
}

export interface FluxStandardPayloadInterceptor {
  (response: AxiosResponse, action: RequestAction, state: any): any;
}

export interface FluxStandardPayload {
  payload?: any;
  type: string | symbol;
}
