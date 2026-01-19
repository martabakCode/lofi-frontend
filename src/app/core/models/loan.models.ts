export enum LoanStatus {
    DRAFT = 'DRAFT',
    SUBMITTED = 'SUBMITTED',
    REVIEWED = 'REVIEWED',
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED',
    ROLLBACK = 'ROLLBACK',
    COMPLETED = 'COMPLETED',
    DISBURSED = 'DISBURSED'
}

export enum LoanStage {
    CUSTOMER = 'CUSTOMER',
    MARKETING = 'MARKETING',
    BRANCH_MANAGER = 'BRANCH_MANAGER',
    BACK_OFFICE = 'BACK_OFFICE'
}

export interface LoanSLA {
    targetSeconds: number;
    remainingSeconds: number;
    isExpired: boolean;
    status: 'SAFE' | 'WARNING' | 'CRITICAL' | 'EXPIRED';
}

/**
 * COMPOSITE PATTERN
 * Base node for loan status rules.
 */
export abstract class LoanStatusNode {
    constructor(public status: LoanStatus, public stage: LoanStage) { }

    abstract canApprove(userRoles: string[]): boolean;
    abstract canRollback(): boolean;
    abstract getNextStatus(): LoanStatus;
}
