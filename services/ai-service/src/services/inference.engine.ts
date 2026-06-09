import { Injectable } from '@nestjs/common';

export interface AbnormalDetectInput {
  testCode: string;
  value: number;
  historicalValues?: number[];
  mean?: number;
  stdDev?: number;
  referenceLow?: number;
  referenceHigh?: number;
}

export interface AbnormalDetectResult {
  isAbnormal: boolean;
  zScore: number;
  flag: 'normal' | 'low' | 'high' | 'critical_low' | 'critical_high';
  confidence: number;
  reason: string;
}

export interface CriticalValueInput {
  testCode: string;
  value: number;
  criticalLow?: number;
  criticalHigh?: number;
  panicLow?: number;
  panicHigh?: number;
}

export interface CriticalValueResult {
  isCritical: boolean;
  severity: 'none' | 'critical' | 'panic';
  flag: string;
  confidence: number;
}

export interface InterpretInput {
  testCode: string;
  value: number;
  unit?: string;
  referenceLow?: number;
  referenceHigh?: number;
}

export interface InterpretResult {
  interpretation: string;
  flag: 'normal' | 'low' | 'high';
  confidence: number;
}

export interface RiskFactor {
  code: string;
  value: number;
  weight?: number;
}

export interface RiskPredictInput {
  patientAge?: number;
  factors: RiskFactor[];
}

export interface RiskPredictResult {
  riskScore: number;
  riskLevel: 'low' | 'moderate' | 'high';
  confidence: number;
  contributingFactors: string[];
}

export interface TimeSeriesPoint {
  period: string;
  value: number;
}

export interface ForecastInput {
  series: TimeSeriesPoint[];
  horizon?: number;
}

export interface ForecastResult {
  forecast: TimeSeriesPoint[];
  method: string;
  confidence: number;
}

export interface StaffPlanningInput {
  expectedVolume: number[];
  staffCapacityPerShift?: number;
  shiftsPerDay?: number;
}

export interface StaffPlanningResult {
  recommendedStaff: number[];
  totalStaffRequired: number;
  confidence: number;
}

const DEFAULT_CRITICAL_THRESHOLDS: Record<
  string,
  { criticalLow?: number; criticalHigh?: number; panicLow?: number; panicHigh?: number }
> = {
  GLUCOSE: { criticalLow: 40, criticalHigh: 400, panicLow: 50, panicHigh: 500 },
  POTASSIUM: { criticalLow: 2.5, criticalHigh: 6.5, panicLow: 2.0, panicHigh: 7.0 },
  HEMOGLOBIN: { criticalLow: 7, criticalHigh: 20 },
};

@Injectable()
export class InferenceEngine {
  calculateMean(values: number[]): number {
    if (!values.length) return 0;
    return values.reduce((sum, v) => sum + v, 0) / values.length;
  }

  calculateStdDev(values: number[], mean?: number): number {
    if (values.length < 2) return 0;
    const avg = mean ?? this.calculateMean(values);
    const variance =
      values.reduce((sum, v) => sum + (v - avg) ** 2, 0) / (values.length - 1);
    return Math.sqrt(variance);
  }

  calculateZScore(value: number, mean: number, stdDev: number): number {
    if (stdDev === 0) return 0;
    return (value - mean) / stdDev;
  }

  detectAbnormal(input: AbnormalDetectInput): AbnormalDetectResult {
    const historical = input.historicalValues ?? [];
    const mean =
      input.mean ?? (historical.length ? this.calculateMean(historical) : input.value);
    const stdDev =
      input.stdDev ?? (historical.length ? this.calculateStdDev(historical, mean) : 1);

    const zScore = this.calculateZScore(input.value, mean, stdDev);
    const absZ = Math.abs(zScore);

    let flag: AbnormalDetectResult['flag'] = 'normal';
    let reason = 'Value within expected range';

    if (input.referenceLow !== undefined && input.value < input.referenceLow) {
      flag = absZ >= 3 ? 'critical_low' : 'low';
      reason = `Below reference range (${input.referenceLow})`;
    } else if (input.referenceHigh !== undefined && input.value > input.referenceHigh) {
      flag = absZ >= 3 ? 'critical_high' : 'high';
      reason = `Above reference range (${input.referenceHigh})`;
    } else if (absZ >= 3) {
      flag = zScore > 0 ? 'critical_high' : 'critical_low';
      reason = `Z-score ${zScore.toFixed(2)} exceeds ±3 SD`;
    } else if (absZ >= 2) {
      flag = zScore > 0 ? 'high' : 'low';
      reason = `Z-score ${zScore.toFixed(2)} exceeds ±2 SD`;
    }

    const isAbnormal = flag !== 'normal';
    const confidence = Math.min(0.99, 0.5 + absZ * 0.15);

    return { isAbnormal, zScore, flag, confidence, reason };
  }

  evaluateCriticalValue(input: CriticalValueInput): CriticalValueResult {
    const defaults = DEFAULT_CRITICAL_THRESHOLDS[input.testCode.toUpperCase()] ?? {};
    const criticalLow = input.criticalLow ?? defaults.criticalLow;
    const criticalHigh = input.criticalHigh ?? defaults.criticalHigh;
    const panicLow = input.panicLow ?? defaults.panicLow;
    const panicHigh = input.panicHigh ?? defaults.panicHigh;

    if (panicLow !== undefined && input.value <= panicLow) {
      return {
        isCritical: true,
        severity: 'panic',
        flag: 'panic_low',
        confidence: 0.98,
      };
    }
    if (panicHigh !== undefined && input.value >= panicHigh) {
      return {
        isCritical: true,
        severity: 'panic',
        flag: 'panic_high',
        confidence: 0.98,
      };
    }
    if (criticalLow !== undefined && input.value <= criticalLow) {
      return {
        isCritical: true,
        severity: 'critical',
        flag: 'critical_low',
        confidence: 0.92,
      };
    }
    if (criticalHigh !== undefined && input.value >= criticalHigh) {
      return {
        isCritical: true,
        severity: 'critical',
        flag: 'critical_high',
        confidence: 0.92,
      };
    }

    return { isCritical: false, severity: 'none', flag: 'normal', confidence: 0.85 };
  }

  interpretResult(input: InterpretInput): InterpretResult {
    const unit = input.unit ? ` ${input.unit}` : '';
    const { referenceLow, referenceHigh, value, testCode } = input;

    if (referenceLow !== undefined && value < referenceLow) {
      return {
        interpretation: `${testCode} is below the reference range at ${value}${unit}. Clinical correlation recommended.`,
        flag: 'low',
        confidence: 0.88,
      };
    }
    if (referenceHigh !== undefined && value > referenceHigh) {
      return {
        interpretation: `${testCode} is above the reference range at ${value}${unit}. Follow-up testing may be warranted.`,
        flag: 'high',
        confidence: 0.88,
      };
    }

    return {
      interpretation: `${testCode} is within the reference range at ${value}${unit}.`,
      flag: 'normal',
      confidence: 0.9,
    };
  }

  predictRisk(input: RiskPredictInput): RiskPredictResult {
    const contributingFactors: string[] = [];
    let weightedSum = 0;
    let totalWeight = 0;

    for (const factor of input.factors) {
      const weight = factor.weight ?? 1;
      weightedSum += factor.value * weight;
      totalWeight += weight;
      if (factor.value >= 0.7) {
        contributingFactors.push(factor.code);
      }
    }

    let riskScore = totalWeight > 0 ? weightedSum / totalWeight : 0;

    if (input.patientAge !== undefined) {
      const ageFactor = input.patientAge >= 65 ? 0.2 : input.patientAge >= 45 ? 0.1 : 0;
      riskScore = Math.min(1, riskScore + ageFactor);
      if (ageFactor > 0) contributingFactors.push('age');
    }

    let riskLevel: RiskPredictResult['riskLevel'] = 'low';
    if (riskScore >= 0.7) riskLevel = 'high';
    else if (riskScore >= 0.4) riskLevel = 'moderate';

    return {
      riskScore: Math.round(riskScore * 100) / 100,
      riskLevel,
      confidence: 0.75,
      contributingFactors,
    };
  }

  movingAverageForecast(input: ForecastInput): ForecastResult {
    const horizon = input.horizon ?? 3;
    const values = input.series.map((p) => p.value);

    if (!values.length) {
      return { forecast: [], method: 'moving_average', confidence: 0 };
    }

    const window = Math.min(3, values.length);
    const avg = this.calculateMean(values.slice(-window));
    const lastPeriod = input.series[input.series.length - 1].period;

    const forecast: TimeSeriesPoint[] = [];
    for (let i = 1; i <= horizon; i++) {
      forecast.push({
        period: `${lastPeriod}+${i}`,
        value: Math.round(avg * 100) / 100,
      });
    }

    const confidence = values.length >= 3 ? 0.7 : 0.5;
    return { forecast, method: 'moving_average', confidence };
  }

  planStaff(input: StaffPlanningInput): StaffPlanningResult {
    const capacity = input.staffCapacityPerShift ?? 20;
    const shifts = input.shiftsPerDay ?? 2;

    const recommendedStaff = input.expectedVolume.map((volume) =>
      Math.max(1, Math.ceil(volume / capacity)),
    );

    const peakStaff = Math.max(...recommendedStaff, 1);
    const totalStaffRequired = peakStaff * shifts;

    return {
      recommendedStaff,
      totalStaffRequired,
      confidence: input.expectedVolume.length >= 3 ? 0.72 : 0.55,
    };
  }

  generateChatResponse(userMessage: string, history: string[] = []): string {
    const lower = userMessage.toLowerCase();

    if (lower.includes('report') || lower.includes('result')) {
      return 'Your lab reports are available in the patient portal. Would you like help understanding a specific test?';
    }
    if (lower.includes('appointment') || lower.includes('book')) {
      return 'I can help you schedule an appointment. Please share your preferred date and test package.';
    }
    if (lower.includes('hello') || lower.includes('hi')) {
      return 'Hello! I am your lab assistant. How can I help you today?';
    }
    if (history.length > 0 && lower.includes('thank')) {
      return 'You are welcome! Let me know if you need anything else.';
    }

    return 'I understand your question. For clinical advice, please consult your physician. I can help with reports, appointments, and general lab information.';
  }

  generateVoiceResponse(transcript: string): string {
    const lower = transcript.toLowerCase();
    if (lower.includes('hours') || lower.includes('timing')) {
      return 'Our lab is open Monday through Saturday, 7 AM to 8 PM.';
    }
    if (lower.includes('location') || lower.includes('address')) {
      return 'Please visit our website or patient app for branch locations near you.';
    }
    return 'Thank you for calling. A representative will assist you shortly. For urgent results, please check your patient portal.';
  }
}
