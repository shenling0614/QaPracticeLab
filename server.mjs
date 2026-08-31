import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT) || 4173;
const ALLOWED_ROLES = new Set(['qa-engineer', 'qa-lead', 'sdet']);
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DUPLICATE_MESSAGE = 'An application with this email already exists';

const submittedEmails = new Set(['applied@example.com']);

function json(response, status, body) {
  const payload = JSON.stringify(body);
  response.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(payload),
  });
  response.end(payload);
}

function readBody(request) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    request.on('data', (chunk) => chunks.push(chunk));
    request.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    request.on('error', reject);
  });
}

function validate(body) {
  const fullName = typeof body.fullName === 'string' ? body.fullName.trim() : '';
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  const role = typeof body.role === 'string' ? body.role : '';
  const errors = [];

  if (!fullName) {
    errors.push('Full name is required');
  }
  if (!email) {
    errors.push('Email is required');
  } else if (!EMAIL_PATTERN.test(email)) {
    errors.push('Enter a valid email');
  }
  if (!role) {
    errors.push('Role is required');
  } else if (!ALLOWED_ROLES.has(role)) {
    errors.push('Role is required');
  }

  return { errors, fullName, email, role };
}

function mimeType(filePath) {
  if (filePath.endsWith('.html')) {
    return 'text/html; charset=utf-8';
  }
  if (filePath.endsWith('.css')) {
    return 'text/css; charset=utf-8';
  }
  return 'application/octet-stream';
}

function serveStatic(urlPath, response) {
  const relative = urlPath === '/' ? '/index.html' : urlPath;
  const filePath = path.normalize(path.join(__dirname, relative));
  if (!filePath.startsWith(__dirname)) {
    response.writeHead(403);
    response.end();
    return;
  }

  fs.readFile(filePath, (error, data) => {
    if (error) {
      response.writeHead(404);
      response.end('Not found');
      return;
    }
    response.writeHead(200, { 'Content-Type': mimeType(filePath) });
    response.end(data);
  });
}

const server = http.createServer(async (request, response) => {
  const url = new URL(request.url, `http://127.0.0.1:${PORT}`);

  if (request.method === 'POST' && url.pathname === '/api/applications') {
    let body;
    try {
      body = JSON.parse((await readBody(request)) || '{}');
    } catch {
      json(response, 400, { errors: ['Invalid request'] });
      return;
    }

    const { errors, email } = validate(body);
    if (errors.length) {
      json(response, 400, { errors });
      return;
    }
    if (submittedEmails.has(email)) {
      json(response, 409, { errors: [DUPLICATE_MESSAGE] });
      return;
    }

    submittedEmails.add(email);
    json(response, 201, { confirmation: 'QA-1001' });
    return;
  }

  if (request.method === 'GET') {
    serveStatic(url.pathname, response);
    return;
  }

  response.writeHead(405);
  response.end();
});

server.listen(PORT, '127.0.0.1', () => {
  process.stdout.write(`QA Practice Lab at http://127.0.0.1:${PORT}\n`);
});
