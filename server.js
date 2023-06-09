const http = require('http');
const fs = require('fs');
const path = require('path');
const cp = require('child_process');

const indexHtml = fs.readFileSync('./index.html', 'utf-8');
const files = {
  '/': {
    content: indexHtml,
    contentType: 'text/html',
  },
  '/favicon.ico': {
    content: fs.readFileSync('./favicon.ico'),
    contentType: 'image/x-icon',
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

const state = {
  peers: [],
};

function render() {
  return (files['/'].content = indexHtml.replace('%%__STATE__%%', JSON.stringify(state, null, 2)));
}

const server = http.createServer((req, res) => {
  if (req.url === '/api') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(state, null, 2), 'utf-8');
    return;
  }
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

async function updatePeers() {
  const peers = await new Promise((resolve) =>
    cp.exec("ipfs-cluster-ctl --enc=json peers ls | jq '[inputs]'", (err, stdout, stderr) => {
      if (err) {
        console.error(err);
        return resolve([]);
      }
      if (stderr) {
        console.error(new Error(stderr));
        return resolve([]);
      }
      try {
        const result = JSON.parse(stdout);
        return resolve(result.map(({ id, peername, version }) => ({ id, peername, version })));
      } catch (e) {
        return resolve([]);
      }
      return resolve([]);
    })
  );
  console.log(`peers`, peers);
  Object.assign(state, { peers });
  render();
}
setInterval(updatePeers, 10_000);
Promise.all([updatePeers()]).then(() =>
  server.listen(3000, '0.0.0.0', () => console.log('Server running at http://0.0.0.0:3000/'))
);
