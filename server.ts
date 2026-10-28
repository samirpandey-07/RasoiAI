import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import app from './api/app';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = Number(process.env.PORT) || 3000;

// Setup Vite middleware in dev or static files in production
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // When run directly from dist/server.js, __dirname is already the dist folder
    const distPath = fs.existsSync(path.resolve(__dirname, 'index.html'))
      ? __dirname
      : path.resolve(__dirname, 'dist');

    app.use(express.static(distPath, { maxAge: '1d', etag: true }));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`Smart Kitchen AI server running in ${isProduction ? 'PRODUCTION' : 'DEVELOPMENT'} mode at http://0.0.0.0:${PORT}`);
  });

  const gracefulShutdown = (signal: string) => {
    console.log(`Received ${signal}, gracefully shutting down HTTP server...`);
    server.close(() => {
      console.log('Server terminated cleanly.');
      process.exit(0);
    });
    setTimeout(() => {
      console.error('Graceful shutdown timeout exceeded, forcefully terminating.');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
}

// Only start listening when run directly, not in Vercel serverless context
if (!process.env.VERCEL) {
  startServer();
}

export default app;
