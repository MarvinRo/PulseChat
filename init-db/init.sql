-- Garante que estamos usando o banco correto caso ele já exista
USE pulse_app;

CREATE TABLE IF NOT EXISTS user (
    id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT NULL,
    deleted_at DATETIME DEFAULT NULL
);