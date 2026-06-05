// Custom Node entry point. Mirrors IPTV (cheapstreamtv.com) — same
// Contabo + nginx + Cloudflare stack, no navigation bug. They ship a
// custom server.js wrapping next({...}).getRequestHandler() instead of
// running `next start` directly. Matching that runtime model is the
// last remaining variable in the production navigation-bug
// investigation.
//
// Differences from IPTV's server.js:
//   - No socket.io integration here — our sockets live in a separate
//     service (NotificationContext connects to NEXT_PUBLIC_SOCKET_URL),
//     not on this Node process.
//   - Port defaults to 3001 to match our existing Dockerfile and
//     docker-compose port mappings.

const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');

const dev = process.env.NODE_ENV !== 'production';
const isProd = process.env.NODE_ENV === 'production';
const hostname = process.env.HOSTNAME || '0.0.0.0';
const port = parseInt(process.env.PORT || '3001', 10);

// Graceful shutdown — give in-flight requests a chance to drain before
// the process exits.
let isShuttingDown = false;
const gracefulShutdown = signal => {
  if (isShuttingDown) return;
  isShuttingDown = true;
  console.log(`[${signal}] Graceful shutdown started`);
  setTimeout(() => {
    console.log('[Shutdown] Forcing exit after timeout');
    process.exit(0);
  }, 10000);
};
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Surface uncaught errors instead of silently dying. In prod, exit
// so the container's restart policy can recover; in dev, keep going.
process.on('uncaughtException', err => {
  console.error('[Fatal] Uncaught Exception:', err.message);
  console.error(err.stack);
  if (isProd) process.exit(1);
});
process.on('unhandledRejection', reason => {
  console.error('[Error] Unhandled Rejection:', reason);
  if (isProd) process.exit(1);
});

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app
  .prepare()
  .then(() => {
    const httpServer = createServer(async (req, res) => {
      try {
        const parsedUrl = parse(req.url, true);
        await handle(req, res, parsedUrl);
      } catch (err) {
        console.error('Error handling request', req.url, err);
        res.statusCode = 500;
        res.end('internal server error');
      }
    });

    httpServer
      .once('error', err => {
        console.error('Server error:', err);
        process.exit(1);
      })
      .listen(port, hostname, () => {
        console.log(`> Ready on http://${hostname}:${port}`);
        console.log(`> Environment: ${dev ? 'development' : 'production'}`);
      });
  })
  .catch(err => {
    console.error('Next.js failed to prepare:', err);
    process.exit(1);
  });
