import type { AgentType, AgentsDashboardStats, AiAgentRecord } from '@/types';

export const mockAgentsDashboardStats: AgentsDashboardStats = {
  activeAgents: 8,
  sessionsToday: 1247,
  avgResolutionTime: 42,
  satisfactionScore: 4.6,
  agentsTrend: 14.3,
  sessionsTrend: 28.5,
  resolutionTrend: -15.2,
  satisfactionTrend: 3.8,
};

export const mockAiAgents: AiAgentRecord[] = [
  { id: 'ag1', agentCode: 'AGT-PATIENT-001', name: 'Patient Care Assistant', type: 'patient', model: 'gpt-4o', capabilities: 'Report explanation, appointment booking, FAQs', sessionsToday: 520, status: 'active' },
  { id: 'ag2', agentCode: 'AGT-PATIENT-002', name: 'WhatsApp Patient Bot', type: 'patient', model: 'gpt-4o-mini', capabilities: 'Report delivery, payment reminders', sessionsToday: 380, status: 'active' },
  { id: 'ag3', agentCode: 'AGT-DOCTOR-001', name: 'Clinical Decision Support', type: 'doctor', model: 'gpt-4o', capabilities: 'Differential diagnosis, drug interactions', sessionsToday: 145, status: 'active' },
  { id: 'ag4', agentCode: 'AGT-DOCTOR-002', name: 'Referral Insights Agent', type: 'doctor', model: 'claude-3.5', capabilities: 'Referral trends, patient summaries', sessionsToday: 62, status: 'active' },
  { id: 'ag5', agentCode: 'AGT-LAB-001', name: 'Lab Operations Agent', type: 'lab', model: 'gpt-4o', capabilities: 'TAT optimization, QC analysis, workload balancing', sessionsToday: 88, status: 'active' },
  { id: 'ag6', agentCode: 'AGT-LAB-002', name: 'Result Interpretation Agent', type: 'lab', model: 'gpt-4o', capabilities: 'Abnormal flagging, smart comments', sessionsToday: 210, status: 'training' },
  { id: 'ag7', agentCode: 'AGT-MGMT-001', name: 'Executive Insights Agent', type: 'management', model: 'gpt-4o', capabilities: 'Revenue analysis, branch comparison, forecasting', sessionsToday: 34, status: 'active' },
  { id: 'ag8', agentCode: 'AGT-MGMT-002', name: 'Compliance Monitor Agent', type: 'management', model: 'claude-3.5', capabilities: 'NABL audit prep, policy compliance', sessionsToday: 18, status: 'disabled' },
];

export function getAgentsByType(type: AgentType): AiAgentRecord[] {
  return mockAiAgents.filter((a) => a.type === type);
}
