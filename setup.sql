
-- SQL script to create chatapp database and users table

CREATE DATABASE IF NOT EXISTS chatapp;
USE chatapp;

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(100) NOT NULL
);
