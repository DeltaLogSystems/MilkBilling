// FIXED AuthController.cs - Login Method
// Replace your current Login method with this:

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

        // Get user by username ONLY (don't verify password in repository)
        // You need to create a new method: GetUserByUsernameAsync
        var user = await _userRepository.GetUserByUsernameAsync(request.UserName);

        if (user == null)
        {
            return Unauthorized(new ApiResponse<LoginResponseDTO>(false, "Invalid username or password"));
        }

        // Verify password using BCrypt
        if (!_passwordService.VerifyPassword(request.Password, user.Password))
        {
            return Unauthorized(new ApiResponse<LoginResponseDTO>(false, "Invalid username or password"));
        }

        // Check if user is active
        if (!user.ActiveStatus)
        {
            return Unauthorized(new ApiResponse<LoginResponseDTO>(false, "Account is inactive"));
        }

        // Generate JWT token
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
// ADD THIS METHOD TO IUserRepository interface
// ============================================
public interface IUserRepository
{
    Task<User> GetUserByUsernameAsync(string username);
    // ... other methods
}

// ============================================
// ADD THIS METHOD TO UserRepository class
// ============================================
public async Task<User> GetUserByUsernameAsync(string username)
{
    var parameters = new DynamicParameters();
    parameters.Add("@UserName", username);

    using (var connection = new SqlConnection(_connectionString))
    {
        var user = await connection.QueryFirstOrDefaultAsync<User>(
            "sp_GetUserByUsername",  // Create this stored procedure
            parameters,
            commandType: CommandType.StoredProcedure
        );

        return user;
    }
}
