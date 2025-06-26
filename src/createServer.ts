import { getLogger } from './core/logging';
import Koa from 'koa';
import installRest from './rest';
import { initializeData, shutdownData } from './data';
import type { KoaApplication, TemplateAppContext, TemplateAppState } from './types/koa';
import installMiddlewares from './core/installMiddlewares';

export interface Server {
  getApp(): KoaApplication;
  start(): Promise<void>;
  stop(): Promise<void>;
}

export default async function createServer() : Promise<Server> {
  const app = new Koa<TemplateAppState, TemplateAppContext>(); 

  installMiddlewares(app);

  await initializeData();
  
  installRest(app);

  return {
    getApp(){
      return app;
    },
    start(){
      return new Promise<void>((resolve) => {
        app.listen(9000, () => {
          getLogger().info('server is on');
          resolve();
        }); 
      });
    },
    async stop(){
      app.removeAllListeners();
      await shutdownData;
      getLogger().info('Goodbye!');
    },
  };
}

