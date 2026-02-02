-- ============================================
-- DATABASE FIXES for Admin Login
-- Run these scripts on your MilkBilling database
-- ============================================

-- 1. Create stored procedure to get user by username
CREATE OR ALTER PROCEDURE sp_GetUserByUsername
    @UserName NVARCHAR(100)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        UserId,
        UserName,
        Email,
        Password,  -- BCrypt hashed password
        ActiveStatus,
        CreatedDate,
        SubscriptionEndDate
    FROM Users
    WHERE UserName = @UserName;
END
GO

-- 2. Check if admin user exists
SELECT * FROM Users WHERE UserId = 1 OR LOWER(UserName) = 'admin';
GO

-- 3. If admin doesn't exist, create admin user
-- IMPORTANT: Replace 'admin123' with your desired admin password
-- The password will be hashed by the application
IF NOT EXISTS (SELECT 1 FROM Users WHERE UserId = 1)
BEGIN
    INSERT INTO Users (UserName, Email, Password, ActiveStatus, CreatedDate)
    VALUES (
        'admin',
        'admin@milkbilling.com',
        '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- BCrypt hash for 'password'
        1,  -- Active
        GETDATE()
    );

    PRINT 'Admin user created with username: admin, password: password';
    PRINT 'PLEASE CHANGE THIS PASSWORD IMMEDIATELY AFTER FIRST LOGIN!';
END
ELSE
BEGIN
    PRINT 'Admin user already exists';
END
GO

-- 4. Verify all passwords are BCrypt hashed (should start with $2a$ or $2y$)
SELECT
    UserId,
    UserName,
    CASE
        WHEN Password LIKE '$2a$%' OR Password LIKE '$2y$%' THEN 'BCrypt Hashed ✓'
        ELSE 'PLAIN TEXT - NEEDS HASHING! ✗'
    END AS PasswordStatus,
    ActiveStatus
FROM Users;
GO

-- 5. If you need to manually hash passwords (for testing)
-- Use this to generate BCrypt hash in C#:
-- BCrypt.Net.BCrypt.HashPassword("yourpassword", 10);

-- 6. Ensure admin user is active
UPDATE Users
SET ActiveStatus = 1
WHERE UserId = 1 OR LOWER(UserName) = 'admin';
GO

-- 7. Check admin stored procedure
CREATE OR ALTER PROCEDURE sp_AdminLogin
    @UserName NVARCHAR(100),
    @Password NVARCHAR(500)
AS
BEGIN
    SET NOCOUNT ON;

    -- Get admin user (only admin table)
    SELECT
        AdminId,
        UserName,
        Password,  -- BCrypt hashed
        IsActive,
        CreatedDate
    FROM Admins
    WHERE UserName = @UserName;
END
GO
