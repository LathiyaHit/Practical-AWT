DROP DATABASE IF EXISTS shopping_db;
CREATE DATABASE shopping_db;
USE shopping_db;

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) UNIQUE,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE activity_log (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100),
    event_type ENUM('login','logout','purchase','update'),
    item_name VARCHAR(100),
    event_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

SELECT * FROM users;
SELECT * FROM activity_log;

