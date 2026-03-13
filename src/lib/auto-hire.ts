import type { Agent, AutoHireResult } from '@/types';

const KEYWORD_MAP: Record<string, string[]> = {
  codebot: ['code', 'implement', 'build', 'develop', 'refactor', 'typescript', 'python'],
  bughunter: ['bug', 'fix', 'error', 'crash', 'debug', 'trace', 'profile'],
  datamind: ['research', 'find', 'search', 'summarize', 'analyze', 'web'],
  sysforge: ['architect', 'design', 'system', 'plan', 'structure', 'pattern'],
  qadroid: ['test', 'qa', 'coverage', 'verify', 'e2e', 'automation'],
  pipebot: ['deploy', 'ci', 'docker', 'kubernetes', 'pipeline', 'terraform'],
  pixelcraft: ['ui', 'ux', 'interface', 'style', 'design', 'css', 'figma'],
  datalens: ['analyze', 'data', 'report', 'metrics', 'sql', 'visualization'],
};

export function autoHire(description: string, agents: Agent[]): AutoHireResult {
  const lower = description.toLowerCase();
  const selectedAgents: Agent[] = [];
  const reasoning: Record<string, string> = {};

  for (const [agentId, keywords] of Object.entries(KEYWORD_MAP)) {
    const matched = keywords.filter(kw => lower.includes(kw));
    if (matched.length > 0) {
      const agent = agents.find(a => a.id === agentId && a.status === 'available');
      if (agent) {
        selectedAgents.push(agent);
        reasoning[agentId] = `Matched keywords: ${matched.join(', ')}`;
      }
    }
  }

  return { agents: selectedAgents, reasoning };
}
