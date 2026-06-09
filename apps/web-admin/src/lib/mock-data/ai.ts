import type {
  AiChatSession,
  AiDashboardStats,
  ClinicalAiInsight,
  OperationalAiInsight,
  VoiceAssistantSession,
  WhatsAppConversation,
} from '@/types';

export const mockAiDashboardStats: AiDashboardStats = {
  activeInsights: 24,
  anomaliesDetected: 8,
  chatSessionsToday: 142,
  whatsappMessages: 856,
  insightsTrend: 18.5,
  anomaliesTrend: -12.0,
  chatTrend: 22.3,
  whatsappTrend: 15.7,
};

export const mockClinicalAiInsights: ClinicalAiInsight[] = [
  { id: 'cai1', patientName: 'Ramesh Iyer', testName: 'Potassium', insightType: 'anomaly', severity: 'critical', description: 'Critical high potassium (6.8 mEq/L) — immediate clinical correlation recommended.', detectedAt: '2026-06-08T09:15:00', status: 'new' },
  { id: 'cai2', patientName: 'Ananya Patel', testName: 'HbA1c + FBS', insightType: 'risk', severity: 'high', description: 'Prediabetes progression pattern detected — HbA1c trending upward over 3 visits.', detectedAt: '2026-06-08T08:42:00', status: 'reviewed' },
  { id: 'cai3', patientName: 'Vikram Singh', testName: 'Lipid Profile', insightType: 'recommendation', severity: 'medium', description: 'LDL/HDL ratio suggests adding ApoB test for cardiovascular risk assessment.', detectedAt: '2026-06-07T16:30:00', status: 'new' },
  { id: 'cai4', patientName: 'Priya Sharma', testName: 'Thyroid Panel', insightType: 'anomaly', severity: 'high', description: 'TSH suppression with normal T4 — suggest free T3 and antibody panel.', detectedAt: '2026-06-07T14:20:00', status: 'reviewed' },
  { id: 'cai5', patientName: 'Lakshmi Reddy', testName: 'CBC', insightType: 'risk', severity: 'low', description: 'Mild microcytic anemia pattern — iron studies recommended if not recently done.', detectedAt: '2026-06-06T11:05:00', status: 'dismissed' },
];

export const mockOperationalAiInsights: OperationalAiInsight[] = [
  { id: 'oai1', area: 'Sample Processing', insightType: 'Bottleneck', impact: 'high', description: 'Hematology section TAT exceeded SLA for 18% of samples today.', suggestedAction: 'Reassign 1 technologist from biochemistry during peak hours (10 AM–2 PM).', detectedAt: '2026-06-08T10:00:00' },
  { id: 'oai2', area: 'Home Collection', insightType: 'Route Optimization', impact: 'medium', description: 'Route HC-MUM-042 has 3 stops with >45 min travel gaps.', suggestedAction: 'Reorder stops 4-6 to reduce total route time by ~35 minutes.', detectedAt: '2026-06-08T07:30:00' },
  { id: 'oai3', area: 'Inventory', insightType: 'Stock Alert', impact: 'high', description: 'Glucose reagent consumption 40% above forecast for Mumbai Central.', suggestedAction: 'Trigger emergency PO or inter-branch transfer from Pune.', detectedAt: '2026-06-07T18:00:00' },
  { id: 'oai4', area: 'Billing', insightType: 'Revenue Leakage', impact: 'medium', description: '12 corporate invoices missing PO reference — may delay payment by 15+ days.', suggestedAction: 'Send automated reminder to account managers for PO attachment.', detectedAt: '2026-06-07T09:00:00' },
  { id: 'oai5', area: 'Devices', insightType: 'Predictive Maintenance', impact: 'low', description: 'Cobas 6000 error rate trending up — maintenance due within 72 hours.', suggestedAction: 'Schedule preventive maintenance before weekend peak load.', detectedAt: '2026-06-06T15:00:00' },
];

export const mockAiChatSessions: AiChatSession[] = [
  { id: 'chat1', sessionId: 'CHAT-2026-8842', userName: 'Reception - Mumbai', topic: 'Test pricing inquiry', messages: 12, startedAt: '2026-06-08T10:30:00', status: 'active' },
  { id: 'chat2', sessionId: 'CHAT-2026-8841', userName: 'Dr. Amit Verma', topic: 'Report interpretation', messages: 8, startedAt: '2026-06-08T09:45:00', status: 'closed' },
  { id: 'chat3', sessionId: 'CHAT-2026-8840', userName: 'Lab Tech - Delhi', topic: 'QC troubleshooting', messages: 15, startedAt: '2026-06-08T08:20:00', status: 'closed' },
  { id: 'chat4', sessionId: 'CHAT-2026-8839', userName: 'Patient Portal User', topic: 'Report download help', messages: 6, startedAt: '2026-06-08T07:55:00', status: 'closed' },
  { id: 'chat5', sessionId: 'CHAT-2026-8838', userName: 'Admin - Bangalore', topic: 'Dashboard configuration', messages: 20, startedAt: '2026-06-07T16:00:00', status: 'closed' },
];

export const mockWhatsAppConversations: WhatsAppConversation[] = [
  { id: 'wa1', phone: '+91 98765 43210', patientName: 'Priya Sharma', lastMessage: 'Your report is ready. Download: link', messageCount: 8, lastActiveAt: '2026-06-08T10:15:00', status: 'active' },
  { id: 'wa2', phone: '+91 98200 55667', patientName: 'Rajesh Kumar', lastMessage: 'Home collection confirmed for tomorrow 8 AM', messageCount: 5, lastActiveAt: '2026-06-08T09:30:00', status: 'waiting' },
  { id: 'wa3', phone: '+91 98190 77889', patientName: 'Ananya Patel', lastMessage: 'Please share your ABHA number for linking', messageCount: 3, lastActiveAt: '2026-06-08T08:45:00', status: 'active' },
  { id: 'wa4', phone: '+91 98450 33221', patientName: 'Vikram Singh', lastMessage: 'Payment received. Invoice #INV-2026-08422', messageCount: 12, lastActiveAt: '2026-06-07T17:20:00', status: 'closed' },
  { id: 'wa5', phone: '+91 98765 12345', patientName: 'Lakshmi Reddy', lastMessage: 'Your appointment is confirmed for June 10', messageCount: 4, lastActiveAt: '2026-06-07T14:00:00', status: 'closed' },
];

export const mockVoiceAssistantSessions: VoiceAssistantSession[] = [
  { id: 'voice1', sessionId: 'VOICE-2026-1204', callerPhone: '+91 98765 43210', intent: 'Report status inquiry', duration: 95, outcome: 'resolved', startedAt: '2026-06-08T10:00:00' },
  { id: 'voice2', sessionId: 'VOICE-2026-1203', callerPhone: '+91 98200 55667', intent: 'Book home collection', duration: 180, outcome: 'resolved', startedAt: '2026-06-08T09:15:00' },
  { id: 'voice3', sessionId: 'VOICE-2026-1202', callerPhone: '+91 98190 77889', intent: 'Billing query', duration: 45, outcome: 'transferred', startedAt: '2026-06-08T08:30:00' },
  { id: 'voice4', sessionId: 'VOICE-2026-1201', callerPhone: '+91 98450 33221', intent: 'Test preparation info', duration: 120, outcome: 'resolved', startedAt: '2026-06-07T16:45:00' },
  { id: 'voice5', sessionId: 'VOICE-2026-1200', callerPhone: '+91 98765 12345', intent: 'Branch location', duration: 30, outcome: 'abandoned', startedAt: '2026-06-07T15:20:00' },
];
