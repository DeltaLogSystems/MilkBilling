# Admin Login Debug Guide

## Step-by-Step Fix Process

### Step 1: Fix Backend AuthController

**File:** `Controllers/AuthController.cs`

**Issue:** Duplicate password verification

**Fix:** Replace Login method with code from `COMPLETE_FIX_AuthController.cs`

### Step 2: Add Repository Method

**File:** `Repositories/UserRepository.cs`

**Add Method:**
```csharp
public async Task<User> GetUserByUsernameAsync(string username)
{
    var parameters = new DynamicParameters();
    parameters.Add("@UserName", username);

    using (var connection = new SqlConnection(_connectionString))
    {
        return await connection.QueryFirstOrDefaultAsync<User>(
            "sp_GetUserByUsername",
            parameters,
            commandType: CommandType.StoredProcedure
        );
    }
}
```

**Add Interface:**
```csharp
// IUserRepository.cs
Task<User> GetUserByUsernameAsync(string username);
```

### Step 3: Run Database Scripts

Execute all scripts in `DATABASE_FIXES.sql`:
1. Create `sp_GetUserByUsername` stored procedure
2. Check if admin user exists
3. Create admin user if needed
4. Verify password hashing status

### Step 4: Test Admin Login

#### Option A: Login as Regular User First
```
Username: admin
Password: password (or whatever you set)
```

After login, check:
- Is `userId === 1`? OR
- Is `userName === 'admin'`?

If YES, you should see "User Management" section in Settings.

#### Option B: Use Admin Login Endpoint
```javascript
// Test with Postman or cURL
POST http://localhost:5000/api/Admin/login
Body: {
  "userName": "admin",
  "password": "password"
}
```

### Step 5: Verify Password Hashing

Run this SQL query:
```sql
SELECT UserId, UserName,
       CASE
         WHEN Password LIKE '$2a$%' OR Password LIKE '$2y$%'
         THEN 'BCrypt ✓'
         ELSE 'Plain Text ✗'
       END AS Status
FROM Users;
```

**Expected:** All passwords should show "BCrypt ✓"

If showing "Plain Text ✗":
1. Update registration to hash passwords
2. Re-hash existing passwords:
   ```csharp
   var hashedPassword = BCrypt.Net.BCrypt.HashPassword("password", 10);
   // Update user record with hashedPassword
   ```

---

## Common Issues & Solutions

### Issue 1: "Invalid username or password" (even with correct credentials)

**Cause:** Duplicate password verification or plain text passwords

**Solution:**
1. Check AuthController has ONLY ONE password verification
2. Verify password in DB is BCrypt hashed
3. Check PasswordService uses BCrypt.Net.BCrypt

### Issue 2: "Account is inactive"

**Solution:**
```sql
UPDATE Users SET ActiveStatus = 1 WHERE UserName = 'admin';
```

### Issue 3: "Access Denied" in Admin Panel

**Cause:** User ID is not 1 and username is not 'admin'

**Solution:**
```sql
-- Check current admin user
SELECT UserId, UserName FROM Users WHERE UserId = 1;

-- Update username to 'admin' if needed
UPDATE Users SET UserName = 'admin' WHERE UserId = 1;
```

### Issue 4: Admin Login Returns 500 Error

**Check:**
1. Database connection string is correct
2. `sp_GetUserByUsername` stored procedure exists
3. Check API logs for detailed error message

---

## Testing Checklist

- [ ] Backend AuthController fixed (single password verification)
- [ ] GetUserByUsernameAsync method added to repository
- [ ] sp_GetUserByUsername stored procedure created
- [ ] Admin user exists with UserId=1 or UserName='admin'
- [ ] Admin user is active (ActiveStatus=1)
- [ ] Password is BCrypt hashed (starts with $2a$ or $2y$)
- [ ] Can login as admin through /api/Auth/login
- [ ] "User Management" section visible in Settings
- [ ] Can navigate to /admin/users page
- [ ] Can view all users except admin
- [ ] Can reset user passwords
- [ ] Can activate/deactivate users
- [ ] Can set subscriptions

---

## Quick Test Script

```csharp
// Test.cs - Quick verification script
public class PasswordTest
{
    public static void Main()
    {
        var password = "password";

        // Hash password
        var hashedPassword = BCrypt.Net.BCrypt.HashPassword(password, 10);
        Console.WriteLine($"Hashed: {hashedPassword}");

        // Verify password
        var isValid = BCrypt.Net.BCrypt.Verify(password, hashedPassword);
        Console.WriteLine($"Valid: {isValid}"); // Should be True

        // Test with wrong password
        var isInvalid = BCrypt.Net.BCrypt.Verify("wrongpassword", hashedPassword);
        Console.WriteLine($"Invalid: {isInvalid}"); // Should be False
    }
}
```

Expected Output:
```
Hashed: $2a$10$abcd1234...
Valid: True
Invalid: False
```

---

## If Still Not Working

1. Enable detailed logging in AuthController
2. Check exact error message
3. Verify BCrypt.Net.BCrypt NuGet package is installed
4. Check database connection is working
5. Test with a new user registration first
6. Compare working user login vs admin login

---

## Contact Points

- Frontend API call: `/home/user/MilkBilling/src/services/api.js` line 62-74
- Admin check: `/home/user/MilkBilling/src/component/Web_module/AdminUserManagement.js` line 26-27
- User Management section: `/home/user/MilkBilling/src/component/Web_module/SettingsSections/UserManagementSection.js`
