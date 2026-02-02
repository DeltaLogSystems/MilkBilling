// ============================================
// RECOMMENDED FIX for AuthController.cs
// ============================================
// Replace your Login method with this:

[HttpPost("login")]
public async Task<ActionResult<ApiResponse<LoginResponseDTO>>> Login([FromBody] LoginRequestDTO request)
{
    try
    {
        // Validate input
        if (string.IsNullOrWhiteSpace(request.UserName) || string.IsNullOrWhiteSpace(request.Password))
        {
            return BadRequest(new ApiResponse<LoginResponseDTO>(false, "Username and password are required"));
        }

        // STEP 1: Get user by username ONLY (no password verification yet)
        var user = await _userRepository.GetUserByUsernameAsync(request.UserName);

        if (user == null)
        {
            return Unauthorized(new ApiResponse<LoginResponseDTO>(false, "Invalid username or password"));
        }

        // STEP 2: Verify password using BCrypt (SINGLE verification)
        if (!_passwordService.VerifyPassword(request.Password, user.Password))
        {
            return Unauthorized(new ApiResponse<LoginResponseDTO>(false, "Invalid username or password"));
        }

        // STEP 3: Check if user is active
        if (!user.ActiveStatus)
        {
            return Unauthorized(new ApiResponse<LoginResponseDTO>(false, "Account is inactive"));
        }

        // STEP 4: Generate JWT token
        var token = _jwtService.GenerateToken(user);
        var tokenExpiry = DateTime.UtcNow.AddMinutes(60);

        var response = new LoginResponseDTO
        {
            UserId = user.UserId,
            UserName = user.UserName,
            Email = user.Email,
            Token = token,
            TokenExpiry = tokenExpiry
        };

        return Ok(new ApiResponse<LoginResponseDTO>(response, "Login successful"));
    }
    catch (Exception ex)
    {
        return StatusCode(500, new ApiResponse<LoginResponseDTO>(false, $"An error occurred: {ex.Message}"));
    }
}

// ============================================
// ADD to IUserRepository interface
// ============================================
public interface IUserRepository
{
    Task<User> GetUserByUsernameAsync(string username);
    // ... other existing methods
}

// ============================================
// ADD to UserRepository.cs implementation
// ============================================
public async Task<User> GetUserByUsernameAsync(string username)
{
    var parameters = new DynamicParameters();
    parameters.Add("@UserName", username);

    using (var connection = new SqlConnection(_connectionString))
    {
        var user = await connection.QueryFirstOrDefaultAsync<User>(
            "sp_GetUserByUsername",
            parameters,
            commandType: CommandType.StoredProcedure
        );

        return user;
    }
}

// ============================================
// VERIFY PasswordService.cs implementation
// ============================================
public class PasswordService : IPasswordService
{
    public string HashPassword(string password)
    {
        // Hash password with BCrypt (workFactor 10)
        return BCrypt.Net.BCrypt.HashPassword(password, 10);
    }

    public bool VerifyPassword(string password, string hashedPassword)
    {
        // Verify password with BCrypt
        return BCrypt.Net.BCrypt.Verify(password, hashedPassword);
    }
}
