-- Database initialization script for Docker
-- This script runs automatically when MySQL container starts

-- Create database if it doesn't exist
CREATE DATABASE IF NOT EXISTS chat_app CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Use the database
USE chat_app;

-- Create user if it doesn't exist
CREATE USER IF NOT EXISTS 'chat_user'@'%' IDENTIFIED BY 'chat_password';

-- Grant privileges to the user
GRANT ALL PRIVILEGES ON chat_app.* TO 'chat_user'@'%';

-- Flush privileges to apply changes
FLUSH PRIVILEGES;

-- Create messages table if it doesn't exist (fallback)
CREATE TABLE IF NOT EXISTS messages (
    id VARCHAR(36) PRIMARY KEY,
    userId VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    room VARCHAR(100) DEFAULT 'general',
    metadata JSON,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_room_timestamp (room, timestamp),
    INDEX idx_userId (userId)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create migrations table if it doesn't exist
CREATE TABLE IF NOT EXISTS migrations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    timestamp BIGINT NOT NULL,
    name VARCHAR(255) NOT NULL,
    UNIQUE KEY unique_migration (timestamp, name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert sample data (optional)
INSERT IGNORE INTO messages (id, userId, content, room, timestamp) VALUES
('sample-1', 'System', 'Welcome to the chat! 🎉', 'general', NOW()),
('sample-2', 'System', 'Join different rooms to start chatting!', 'general', NOW()),
('sample-3', 'System', 'Music lovers, join the music room! 🎵', 'music', NOW()),
('sample-4', 'System', 'Tech discussions happen here! 💻', 'tech', NOW());

-- Show confirmation
SELECT 'Database chat_app initialized successfully!' as status; 