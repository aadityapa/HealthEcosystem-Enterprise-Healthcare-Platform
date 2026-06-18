import { Injectable } from '@nestjs/common';
import { Gender, ResultFlag } from '@health/db';

export interface ReferenceRange {
  gender?: Gender | 'ALL';
  ageMin?: number;
  ageMax?: number;
  low?: number;
  high?: number;
  criticalLow?: number;
  criticalHigh?: number;
  textNormal?: string;
}

export interface ValidationInput {
  value: string;
  dataType: string;
  referenceRanges: ReferenceRange[];
  gender?: Gender;
  ageYears?: number;
}

export interface ValidationResult {
  flag: ResultFlag;
  referenceRange: string | null;
  isAbnormal: boolean;
}

@Injectable()
export class ResultValidationService {
  validate(input: ValidationInput): ValidationResult {
    const { value, dataType, referenceRanges, gender, ageYears } = input;

    if (dataType === 'text' || dataType === 'enum') {
      return this.validateText(value, referenceRanges);
    }

    const numericValue = Number(value);
    if (Number.isNaN(numericValue)) {
      return {
        flag: ResultFlag.ABNORMAL,
        referenceRange: null,
        isAbnormal: true,
      };
    }

    const range = this.selectRange(referenceRanges, gender, ageYears);
    if (!range) {
      return {
        flag: ResultFlag.NORMAL,
        referenceRange: null,
        isAbnormal: false,
      };
    }

    const referenceRange = this.formatRange(range);
    const flag = this.flagNumeric(numericValue, range);

    return {
      flag,
      referenceRange,
      isAbnormal: flag !== ResultFlag.NORMAL,
    };
  }

  private selectRange(
    ranges: ReferenceRange[],
    gender?: Gender,
    ageYears?: number,
  ): ReferenceRange | undefined {
    return ranges.find((range) => {
      const genderMatch =
        !range.gender ||
        range.gender === 'ALL' ||
        !gender ||
        range.gender === gender;
    const ageMatch =
      ageYears === undefined ||
      ((range.ageMin === undefined || ageYears >= range.ageMin) &&
        (range.ageMax === undefined || ageYears <= range.ageMax));
      return genderMatch && ageMatch;
    });
  }

  private flagNumeric(value: number, range: ReferenceRange): ResultFlag {
    const { low, high, criticalLow, criticalHigh } = range;

    if (criticalLow !== undefined && value <= criticalLow) {
      return ResultFlag.CRITICAL_LOW;
    }
    if (criticalHigh !== undefined && value >= criticalHigh) {
      return ResultFlag.CRITICAL_HIGH;
    }
    if (low !== undefined && value < low) {
      return ResultFlag.LOW;
    }
    if (high !== undefined && value > high) {
      return ResultFlag.HIGH;
    }

    return ResultFlag.NORMAL;
  }

  private validateText(
    value: string,
    ranges: ReferenceRange[],
  ): ValidationResult {
    const range = ranges[0];
    if (!range?.textNormal) {
      return {
        flag: ResultFlag.NORMAL,
        referenceRange: null,
        isAbnormal: false,
      };
    }

    const isNormal = value.toLowerCase() === range.textNormal.toLowerCase();
    return {
      flag: isNormal ? ResultFlag.NORMAL : ResultFlag.ABNORMAL,
      referenceRange: range.textNormal,
      isAbnormal: !isNormal,
    };
  }

  private formatRange(range: ReferenceRange): string {
    if (range.textNormal) {
      return range.textNormal;
    }
    const parts: string[] = [];
    if (range.low !== undefined) parts.push(String(range.low));
    if (range.high !== undefined) {
      parts.push(parts.length ? `- ${range.high}` : String(range.high));
    }
    return parts.join(' ') || 'N/A';
  }
}
