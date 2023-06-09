const http = require('http');
const fs = require('fs');
const path = require('path');

const mimeTypes = {
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
};

const files = {
  '/index.html': {
    content: fs.readFileSync('./index.html', 'utf-8'),
    contentType: 'text/html',
  },
  '/main.js': {
    content: fs.readFileSync('./main.js', 'utf-8'),
    contentType: 'text/javascript',
  },
  '/main.css': {
    content: fs.readFileSync('./main.css', 'utf-8'),
    contentType: 'text/css',
  },
};
files['/'] = files['/index.html'];

const server = http.createServer((req, res) => {
  if (req.url in files) {
    const file = files[req.url];
    res.writeHead(200, { 'Content-Type': file.contentType });
    res.end(file.content, 'utf-8');
    return;
  }
  res.writeHead(404, { 'Content-Type': 'text/html' });
  res.end('Not Found', 'utf-8');
  return;
});

server.listen(3000, '0.0.0.0', () => console.log('Server running at http://0.0.0.0:3000/'));
