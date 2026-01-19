import { ProductResponse, ProductVM } from '../models/product.models';

export class ProductAdapter {
    /**
     * ADAPTER PATTERN
     * Transforms API DTO to View Model for UI consumption.
     */
    static toView(dto: ProductResponse): ProductVM {
        return {
            id: dto.id,
            code: dto.productCode,
            name: dto.productName,
            description: dto.description,
            interestRate: dto.interestRate,
            adminFee: dto.adminFee,
            minTenor: dto.minTenor,
            maxTenor: dto.maxTenor,
            minAmount: dto.minLoanAmount,
            maxAmount: dto.maxLoanAmount,
            isActive: dto.isActive,
            tenorLabel: `${dto.minTenor} - ${dto.maxTenor} months`,
            amountRangeLabel: `Rp ${dto.minLoanAmount.toLocaleString()} - Rp ${dto.maxLoanAmount.toLocaleString()}`,
            interestRateLabel: `${dto.interestRate}% p.a.`
        };
    }

    static toViewList(dtos: ProductResponse[]): ProductVM[] {
        return dtos.map(dto => this.toView(dto));
    }
}
