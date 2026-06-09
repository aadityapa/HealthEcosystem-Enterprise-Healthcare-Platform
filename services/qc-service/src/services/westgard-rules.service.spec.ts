import { WestgardRulesService } from './westgard-rules.service';

describe('WestgardRulesService', () => {
  let service: WestgardRulesService;

  beforeEach(() => {
    service = new WestgardRulesService();
  });

  describe('calculateZScore', () => {
    it('computes z-score from value, mean, and SD', () => {
      expect(service.calculateZScore(110, 100, 5)).toBe(2);
    });

    it('returns 0 when SD is zero', () => {
      expect(service.calculateZScore(110, 100, 0)).toBe(0);
    });
  });

  describe('1-2s rule', () => {
    it('flags warning when a point exceeds ±2 SD', () => {
      const violations = service.evaluate([2.5]);
      expect(violations).toContainEqual(
        expect.objectContaining({ ruleCode: '1-2s', severity: 'warning' }),
      );
    });

    it('does not flag 1-2s when within ±2 SD', () => {
      const violations = service.evaluate([1.5]);
      expect(violations.find((v) => v.ruleCode === '1-2s')).toBeUndefined();
    });
  });

  describe('1-3s rule', () => {
    it('flags reject when a point exceeds ±3 SD', () => {
      const violations = service.evaluate([-3.5]);
      expect(violations).toContainEqual(
        expect.objectContaining({ ruleCode: '1-3s', severity: 'reject' }),
      );
    });
  });

  describe('2-2s rule', () => {
    it('flags reject for two consecutive points beyond ±2 SD on same side', () => {
      const violations = service.evaluate([2.2, 2.5]);
      expect(violations).toContainEqual(
        expect.objectContaining({ ruleCode: '2-2s', severity: 'reject' }),
      );
    });

    it('does not flag 2-2s when points are on opposite sides', () => {
      const violations = service.evaluate([2.5, -2.5]);
      expect(violations.find((v) => v.ruleCode === '2-2s')).toBeUndefined();
    });
  });

  describe('R-4s rule', () => {
    it('flags reject when range between consecutive points exceeds 4 SD', () => {
      const violations = service.evaluate([-2, 2.5]);
      expect(violations).toContainEqual(
        expect.objectContaining({ ruleCode: 'R-4s', severity: 'reject' }),
      );
    });
  });

  describe('4-1s rule', () => {
    it('flags reject for four consecutive points beyond ±1 SD on same side', () => {
      const violations = service.evaluate([1.2, 1.3, 1.1, 1.4]);
      expect(violations).toContainEqual(
        expect.objectContaining({ ruleCode: '4-1s', severity: 'reject' }),
      );
    });
  });

  describe('10x rule', () => {
    it('flags reject for ten consecutive points on same side of mean', () => {
      const zScores = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0];
      const violations = service.evaluate(zScores);
      expect(violations).toContainEqual(
        expect.objectContaining({ ruleCode: '10x', severity: 'reject' }),
      );
    });
  });
});
