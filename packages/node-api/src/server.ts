/* eslint-disable */
import buildDebug from 'debug';
import _, { assign, isFunction } from 'lodash';
import constants from 'node:constants';
import fs from 'node:fs';
import http from 'node:http';
import https from 'node:https';
import url from 'node:url';

import { getConfigParsed, getListenAddress } from '@verdaccio/config';
import { DEFAULT_PORT } from '@verdaccio/core';
import { logger, setup } from '@verdaccio/logger';
import expressServer from '@verdaccio/server';
import fastifyServer from '@verdaccio/server-fastify';
import { ConfigYaml, HttpsConfKeyCert, HttpsConfPfx } from '@verdaccio/types';

import { displayExperimentsInfoBox } from './experiments';

const debug = buildDebug('verdaccio:node-api');

function unlinkAddressPath(addr) {
  if (addr.path && fs.existsSync(addr.path)) {
    fs.unlinkSync(addr.path);
  }
}

/**
 * Return a native HTTP/HTTPS server instance
 * @param config
 * @param addr
 * @param app
 */
export function createServerFactory(config: ConfigYaml, addr, app) {
  let serverFactory;
  if (addr.proto === 'https') {
    debug('https enabled');
    try {
      let httpsOptions = {
        // disable insecure SSLv2 and SSLv3
        secureOptions: constants.SSL_OP_NO_SSLv2 | constants.SSL_OP_NO_SSLv3,
      };

      const keyCertConfig = config.https as HttpsConfKeyCert;
      const pfxConfig = config.https as HttpsConfPfx;

      // https must either have key and cert or a pfx and (optionally) a passphrase
      if (!((keyCertConfig.key && keyCertConfig.cert) || pfxConfig.pfx)) {
        // logHTTPSError(configPath);
        throw Error('bad format https configuration');
      }

      if (pfxConfig.pfx) {
        const { pfx, passphrase } = pfxConfig;
        httpsOptions = assign(httpsOptions, {
          pfx: fs.readFileSync(pfx),
          passphrase: passphrase || '',
        });
      } else {
        const { key, cert, ca } = keyCertConfig;
        httpsOptions = assign(httpsOptions, {
          key: fs.readFileSync(key),
          cert: fs.readFileSync(cert),
          ...(ca && {
            ca: fs.readFileSync(ca),
          }),
        });
      }
      // TODO: enable http2 as feature
      // if (config.server.http2) <-- check if force http2
      serverFactory = https.createServer(httpsOptions, app);
    } catch (err: any) {
      throw new Error(`cannot create https server: ${err.message}`);
    }
  } else {
    // http
    debug('http enabled');
    serverFactory = http.createServer(app);
  }

  // List of all routes registered in the app
  function printRoutes(layer) {
    if (layer.route) {
      debug('%s (%s)', layer.route.path, Object.keys(layer.route.methods).join(', '));
    } else if (layer.name === 'router') {
      layer.handle.stack.forEach((nestedLayer) => {
        printRoutes(nestedLayer);
      });
    }
  }

  debug('registered routes:');
  app._router.stack.forEach(printRoutes);

  if (
    config.server &&
    typeof config.server.keepAliveTimeout !== 'undefined' &&
    // @ts-ignore
    config.server.keepAliveTimeout !== 'null'
  ) {
    // library definition for node is not up to date (doesn't contain recent 8.0 changes)
    serverFactory.keepAliveTimeout = config.server.keepAliveTimeout * 1000;
  }
  // FIXE: I could not find the reason of this code.
  unlinkAddressPath(addr);

  return serverFactory;
}

/**
 * Start the server on the port defined
 * @param config
 * @param port
 * @param version
 * @param pkgName
 */
export async function initServer(
  config: ConfigYaml,
  port: string | void,
  version: string,
  pkgName: string
): Promise<void> {
  return new Promise(async (resolve, reject) => {
    const logger = setup(config?.log as any);
    const combined: string | undefined | any[] = [port, config?.listen, DEFAULT_PORT];
    const addr = getListenAddress(combined, logger);
    displayExperimentsInfoBox(config.flags);

    let app;
    if (process.env.VERDACCIO_SERVER === 'fastify') {
      app = await fastifyServer(config);
      app.listen({ port: addr.port, host: addr.host }, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    } else {
      app = await expressServer(config);
      const serverFactory = createServerFactory(config, addr, app);
      serverFactory
        .listen(addr.port || addr.path, addr.host, (): void => {
          // send a message for test
          if (isFunction(process.send)) {
            process.send({
              verdaccio_started: true,
            });
          }
          const addressServer = `${
            addr.path
              ? url.format({
                  protocol: 'unix',
                  pathname: addr.path,
                })
              : url.format({
                  protocol: addr.proto,
                  hostname: addr.host,
                  port: addr.port,
                  pathname: '/',
                })
          }`;
          logger.info({ addressServer }, 'http address: @{addressServer}');
          logger.info({ version }, 'version: @{version}');
          resolve();
        })
        .on('error', function (err): void {
          reject(err);
          process.exitCode = 1;
        });
      function handleShutdownGracefully() {
        logger.info('received shutdown signal - closing server gracefully...');
        serverFactory.close(() => {
          logger.info('server closed.');
          process.exit(0);
        });
      }

      for (const signal of ['SIGINT', 'SIGTERM', 'SIGHUP']) {
        // Use once() so that receiving double signals exit the app.
        process.once(signal, handleShutdownGracefully);
      }
    }
  });
}

/**
 * Exposes a server factory to be instantiated programmatically.
 *
    ```ts
    const app = await runServer(); // default configuration
    const app = await runServer('./config/config.yaml');
    const app = await runServer({ configuration });
    app.listen(4000, (event) => {
    // do something
    });
    ```
 * @param config
 */
export async function runServer(config?: string | ConfigYaml): Promise<any> {
  const configurationParsed = getConfigParsed(config);
  setup(configurationParsed.log as any);
  displayExperimentsInfoBox(configurationParsed.flags);
  // FIXME: get only the first match, the multiple address will be removed
  const combined: string | undefined | any[] = [configurationParsed?.listen, DEFAULT_PORT];
  const addr = getListenAddress(combined, logger);
  const app = await expressServer(configurationParsed);
  return createServerFactory(configurationParsed, addr, app);
}
