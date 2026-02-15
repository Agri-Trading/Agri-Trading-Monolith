using FluentValidation;
using Lotexa.Application.DTOs;

namespace Lotexa.Application.Validators;

public class CreateSaleRequestValidator : AbstractValidator<CreateSaleRequest>
{
    public CreateSaleRequestValidator()
    {
        RuleFor(x => x.CropId).GreaterThan(0);
        RuleFor(x => x.TraderId).GreaterThan(0);
        RuleFor(x => x.Quantity).GreaterThan(0);
        RuleFor(x => x.SellPricePerUom).GreaterThan(0);
    }
}

public class CreateSaleExpenseRequestValidator : AbstractValidator<CreateSaleExpenseRequest>
{
    public CreateSaleExpenseRequestValidator()
    {
        RuleFor(x => x.Description).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Amount).GreaterThan(0);
    }
}

public class CreatePaymentRequestValidator : AbstractValidator<CreatePaymentRequest>
{
    public CreatePaymentRequestValidator()
    {
        RuleFor(x => x.Amount).GreaterThan(0);
        RuleFor(x => x.PaymentMethod).MaximumLength(50);
    }
}
