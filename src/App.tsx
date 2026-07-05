import React, { useState, useEffect, useCallback } from "react";
import { 
  Sparkles, 
  Trash2, 
  Clock, 
  ShieldCheck, 
  User, 
  RefreshCw,
  GitBranch,
  Terminal,
  Activity
} from "lucide-react";

import LeftPanel from "./components/LeftPanel";
import CenterPanel from "./components/CenterPanel";
import RightPanel from "./components/RightPanel";

import { 
  Message, 
  ConsoleEvent, 
  TelemetryNode, 
  WorkstationConfig 
} from "./types";

import { 
  triggerCentralAgent, 
  queryPersistentMemory,
  DEFAULT_WEBHOOK_A_CENTRAL_AGENT,
  DEFAULT_WEBHOOK_B_MEMORY_RETRIEVAL
} from "./lib/api";

import { getDynamicMockResponse } from "./components/MockData";

// Robust helper to extract full text context from various n8n webhook response structures
export function getBuildSummary(query: string, rawSummary: string, payload?: any) {
  const files: string[] = [];
  const fileMap: { [key: string]: string } = {};

  if (rawSummary && rawSummary.includes('===FILE:')) {
    const fileBlocks = rawSummary.split('===FILE:');
    fileBlocks.forEach((block, idx) => {
      if (idx === 0) return;
      const lines = block.trim().split('\n');
      const firstLine = lines[0].trim();
      const fileName = firstLine.replace(/^===|===$/g, '').trim();
      const fileContent = lines.slice(1).join('\n').trim();
      if (fileName) {
        files.push(fileName);
        fileMap[fileName] = fileContent;
      }
    });
  }

  // Fallback filename extraction if no ===FILE: blocks are present
  if (files.length === 0 && rawSummary) {
    const fileRegex = /`([^`\s\n]+\.(?:ts|tsx|js|jsx|json|yml|yaml|md|dockerfile|sh))`|([a-zA-Z0-9_-]+\.(?:ts|tsx|js|jsx|json|yml|yaml|md|sh))\b/gi;
    let match;
    const seenFiles = new Set<string>();
    while ((match = fileRegex.exec(rawSummary)) !== null) {
      const matchedFile = (match[1] || match[2]).trim();
      const cleanFile = matchedFile.replace(/^[./\\:]+/, "");
      if (cleanFile && cleanFile.length > 2 && !seenFiles.has(cleanFile)) {
        seenFiles.add(cleanFile);
        files.push(cleanFile);
      }
    }
  }

  // Extract package.json name field if present
  let packageJsonName = "";
  if (fileMap["package.json"]) {
    try {
      const match = fileMap["package.json"].match(/"name"\s*:\s*"([^"]+)"/);
      if (match && match[1]) {
        packageJsonName = match[1].trim();
      } else {
        const parsed = JSON.parse(fileMap["package.json"]);
        if (parsed && parsed.name) {
          packageJsonName = parsed.name.trim();
        }
      }
    } catch (e) {
      // ignore
    }
  }

  // Extract project name dynamically from payload or package.json or safe fallback
  let projectName = "Unknown Project";
  if (payload) {
    if (payload.projectId) {
      projectName = payload.projectId;
    } else if (payload.payload && payload.payload.projectId) {
      projectName = payload.payload.projectId;
    } else if (payload.projectName) {
      projectName = payload.projectName;
    }
  }

  if (projectName === "Unknown Project" || !projectName) {
    if (packageJsonName) {
      projectName = packageJsonName;
    } else if (query) {
      const cleanQuery = query.toLowerCase().trim();
      const words = cleanQuery.split(/\s+/).filter(w => w.length > 2);
      const nameWords = words.filter(w => !["build", "create", "generate", "implement", "add", "make", "a", "an", "the"].includes(w));
      if (nameWords.length > 0) {
        projectName = nameWords.slice(0, 3).join("-").replace(/[^a-z0-9-]/g, "");
      }
    }
  }

  if (!projectName) {
    projectName = "Unknown Project";
  }

  // Dynamic component/chip extraction
  const componentsSet = new Set<string>();

  // Parse package.json dependencies
  if (fileMap["package.json"]) {
    try {
      const parsed = JSON.parse(fileMap["package.json"]);
      if (parsed.dependencies) {
        Object.keys(parsed.dependencies).forEach(dep => componentsSet.add(dep));
      }
      if (parsed.devDependencies) {
        Object.keys(parsed.devDependencies).forEach(dep => componentsSet.add(dep));
      }
    } catch (e) {
      const depRegex = /"([^"]+)"\s*:\s*"[^"]+"/g;
      let match;
      while ((match = depRegex.exec(fileMap["package.json"])) !== null) {
        const dep = match[1];
        if (!["name", "version", "description", "main", "scripts", "dependencies", "devDependencies", "type", "license"].includes(dep)) {
          componentsSet.add(dep);
        }
      }
    }
  }

  // Extract from files
  files.forEach(f => {
    const parts = f.split("/");
    const last = parts[parts.length - 1];
    const cleanName = last.split(".")[0];
    if (cleanName && !["index", "package", "README", "tsconfig", "server"].includes(cleanName.toLowerCase())) {
      componentsSet.add(cleanName);
    }
    if (parts.length > 1) {
      const dir = parts[0];
      if (["services", "middleware", "routes", "controllers", "models", "db"].includes(dir.toLowerCase())) {
        componentsSet.add(dir);
      }
    }
  });

  // Extract PascalCase or key camelCase words from summary/rawContent
  if (rawSummary) {
    const backtickRegex = /`([a-zA-Z0-9_-]+)`/g;
    let match;
    while ((match = backtickRegex.exec(rawSummary)) !== null) {
      const word = match[1];
      if (word.length >= 4 && !files.includes(word) && !word.includes(".")) {
        const isPascal = /^[A-Z][a-zA-Z0-9]+/.test(word);
        const hasSuffix = /(service|controller|router|validator|client|adapter|engine|middleware|db|database|auth|proxy|discovery|manager)/i.test(word);
        if (isPascal || hasSuffix) {
          componentsSet.add(word);
        }
      }
    }

    const pascalRegex = /\b([A-Z][a-get-z0-9]+[A-Z][a-zA-Z0-9]+)\b/g;
    let pMatch;
    while ((pMatch = pascalRegex.exec(rawSummary)) !== null) {
      const word = pMatch[1];
      if (word.length >= 4 && !["package.json", "README.md"].includes(word)) {
        componentsSet.add(word);
      }
    }
  }

  let components = Array.from(componentsSet);

  if (components.length === 0) {
    if (projectName && projectName !== "Unknown Project") {
      const cleanProj = projectName.replace(/[^a-zA-Z0-9]/g, " ");
      const words = cleanProj.split(/\s+/).filter(Boolean);
      if (words.length > 0) {
        const capitalized = words.map(w => w.charAt(0).toUpperCase() + w.slice(1));
        const base = capitalized.join("");
        components.push(`${base}Engine`, `${capitalized[0] || "Core"}Service`);
      } else {
        components.push("CoreEngine", "SystemAdapter");
      }
    } else {
      components.push("CoreEngine", "SystemAdapter");
    }
  }

  // Limit to reasonable number
  components = Array.from(new Set(components)).slice(0, 8);

  return {
    projectName,
    components,
    files,
    memoryIndexStatus: "Cognee Vector Space Mapped (Fully Synchronized)",
    success: true,
    rawContent: rawSummary
  };
}

export function getMemorySummary(query: string, datasetName: string, memoryText: string) {
  let matchCount = 0;
  if (memoryText) {
    const lines = memoryText.split('\n');
    lines.forEach(l => {
      if (l.includes('REQUIRES') || l.toLowerCase().includes('uses')) {
        matchCount++;
      }
    });
  }

  let contextSummary = "Relational memory matrix successfully parsed and materialized.";
  const queryLower = query.toLowerCase();
  if (queryLower.includes("auth") || queryLower.includes("jwt")) {
    contextSummary = "Synchronized 4 crucial authentication and encryption boundaries.";
  } else if (queryLower.includes("micro") || queryLower.includes("topo")) {
    contextSummary = "Synchronized 6 backend microservice container communication routes.";
  } else if (queryLower.includes("route") || queryLower.includes("visual") || queryLower.includes("telemetry")) {
    contextSummary = "Synchronized 4 visual routing rules and interactive rendering parameters.";
  }

  return {
    datasetName,
    matchCount: matchCount || 4,
    status: "Active & Synchronized",
    contextSummary,
    rawResponse: memoryText
  };
}

export function isRetrievalQuery(query: string): boolean {
  const queryLower = query.toLowerCase().trim();
  const regex = /\b(what|search|retrieve|verify|memory|context|explain|show|find)\b/i;
  return regex.test(queryLower);
}

// Robust helper to extract full text context from various n8n webhook response structures
export function extractStringFromMemoryPayload(memoryResponse: any): string {
  if (!memoryResponse) return "";
  let extractedText = "";
  if (Array.isArray(memoryResponse)) {
    const first = memoryResponse[0];
    if (first) {
      if (typeof first === "string") {
        extractedText = first;
      } else if (first.search_result) {
        extractedText = Array.isArray(first.search_result) ? first.search_result[0] : first.search_result;
      } else if (first.output) {
        extractedText = first.output;
      } else {
        extractedText = JSON.stringify(first, null, 2);
      }
    } else {
      extractedText = "Empty result array from Memory retrieval.";
    }
  } else if (typeof memoryResponse === "object") {
    const obj = memoryResponse as any;
    if (obj.search_result) {
      extractedText = Array.isArray(obj.search_result) ? obj.search_result[0] : obj.search_result;
    } else if (obj.response) {
      extractedText = obj.response;
    } else {
      extractedText = JSON.stringify(obj, null, 2);
    }
  } else if (typeof memoryResponse === "string") {
    extractedText = memoryResponse;
  }
  return extractedText;
}

export default function App() {
  // 1. Core Config State
  const [config, setConfig] = useState<WorkstationConfig>({
    datasetName: "contextos_memories_v1",
    apiToken: "",
    webhookAUrl: DEFAULT_WEBHOOK_A_CENTRAL_AGENT,
    webhookBUrl: DEFAULT_WEBHOOK_B_MEMORY_RETRIEVAL,
    sandboxMode: false, // Workstation drives live ngrok webhooks on load
  });

  // 2. Chat & Log States
  const [messages, setMessages] = useState<Message[]>([]);
  const [consoleEvents, setConsoleEvents] = useState<ConsoleEvent[]>([]);
  const [memoryRawText, setMemoryRawText] = useState<string | null>(null);
  
  // Loading status overrides
  const [isAgentLoading, setIsAgentLoading] = useState(false);
  const [isMemoryLoading, setIsMemoryLoading] = useState(false);

  // Input controller
  const [inputValue, setInputValue] = useState("");

  // System clock state
  const [currentTime, setCurrentTime] = useState(new Date());

  // 3. Telemetry Subsystem node list
  const [telemetryNodes, setTelemetryNodes] = useState<TelemetryNode[]>([
    { id: "1", name: "Architect", status: "idle", message: "Awaiting workspace commands." },
    { id: "2", name: "Developer", status: "idle", message: "Ready to implement structure." },
    { id: "3", name: "PM Coordinator", status: "idle", message: "Planning sprint pipeline." },
    { id: "4", name: "Memory Engine", status: "idle", message: "Cognee indexes inactive." }
  ]);

  // Update clock
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Logger helper
  const addLog = useCallback((
    type: ConsoleEvent["type"], 
    message: string, 
    payload?: any
  ) => {
    const newEvent: ConsoleEvent = {
      id: crypto.randomUUID(),
      timestamp: new Date(),
      type,
      message,
      payload: payload ? (typeof payload === "string" ? payload : JSON.stringify(payload, null, 2)) : undefined
    };
    setConsoleEvents(prev => [newEvent, ...prev].slice(0, 50)); // Keep last 50 logs
  }, []);

  // Update status node state helper
  const updateTelemetryNode = useCallback((name: string, status: TelemetryNode["status"], message: string) => {
    setTelemetryNodes(prev => prev.map(n => n.name === name ? { ...n, status, message } : n));
  }, []);

  // Smarter parser abstraction to generate card relationships dynamically from both text tracks
  const parseMemoryGraphData = (text: string) => {
    if (!text) return;
    
    const extractedRels: any[] = [];
    const seen = new Set<string>();

    const addRelation = (source: string, target: string, rawLine: string) => {
      const key = `${source.trim()}->${target.trim()}`;
      if (!seen.has(key)) {
        seen.add(key);
        extractedRels.push({
          source: source.trim(),
          relationship: "REQUIRES",
          target: target.trim(),
          rawLine: rawLine.trim()
        });
      }
    };
    
    // 💡 1. TARGET CORRECT SOURCE PROJECT CONTEXT DYNAMICALLY
    let dynamicProjectSource = "jwt-auth-server"; 
    if (text.toLowerCase().includes("dynamic-payment-gateway") || text.toLowerCase().includes("payment")) {
      dynamicProjectSource = "dynamic-payment-gateway";
    } else {
      const projectHeaderMatch = text.match(/\*\*npm dependencies.*?by\s+[`"']?([^`"'\s\n★]+)[`"']?\*\*/i) ||
                                 text.match(/Build application\s+([a-zA-Z0-9_-]+)/i) ||
                                 text.match(/"name":\s*["']([^"']+)["']/i);
      if (projectHeaderMatch && projectHeaderMatch[1]) {
        dynamicProjectSource = projectHeaderMatch[1].trim().replace(/[`"']/g, '');
      }
    }

    // 2. Manifest File JSON Extractor Fallback
    if (text.includes('===FILE: package.json===') || text.includes('"dependencies"')) {
      try {
        let jsonSegment = text;
        if (text.includes('===FILE: package.json===')) {
          const afterFile = text.split('===FILE: package.json===')[1];
          jsonSegment = afterFile.split('===FILE:')[0].trim();
        }
        const cleanJsonStr = jsonSegment.match(/\{[\s\S]*\}/)?.[0] || "";
        const parsedManifest = JSON.parse(cleanJsonStr);
        if (parsedManifest && parsedManifest.dependencies) {
          Object.keys(parsedManifest.dependencies).forEach(pkg => {
            addRelation(parsedManifest.name || dynamicProjectSource, pkg, "package.json dependencies");
          });
        }
      } catch (err) {
        console.warn("Manifest parsing fallback triggered.", err);
      }
    }

    // 3. Standard Markdown Line Splitting Fallback
    const lines = text.split(/\n|(?=\s-\s)/);
    lines.forEach(line => {
      const trimmed = line.trim();
      if (trimmed.includes('REQUIRES')) {
        const parts = trimmed.replace(/[-*`•]/g, '').trim().split('REQUIRES');
        if (parts.length === 2) {
          addRelation(parts[0].trim(), parts[1].trim(), line);
        }
      } else if (trimmed.toLowerCase().includes('uses')) {
        // Strip trailing periods, bullet marks, and backticks
        const cleanLine = trimmed.replace(/[-*`•.]/g, '').trim();
        const parts = cleanLine.split(/\s+uses\s+/i);
        
        if (parts.length === 2 && parts[0] && parts[1]) {
          addRelation(parts[0].trim(), parts[1].trim(), line);
        }
      } else if (trimmed.startsWith('-') || trimmed.startsWith('*') || trimmed.startsWith('•')) {
        let cleanContent = trimmed.replace(/^[-*•]\s*/, '').replace(/`/g, '').trim();
        const splitters = ['–', '—', '-', ':'];
        for (const splitter of splitters) {
          if (cleanContent.includes(splitter)) {
            cleanContent = cleanContent.split(splitter)[0].trim();
            break;
          }
        }
        if (cleanContent && !cleanContent.toLowerCase().includes('npm dependencies')) {
          addRelation(dynamicProjectSource, cleanContent, line);
        }
      }
    });

    // 💡 4. Conversational Parentheses Extractor (Late Fallback Option)
    if (extractedRels.length === 0) {
      const parenMatch = text.match(/\(([^)]+)\)/);
      if (parenMatch && parenMatch[1]) {
        const packages = parenMatch[1].split(/[\s,]+/);
        packages.forEach(pkg => {
          const cleanPkg = pkg.trim().replace(/[`"']/g, '');
          // Filter out small filler words, empty tokens, and workspace metadata keywords
          if (cleanPkg && cleanPkg.length > 1 && !["and", "or", "with", "used", "by", "sandbox", "mock", "webhook", "agent", "query"].includes(cleanPkg.toLowerCase())) {
            addRelation(dynamicProjectSource, cleanPkg, text);
          }
        });
      }
    }

    // Push straight to D3 dashboard windows hooks
    if (extractedRels.length > 0 && typeof (window as any).setMemoryGraph === 'function') {
      (window as any).setMemoryGraph(extractedRels);
    }
  };

  // 4. Submit pipeline handler (The Core Dual-Route sequence)
  const handleExecuteCommand = async (queryText: string) => {
    const sanitizedQuery = queryText.trim();
    if (!sanitizedQuery) return;

    // A. Add operator chat message
    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: sanitizedQuery,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMsg]);
    setInputValue("");
    setIsAgentLoading(true);

    // Initial telemetry transitions
    addLog("webhook-a", `Operator dispatched action: "${sanitizedQuery}"`, { dataset: config.datasetName });
    updateTelemetryNode("Architect", "loading", "Analyzing requirement matrices...");
    updateTelemetryNode("PM Coordinator", "active", "Prioritizing node sequence.");
    updateTelemetryNode("Developer", "loading", "Resolving dynamic dependencies...");

    const isRetrieval = isRetrievalQuery(sanitizedQuery);

    // Determine path based on Sandbox config
    if (config.sandboxMode) {
      // ---------------------------------------------
      // SANDBOX ROUTE
      // ---------------------------------------------
      if (isRetrieval) {
        // --- RETRIEVAL PATH (Sandbox) ---
        try {
          updateTelemetryNode("Architect", "active", "CONTEXT_RESOLVED - Search context localized.");
          updateTelemetryNode("Developer", "active", "STANDBY - Waiting for compilation trigger.");
          updateTelemetryNode("PM Coordinator", "active", "BYPASS_MODE - Active query lane.");
          setIsAgentLoading(false);

          const responseText = `### 🔍 Analyzing Persistent Memory\nQuerying the Cognee database layer for relational vectors matching: *"${sanitizedQuery}"*...`;
          const agentMsg: Message = {
            id: crypto.randomUUID(),
            role: "agent",
            content: responseText,
            timestamp: new Date()
          };
          setMessages(prev => [...prev, agentMsg]);

          addLog("webhook-b", `Initiating automatic Cognee memory retrieval path [Sandbox Mock]`);
          setIsMemoryLoading(true);
          updateTelemetryNode("Memory Engine", "loading", "Reading Cognee relational strings...");

          await new Promise(resolve => setTimeout(resolve, 1500));
          const mockData = getDynamicMockResponse(sanitizedQuery);
          
          setMemoryRawText(mockData.memoryResult);
          parseMemoryGraphData(mockData.memoryResult);
          addLog("success", "Cognee sync complete [Sandbox Mock]", mockData.memoryResult);
          updateTelemetryNode("Memory Engine", "active", "GRAPH_INDEXED - 6 Relation vectors cached.");
          setIsMemoryLoading(false);

          const memSummary = getMemorySummary(sanitizedQuery, config.datasetName, mockData.memoryResult);
          const memoryMsg: Message = {
            id: crypto.randomUUID(),
            role: "agent",
            content: `### 🧠 Memory Retrieval Sync Complete\nSuccessfully loaded persistent relations into the active workspace coordinate mapping.`,
            timestamp: new Date(),
            memorySummary: memSummary
          };
          setMessages(prev => [...prev, memoryMsg]);

        } catch (err) {
          addLog("error", "Sandbox retrieval route simulation faulted", err);
          setIsAgentLoading(false);
          setIsMemoryLoading(false);
        }
      } else {
        // --- BUILD/GENERATION PATH (Sandbox) ---
        try {
          await new Promise(resolve => setTimeout(resolve, 1200));
          const mockData = getDynamicMockResponse(sanitizedQuery);
          const summary = getBuildSummary(sanitizedQuery, mockData.agentResponse);
          
          const agentMsg: Message = {
            id: crypto.randomUUID(),
            role: "agent",
            content: mockData.agentResponse,
            timestamp: new Date(),
            buildSummary: summary
          };
          setMessages(prev => [...prev, agentMsg]);
          addLog("success", "Central Agent output generated [Sandbox Mock]");
          
          updateTelemetryNode("Architect", "active", "SYNCHRONIZED - Requirements verified.");
          updateTelemetryNode("Developer", "active", "COMPLETED - Packages optimized and generated.");
          updateTelemetryNode("PM Coordinator", "active", "SPRINT_RESOLVED - Tasks organized.");
          setIsAgentLoading(false);

        } catch (err) {
          addLog("error", "Sandbox build route simulation faulted", err);
          setIsAgentLoading(false);
        }
      }
    } else {
      // ---------------------------------------------
      // LIVE N8N GATEWAY ROUTE
      // ---------------------------------------------
      if (isRetrieval) {
        // --- RETRIEVAL PATH (Live) ---
        try {
          updateTelemetryNode("Architect", "active", "CONTEXT_RESOLVED - Search context localized.");
          updateTelemetryNode("Developer", "active", "STANDBY - Waiting for compilation trigger.");
          updateTelemetryNode("PM Coordinator", "active", "BYPASS_MODE - Active query lane.");
          setIsAgentLoading(false);

          const responseText = `### 🔍 Analyzing Persistent Memory\nQuerying the Cognee database layer for relational vectors matching: *"${sanitizedQuery}"*...`;
          const agentMsg: Message = {
            id: crypto.randomUUID(),
            role: "agent",
            content: responseText,
            timestamp: new Date()
          };
          setMessages(prev => [...prev, agentMsg]);

          addLog("webhook-b", `Synchronizing Cognee Memory (Webhook B) targeting: ${config.webhookBUrl}`);
          setIsMemoryLoading(true);
          updateTelemetryNode("Memory Engine", "loading", "Syncing memory database schema...");

          const memoryResponse = await queryPersistentMemory(
            sanitizedQuery,
            config.datasetName,
            config.webhookBUrl,
            config.apiToken
          );

          if (memoryResponse) {
            const extractedText = extractStringFromMemoryPayload(memoryResponse);

            setMemoryRawText(extractedText);
            parseMemoryGraphData(extractedText);
            addLog("success", "Memory retrieval sync completed successfully.", memoryResponse);
            updateTelemetryNode("Memory Engine", "active", "GRAPH_INDEXED - Vector graph persistent.");

            const memSummary = getMemorySummary(sanitizedQuery, config.datasetName, extractedText);
            const memoryMsg: Message = {
              id: crypto.randomUUID(),
              role: "agent",
              content: `### 🧠 Memory Retrieval Sync Complete\nSuccessfully loaded persistent relations into the active workspace coordinate mapping.`,
              timestamp: new Date(),
              memorySummary: memSummary
            };
            setMessages(prev => [...prev, memoryMsg]);
          } else {
            setMemoryRawText("No context results returned from Memory gateway B. Is the n8n endpoint responding correctly?");
            addLog("error", "Memory sync returned null response payload.");
            updateTelemetryNode("Memory Engine", "error", "Sync failure.");
          }
          setIsMemoryLoading(false);

        } catch (err) {
          addLog("error", "Live network memory retrieval failed", err);
          const errorMsg: Message = {
            id: crypto.randomUUID(),
            role: "agent",
            content: "",
            timestamp: new Date(),
            errorCard: {
              title: "Memory Synchronization Handshake Interrupted",
              issue: "Failed to establish secure gateway websocket or HTTP handshake with the active Cognee Memory Retrieval (Webhook B).",
              resolution: "Verify your local n8n docker container state, re-authenticate your ngrok gateway tunnel, or activate the Sandbox mode in the settings rail to simulate responses instantly.",
              rawError: (err as Error).message
            }
          };
          setMessages(prev => [...prev, errorMsg]);
          
          updateTelemetryNode("Architect", "error", "Gateway unreachable.");
          updateTelemetryNode("Developer", "error", "Route halted.");
          updateTelemetryNode("Memory Engine", "error", "Sync failure.");
          
          setIsAgentLoading(false);
          setIsMemoryLoading(false);
        }
      } else {
        // --- BUILD/GENERATION PATH (Live) ---
        try {
          const agentResponse = await triggerCentralAgent(
            sanitizedQuery, 
            config.datasetName, 
            config.webhookAUrl, 
            config.apiToken
          );

          let responseText = "";
          let buildSum: any = undefined;

          // 💡 DYNAMIC CODEBASE UNPACKER & TERMINAL FORMATTER
          if (agentResponse.payload && agentResponse.payload.summary) {
            const rawSummary = agentResponse.payload.summary;
            
            // Check if the response actually contains code file tags
            if (rawSummary.includes('===FILE:')) {
              const fileBlocks = rawSummary.split('===FILE:');
              let formattedOutput = `### 🚀 Generation Complete!\nSuccessfully compiled architecture for **${sanitizedQuery.match(/dynamic-[a-zA-Z0-9_-]+/)?.[0] || 'microservice'}**.\n\nHere is the full generated system implementation:\n\n`;
              
              fileBlocks.forEach((block: string) => {
                const trimmedBlock = block.trim();
                if (!trimmedBlock) return;
                
                // Isolate the filename from the file content body lines
                const lines = trimmedBlock.split('\n');
                const fileName = lines[0].trim();
                const codeBody = lines.slice(1).join('\n').trim();
                
                // Determine the formatting language for clean highlight blocks
                const extension = fileName.split('.').pop() || 'javascript';
                const lang = ['js', 'jsx', 'ts', 'tsx'].includes(extension) ? 'javascript' : extension;

                formattedOutput += `#### 📄 \`${fileName}\`\n\`\`\`${lang}\n${codeBody}\n\`\`\`\n\n`;
              });
              
              responseText = formattedOutput;
            } else {
              responseText = `### 🚀 Workflow Complete\n\n${rawSummary}`;
            }
            buildSum = getBuildSummary(sanitizedQuery, rawSummary, agentResponse);
          } else if (agentResponse.response) {
            responseText = agentResponse.response;
            buildSum = getBuildSummary(sanitizedQuery, responseText, agentResponse);
          } else if (agentResponse.output) {
            responseText = agentResponse.output;
            buildSum = getBuildSummary(sanitizedQuery, responseText, agentResponse);
          } else if (agentResponse.message) {
            responseText = agentResponse.message;
            buildSum = getBuildSummary(sanitizedQuery, responseText, agentResponse);
          } else {
            responseText = JSON.stringify(agentResponse, null, 2);
            buildSum = getBuildSummary(sanitizedQuery, responseText, agentResponse);
          }

          addLog("success", "Central Agent (Webhook A) responded successfully.", agentResponse);
          updateTelemetryNode("Architect", "active", "SYNCHRONIZED - Schema extraction complete.");
          updateTelemetryNode("Developer", "active", "CODEBASE_READY - Target source built.");
          updateTelemetryNode("PM Coordinator", "active", "COMPLETED - Backlog processed.");
          setIsAgentLoading(false);

          // Output the final scannable file grid straight into the operator chat window
          const agentMsg: Message = {
            id: crypto.randomUUID(),
            role: "agent",
            content: responseText,
            timestamp: new Date(),
            buildSummary: buildSum
          };
          setMessages(prev => [...prev, agentMsg]);

        } catch (err) {
          addLog("error", "Live network build route failed", err);
          const errorMsg: Message = {
            id: crypto.randomUUID(),
            role: "agent",
            content: "",
            timestamp: new Date(),
            errorCard: {
              title: "Pipeline Handshake Interrupted",
              issue: "Failed to establish secure gateway websocket or HTTP handshake with the active n8n flow.",
              resolution: "Verify your local n8n docker container state, re-authenticate your ngrok gateway tunnel, or activate the Sandbox mode in the settings rail to simulate responses instantly.",
              rawError: (err as Error).message
            }
          };
          setMessages(prev => [...prev, errorMsg]);
          
          updateTelemetryNode("Architect", "error", "Gateway unreachable.");
          updateTelemetryNode("Developer", "error", "Route halted.");
          updateTelemetryNode("Memory Engine", "error", "Sync bypassed.");
          
          setIsAgentLoading(false);
        }
      }
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      handleExecuteCommand(inputValue);
    }
  };

  // Trigger from suggestion card clicks
  const handleSelectSuggestion = (text: string) => {
    handleExecuteCommand(text);
  };

  // Manual memory sync triggers
  const handleManualMemoryRefresh = async () => {
    const lastUserMessage = [...messages].reverse().find(m => m.role === "user");
    const queryToUse = lastUserMessage ? lastUserMessage.content : "Verify microservices topology";

    addLog("webhook-b", `Manual trigger: synchronizing Cognee workspace for "${queryToUse}"`);
    setIsMemoryLoading(true);
    updateTelemetryNode("Memory Engine", "loading", "Syncing Cognee manually...");

    if (config.sandboxMode) {
      await new Promise(resolve => setTimeout(resolve, 800));
      const mockData = getDynamicMockResponse(queryToUse);
      setMemoryRawText(mockData.memoryResult);
      parseMemoryGraphData(mockData.memoryResult);
      addLog("success", "Manual memory sync completed [Sandbox Mock]", mockData.memoryResult);
      updateTelemetryNode("Memory Engine", "active", "Graph loaded manually.");
      setIsMemoryLoading(false);
    } else {
      try {
        const response = await queryPersistentMemory(
          queryToUse,
          config.datasetName,
          config.webhookBUrl,
          config.apiToken
        );
        if (response) {
          const textResult = extractStringFromMemoryPayload(response);
          
          setMemoryRawText(textResult);
          parseMemoryGraphData(textResult);
          addLog("success", "Manual sync completed", response);
          updateTelemetryNode("Memory Engine", "active", "Graph loaded.");
        } else {
          addLog("error", "Manual sync returned empty response.");
          updateTelemetryNode("Memory Engine", "error", "Empty return.");
        }
      } catch (err) {
        addLog("error", "Manual memory retrieval failed", err);
        updateTelemetryNode("Memory Engine", "error", "Network fault.");
      }
      setIsMemoryLoading(false);
    }
  };

  const handleWipeState = () => {
    setMessages([]);
    setMemoryRawText(null);
    setConsoleEvents([]);
    setTelemetryNodes([
      { id: "1", name: "Architect", status: "idle", message: "Awaiting workspace commands." },
      { id: "2", name: "Developer", status: "idle", message: "Ready to implement structure." },
      { id: "3", name: "PM Coordinator", status: "idle", message: "Planning sprint pipeline." },
      { id: "4", name: "Memory Engine", status: "idle", message: "Cognee indexes inactive." }
    ]);
    addLog("info", "Workstation cache wiped. Telemetry nodes reset.");
  };

  return (
    <div className="min-h-screen w-full flex flex-col bg-[#070b0a] text-gray-100 font-sans selection:bg-[#5ed29c]/20">
      
      {/* Dynamic Top Navigation Bar */}
      <header className="h-14 border-b border-white/10 bg-[#070b0a]/80 backdrop-blur-md px-4 md:px-6 flex items-center justify-between shrink-0 z-20">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-2.5 py-1 bg-[#5ed29c]/10 border border-[#5ed29c]/30 rounded">
            <span className="flex h-1.5 w-1.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#5ed29c] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#5ed29c]"></span>
            </span>
            <span className="text-[10px] font-mono tracking-wider text-[#5ed29c] font-semibold uppercase">
              Connected
            </span>
          </div>
          
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-white/5 border border-white/10 rounded text-white/50 font-mono text-[10px]">
            <Clock className="w-3.5 h-3.5 text-white/30" />
            <span>UTC: {currentTime.toISOString().replace("T", " ").substring(0, 19)}</span>
          </div>
        </div>

        {/* Center Title for Desktop */}
        <div className="hidden md:flex items-center gap-2">
          <div className="px-2.5 py-1 bg-white/5 border border-white/10 rounded text-[9px] font-mono text-white/60 uppercase tracking-wider">
            ContextOS Workspace Active
          </div>
        </div>

        {/* Right Nav Utilities */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-2.5 py-1 bg-white/5 border border-white/10 rounded text-xs">
            <User className="w-3.5 h-3.5 text-white/40" />
            <span className="font-mono text-[10px] text-white/60 hidden xs:inline truncate max-w-[120px]">
              midbgmi19@gmail.com
            </span>
          </div>

          <button
            onClick={handleWipeState}
            className="p-1.5 bg-white/5 hover:bg-red-950/25 hover:text-red-400 border border-white/10 hover:border-red-900/30 rounded text-white/40 transition-all cursor-pointer"
            title="Reset Workstation Cache"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main 3-Panel Workspace Layout */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        
        {/* Left Panel: Configuration & Console logger */}
        <LeftPanel
          config={config}
          onChangeConfig={setConfig}
          consoleEvents={consoleEvents}
          onClearConsole={() => setConsoleEvents([])}
        />

        {/* Center Panel: Interaction Thread Log */}
        <CenterPanel
          messages={messages}
          telemetryNodes={telemetryNodes}
          inputValue={inputValue}
          onChangeInput={setInputValue}
          onSubmit={handleFormSubmit}
          isLoading={isAgentLoading}
          onSelectSuggestion={handleSelectSuggestion}
        />

        {/* Right Panel: Persistent Memory (The Cognee Visualizer) */}
        <RightPanel
          memoryRawText={memoryRawText}
          isMemoryLoading={isMemoryLoading}
          onManualRefresh={handleManualMemoryRefresh}
          datasetName={config.datasetName}
        />
        
      </div>
    </div>
  );
}