-- SQL Stored Procedure to get user by username
-- Run this on your database

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
