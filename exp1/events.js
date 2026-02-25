const db = require("./db");

function safeQuery(sql, params=[]) {
  db.query(sql, params, (err) => {
    if (err) {
      console.log("DB ERROR:", err.message);
    }
  });
}

function registerEvents(emitter) {

  emitter.on("login", (user) => {

    safeQuery(
      "INSERT IGNORE INTO users (username) VALUES (?)",
      [user]
    );

    safeQuery(
      "INSERT INTO activity_log (username, event_type) VALUES (?, 'login')",
      [user]
    );
  });

  emitter.on("logout", (user) => {

    safeQuery(
      "INSERT INTO activity_log (username, event_type) VALUES (?, 'logout')",
      [user]
    );
  });

  emitter.on("purchase", (user, item) => {

    safeQuery(
      "INSERT INTO activity_log (username, event_type, item_name) VALUES (?, 'purchase', ?)",
      [user, item]
    );
  });

  emitter.on("update", (oldName, newName) => {

    safeQuery(
      "UPDATE users SET username = ? WHERE username = ?",
      [newName, oldName]
    );

    safeQuery(
      "INSERT INTO activity_log (username, event_type) VALUES (?, 'update')",
      [newName]
    );
  });
}

module.exports = registerEvents;
