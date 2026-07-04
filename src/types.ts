export interface Message {
  id: string;
  role: "user" | "agent";
  content: string;
  timestamp: Date;
  buildSummary?: {
    projectName: string;
    components: string[];
    files: string[];
    memoryIndexStatus: string;
    success: boolean;
    rawContent?: string;
  };
  memorySummary?: {
    datasetName: string;
    matchCount: number;
    status: string;
    contextSummary: string;
    rawResponse?: string;
  };
  errorCard?: {
    title: string;
    issue: string;
    resolution: string;
    rawError?: string;
  };
}

export interface ConsoleEvent {
  id: string;
  timestamp: Date;
  type: "info" | "webhook-a" | "webhook-b" | "success" | "error";
  message: string;
  payload?: string;
}

export interface MemoryRelation {
  source: string;
  target: string;
  rawLine: string;
}

export type NodeStatusType = "idle" | "loading" | "active" | "error";

export interface TelemetryNode {
  id: string;
  name: string; // e.g. "Architect", "Developer", "PM", "Memory Engine"
  status: NodeStatusType;
  message: string;
}

export interface WorkstationConfig {
  datasetName: string;
  apiToken: string;
  webhookAUrl: string;
  webhookBUrl: string;
  sandboxMode: boolean;
}
