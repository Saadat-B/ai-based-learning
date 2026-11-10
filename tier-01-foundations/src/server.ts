import { app } from './app.js';
import { config } from './config.js';

const SHUTDOWN_TIMEOUT_MS = 8_000;

const server = app.listen(config.PORT, (err) => {
  if (err) {
    console.error(`Could not start server: ${err.message}`);
    process.exit(1);
  }
  console.log(`[${config.NODE_ENV}] listening on http://localhost:${config.PORT}`);
});

let shuttingDown = false;

function shutdown(signal: NodeJS.Signals): void {
  if (shuttingDown) return;
  shuttingDown = true;
  console.log(`${signal} received: no new connections, waiting for in-flight requests`);

  const forceExit = setTimeout(() => {
    console.error(`Still open after ${SHUTDOWN_TIMEOUT_MS}ms, forcing exit`);
    process.exit(1);
  }, SHUTDOWN_TIMEOUT_MS);
  forceExit.unref();

  server.close((closeErr) => {
    clearTimeout(forceExit);
    if (closeErr) {
      console.error(closeErr);
      process.exit(1);
    }
    console.log('All connections closed, exiting cleanly');
    process.exit(0);
  });
}

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
