using Microsoft.AspNetCore.Identity;

namespace Lotexa.Infrastructure.Identity;

public class ApplicationUser : IdentityUser
{
    public string FullName { get; set; } = string.Empty;
}
