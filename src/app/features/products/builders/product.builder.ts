import { CreateProductRequest } from '../models/product.models';

export class ProductBuilder {
    /**
     * BUILDER PATTERN
     * Helps in constructing complex product configuration payloads step-by-step.
     */
    private product: Partial<CreateProductRequest> = {};

    reset(): ProductBuilder {
        this.product = {};
        return this;
    }

    setBasicInfo(code: string, name: string, description: string): ProductBuilder {
        this.product.productCode = code;
        this.product.productName = name;
        this.product.description = description;
        return this;
    }

    setFinancials(interestRate: number, adminFee: number): ProductBuilder {
        this.product.interestRate = interestRate;
        this.product.adminFee = adminFee;
        return this;
    }

    setLimits(minTenor: number, maxTenor: number, minAmount: number, maxAmount: number): ProductBuilder {
        this.product.minTenor = minTenor;
        this.product.maxTenor = maxTenor;
        this.product.minLoanAmount = minAmount;
        this.product.maxLoanAmount = maxAmount;
        return this;
    }

    build(): CreateProductRequest {
        return this.product as CreateProductRequest;
    }
}
