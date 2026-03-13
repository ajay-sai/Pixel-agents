import type { Agent, Task } from '@/types';

interface Store {
  agents: Agent[];
  tasks: Task[];
}

const INITIAL_AGENTS: Agent[] = [
  {
    id: 'codebot',
    name: 'CodeBot',
    type: 'Coder',
    description: 'Expert coder specializing in TypeScript, Python, and refactoring.',
    skills: ['coding', 'refactoring', 'TypeScript', 'Python'],
    status: 'available',
    level: 5,
    cost: 8,
    color: '#00ff41',
    accentColor: '#00cc33',
    position: { x: 2, y: 2 },
  },
  {
    id: 'bughunter',
    name: 'BugHunter',
    type: 'Debugger',
    description: 'Expert debugger for tracing, profiling, and fixing bugs.',
    skills: ['debugging', 'testing', 'tracing', 'profiling'],
    status: 'available',
    level: 4,
    cost: 7,
    color: '#ff4444',
    accentColor: '#cc0000',
    position: { x: 9, y: 2 },
  },
  {
    id: 'datamind',
    name: 'DataMind',
    type: 'Researcher',
    description: 'Research agent for search, summarization, and web analysis.',
    skills: ['search', 'summarization', 'analysis', 'web'],
    status: 'available',
    level: 3,
    cost: 6,
    color: '#00ffff',
    accentColor: '#00cccc',
    position: { x: 10, y: 2 },
  },
  {
    id: 'sysforge',
    name: 'SysForge',
    type: 'Architect',
    description: 'Systems architect for planning, design patterns, and architecture.',
    skills: ['architecture', 'planning', 'design-patterns'],
    status: 'available',
    level: 6,
    cost: 10,
    color: '#ff8800',
    accentColor: '#cc6600',
    position: { x: 16, y: 2 },
  },
  {
    id: 'qadroid',
    name: 'QADroid',
    type: 'Tester',
    description: 'Testing agent for automation, coverage, and end-to-end tests.',
    skills: ['testing', 'automation', 'coverage', 'e2e'],
    status: 'available',
    level: 3,
    cost: 5,
    color: '#ffff00',
    accentColor: '#cccc00',
    position: { x: 8, y: 8 },
  },
  {
    id: 'pipebot',
    name: 'PipeBot',
    type: 'DevOps',
    description: 'DevOps agent for Docker, Kubernetes, CI/CD, and Terraform.',
    skills: ['docker', 'kubernetes', 'CI/CD', 'terraform'],
    status: 'available',
    level: 4,
    cost: 9,
    color: '#aa44ff',
    accentColor: '#8822dd',
    position: { x: 16, y: 3 },
  },
    name: 'PixelCraft',
    type: 'Designer',
    description: 'Design agent for UI, accessibility, CSS, and Figma.',
    skills: ['design', 'accessibility', 'CSS', 'Figma'],
    status: 'available',
    level: 4,
    cost: 7,
    color: '#ff00ff',
    accentColor: '#cc00cc',
    position: { x: 2, y: 8 },
  },
  {
    id: 'datalens',
    name: 'DataLens',
    type: 'Analyst',
    description: 'Data analyst for SQL, visualization, and reporting.',
    skills: ['analysis', 'reporting', 'SQL', 'visualization'],
    status: 'available',
    level: 3,
    cost: 6,
    color: '#44aaff',
    accentColor: '#2288dd',
    position: { x: 15, y: 8 },
  },
];

const store: Store = {
  agents: INITIAL_AGENTS.map(a => ({ ...a })),
  tasks: [],
};

export function getStore(): Store {
  return store;
}

export function updateStore(updater: (store: Store) => void): void {
  updater(store);
}
