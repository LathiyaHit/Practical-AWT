const db = require("./db");

function registerEvents(emitter) {
  emitter.on("login", (user) => {
    console.log("LOGIN:", user);

    db.query(
      "INSERT IGNORE INTO users (username) VALUES (?)",
      [user]
    );

    db.query(
      "INSERT INTO activity_log (username, event_type) VALUES (?, 'login')",
      [user]
    );
  });

  emitter.on("logout", (user) => {
    console.log("LOGOUT:", user);

    db.query(
      "INSERT INTO activity_log (username, event_type) VALUES (?, 'logout')",
      [user]
    );
  });

  emitter.on("purchase", (user, item) => {
    console.log("PURCHASE:", user, "purchased", item);

    db.query(
      "INSERT INTO activity_log (username, event_type, item_name) VALUES (?, 'purchase', ?)",
      [user, item]
    );
  });

  emitter.on("update", (oldName, newName) => {
    console.log("UPDATE:", oldName, "→", newName);

    db.query(
      "UPDATE users SET username = ? WHERE username = ?",
      [newName, oldName]
    );

    db.query(
      "INSERT INTO activity_log (username, event_type) VALUES (?, 'update')",
      [newName]
    );
  });

  emitter.on("summary", () => {
    db.query(
      "SELECT event_type, COUNT(*) AS total FROM activity_log GROUP BY event_type",
      (err, results) => {
        if (err) return console.log(err);

        console.log("------ ACTIVITY SUMMARY ------");
        console.table(results);
      }
    );
  });
}

module.exports = registerEvents;
