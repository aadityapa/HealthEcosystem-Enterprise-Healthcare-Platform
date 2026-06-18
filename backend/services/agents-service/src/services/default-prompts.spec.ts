import { AgentType } from '@/common/agent-type';
import { DEFAULT_AGENT_PROMPTS } from './default-prompts';

describe('DEFAULT_AGENT_PROMPTS', () => {
  it('defines prompts for all agent types', () => {
    const types = Object.values(AgentType);
    for (const type of types) {
      expect(DEFAULT_AGENT_PROMPTS[type]).toBeDefined();
      expect(DEFAULT_AGENT_PROMPTS[type].systemPrompt.length).toBeGreaterThan(20);
      expect(DEFAULT_AGENT_PROMPTS[type].capabilities.length).toBeGreaterThan(0);
    }
  });

  it('has unique agent names per type', () => {
    const names = Object.values(DEFAULT_AGENT_PROMPTS).map((p) => p.name);
    expect(new Set(names).size).toBe(names.length);
  });
});
