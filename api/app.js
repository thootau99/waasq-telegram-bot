import path from 'path';
import AutoLoad from '@fastify/autoload';
import { fileURLToPath } from 'url';

const thisFilename = fileURLToPath(import.meta.url);
const thisDirname = path.dirname(thisFilename);

// Pass --options via CLI arguments in command to enable these options.
export const options = {};

export default async function (fastify, opts) {
  // Place here your custom code!

  // Do not touch the following lines

  // This loads all plugins defined in plugins
  // those should be support plugins that are reused
  // through your application
  fastify.register(AutoLoad, {
    dir: path.join(thisDirname, 'plugins'),
    options: { ...opts },
  });

  // This loads all plugins defined in routes
  // define your routes in one of these
  fastify.register(AutoLoad, {
    dir: path.join(thisDirname, 'routes'),
    options: { ...opts },
  });
}
