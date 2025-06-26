import type { ParameterizedContext } from 'koa';
import type Application from 'koa';
import type Router from '@koa/router';
import type { SessionInfo } from './auth';

export interface TemplateAppState{
  session: SessionInfo;
}

export interface TemplateAppContext<
  Params = unknown,
  RequestBody = unknown,
  Query = unknown,
> {
  request: {
    body: RequestBody;
    query: Query;
  };
  params: Params;
}

export type KoaContext<
  responseBody = unknown,
  Params = unknown,
  RequestBody = unknown,
  Query = unknown,
> = ParameterizedContext<
  TemplateAppState,
  TemplateAppContext<Params, RequestBody, Query>,
  responseBody
>;

export interface KoaApplication extends Application<TemplateAppState, TemplateAppContext> {}

export interface KoaRouter extends Router<TemplateAppState, TemplateAppContext> {}

