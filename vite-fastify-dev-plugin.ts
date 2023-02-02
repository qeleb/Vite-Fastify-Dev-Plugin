import type { FastifyInstance } from 'fastify';
import type { IncomingMessage, ServerResponse } from 'node:http';
import type { Connect, Plugin, UserConfig, ViteDevServer } from 'vite';

const PLUGIN_NAME = 'vite-fastify-dev-plugin';
type PluginConfig = { appPath: string; exportName: string };

export const createMiddleware = async (server: ViteDevServer): Promise<Connect.HandleFunction> => {
  const plugin = server.config.plugins.find(p => p.name === PLUGIN_NAME) as Plugin;
  if (plugin === undefined) {
    console.error('Add ViteFastifyDevPlugin to the Vite config');
    process.exit(1);
  }

  let userConfig: UserConfig | null | void;
  if (typeof plugin.config === 'function') userConfig = await plugin.config({}, { command: 'serve', mode: '' });
  else if (typeof plugin.config?.handler === 'function')
    userConfig = await plugin.config?.handler!({}, { command: 'serve', mode: '' });
  const config = (userConfig as UserConfig & { ViteFastifyDevPlugin: PluginConfig }).ViteFastifyDevPlugin;

  return async (req: IncomingMessage, res: ServerResponse, next: Connect.NextFunction) => {
    const app = (await server.ssrLoadModule(config.appPath))[config.exportName] as FastifyInstance;
    if (app === undefined) {
      server.config.logger.error(`Failed to find a named export ${config.exportName} from ${config.appPath}`);
      process.exit(1);
    }
    app.ready().then(() => app.routing(req, res));
  };
};

export const ViteFastifyDevPlugin = (cfg?: PluginConfig) => {
  const config = { appPath: cfg?.appPath ?? 'src/server.ts', exportName: cfg?.exportName ?? 'app' } as PluginConfig;

  return {
    name: PLUGIN_NAME,
    config: () =>
      ({
        build: { ssr: config.appPath, rollupOptions: { input: config.appPath } },
        server: { hmr: false },
        ViteFastifyDevPlugin: config,
      } as UserConfig & { ViteFastifyDevPlugin: PluginConfig }),
    configureServer: async server => {
      server.middlewares.use(await createMiddleware(server));
    },
  } as Plugin;
};
