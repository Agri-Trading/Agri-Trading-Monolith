using FluentValidation;
using Lotexa.Application.DTOs;
using Lotexa.Domain.Enums;

namespace Lotexa.Application.Validators;

public class LoginRequestValidator : AbstractValidator<LoginRequest>
{
    public LoginRequestValidator()
    {
        RuleFor(x => x.Identifier).NotEmpty().WithMessage("Email or phone number is required");
        RuleFor(x => x.Password).NotEmpty().MinimumLength(6);
    }
}

public class RegisterRequestValidator : AbstractValidator<RegisterRequest>
{
    public RegisterRequestValidator()
    {
        RuleFor(x => x.Email).NotEmpty().EmailAddress();
        RuleFor(x => x.PhoneNumber).NotEmpty().WithMessage("Phone number is required");
        RuleFor(x => x.Password).NotEmpty().MinimumLength(6);
        RuleFor(x => x.FullName).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Role).Must(r => r == UserRoles.Farmer || r == UserRoles.Buyer)
            .WithMessage("Role must be Farmer or Buyer");
    }
}

public class CreateQuoteRequestValidator : AbstractValidator<CreatePriceQuoteRequest>
{
    public CreateQuoteRequestValidator()
    {
        RuleFor(x => x.CropId).GreaterThan(0);
        RuleFor(x => x.TraderId).GreaterThan(0);
        RuleFor(x => x.PricePerUom).GreaterThan(0);
    }
}
