-- Veritabanı oluşturma
CREATE DATABASE ChatbotDB;
GO

USE ChatbotDB;
GO

-- Kullanıcı tablosu
CREATE TABLE Users (
    UserID INT IDENTITY(1,1) PRIMARY KEY,
    Email VARCHAR(255) NOT NULL UNIQUE,
    Name VARCHAR(100),
    PasswordHash VARCHAR(255) NOT NULL,
    PasswordSalt VARCHAR(255) NOT NULL,
    CreatedAt DATETIME NOT NULL DEFAULT GETDATE(),
    LastLogin DATETIME
);

-- Model tablosu (farklı AI modellerini temsil eder)
CREATE TABLE Models (
    ModelID INT IDENTITY(1,1) PRIMARY KEY,
    ModelName VARCHAR(100) NOT NULL UNIQUE,
    Description VARCHAR(500),
    APIEndpoint VARCHAR(255)
);

-- Sohbet geçmişi tablosu
CREATE TABLE Conversations (
    ConversationID INT IDENTITY(1,1) PRIMARY KEY,
    UserID INT NOT NULL,
    ModelID INT NOT NULL,
    StartedAt DATETIME NOT NULL DEFAULT GETDATE(),
    LastMessageAt DATETIME NOT NULL DEFAULT GETDATE(),
    Title VARCHAR(255),
    FOREIGN KEY (UserID) REFERENCES Users(UserID),
    FOREIGN KEY (ModelID) REFERENCES Models(ModelID)
);

-- Mesaj tablosu
CREATE TABLE Messages (
    MessageID INT IDENTITY(1,1) PRIMARY KEY,
    ConversationID INT NOT NULL,
    Content TEXT NOT NULL,
    Sender VARCHAR(50) NOT NULL, -- 'user' veya 'bot'
    SentAt DATETIME NOT NULL DEFAULT GETDATE(),
    FOREIGN KEY (ConversationID) REFERENCES Conversations(ConversationID)
);

-- Başlangıç verileri
INSERT INTO Models (ModelName, Description, APIEndpoint) 
VALUES 
('MathSolver', 'Matematik problemlerini çözen model', '/api/math-solver'),
('DeepSeek', 'Derinlemesine AI çözümleri sunan model', '/api/deepseek-solver');

GO

-- Örnek bir saklı prosedür: Kullanıcı kaydı için
CREATE PROCEDURE CreateUser
    @Email VARCHAR(255),
    @Name VARCHAR(100),
    @PasswordHash VARCHAR(255),
    @PasswordSalt VARCHAR(255)
AS
BEGIN
    INSERT INTO Users (Email, Name, PasswordHash, PasswordSalt, CreatedAt)
    VALUES (@Email, @Name, @PasswordHash, @PasswordSalt, GETDATE());
    
    SELECT SCOPE_IDENTITY() AS UserID;
END
GO

-- Örnek bir saklı prosedür: Kullanıcı girişi için
CREATE PROCEDURE AuthenticateUser
    @Email VARCHAR(255)
AS
BEGIN
    SELECT UserID, Email, Name, PasswordHash, PasswordSalt
    FROM Users
    WHERE Email = @Email;
    
    -- Başarılı giriş durumunda son giriş zamanını güncelle
    IF @@ROWCOUNT > 0
    BEGIN
        UPDATE Users
        SET LastLogin = GETDATE()
        WHERE Email = @Email;
    END
END
GO

-- Örnek bir saklı prosedür: Sohbet geçmişi getirme
CREATE PROCEDURE GetConversationHistory
    @UserID INT,
    @ModelName VARCHAR(100)
AS
BEGIN
    SELECT m.Content, m.Sender, m.SentAt
    FROM Messages m
    JOIN Conversations c ON m.ConversationID = c.ConversationID
    JOIN Models mod ON c.ModelID = mod.ModelID
    WHERE c.UserID = @UserID AND mod.ModelName = @ModelName
    ORDER BY m.SentAt ASC;
END
GO

-- Örnek bir saklı prosedür: Yeni mesaj ekleme
CREATE PROCEDURE AddMessage
    @UserID INT,
    @ModelName VARCHAR(100),
    @Content TEXT,
    @Sender VARCHAR(50)
AS
BEGIN
    DECLARE @ModelID INT;
    DECLARE @ConversationID INT;
    
    -- Model ID'sini bul
    SELECT @ModelID = ModelID FROM Models WHERE ModelName = @ModelName;
    
    -- Mevcut konuşmayı bul veya yeni oluştur
    SELECT TOP 1 @ConversationID = ConversationID 
    FROM Conversations 
    WHERE UserID = @UserID AND ModelID = @ModelID
    ORDER BY LastMessageAt DESC;
    
    IF @ConversationID IS NULL
    BEGIN
        INSERT INTO Conversations (UserID, ModelID, StartedAt, LastMessageAt)
        VALUES (@UserID, @ModelID, GETDATE(), GETDATE());
        
        SET @ConversationID = SCOPE_IDENTITY();
    END
    ELSE
    BEGIN
        UPDATE Conversations
        SET LastMessageAt = GETDATE()
        WHERE ConversationID = @ConversationID;
    END
    
    -- Mesajı ekle
    INSERT INTO Messages (ConversationID, Content, Sender, SentAt)
    VALUES (@ConversationID, @Content, @Sender, GETDATE());
    
    -- Eklenen mesajın ID'sini döndür
    SELECT SCOPE_IDENTITY() AS MessageID;
END
GO