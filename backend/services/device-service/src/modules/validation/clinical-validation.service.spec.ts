import { ResultFlag } from '@health/db';
import { ClinicalValidationEngineService } from './clinical-validation.service';

describe('ClinicalValidationEngineService', () => {
  let service: ClinicalValidationEngineService;

  beforeEach(() => {
    service = new ClinicalValidationEngineService();
  });

  const range = {
    low: 70,
    high: 100,
    criticalLow: 50,
    criticalHigh: 120,
    panicLow: 40,
    panicHigh: 130,
  };

  it('flags NORMAL within range', () => {
    const result = service.validate({
      parameterCode: 'GLU',
      value: '85',
      range,
    });
    expect(result.flag).toBe(ResultFlag.NORMAL);
    expect(result.isPanic).toBe(false);
  });

  it('flags LOW below reference', () => {
    const result = service.validate({ parameterCode: 'GLU', value: '65', range });
    expect(result.flag).toBe(ResultFlag.LOW);
    expect(result.isAbnormal).toBe(true);
  });

  it('flags HIGH above reference', () => {
    const result = service.validate({ parameterCode: 'GLU', value: '105', range });
    expect(result.flag).toBe(ResultFlag.HIGH);
  });

  it('detects panic low values', () => {
    const result = service.validate({ parameterCode: 'GLU', value: '38', range });
    expect(result.flag).toBe(ResultFlag.CRITICAL_LOW);
    expect(result.isPanic).toBe(true);
  });

  it('detects panic high values', () => {
    const result = service.validate({ parameterCode: 'GLU', value: '135', range });
    expect(result.flag).toBe(ResultFlag.CRITICAL_HIGH);
    expect(result.isPanic).toBe(true);
  });

  it('flags delta check failure', () => {
    const result = service.validate({
      parameterCode: 'GLU',
      value: '120',
      range,
      previousValue: '85',
      deltaRule: { parameterCode: 'GLU', maxDeltaPercent: 20 },
    });
    expect(result.deltaExceeded).toBe(true);
    expect(result.isAbnormal).toBe(true);
  });

  it('passes delta check within threshold', () => {
    const result = service.validate({
      parameterCode: 'GLU',
      value: '90',
      range,
      previousValue: '85',
      deltaRule: { parameterCode: 'GLU', maxDeltaPercent: 20 },
    });
    expect(result.deltaExceeded).toBe(false);
  });

  it('flags non-numeric values', () => {
    const result = service.validate({ parameterCode: 'GLU', value: 'abc', range });
    expect(result.flag).toBe(ResultFlag.ABNORMAL);
  });
});
