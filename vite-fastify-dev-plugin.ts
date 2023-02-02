import type { FastifyInstance } from 'fastify';
import type { IncomingMessage, ServerResponse } from 'node:http';
import type { Connect, Plugin } from 'vite';

export const ViteFastifyDevPlugin = (cfg?: { path?: string; instance?: string }) => {
  const { path, instance } = { path: cfg?.path ?? 'src/server.ts', instance: cfg?.instance ?? 'app' };
  return {
    name: 'vite-fastify-dev-plugin',
    config: () => ({ build: { ssr: path, rollupOptions: { input: path } }, server: { hmr: false } }),
    configureServer: server => {
      server.middlewares.use(async (req: IncomingMessage, res: ServerResponse, _: Connect.NextFunction) => {
        const app = (await server.ssrLoadModule(path))[instance] as FastifyInstance;
        if (app === undefined) {
          server.config.logger.error(`Failed to find a named export ${instance} from ${path}`);
          process.exit(1);
        }
        app.ready().then(() => app.routing(req, res));
      });
    },
  } as Plugin;
};
