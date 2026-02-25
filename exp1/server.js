const http = require("http");
const fs = require("fs");
const path = require("path");
const EventEmitter = require("events");

const PORT = 3000;
const emitter = new EventEmitter();

const registerEvents = require("./events");
registerEvents(emitter);

let loginCount = 0;
let logoutCount = 0;
let purchaseCount = 0;
let updateCount = 0;

emitter.on("login", (user) => {
  loginCount++;
  console.log("LOGIN:", user);
});

emitter.on("logout", (user) => {
  logoutCount++;
  console.log("LOGOUT:", user);
});

emitter.on("purchase", (user, item) => {
  purchaseCount++;
  console.log("PURCHASE:", user, "purchased", item);
});

emitter.on("update", (oldName, newName) => {
  updateCount++;
  console.log("UPDATE:", oldName, "→", newName);
});

emitter.on("summary", () => {
  console.log("----- USER ACTIVITY SUMMARY -----");
  console.log("Login Count   :", loginCount);
  console.log("Logout Count  :", logoutCount);
  console.log("Purchase Count:", purchaseCount);
  console.log("Update Count  :", updateCount);
  console.log("---------------------------------");
});

function serveStaticFile(filePath, res) {
  const ext = path.extname(filePath);
  const typeMap = {
    ".html": "text/html",
    ".css": "text/css",
    ".js": "text/javascript",
    ".png": "image/png",
    ".jpg": "image/jpeg"
  };

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end("File not found");
      return;
    }
    res.writeHead(200, {
      "Content-Type": typeMap[ext] || "text/plain"
    });
    res.end(data);
  });
}

function getRequestBody(req, callback) {
  let body = "";
  req.on("data", chunk => body += chunk);
  req.on("end", () => callback(JSON.parse(body || "{}")));
}

const server = http.createServer((req, res) => {
  if (req.method === "POST") {

    if (req.url === "/login") {
      return getRequestBody(req, body => {
        emitter.emit("login", body.username);
        res.writeHead(200);
        res.end();
      });
    }

    if (req.url === "/purchase") {
      return getRequestBody(req, body => {
        emitter.emit("purchase", body.username, body.item);
        res.writeHead(200);
        res.end();
      });
    }

    if (req.url === "/update") {
      return getRequestBody(req, body => {
        emitter.emit("update", body.oldName, body.newName);
        res.writeHead(200);
        res.end();
      });
    }

    if (req.url === "/logout") {
      return getRequestBody(req, body => {
        emitter.emit("logout", body.username);
        res.writeHead(200);
        res.end();
      });
    }

    if (req.url === "/summary") {
      emitter.emit("summary");
      res.writeHead(200);
      return res.end();
    }
  }

  let filePath = path.join(
    __dirname,
    "public",
    req.url === "/" ? "index.html" : req.url
  );

  serveStaticFile(filePath, res);
});

server.listen(PORT, () => {
  console.log("Server running at http://localhost:" + PORT);
});
