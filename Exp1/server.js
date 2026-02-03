const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const EventEmitter = require("events");

const eventEmitter = new EventEmitter();

const eventCount = {
    login: 0,
    logout: 0,
    purchase: 0,
    profileUpdate: 0
};

eventEmitter.on("user-login", (username) => {
    eventCount.login++;
    console.log(`User logged in: ${username}`);
});

eventEmitter.on("user-logout", (username) => {
    eventCount.logout++;
    console.log(`User logged out: ${username}`)
})

eventEmitter.on("user-purchase", (username, item) => {
    eventCount.purchase++;
    console.log(`User ${username} purchased ${item}`);
});

eventEmitter.on("profile-update", (username) => {
    eventCount.profileUpdate++;
    console.log(`User ${username} updated profile`);
});

eventEmitter.on("summary", () => {
    console.log("\nEVENT SUMMARY REPORT");
    console.log(`User Login Events: ${eventCount.login}`);
    console.log(`User Logout Events: ${eventCount.logout}`);
    console.log(`User Purchase Events: ${eventCount.purchase}`);
    console.log(`Profile Update Events: ${eventCount.profileUpdate}`);
});

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  if (pathname === '/' || pathname === '/index.html') {
    const filePath = path.join(__dirname, 'public', 'index.html');
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('404 Not Found');
        return;
      }
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(data);
    });
  } else if (pathname === '/style.css') {
    const filePath = path.join(__dirname, 'public', 'style.css');
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('404 Not Found');
        return;
      }
      res.writeHead(200, { 'Content-Type': 'text/css' });
      res.end(data);
    });
  } else if (pathname === '/script.js') {
    const filePath = path.join(__dirname, 'public', 'script.js');
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('404 Not Found');
        return;
      }
      res.writeHead(200, { 'Content-Type': 'application/javascript' });
      res.end(data);
    });
  }

  else if (pathname === '/api/login' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        eventEmitter.emit('user-login', data.username);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, message: 'Logged in successfully' }));
      } catch (error) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, message: 'Invalid request' }));
      }
    });
  }
  else if (pathname === '/api/logout' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        eventEmitter.emit('user-logout', data.username);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, message: 'Logged out successfully' }));
      } catch (error) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, message: 'Invalid request' }));
      }
    });
  }
  else if (pathname === '/api/purchase' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        eventEmitter.emit('user-purchase', data.username, data.product);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, message: 'Purchase successful' }));
      } catch (error) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, message: 'Invalid request' }));
      }
    });
  }
  else if (pathname === '/api/profile' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        eventEmitter.emit('profile-update', data.username);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, message: 'Profile updated successfully' }));
      } catch (error) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, message: 'Invalid request' }));
      }
    });
  }
  else if (pathname === '/api/activity' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, activity: eventCount }));
  }
  else if (pathname === '/api/summary' && req.method === 'GET') {
    eventEmitter.emit('summary');
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, eventCount }));
  }
  else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('404 Not Found');
  }
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log('\nServer running at http://localhost:' + PORT + '/');
  console.log('EventEmitter is active and tracking events\n');
});
