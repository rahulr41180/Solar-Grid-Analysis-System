-- Solar Grid backend schema (MySQL 8+)

CREATE TABLE IF NOT EXISTS users (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  email         VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS scenes (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  user_id     INT NULL,
  name        VARCHAR(255) NOT NULL,
  data        JSON NOT NULL,
  share_token VARCHAR(64) NULL UNIQUE,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_scene_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_scenes_user (user_id)
);

CREATE TABLE IF NOT EXISTS analyses (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  scene_id      INT NOT NULL,
  kind          VARCHAR(32) NOT NULL DEFAULT 'snapshot', -- 'snapshot' | 'daily'
  sun_azimuth   DOUBLE NULL,
  sun_elevation DOUBLE NULL,
  result        JSON NOT NULL,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_analysis_scene FOREIGN KEY (scene_id) REFERENCES scenes(id) ON DELETE CASCADE,
  INDEX idx_analyses_scene (scene_id)
);

CREATE TABLE IF NOT EXISTS presets (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(255) NOT NULL UNIQUE,
  description TEXT NULL,
  data        JSON NOT NULL
);
