import { BadRequestException, Injectable } from '@nestjs/common';
import { SampleStatus } from '@health/db';

const VALID_TRANSITIONS: Readonly<Record<SampleStatus, readonly SampleStatus[]>> = {
  [SampleStatus.ORDERED]: [SampleStatus.COLLECTED, SampleStatus.REJECTED],
  [SampleStatus.COLLECTED]: [
    SampleStatus.IN_TRANSIT,
    SampleStatus.RECEIVED,
    SampleStatus.REJECTED,
  ],
  [SampleStatus.IN_TRANSIT]: [SampleStatus.RECEIVED, SampleStatus.REJECTED],
  [SampleStatus.RECEIVED]: [SampleStatus.PROCESSING, SampleStatus.REJECTED],
  [SampleStatus.PROCESSING]: [SampleStatus.RESULT_PENDING, SampleStatus.REJECTED],
  [SampleStatus.RESULT_PENDING]: [SampleStatus.VERIFIED, SampleStatus.REJECTED],
  [SampleStatus.VERIFIED]: [SampleStatus.APPROVED, SampleStatus.RESULT_PENDING],
  [SampleStatus.APPROVED]: [SampleStatus.REPORTED],
  [SampleStatus.REJECTED]: [],
  [SampleStatus.REPORTED]: [SampleStatus.ARCHIVED],
  [SampleStatus.ARCHIVED]: [],
};

export const SAMPLE_WORKFLOW_EVENT_TYPES = {
  ORDER_CREATED: 'order.created',
  SAMPLE_COLLECTED: 'sample.collected',
  SAMPLE_RECEIVED: 'sample.received',
  SAMPLE_PROCESSING: 'sample.processing',
  RESULTS_ENTERED: 'results.entered',
  RESULT_VERIFIED: 'result.verified',
  RESULT_APPROVED: 'result.approved',
  SAMPLE_REJECTED: 'sample.rejected',
  REPORT_RELEASED: 'report.released',
} as const;

@Injectable()
export class SampleWorkflowService {
  canTransition(from: SampleStatus, to: SampleStatus): boolean {
    return VALID_TRANSITIONS[from].includes(to);
  }

  assertTransition(from: SampleStatus, to: SampleStatus): void {
    if (!this.canTransition(from, to)) {
      throw new BadRequestException(
        `Invalid sample status transition: ${from} → ${to}`,
      );
    }
  }

  getAllowedTransitions(from: SampleStatus): SampleStatus[] {
    return [...VALID_TRANSITIONS[from]];
  }

  eventTypeForTransition(to: SampleStatus): string {
    switch (to) {
      case SampleStatus.COLLECTED:
        return SAMPLE_WORKFLOW_EVENT_TYPES.SAMPLE_COLLECTED;
      case SampleStatus.RECEIVED:
        return SAMPLE_WORKFLOW_EVENT_TYPES.SAMPLE_RECEIVED;
      case SampleStatus.PROCESSING:
        return SAMPLE_WORKFLOW_EVENT_TYPES.SAMPLE_PROCESSING;
      case SampleStatus.RESULT_PENDING:
        return SAMPLE_WORKFLOW_EVENT_TYPES.RESULTS_ENTERED;
      case SampleStatus.VERIFIED:
        return SAMPLE_WORKFLOW_EVENT_TYPES.RESULT_VERIFIED;
      case SampleStatus.APPROVED:
        return SAMPLE_WORKFLOW_EVENT_TYPES.RESULT_APPROVED;
      case SampleStatus.REJECTED:
        return SAMPLE_WORKFLOW_EVENT_TYPES.SAMPLE_REJECTED;
      case SampleStatus.REPORTED:
        return SAMPLE_WORKFLOW_EVENT_TYPES.REPORT_RELEASED;
      default:
        return 'sample.status_changed';
    }
  }
}
