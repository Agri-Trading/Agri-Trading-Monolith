using FluentValidation;
using Lotexa.Application.DTOs;

namespace Lotexa.Application.Validators;

public class CreatePurchaseLotRequestValidator : AbstractValidator<CreatePurchaseLotRequest>
{
    public CreatePurchaseLotRequestValidator()
    {
        RuleFor(x => x.CropId).GreaterThan(0);
        RuleFor(x => x.FarmerId).GreaterThan(0);
        RuleFor(x => x.WarehouseId).GreaterThan(0);
        RuleFor(x => x.UnitOfMeasureId).GreaterThan(0);
        RuleFor(x => x.Quantity).GreaterThan(0);
        RuleFor(x => x.BuyPricePerUom).GreaterThanOrEqualTo(0);
        RuleFor(x => x.OtherCharges).GreaterThanOrEqualTo(0);
    }
}

public class CreateLotExpenseRequestValidator : AbstractValidator<CreateLotExpenseRequest>
{
    public CreateLotExpenseRequestValidator()
    {
        RuleFor(x => x.Description).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Amount).GreaterThan(0);
    }
}

public class CreateLotTestRequestValidator : AbstractValidator<CreateLotTestRequest>
{
    public CreateLotTestRequestValidator()
    {
        RuleFor(x => x.TestName).NotEmpty().MaximumLength(100);
    }
}

public class CreateLotAdjustmentRequestValidator : AbstractValidator<CreateLotAdjustmentRequest>
{
    public CreateLotAdjustmentRequestValidator()
    {
        RuleFor(x => x.QtyDelta).NotEqual(0).WithMessage("Adjustment quantity cannot be zero");
        RuleFor(x => x.Reason).NotEmpty().MaximumLength(500);
    }
}
