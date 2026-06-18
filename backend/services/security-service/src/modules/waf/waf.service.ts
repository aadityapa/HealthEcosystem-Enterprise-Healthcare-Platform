import { Injectable } from '@nestjs/common';

export interface WafRule {
  id: string;
  name: string;
  action: 'allow' | 'block' | 'rate_limit';
  enabled: boolean;
}

export interface BlockedIp {
  ip: string;
  reason: string;
  blockedAt: string;
  expiresAt?: string;
}

@Injectable()
export class WafService {
  private readonly rules: WafRule[] = [
    { id: 'waf-001', name: 'SQL Injection Protection', action: 'block', enabled: true },
    { id: 'waf-002', name: 'XSS Protection', action: 'block', enabled: true },
    { id: 'waf-003', name: 'Rate Limiting', action: 'rate_limit', enabled: true },
    { id: 'waf-004', name: 'Geo Block List', action: 'block', enabled: false },
    { id: 'waf-005', name: 'Bot Detection', action: 'block', enabled: true },
  ];

  private readonly blockedIps = new Map<string, BlockedIp>();

  getStatus() {
    return {
      enabled: true,
      provider: 'stub-waf',
      rules: this.rules,
      blockedIpCount: this.blockedIps.size,
      blockedIps: Array.from(this.blockedIps.values()),
      frameworks: ['ISO 27001', 'SOC 2', 'HIPAA'],
    };
  }

  blockIp(ip: string, reason: string, ttlMinutes = 60) {
    const blockedAt = new Date();
    const expiresAt = new Date(blockedAt.getTime() + ttlMinutes * 60 * 1000);

    const entry: BlockedIp = {
      ip,
      reason,
      blockedAt: blockedAt.toISOString(),
      expiresAt: expiresAt.toISOString(),
    };

    this.blockedIps.set(ip, entry);

    return {
      blocked: true,
      entry,
      message: `IP ${ip} blocked by WAF`,
    };
  }
}
