import { Injectable } from '@nestjs/common';
import type { ThreatLevel } from '@health/db';

export interface SiemEventInput {
  eventType: string;
  source: string;
  severity: string;
  message: string;
  rawPayload?: Record<string, unknown>;
  sourceIp?: string;
}

export interface ThreatDetectionResult {
  ruleName: string;
  threatLevel: ThreatLevel;
  source: string;
  description: string;
  rawEvent: Record<string, unknown>;
}

const BRUTE_FORCE_THRESHOLD = 5;
const RATE_SPIKE_THRESHOLD = 100;
const SUSPICIOUS_IP_PREFIXES = ['10.99.', '192.0.2.', '203.0.113.'];

@Injectable()
export class ThreatDetectorService {
  private readonly eventCounts = new Map<string, number>();
  private readonly failedLogins = new Map<string, number>();

  detect(events: SiemEventInput[]): ThreatDetectionResult[] {
    const results: ThreatDetectionResult[] = [];

    for (const event of events) {
      const ip = event.sourceIp ?? this.extractIp(event);
      if (!ip) continue;

      const bruteForce = this.checkBruteForce(event, ip);
      if (bruteForce) results.push(bruteForce);

      const suspiciousIp = this.checkSuspiciousIp(event, ip);
      if (suspiciousIp) results.push(suspiciousIp);

      const rateSpike = this.checkRateSpike(event, ip);
      if (rateSpike) results.push(rateSpike);
    }

    return results;
  }

  resetCounters(): void {
    this.eventCounts.clear();
    this.failedLogins.clear();
  }

  private extractIp(event: SiemEventInput): string | undefined {
    const payload = event.rawPayload ?? {};
    const ip = payload['sourceIp'] ?? payload['ip'] ?? payload['clientIp'];
    return typeof ip === 'string' ? ip : undefined;
  }

  private checkBruteForce(
    event: SiemEventInput,
    ip: string,
  ): ThreatDetectionResult | null {
    const isFailedLogin =
      event.eventType === 'auth.login.failed' ||
      event.message.toLowerCase().includes('failed login');

    if (!isFailedLogin) return null;

    const count = (this.failedLogins.get(ip) ?? 0) + 1;
    this.failedLogins.set(ip, count);

    if (count < BRUTE_FORCE_THRESHOLD) return null;

    return {
      ruleName: 'brute_force',
      threatLevel: 'HIGH',
      source: ip,
      description: `${count} failed login attempts from ${ip}`,
      rawEvent: { event, failedAttempts: count },
    };
  }

  private checkSuspiciousIp(
    event: SiemEventInput,
    ip: string,
  ): ThreatDetectionResult | null {
    const isSuspicious = SUSPICIOUS_IP_PREFIXES.some((prefix) =>
      ip.startsWith(prefix),
    );

    if (!isSuspicious) return null;

    return {
      ruleName: 'suspicious_ip',
      threatLevel: 'MEDIUM',
      source: ip,
      description: `Traffic from suspicious IP range: ${ip}`,
      rawEvent: { event, ip },
    };
  }

  private checkRateSpike(
    event: SiemEventInput,
    ip: string,
  ): ThreatDetectionResult | null {
    const count = (this.eventCounts.get(ip) ?? 0) + 1;
    this.eventCounts.set(ip, count);

    if (count < RATE_SPIKE_THRESHOLD) return null;

    return {
      ruleName: 'rate_spike',
      threatLevel: 'CRITICAL',
      source: ip,
      description: `Rate spike detected: ${count} events from ${ip}`,
      rawEvent: { event, eventCount: count },
    };
  }
}
