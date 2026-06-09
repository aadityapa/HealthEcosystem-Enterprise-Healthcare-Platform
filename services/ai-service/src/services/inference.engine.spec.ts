import { InferenceEngine } from './inference.engine';

describe('InferenceEngine', () => {
  let engine: InferenceEngine;

  beforeEach(() => {
    engine = new InferenceEngine();
  });

  describe('calculateZScore', () => {
    it('computes z-score from value, mean, and SD', () => {
      expect(engine.calculateZScore(110, 100, 5)).toBe(2);
    });

    it('returns 0 when SD is zero', () => {
      expect(engine.calculateZScore(110, 100, 0)).toBe(0);
    });
  });

  describe('detectAbnormal', () => {
    it('flags high z-score as abnormal', () => {
      const result = engine.detectAbnormal({
        testCode: 'GLUCOSE',
        value: 130,
        historicalValues: [90, 95, 100, 98, 102],
      });
      expect(result.isAbnormal).toBe(true);
      expect(result.flag).toMatch(/high/);
    });

    it('returns normal for value within reference range', () => {
      const result = engine.detectAbnormal({
        testCode: 'GLUCOSE',
        value: 95,
        referenceLow: 70,
        referenceHigh: 110,
        mean: 100,
        stdDev: 5,
      });
      expect(result.isAbnormal).toBe(false);
      expect(result.flag).toBe('normal');
    });

    it('flags value below reference low', () => {
      const result = engine.detectAbnormal({
        testCode: 'HEMOGLOBIN',
        value: 11.5,
        referenceLow: 12,
        referenceHigh: 16,
        mean: 14,
        stdDev: 1,
      });
      expect(result.isAbnormal).toBe(true);
      expect(result.flag).toBe('low');
    });
  });

  describe('evaluateCriticalValue', () => {
    it('detects panic high glucose', () => {
      const result = engine.evaluateCriticalValue({
        testCode: 'GLUCOSE',
        value: 520,
      });
      expect(result.isCritical).toBe(true);
      expect(result.severity).toBe('panic');
      expect(result.flag).toBe('panic_high');
    });

    it('detects critical low potassium', () => {
      const result = engine.evaluateCriticalValue({
        testCode: 'POTASSIUM',
        value: 2.3,
      });
      expect(result.isCritical).toBe(true);
      expect(result.severity).toBe('critical');
    });

    it('returns none for normal value', () => {
      const result = engine.evaluateCriticalValue({
        testCode: 'GLUCOSE',
        value: 100,
      });
      expect(result.isCritical).toBe(false);
      expect(result.severity).toBe('none');
    });
  });

  describe('interpretResult', () => {
    it('interprets high value', () => {
      const result = engine.interpretResult({
        testCode: 'TSH',
        value: 8.5,
        unit: 'mIU/L',
        referenceHigh: 4.5,
      });
      expect(result.flag).toBe('high');
      expect(result.interpretation).toContain('above');
    });

    it('interprets low value', () => {
      const result = engine.interpretResult({
        testCode: 'HEMOGLOBIN',
        value: 9,
        referenceLow: 12,
      });
      expect(result.flag).toBe('low');
    });

    it('interprets normal value', () => {
      const result = engine.interpretResult({
        testCode: 'GLUCOSE',
        value: 95,
        referenceLow: 70,
        referenceHigh: 110,
      });
      expect(result.flag).toBe('normal');
    });
  });

  describe('predictRisk', () => {
    it('returns high risk for elevated factors and age', () => {
      const result = engine.predictRisk({
        patientAge: 70,
        factors: [
          { code: 'DIABETES', value: 0.9 },
          { code: 'HYPERTENSION', value: 0.8 },
        ],
      });
      expect(result.riskLevel).toBe('high');
      expect(result.contributingFactors).toContain('DIABETES');
    });

    it('returns low risk for minimal factors', () => {
      const result = engine.predictRisk({
        patientAge: 30,
        factors: [{ code: 'SMOKING', value: 0.1 }],
      });
      expect(result.riskLevel).toBe('low');
    });
  });

  describe('movingAverageForecast', () => {
    it('forecasts using moving average of recent values', () => {
      const result = engine.movingAverageForecast({
        series: [
          { period: '2026-01', value: 100 },
          { period: '2026-02', value: 110 },
          { period: '2026-03', value: 120 },
        ],
        horizon: 2,
      });
      expect(result.forecast).toHaveLength(2);
      expect(result.forecast[0].value).toBe(110);
      expect(result.method).toBe('moving_average');
    });

    it('returns empty forecast for empty series', () => {
      const result = engine.movingAverageForecast({ series: [] });
      expect(result.forecast).toHaveLength(0);
      expect(result.confidence).toBe(0);
    });
  });

  describe('planStaff', () => {
    it('recommends staff based on volume and capacity', () => {
      const result = engine.planStaff({
        expectedVolume: [80, 95, 110],
        staffCapacityPerShift: 20,
        shiftsPerDay: 2,
      });
      expect(result.recommendedStaff).toEqual([4, 5, 6]);
      expect(result.totalStaffRequired).toBe(12);
    });
  });

  describe('generateChatResponse', () => {
    it('responds to report inquiries', () => {
      const reply = engine.generateChatResponse('Where is my report?');
      expect(reply.toLowerCase()).toContain('report');
    });

    it('responds to greetings', () => {
      const reply = engine.generateChatResponse('Hello');
      expect(reply.toLowerCase()).toContain('hello');
    });
  });

  describe('generateVoiceResponse', () => {
    it('responds to hours inquiry', () => {
      const reply = engine.generateVoiceResponse('What are your lab hours?');
      expect(reply.toLowerCase()).toContain('open');
    });
  });
});
