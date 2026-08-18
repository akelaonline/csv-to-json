const path = require('node:path');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const multer = require('multer');
const { rateLimit } = require('express-rate-limit');
const fileRoutes = require('./routes/fileRoutes');
const packageJson = require('./package.json');

const app = express();

app.disable('x-powered-by');

if (process.env.TRUST_PROXY === 'true') {
  app.set('trust proxy', 1);
}

app.use(helmet());
app.use(express.json({ limit: '100kb' }));

const configuredOrigins = (process.env.CORS_ORIGIN || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

if (configuredOrigins.length > 0) {
  app.use(cors({
    origin(origin, callback) {
      if (!origin || configuredOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(Object.assign(new Error('Origin not allowed by CORS'), { status: 403 }));
    }
  }));
}

app.use(express.static(path.join(__dirname, 'public'), {
  etag: true,
  maxAge: process.env.NODE_ENV === 'production' ? '1h' : 0
}));

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: packageJson.name,
    version: packageJson.version,
    uptimeSeconds: Math.round(process.uptime())
  });
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: Number(process.env.RATE_LIMIT_MAX || 30),
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { error: 'Too many requests. Please try again later.' }
});

app.use('/api', apiLimiter);
app.use('/api/files', fileRoutes);

app.use('/api', (req, res) => {
  res.status(404).json({ error: 'API route not found' });
});

app.use((err, req, res, next) => { // eslint-disable-line no-unused-vars
  let status = Number(err.status || err.statusCode || 500);
  let message = err.message || 'Something went wrong';

  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      status = 413;
      message = 'File is too large';
    } else {
      status = 400;
      message = `Upload error: ${err.message}`;
    }
  }

  if (status >= 500) {
    console.error(err);
    message = 'Internal server error';
  }

  const body = { error: message };
  if (process.env.NODE_ENV !== 'production' && err.code && status < 500) {
    body.code = err.code;
  }

  res.status(status).json(body);
});

function startServer() {
  const port = Number(process.env.PORT || 3001);
  const server = app.listen(port, () => {
    console.log(`AI Data Prep Converter v${packageJson.version} listening on port ${port}`);
  });

  server.requestTimeout = Number(process.env.REQUEST_TIMEOUT_MS || 30000);
  server.headersTimeout = Number(process.env.HEADERS_TIMEOUT_MS || 15000);
  server.keepAliveTimeout = Number(process.env.KEEP_ALIVE_TIMEOUT_MS || 5000);

  return server;
}

if (require.main === module) {
  startServer();
}

module.exports = { app, startServer };
