export type AgentStatus = 'available' | 'hired' | 'working' | 'idle';
export type TaskStatus = 'pending' | 'in-progress' | 'done' | 'failed';
export type AgentType = 'Coder' | 'Debugger' | 'Researcher' | 'Architect' | 'Tester' | 'DevOps' | 'Designer' | 'Analyst';

export interface Agent {
  id: string;
  name: string;
  type: AgentType;
  description: string;
  skills: string[];
  status: AgentStatus;
  level: number;
  cost: number;
  currentTask?: string;
  color: string;
  accentColor: string;
  position: { x: number; y: number };
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  assignedAgents: string[];
  subtasks: SubTask[];
  progress: number;
  createdAt: number;
}

export interface SubTask {
  id: string;
  title: string;
  status: TaskStatus;
  agentId?: string;
}

export interface AutoHireResult {
  agents: Agent[];
  reasoning: Record<string, string>;
}

export interface WorldCell {
  x: number;
  y: number;
  type: 'empty' | 'code-zone' | 'research-zone' | 'test-zone' | 'deploy-zone' | 'design-zone';
  agentId?: string;
}
