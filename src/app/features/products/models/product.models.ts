export interface ProductResponse {
    id: string;
    productCode: string; // "PROD-001"
    productName: string; // "Kredit Multiguna"
    description: string;
    interestRate: number;
    adminFee: number;
    minTenor: number;
    maxTenor: number;
    minLoanAmount: number;
    maxLoanAmount: number;
    isActive: boolean;
}

export interface ProductVM {
    id: string;
    code: string; // Mapped from productCode
    name: string; // Mapped from productName
    minAmount: number; // Mapped from minLoanAmount
    maxAmount: number; // Mapped from maxLoanAmount
    minTenor: number;
    maxTenor: number;
    interestRate: number;
    description?: string;
    adminFee?: number;
    isActive?: boolean;
    tenorLabel: string;
    amountRangeLabel: string;
    interestRateLabel: string;
}

export interface CreateProductRequest {
    productCode: string;
    productName: string;
    description: string;
    interestRate: number;
    adminFee: number;
    minTenor: number;
    maxTenor: number;
    minLoanAmount: number;
    maxLoanAmount: number;
}
