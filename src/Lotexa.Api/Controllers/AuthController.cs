using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Lotexa.Application.DTOs;
using Lotexa.Application.Interfaces;
using Lotexa.Domain.Entities;
using Lotexa.Domain.Enums;
using Lotexa.Infrastructure.Identity;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

namespace Lotexa.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly IConfiguration _configuration;
    private readonly IUnitOfWork _uow;

    public AuthController(UserManager<ApplicationUser> userManager, IConfiguration configuration, IUnitOfWork uow)
    {
        _userManager = userManager;
        _configuration = configuration;
        _uow = uow;
    }

    [HttpPost("login")]
    public async Task<ActionResult<AuthResponse>> Login([FromBody] LoginRequest request)
    {
        ApplicationUser? user;

        if (request.Identifier.Contains('@'))
        {
            user = await _userManager.FindByEmailAsync(request.Identifier);
        }
        else
        {
            user = await _userManager.Users
                .FirstOrDefaultAsync(u => u.PhoneNumber == request.Identifier);
        }

        if (user == null || !await _userManager.CheckPasswordAsync(user, request.Password))
            return Unauthorized(new { message = "Invalid credentials" });

        var roles = await _userManager.GetRolesAsync(user);
        var token = GenerateJwtToken(user, roles);

        return Ok(new AuthResponse
        {
            Token = token,
            Email = user.Email!,
            Role = roles.FirstOrDefault() ?? "",
            ExpiresAt = DateTime.UtcNow.AddMinutes(double.Parse(_configuration["Jwt:ExpiryInMinutes"]!))
        });
    }

    [HttpPost("register")]
    public async Task<ActionResult<AuthResponse>> Register([FromBody] RegisterRequest request)
    {
        if (request.Role != UserRoles.Farmer && request.Role != UserRoles.Buyer)
            return BadRequest(new { message = "Can only register as Farmer or Buyer" });

        var existingUser = await _userManager.FindByEmailAsync(request.Email);
        if (existingUser != null)
            return BadRequest(new { message = "Email already registered" });

        var existingPhone = await _userManager.Users
            .FirstOrDefaultAsync(u => u.PhoneNumber == request.PhoneNumber);
        if (existingPhone != null)
            return BadRequest(new { message = "Phone number already registered" });

        var user = new ApplicationUser
        {
            UserName = request.Email,
            Email = request.Email,
            PhoneNumber = request.PhoneNumber,
            FullName = request.FullName,
            EmailConfirmed = true
        };

        var result = await _userManager.CreateAsync(user, request.Password);
        if (!result.Succeeded)
            return BadRequest(new { message = string.Join(", ", result.Errors.Select(e => e.Description)) });

        await _userManager.AddToRoleAsync(user, request.Role);

        // Auto-create Farmer or Trader profile linked to this user
        if (request.Role == UserRoles.Farmer)
        {
            var farmer = new Farmer
            {
                Name = request.FullName,
                Phone = request.PhoneNumber,
                Email = request.Email,
                UserId = user.Id
            };
            await _uow.Repository<Farmer>().AddAsync(farmer);
            await _uow.SaveChangesAsync();
        }
        else if (request.Role == UserRoles.Buyer)
        {
            var trader = new Trader
            {
                Name = request.FullName,
                Phone = request.PhoneNumber,
                Email = request.Email,
                UserId = user.Id
            };
            await _uow.Repository<Trader>().AddAsync(trader);
            await _uow.SaveChangesAsync();
        }

        var roles = new List<string> { request.Role };
        var token = GenerateJwtToken(user, roles);

        return Ok(new AuthResponse
        {
            Token = token,
            Email = user.Email,
            Role = request.Role,
            ExpiresAt = DateTime.UtcNow.AddMinutes(double.Parse(_configuration["Jwt:ExpiryInMinutes"]!))
        });
    }

    [HttpPost("admin/create-user")]
    [Authorize(Roles = UserRoles.Admin)]
    public async Task<ActionResult> CreateUser([FromBody] AdminCreateUserRequest request)
    {
        var existingUser = await _userManager.FindByEmailAsync(request.Email);
        if (existingUser != null)
            return BadRequest(new { message = "Email already registered" });

        var user = new ApplicationUser
        {
            UserName = request.Email,
            Email = request.Email,
            FullName = request.FullName,
            EmailConfirmed = true
        };

        var result = await _userManager.CreateAsync(user, request.Password);
        if (!result.Succeeded)
            return BadRequest(new { message = string.Join(", ", result.Errors.Select(e => e.Description)) });

        await _userManager.AddToRoleAsync(user, request.Role);
        return Ok(new { message = "User created successfully" });
    }

    private string GenerateJwtToken(ApplicationUser user, IList<string> roles)
    {
        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, user.Id),
            new(ClaimTypes.Email, user.Email!),
            new(ClaimTypes.Name, user.FullName)
        };
        claims.AddRange(roles.Select(role => new Claim(ClaimTypes.Role, role)));

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]!));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var expiry = DateTime.UtcNow.AddMinutes(double.Parse(_configuration["Jwt:ExpiryInMinutes"]!));

        var token = new JwtSecurityToken(
            issuer: _configuration["Jwt:Issuer"],
            audience: _configuration["Jwt:Audience"],
            claims: claims,
            expires: expiry,
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
