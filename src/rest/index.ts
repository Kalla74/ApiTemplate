import installUserRouter from './user';
import installHealthRouter from './health';
import installSessionRouter from './session';
import Router from '@koa/router';
import type { KoaApplication, TemplateAppContext, TemplateAppState } from '../types/koa';

export default (app: KoaApplication) => {
  const router = new Router<TemplateAppState, TemplateAppContext>({
    prefix: '/api',
  });

  installUserRouter(router);
  installHealthRouter(router);
  installSessionRouter(router);
    
  app.use(router.routes()).use(router.allowedMethods());
};