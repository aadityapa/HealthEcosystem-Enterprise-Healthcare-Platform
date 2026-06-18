import { Injectable } from '@nestjs/common';

export interface WestgardViolationResult {
  ruleCode: string;
  description: string;
  severity: 'warning' | 'reject';
}

@Injectable()
export class WestgardRulesService {
  evaluate(zScores: number[]): WestgardViolationResult[] {
    if (zScores.length === 0) return [];

    const violations: WestgardViolationResult[] = [];
    const current = zScores[zScores.length - 1];

    if (Math.abs(current) > 3) {
      violations.push({
        ruleCode: '1-3s',
        description: 'One point exceeds ±3 SD',
        severity: 'reject',
      });
    }

    if (Math.abs(current) > 2) {
      violations.push({
        ruleCode: '1-2s',
        description: 'One point exceeds ±2 SD',
        severity: 'warning',
      });
    }

    if (zScores.length >= 2) {
      const prev = zScores[zScores.length - 2];
      if (Math.abs(current) > 2 && Math.abs(prev) > 2 && sameSide(current, prev)) {
        violations.push({
          ruleCode: '2-2s',
          description: 'Two consecutive points exceed ±2 SD on the same side',
          severity: 'reject',
        });
      }

      if (Math.abs(current - prev) > 4) {
        violations.push({
          ruleCode: 'R-4s',
          description: 'Range between consecutive points exceeds 4 SD',
          severity: 'reject',
        });
      }
    }

    if (zScores.length >= 4) {
      const lastFour = zScores.slice(-4);
      if (lastFour.every((z) => Math.abs(z) > 1) && sameSide(...lastFour)) {
        violations.push({
          ruleCode: '4-1s',
          description: 'Four consecutive points exceed ±1 SD on the same side',
          severity: 'reject',
        });
      }
    }

    if (zScores.length >= 10) {
      const lastTen = zScores.slice(-10);
      if (lastTen.every((z) => z > 0) || lastTen.every((z) => z < 0)) {
        violations.push({
          ruleCode: '10x',
          description: 'Ten consecutive points on the same side of the mean',
          severity: 'reject',
        });
      }
    }

    return dedupeViolations(violations);
  }

  calculateZScore(value: number, mean: number, sd: number): number {
    if (sd === 0) return 0;
    return (value - mean) / sd;
  }
}

function sameSide(...values: number[]): boolean {
  if (values.length === 0) return false;
  const allPositive = values.every((v) => v > 0);
  const allNegative = values.every((v) => v < 0);
  return allPositive || allNegative;
}

function dedupeViolations(
  violations: WestgardViolationResult[],
): WestgardViolationResult[] {
  const seen = new Set<string>();
  return violations.filter((v) => {
    if (seen.has(v.ruleCode)) return false;
    seen.add(v.ruleCode);
    return true;
  });
}
