import type {
  AutomationRule,
  WorkflowDashboardStats,
  WorkflowDefinition,
  WorkflowInstance,
  WorkflowTask,
} from '@/types';

export const mockWorkflowDashboardStats: WorkflowDashboardStats = {
  activeDefinitions: 18,
  runningInstances: 47,
  pendingTasks: 23,
  automationRules: 12,
  definitionsTrend: 5.5,
  instancesTrend: 12.8,
  tasksTrend: -8.2,
  automationTrend: 16.7,
};

export const mockWorkflowDefinitions: WorkflowDefinition[] = [
  { id: 'wd1', definitionCode: 'WF-SAMPLE-LIFECYCLE', name: 'Sample Lifecycle', category: 'LIMS', version: 3, steps: 8, triggers: 'Order created', status: 'active' },
  { id: 'wd2', definitionCode: 'WF-RESULT-VERIFY', name: 'Result Verification', category: 'LIMS', version: 2, steps: 5, triggers: 'Result submitted', status: 'active' },
  { id: 'wd3', definitionCode: 'WF-INVOICE-APPROVE', name: 'Invoice Approval', category: 'Billing', version: 1, steps: 4, triggers: 'Invoice > ₹50,000', status: 'active' },
  { id: 'wd4', definitionCode: 'WF-QC-CAPA', name: 'QC CAPA Workflow', category: 'QC', version: 2, steps: 6, triggers: 'QC failure', status: 'active' },
  { id: 'wd5', definitionCode: 'WF-ONBOARD-FRANCHISE', name: 'Franchise Onboarding', category: 'Admin', version: 1, steps: 12, triggers: 'Manual', status: 'draft' },
];

export const mockWorkflowInstances: WorkflowInstance[] = [
  { id: 'wi1', instanceCode: 'INS-20260608-001', definitionName: 'Sample Lifecycle', startedBy: 'Lab Tech - Mumbai', startedAt: '2026-06-08T08:30:00', currentStep: 'Processing', status: 'running' },
  { id: 'wi2', instanceCode: 'INS-20260608-002', definitionName: 'Result Verification', startedBy: 'Pathologist - Delhi', startedAt: '2026-06-08T09:15:00', currentStep: 'Pathologist Review', status: 'running' },
  { id: 'wi3', instanceCode: 'INS-20260608-003', definitionName: 'Invoice Approval', startedBy: 'Billing Manager', startedAt: '2026-06-08T07:00:00', currentStep: 'Completed', status: 'completed' },
  { id: 'wi4', instanceCode: 'INS-20260607-089', definitionName: 'QC CAPA Workflow', startedBy: 'QC Lead', startedAt: '2026-06-07T16:45:00', currentStep: 'Root Cause Analysis', status: 'running' },
  { id: 'wi5', instanceCode: 'INS-20260607-088', definitionName: 'Sample Lifecycle', startedBy: 'Lab Tech - Bangalore', startedAt: '2026-06-07T14:20:00', currentStep: 'Failed', status: 'failed' },
];

export const mockWorkflowTasks: WorkflowTask[] = [
  { id: 'wt1', taskCode: 'TSK-001', instanceCode: 'INS-20260608-002', assignee: 'Dr. Anita Desai', taskType: 'Approval', dueAt: '2026-06-08T12:00:00', priority: 'high', status: 'pending' },
  { id: 'wt2', taskCode: 'TSK-002', instanceCode: 'INS-20260608-001', assignee: 'Lab Tech - Mumbai', taskType: 'Processing', dueAt: '2026-06-08T11:00:00', priority: 'medium', status: 'in-progress' },
  { id: 'wt3', taskCode: 'TSK-003', instanceCode: 'INS-20260607-089', assignee: 'QC Lead', taskType: 'Investigation', dueAt: '2026-06-08T18:00:00', priority: 'high', status: 'pending' },
  { id: 'wt4', taskCode: 'TSK-004', instanceCode: 'INS-20260608-003', assignee: 'Finance Head', taskType: 'Approval', dueAt: '2026-06-07T17:00:00', priority: 'medium', status: 'overdue' },
  { id: 'wt5', taskCode: 'TSK-005', instanceCode: 'INS-20260608-003', assignee: 'Billing Manager', taskType: 'Review', dueAt: '2026-06-08T10:00:00', priority: 'low', status: 'completed' },
];

export const mockAutomationRules: AutomationRule[] = [
  { id: 'ar1', ruleCode: 'AUTO-CRITICAL-ALERT', name: 'Critical Result Alert', trigger: 'Critical flag on result', action: 'Notify pathologist + SMS patient', executionsToday: 3, lastTriggered: '2026-06-08T09:45:00', status: 'active' },
  { id: 'ar2', ruleCode: 'AUTO-QC-FAIL', name: 'QC Failure Escalation', trigger: 'QC run failed', action: 'Start CAPA workflow', executionsToday: 1, lastTriggered: '2026-06-08T07:30:00', status: 'active' },
  { id: 'ar3', ruleCode: 'AUTO-INVOICE-REMIND', name: 'Overdue Invoice Reminder', trigger: 'Invoice overdue > 7 days', action: 'Send email reminder', executionsToday: 12, lastTriggered: '2026-06-08T08:00:00', status: 'active' },
  { id: 'ar4', ruleCode: 'AUTO-DEVICE-OFFLINE', name: 'Device Offline Alert', trigger: 'Device offline > 5 min', action: 'PagerDuty incident', executionsToday: 2, lastTriggered: '2026-06-08T06:15:00', status: 'active' },
  { id: 'ar5', ruleCode: 'AUTO-EXPIRY-NOTIFY', name: 'Reagent Expiry Warning', trigger: 'Reagent expires in 30 days', action: 'Notify inventory manager', executionsToday: 0, lastTriggered: '2026-06-07T09:00:00', status: 'disabled' },
];
