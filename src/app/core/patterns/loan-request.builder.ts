/**
 * BUILDER PATTERN
 * Helps constructing complex objects step-by-step.
 * Useful for multi-step forms or complex API requests.
 */
export class LoanRequestBuilder {
    private request: any = {};

    setAmount(amount: number): this {
        this.request.loanAmount = amount;
        return this;
    }

    setTenor(months: number): this {
        this.request.tenor = months;
        return this;
    }

    setProduct(productId: string): this {
        this.request.productId = productId;
        return this;
    }

    setCustomer(customerId: string): this {
        this.request.customerId = customerId;
        return this;
    }

    build() {
        if (!this.request.loanAmount || !this.request.productId) {
            throw new Error('Incomplete loan request');
        }
        return this.request;
    }
}
