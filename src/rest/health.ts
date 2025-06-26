import Router from '@koa/router';
import * as healthService from '../service/health';
import type { Context } from 'koa';
import type { KoaRouter } from '../types/koa';

const ping = async (ctx: Context) => {
  ctx.status = 200;
  ctx.body = healthService.ping();
};

const getVersion = async (ctx: Context) => {
  ctx.status = 200;
  ctx.body = healthService.getVersion();
};

export default (parent: KoaRouter) => {
  const router = new Router({prefix: '/health'});

  router.get('/ping', ping);
  router.get('version', getVersion);

  parent.use(router.routes()).use(router.allowedMethods());
};