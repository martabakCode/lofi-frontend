import { describe, it, expect } from 'vitest';
import { LoanStatusEngine } from './loan-status-engine';
import { LoanStatus, LoanStage } from '../models/loan.models';

describe('LoanStatusEngine', () => {
    it('should return correct node for SUBMITTED status', () => {
        const node = LoanStatusEngine.getNode(LoanStatus.SUBMITTED);
        expect(node).toBeDefined();
        expect(node?.status).toBe(LoanStatus.SUBMITTED);
        expect(node?.stage).toBe(LoanStage.MARKETING);
    });

    it('should allow Marketing role to approve SUBMITTED loan', () => {
        const node = LoanStatusEngine.getNode(LoanStatus.SUBMITTED);
        expect(node?.canApprove(['ROLE_MARKETING'])).toBe(true);
    });

    it('should not allow Customer role to approve SUBMITTED loan', () => {
        const node = LoanStatusEngine.getNode(LoanStatus.SUBMITTED);
        expect(node?.canApprove(['ROLE_CUSTOMER'])).toBe(false);
    });

    it('should return correct next status for REVIEWED', () => {
        const node = LoanStatusEngine.getNode(LoanStatus.REVIEWED);
        expect(node?.getNextStatus()).toBe(LoanStatus.APPROVED);
    });

    it('should allow rollback for REVIEWED status', () => {
        const node = LoanStatusEngine.getNode(LoanStatus.REVIEWED);
        expect(node?.canRollback()).toBe(true);
    });
});
