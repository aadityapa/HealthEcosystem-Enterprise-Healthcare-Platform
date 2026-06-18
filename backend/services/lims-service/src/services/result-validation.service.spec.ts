import { Gender, ResultFlag } from '@health/db';
import { ResultValidationService } from './result-validation.service';

describe('ResultValidationService', () => {
  let service: ResultValidationService;

  beforeEach(() => {
    service = new ResultValidationService();
  });

  describe('numeric validation', () => {
    const ranges = [
      {
        gender: 'ALL' as const,
        ageMin: 18,
        ageMax: 65,
        low: 70,
        high: 100,
        criticalLow: 50,
        criticalHigh: 120,
      },
    ];

    it('flags NORMAL within reference range', () => {
      const result = service.validate({
        value: '85',
        dataType: 'numeric',
        referenceRanges: ranges,
        gender: Gender.MALE,
        ageYears: 30,
      });

      expect(result.flag).toBe(ResultFlag.NORMAL);
      expect(result.isAbnormal).toBe(false);
      expect(result.referenceRange).toBe('70 - 100');
    });

    it('flags LOW below reference range', () => {
      const result = service.validate({
        value: '65',
        dataType: 'numeric',
        referenceRanges: ranges,
        gender: Gender.FEMALE,
        ageYears: 40,
      });

      expect(result.flag).toBe(ResultFlag.LOW);
      expect(result.isAbnormal).toBe(true);
    });

    it('flags HIGH above reference range', () => {
      const result = service.validate({
        value: '105',
        dataType: 'numeric',
        referenceRanges: ranges,
      });

      expect(result.flag).toBe(ResultFlag.HIGH);
      expect(result.isAbnormal).toBe(true);
    });

    it('flags CRITICAL_LOW at or below critical threshold', () => {
      const result = service.validate({
        value: '48',
        dataType: 'numeric',
        referenceRanges: ranges,
      });

      expect(result.flag).toBe(ResultFlag.CRITICAL_LOW);
      expect(result.isAbnormal).toBe(true);
    });

    it('flags CRITICAL_HIGH at or above critical threshold', () => {
      const result = service.validate({
        value: '125',
        dataType: 'numeric',
        referenceRanges: ranges,
      });

      expect(result.flag).toBe(ResultFlag.CRITICAL_HIGH);
      expect(result.isAbnormal).toBe(true);
    });

    it('flags ABNORMAL for non-numeric values on numeric parameters', () => {
      const result = service.validate({
        value: 'invalid',
        dataType: 'numeric',
        referenceRanges: ranges,
      });

      expect(result.flag).toBe(ResultFlag.ABNORMAL);
      expect(result.isAbnormal).toBe(true);
    });

    it('selects gender-specific range when provided', () => {
      const genderRanges = [
        { gender: Gender.MALE, low: 13, high: 17 },
        { gender: Gender.FEMALE, low: 12, high: 16 },
      ];

      const maleResult = service.validate({
        value: '14',
        dataType: 'numeric',
        referenceRanges: genderRanges,
        gender: Gender.MALE,
      });
      expect(maleResult.flag).toBe(ResultFlag.NORMAL);

      const femaleResult = service.validate({
        value: '14',
        dataType: 'numeric',
        referenceRanges: genderRanges,
        gender: Gender.FEMALE,
      });
      expect(femaleResult.flag).toBe(ResultFlag.NORMAL);
    });
  });

  describe('text validation', () => {
    it('flags NORMAL when value matches expected text', () => {
      const result = service.validate({
        value: 'Negative',
        dataType: 'text',
        referenceRanges: [{ textNormal: 'Negative' }],
      });

      expect(result.flag).toBe(ResultFlag.NORMAL);
      expect(result.isAbnormal).toBe(false);
    });

    it('flags ABNORMAL when text does not match', () => {
      const result = service.validate({
        value: 'Positive',
        dataType: 'text',
        referenceRanges: [{ textNormal: 'Negative' }],
      });

      expect(result.flag).toBe(ResultFlag.ABNORMAL);
      expect(result.isAbnormal).toBe(true);
    });
  });
});
