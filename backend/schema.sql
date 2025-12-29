-- schema.sql
CREATE DATABASE IF NOT EXISTS agri_advisor CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE agri_advisor;

CREATE TABLE IF NOT EXISTS farmers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(128),
  phone VARCHAR(20) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  village VARCHAR(255),
  district VARCHAR(255),
  state VARCHAR(255),
  lat DOUBLE,
  lng DOUBLE,
  land_size DECIMAL(8,2) DEFAULT 0.0,
  soil_type VARCHAR(64),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS admins (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(64) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(32) DEFAULT 'superadmin',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS recommendations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  farmer_id INT NOT NULL,
  input_json JSON NOT NULL,
  recommended_json JSON NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (farmer_id) REFERENCES farmers(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS soil_tests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  farmer_id INT NOT NULL,
  ph DECIMAL(4,2),
  n INT,
  p INT,
  k INT,
  moisture DECIMAL(5,2),
  test_date DATE,
  notes TEXT,
  FOREIGN KEY (farmer_id) REFERENCES farmers(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS pest_reports (
  id INT AUTO_INCREMENT PRIMARY KEY,
  farmer_id INT NOT NULL,
  image_path VARCHAR(512),
  predicted_label VARCHAR(128),
  confidence DECIMAL(5,2),
  advisory_json JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (farmer_id) REFERENCES farmers(id) ON DELETE CASCADE
);
