export const AgentType = {
  PATIENT: 'PATIENT',
  DOCTOR: 'DOCTOR',
  LAB: 'LAB',
  MANAGEMENT: 'MANAGEMENT',
} as const;

export type AgentTypeValue = (typeof AgentType)[keyof typeof AgentType];
