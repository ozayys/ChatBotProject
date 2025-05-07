-- MySQL şema dosyası - MathChat uygulaması için

CREATE DATABASE IF NOT EXISTS mathchatdb CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE mathchatdb;

-- Kullanıcılar tablosu
CREATE TABLE IF NOT EXISTS users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    username VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    password_salt VARCHAR(255) NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_login DATETIME NULL
);

-- Sohbetler tablosu
CREATE TABLE IF NOT EXISTS chats (
    chat_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- Mesajlar tablosu
CREATE TABLE IF NOT EXISTS messages (
    message_id INT AUTO_INCREMENT PRIMARY KEY,
    chat_id INT NOT NULL,
    sender ENUM('user', 'assistant') NOT NULL,
    content TEXT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (chat_id) REFERENCES chats(chat_id)
);

-- Saklı prosedürler

-- Kullanıcı oluşturma
DELIMITER //
CREATE PROCEDURE CreateUser(
    IN p_email VARCHAR(255),
    IN p_username VARCHAR(255),
    IN p_password_hash VARCHAR(255),
    IN p_password_salt VARCHAR(255)
)
BEGIN
    INSERT INTO users(email, username, password_hash, password_salt, created_at)
    VALUES(p_email, p_username, p_password_hash, p_password_salt, NOW());
    
    SELECT LAST_INSERT_ID() as user_id;
END //
DELIMITER ;

-- Kullanıcı kimlik doğrulaması
DELIMITER //
CREATE PROCEDURE AuthenticateUser(
    IN p_email VARCHAR(255)
)
BEGIN
    SELECT user_id, email, username, password_hash, password_salt, created_at
    FROM users
    WHERE email = p_email;
    
    -- Son giriş zamanını güncelle
    UPDATE users SET last_login = NOW() WHERE email = p_email;
END //
DELIMITER ;

-- Sohbet oluşturma
DELIMITER //
CREATE PROCEDURE CreateChat(
    IN p_user_id INT,
    IN p_title VARCHAR(255)
)
BEGIN
    INSERT INTO chats(user_id, title, created_at, updated_at)
    VALUES(p_user_id, p_title, NOW(), NOW());
    
    SELECT LAST_INSERT_ID() as chat_id;
END //
DELIMITER ;

-- Mesaj oluşturma
DELIMITER //
CREATE PROCEDURE CreateMessage(
    IN p_chat_id INT,
    IN p_sender ENUM('user', 'assistant'),
    IN p_content TEXT
)
BEGIN
    INSERT INTO messages(chat_id, sender, content, created_at)
    VALUES(p_chat_id, p_sender, p_content, NOW());
    
    -- Sohbet güncelleme zamanını otomatik günceller

    SELECT LAST_INSERT_ID() as message_id;
END //
DELIMITER ;

-- Kullanıcının sohbetlerini getirme
DELIMITER //
CREATE PROCEDURE GetUserChats(
    IN p_user_id INT
)
BEGIN
    SELECT c.chat_id, c.title, c.created_at, c.updated_at,
           (SELECT content FROM messages 
            WHERE chat_id = c.chat_id 
            ORDER BY created_at DESC LIMIT 1) as last_message
    FROM chats c
    WHERE c.user_id = p_user_id
    ORDER BY c.updated_at DESC;
END //
DELIMITER ;

-- Bir sohbetin mesajlarını getirme
DELIMITER //
CREATE PROCEDURE GetChatMessages(
    IN p_chat_id INT
)
BEGIN
    SELECT message_id, sender, content, created_at
    FROM messages
    WHERE chat_id = p_chat_id
    ORDER BY created_at ASC;
END //
DELIMITER ; 