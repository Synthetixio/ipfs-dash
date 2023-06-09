const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const cp = require('node:child_process');

const indexHtml = fs.readFileSync('./index.html', 'utf-8');
const files = {
  'index.html': indexHtml,
  'favicon.ico': fs.readFileSync('./favicon.ico'),
  'main.js': fs.readFileSync('./main.js', 'utf-8'),
  'main.css': fs.readFileSync('./main.css', 'utf-8'),
};

const state = {
  peers: [],
};

function render() {
  return (files['index.html'] = indexHtml.replace('%%__STATE__%%', JSON.stringify(state, null, 2)));
}

const server = http.createServer((req, res) => {
  switch (true) {
    case req.url.endsWith('/api'): {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(state, null, 2), 'utf-8');
      return;
    }

    case req.url.endsWith('/favicon.ico'): {
      res.writeHead(200, { 'Content-Type': 'image/x-icon' });
      res.end(files['favicon.ico']);
      return;
    }

    case req.url.endsWith('/main.js'): {
      res.writeHead(200, { 'Content-Type': 'text/javascript' });
      res.end(files['main.js']);
      return;
    }

    case req.url.endsWith('/main.css'): {
      res.writeHead(200, { 'Content-Type': 'text/css' });
      res.end(files['main.css']);
      return;
    }

    case req.url.endsWith('/'): {
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(files['index.html']);
      return;
    }
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
        return resolve(
          result
            .map(({ id, peername, version }) => ({ id, peername, version }))
            .sort((a, b) => a.id.localeCompare(b.id))
        );
      } catch (e) {
        return resolve([]);
      }
      return resolve([]);
    })
  );
  Object.assign(state, { peers });
  render();
}
setInterval(updatePeers, 60_000);
Promise.all([updatePeers()]).then(() =>
  server.listen(3000, '0.0.0.0', () => console.log('Server running at http://0.0.0.0:3000/'))
);
