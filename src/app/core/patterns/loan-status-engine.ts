import { LoanStatus, LoanStage, LoanStatusNode } from '../models/loan.models';

export class DraftStatusNode extends LoanStatusNode {
    constructor() {
        super(LoanStatus.DRAFT, LoanStage.CUSTOMER);
    }

    canApprove(roles: string[]): boolean {
        return true; // Customer can submit draft
    }

    canRollback(): boolean {
        return false;
    }

    getNextStatus(): LoanStatus {
        return LoanStatus.SUBMITTED;
    }
}

export class SubmittedStatusNode extends LoanStatusNode {
    constructor() {
        super(LoanStatus.SUBMITTED, LoanStage.MARKETING);
    }

    canApprove(roles: string[]): boolean {
        return roles.includes('ROLE_MARKETING');
    }

    canRollback(): boolean {
        return true;
    }

    getNextStatus(): LoanStatus {
        return LoanStatus.REVIEWED;
    }
}

export class ReviewedStatusNode extends LoanStatusNode {
    constructor() {
        super(LoanStatus.REVIEWED, LoanStage.BRANCH_MANAGER);
    }

    canApprove(roles: string[]): boolean {
        return roles.includes('ROLE_BRANCH_MANAGER');
    }

    canRollback(): boolean {
        return true;
    }

    getNextStatus(): LoanStatus {
        return LoanStatus.APPROVED;
    }
}

export class ApprovedStatusNode extends LoanStatusNode {
    constructor() {
        super(LoanStatus.APPROVED, LoanStage.BACK_OFFICE);
    }

    canApprove(roles: string[]): boolean {
        return roles.includes('ROLE_BACK_OFFICE');
    }

    canRollback(): boolean {
        return true;
    }

    getNextStatus(): LoanStatus {
        return LoanStatus.DISBURSED;
    }
}

/**
 * Composite Factory/Registry
 */
export class LoanStatusEngine {
    private static nodes: Map<LoanStatus, LoanStatusNode> = new Map([
        [LoanStatus.DRAFT, new DraftStatusNode()],
        [LoanStatus.SUBMITTED, new SubmittedStatusNode()],
        [LoanStatus.REVIEWED, new ReviewedStatusNode()],
        [LoanStatus.APPROVED, new ApprovedStatusNode()]
    ]);

    static getNode(status: LoanStatus): LoanStatusNode | undefined {
        return this.nodes.get(status);
    }
}
