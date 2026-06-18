import { Injectable } from '@nestjs/common';
import { ResultFlag } from '@health/db';

export interface ClinicalRange {
  low?: number;
  high?: number;
  criticalLow?: number;
  criticalHigh?: number;
  panicLow?: number;
  panicHigh?: number;
  unit?: string;
}

export interface DeltaRule {
  parameterCode: string;
  maxDeltaPercent?: number;
  maxDeltaAbsolute?: number;
}

export interface ClinicalValidationInput {
  parameterCode: string;
  value: string;
  unit?: string;
  range?: ClinicalRange;
  previousValue?: string;
  deltaRule?: DeltaRule;
}

export interface ClinicalValidationResult {
  flag: ResultFlag;
  isAbnormal: boolean;
  isPanic: boolean;
  deltaExceeded: boolean;
  referenceRange: string | null;
  messages: string[];
}

@Injectable()
export class ClinicalValidationEngineService {
  validate(input: ClinicalValidationInput): ClinicalValidationResult {
    const messages: string[] = [];
    const numericValue = Number(input.value);

    if (Number.isNaN(numericValue)) {
      return {
        flag: ResultFlag.ABNORMAL,
        isAbnormal: true,
        isPanic: false,
        deltaExceeded: false,
        referenceRange: null,
        messages: ['Non-numeric value for numeric parameter'],
      };
    }

    const range = input.range;
    let flag: ResultFlag = ResultFlag.NORMAL;
    let isPanic = false;

    if (range) {
      if (range.panicLow !== undefined && numericValue <= range.panicLow) {
        flag = ResultFlag.CRITICAL_LOW;
        isPanic = true;
        messages.push(`Panic low: value ${numericValue} <= ${range.panicLow}`);
      } else if (range.criticalLow !== undefined && numericValue <= range.criticalLow) {
        flag = ResultFlag.CRITICAL_LOW;
        messages.push(`Critical low: value ${numericValue} <= ${range.criticalLow}`);
      } else if (range.panicHigh !== undefined && numericValue >= range.panicHigh) {
        flag = ResultFlag.CRITICAL_HIGH;
        isPanic = true;
        messages.push(`Panic high: value ${numericValue} >= ${range.panicHigh}`);
      } else if (range.criticalHigh !== undefined && numericValue >= range.criticalHigh) {
        flag = ResultFlag.CRITICAL_HIGH;
        messages.push(`Critical high: value ${numericValue} >= ${range.criticalHigh}`);
      } else if (range.low !== undefined && numericValue < range.low) {
        flag = ResultFlag.LOW;
        messages.push(`Below reference range: ${numericValue} < ${range.low}`);
      } else if (range.high !== undefined && numericValue > range.high) {
        flag = ResultFlag.HIGH;
        messages.push(`Above reference range: ${numericValue} > ${range.high}`);
      }
    }

    let deltaExceeded = false;
    if (input.previousValue && input.deltaRule) {
      const prev = Number(input.previousValue);
      if (!Number.isNaN(prev)) {
        const absoluteDelta = Math.abs(numericValue - prev);
        const percentDelta = prev !== 0 ? (absoluteDelta / Math.abs(prev)) * 100 : absoluteDelta;

        if (
          input.deltaRule.maxDeltaAbsolute !== undefined &&
          absoluteDelta > input.deltaRule.maxDeltaAbsolute
        ) {
          deltaExceeded = true;
          messages.push(
            `Delta check failed: absolute change ${absoluteDelta} > ${input.deltaRule.maxDeltaAbsolute}`,
          );
        }

        if (
          input.deltaRule.maxDeltaPercent !== undefined &&
          percentDelta > input.deltaRule.maxDeltaPercent
        ) {
          deltaExceeded = true;
          messages.push(
            `Delta check failed: percent change ${percentDelta.toFixed(1)}% > ${input.deltaRule.maxDeltaPercent}%`,
          );
        }
      }
    }

    return {
      flag,
      isAbnormal: flag !== ResultFlag.NORMAL || deltaExceeded,
      isPanic,
      deltaExceeded,
      referenceRange: range ? this.formatRange(range) : null,
      messages,
    };
  }

  private formatRange(range: ClinicalRange): string {
    const parts: string[] = [];
    if (range.low !== undefined) parts.push(String(range.low));
    if (range.high !== undefined) {
      parts.push(parts.length ? `- ${range.high}` : String(range.high));
    }
    return parts.join(' ') || 'N/A';
  }
}
