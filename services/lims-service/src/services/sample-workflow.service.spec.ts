import { SampleStatus } from '@health/db';
import { SampleWorkflowService } from './sample-workflow.service';

describe('SampleWorkflowService', () => {
  let service: SampleWorkflowService;

  beforeEach(() => {
    service = new SampleWorkflowService();
  });

  describe('canTransition', () => {
    it('allows ORDERED → COLLECTED', () => {
      expect(service.canTransition(SampleStatus.ORDERED, SampleStatus.COLLECTED)).toBe(true);
    });

    it('allows full happy-path lifecycle', () => {
      const path: SampleStatus[] = [
        SampleStatus.ORDERED,
        SampleStatus.COLLECTED,
        SampleStatus.RECEIVED,
        SampleStatus.PROCESSING,
        SampleStatus.RESULT_PENDING,
        SampleStatus.VERIFIED,
        SampleStatus.APPROVED,
        SampleStatus.REPORTED,
        SampleStatus.ARCHIVED,
      ];

      for (let i = 0; i < path.length - 1; i++) {
        expect(service.canTransition(path[i], path[i + 1])).toBe(true);
      }
    });

    it('allows COLLECTED → IN_TRANSIT → RECEIVED', () => {
      expect(service.canTransition(SampleStatus.COLLECTED, SampleStatus.IN_TRANSIT)).toBe(true);
      expect(service.canTransition(SampleStatus.IN_TRANSIT, SampleStatus.RECEIVED)).toBe(true);
    });

    it('allows rejection from active states', () => {
      const rejectable: SampleStatus[] = [
        SampleStatus.ORDERED,
        SampleStatus.COLLECTED,
        SampleStatus.IN_TRANSIT,
        SampleStatus.RECEIVED,
        SampleStatus.PROCESSING,
        SampleStatus.RESULT_PENDING,
      ];

      for (const status of rejectable) {
        expect(service.canTransition(status, SampleStatus.REJECTED)).toBe(true);
      }
    });

    it('blocks REJECTED → any state', () => {
      expect(service.getAllowedTransitions(SampleStatus.REJECTED)).toEqual([]);
    });

    it('blocks skipping workflow steps', () => {
      expect(service.canTransition(SampleStatus.ORDERED, SampleStatus.RECEIVED)).toBe(false);
      expect(service.canTransition(SampleStatus.ORDERED, SampleStatus.PROCESSING)).toBe(false);
      expect(service.canTransition(SampleStatus.COLLECTED, SampleStatus.VERIFIED)).toBe(false);
    });

    it('blocks backward transitions except re-entry to RESULT_PENDING from VERIFIED', () => {
      expect(service.canTransition(SampleStatus.VERIFIED, SampleStatus.PROCESSING)).toBe(false);
      expect(service.canTransition(SampleStatus.APPROVED, SampleStatus.VERIFIED)).toBe(false);
      expect(service.canTransition(SampleStatus.VERIFIED, SampleStatus.RESULT_PENDING)).toBe(true);
    });
  });

  describe('assertTransition', () => {
    it('throws on invalid transition', () => {
      expect(() =>
        service.assertTransition(SampleStatus.ORDERED, SampleStatus.APPROVED),
      ).toThrow('Invalid sample status transition');
    });

    it('does not throw on valid transition', () => {
      expect(() =>
        service.assertTransition(SampleStatus.RECEIVED, SampleStatus.PROCESSING),
      ).not.toThrow();
    });
  });

  describe('eventTypeForTransition', () => {
    it('maps transitions to event types', () => {
      expect(service.eventTypeForTransition(SampleStatus.COLLECTED)).toBe('sample.collected');
      expect(service.eventTypeForTransition(SampleStatus.RECEIVED)).toBe('sample.received');
      expect(service.eventTypeForTransition(SampleStatus.PROCESSING)).toBe('sample.processing');
      expect(service.eventTypeForTransition(SampleStatus.RESULT_PENDING)).toBe('results.entered');
      expect(service.eventTypeForTransition(SampleStatus.VERIFIED)).toBe('result.verified');
      expect(service.eventTypeForTransition(SampleStatus.APPROVED)).toBe('result.approved');
      expect(service.eventTypeForTransition(SampleStatus.REJECTED)).toBe('sample.rejected');
      expect(service.eventTypeForTransition(SampleStatus.REPORTED)).toBe('report.released');
    });
  });
});
