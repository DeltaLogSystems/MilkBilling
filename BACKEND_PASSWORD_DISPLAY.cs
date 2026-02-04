// ============================================
// BACKEND FIX: Display Password Information
// Add this to your AdminController.cs
// ============================================

// Add this helper method to AdminController class
private string GetDisplayPassword(string password)
{
    if (string.IsNullOrEmpty(password))
    {
        return "Not Set";
    }

    // Check if it's a BCrypt hash (starts with $2a$, $2b$, or $2y$)
    if (password.StartsWith("$2a$") || password.StartsWith("$2b$") || password.StartsWith("$2y$"))
    {
        // BCrypt hash - cannot be decrypted (one-way hash)
        // Show indication that password is BCrypt protected
        return "•••••••• (BCrypt Protected)";
    }

    // If it's plain text (which it shouldn't be for security!)
    // IMPORTANT: This should NEVER happen in production
    return "⚠️ PLAIN TEXT - NEEDS HASHING!";
}

// ============================================
// IMPORTANT SECURITY NOTES:
// ============================================

/*
 * WHY BCRYPT PASSWORDS CANNOT BE SHOWN:
 *
 * BCrypt is a ONE-WAY hashing algorithm, which means:
 * 1. You can HASH a password → store in database
 * 2. You can VERIFY a password against the hash
 * 3. You CANNOT reverse/decrypt the hash to get original password
 *
 * This is BY DESIGN for security!
 *
 * Example:
 * Password: "admin123"
 * BCrypt Hash: "$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy"
 *
 * You can verify "admin123" matches the hash
 * But you CANNOT convert the hash back to "admin123"
 *
 * SOLUTION:
 * - Admin can RESET passwords to new values
 * - Admin cannot VIEW existing passwords
 * - This is the correct and secure approach!
 */

// ============================================
// UPDATED GetAllUsers METHOD:
// Replace your current GetAllUsers with this:
// ============================================

[HttpGet("users")]
public async Task<ActionResult<ApiResponse<AdminUserListDTO>>> GetAllUsers()
{
    try
    {
        Console.WriteLine("[AdminController] GetAllUsers called");

        var users = await _adminRepository.GetAllUsersAsync();

        Console.WriteLine($"[AdminController] Retrieved {users?.Count ?? 0} users from repository");

        if (users == null || users.Count == 0)
        {
            Console.WriteLine("[AdminController] No users found in database");
            return Ok(new ApiResponse<AdminUserListDTO>(new AdminUserListDTO
            {
                Users = new List<AdminUserDTO>(),
                TotalCount = 0
            }, "No users found"));
        }

        var userDTOs = users.Select(u => new AdminUserDTO
        {
            UserId = u.UserId,
            UserName = u.UserName ?? "",
            Email = u.Email ?? "",
            // Use helper method to display password information
            // BCrypt hashes are one-way and CANNOT be decrypted
            Password = GetDisplayPassword(u.Password),
            ActiveStatus = u.ActiveStatus,
            CreatedDate = u.CreatedDate,
            SubscriptionEndDate = u.SubscriptionEndDate
        }).ToList();

        var result = new AdminUserListDTO
        {
            Users = userDTOs,
            TotalCount = userDTOs.Count
        };

        Console.WriteLine($"[AdminController] Returning {result.TotalCount} users");
        return Ok(new ApiResponse<AdminUserListDTO>(result, "Users retrieved successfully"));
    }
    catch (Exception ex)
    {
        Console.WriteLine($"[AdminController] Error: {ex.Message}");
        Console.WriteLine($"[AdminController] StackTrace: {ex.StackTrace}");
        return StatusCode(500, new ApiResponse<AdminUserListDTO>(false, $"Error: {ex.Message}"));
    }
}

// ============================================
// ALTERNATIVE: Remove Password Column Entirely
// ============================================

/*
 * RECOMMENDED APPROACH:
 *
 * Don't send password information to frontend at all!
 *
 * 1. Remove Password field from AdminUserDTO
 * 2. Only show "Reset Password" button in UI
 * 3. Admin resets password when needed
 *
 * This is more secure and follows best practices.
 */

// Modified AdminUserDTO (remove Password property)
public class AdminUserDTO
{
    public int UserId { get; set; }
    public string UserName { get; set; }
    public string Email { get; set; }
    // PASSWORD FIELD REMOVED - Not needed for security
    public bool ActiveStatus { get; set; }
    public DateTime CreatedDate { get; set; }
    public DateTime? SubscriptionEndDate { get; set; }
}
