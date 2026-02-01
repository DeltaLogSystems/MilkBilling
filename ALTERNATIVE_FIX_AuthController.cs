// ============================================
// ALTERNATIVE SIMPLER FIX (if LoginAsync already verifies password)
// ============================================
// If your LoginAsync method already does BCrypt password verification,
// just remove the duplicate check:

[HttpPost("login")]
public async Task<ActionResult<ApiResponse<LoginResponseDTO>>> Login([FromBody] LoginRequestDTO request)
{
    try
    {
        if (string.IsNullOrWhiteSpace(request.UserName) || string.IsNullOrWhiteSpace(request.Password))
        {
            return BadRequest(new ApiResponse<LoginResponseDTO>(false, "Username and password are required"));
        }

        // LoginAsync should handle password verification internally
        var user = await _userRepository.LoginAsync(request.UserName, request.Password);

        if (user == null)
        {
            return Unauthorized(new ApiResponse<LoginResponseDTO>(false, "Invalid username or password"));
        }

        // REMOVE THIS DUPLICATE CHECK:
        // if (!_passwordService.VerifyPassword(request.Password, user.Password))
        // {
        //     return Unauthorized(new ApiResponse<LoginResponseDTO>(false, "Invalid username or password"));
        // }

        if (!user.ActiveStatus)
        {
            return Unauthorized(new ApiResponse<LoginResponseDTO>(false, "Account is inactive"));
        }

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
// OR: Make sure LoginAsync in repository does BCrypt verification:
// ============================================
// In UserRepository.cs:

public async Task<User> LoginAsync(string userName, string password)
{
    var parameters = new DynamicParameters();
    parameters.Add("@UserName", userName);

    using (var connection = new SqlConnection(_connectionString))
    {
        // Get user by username
        var user = await connection.QueryFirstOrDefaultAsync<User>(
            "sp_GetUserByUsername",
            parameters,
            commandType: CommandType.StoredProcedure
        );

        if (user == null)
        {
            return null;
        }

        // Verify password with BCrypt
        if (!BCrypt.Net.BCrypt.Verify(password, user.Password))
        {
            return null;
        }

        return user;
    }
}
