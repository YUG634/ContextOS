export interface MockSession {
  query: string;
  agentResponse: string;
  memoryResult: string;
}

export const MOCK_SESSIONS: Record<string, MockSession> = {
  "Verify microservices topology": {
    query: "Verify microservices topology",
    agentResponse: `### 🕸️ System Microservices Analysis

The cognitive graph extraction for **contextos_memories_v1** has completed successfully. 

Our spatial analyzer mapped **6 critical core modules** and verified their connection paths.

#### Key Observations:
1. **Authentication Boundary**: \`jwt-auth-server\` is the main gatekeeper.
2. **Persistence Boundary**: \`postgres-db\` uses \`pg-vector\` for high-density spatial and semantic vector embeddings.
3. **Edge Routing**: \`contextos-core\` orchestrates incoming telemetry streams and binds them directly into the Cognee Engine.

*Telemetry state status:* **OPTIMAL (Green)**. All downstream dependencies have been fully indexed in the memory cache.`,
    memoryResult: "jwt-auth-server REQUIRES express\npostgres-db REQUIRES pg-vector\nauth-server REQUIRES redis-cache\nredis-cache REQUIRES ioredis\ncontextos-core REQUIRES jwt-auth-server\ncontextos-core REQUIRES postgres-db"
  },
  "Deploy auth middleware requirements": {
    query: "Deploy auth middleware requirements",
    agentResponse: `### 🛡️ Authentication Protocol Validation

Our cognitive validation confirms that the deployment of the JWT security middleware requires explicit container dependencies.

#### Active Security Modules:
- **Session Hub**: \`auth-service\`
- **Identity Provider**: \`oauth-manager\`
- **Secret Manager**: \`vault-api\`

These packages are mapped onto secured clusters. All authentication handshakes are validated through cryptographic signatures.`,
    memoryResult: "auth-service REQUIRES jsonwebtoken\nauth-service REQUIRES bcryptjs\noauth-manager REQUIRES passport-oauth2\nvault-api REQUIRES google-auth-library"
  },
  "Configure telemetry visual routing specs": {
    query: "Configure telemetry visual routing specs",
    agentResponse: `### 🗺️ Visual Router & Graph Configurations

Parsing graphic orchestration requirements. The system has resolved front-end dependencies required to display the real-time graph pipeline.

- We've identified **4 front-end assets** that depend on dynamic animation and vector rendering engines.
- The **D3 Force Layout** is selected as the primary visual engine for persistent memory mapping.`,
    memoryResult: "visual-router REQUIRES react-router-dom\nvisual-router REQUIRES tailwindcss\nvisual-router REQUIRES motion\ngraph-visualizer REQUIRES d3-force"
  }
};

export function getDynamicMockResponse(query: string): MockSession {
  // Normalize query to check for key matches
  const normalized = query.toLowerCase();
  
  if (normalized.includes("micro") || normalized.includes("topo") || normalized.includes("graph")) {
    return MOCK_SESSIONS["Verify microservices topology"];
  }
  if (normalized.includes("auth") || normalized.includes("jwt") || normalized.includes("secure")) {
    return MOCK_SESSIONS["Deploy auth middleware requirements"];
  }
  if (normalized.includes("route") || normalized.includes("visual") || normalized.includes("telemetry") || normalized.includes("d3")) {
    return MOCK_SESSIONS["Configure telemetry visual routing specs"];
  }

  // Generate a dynamic mock session based on user input
  const words = query.split(/\s+/).filter(w => w.length > 3).map(w => w.replace(/[^a-zA-Z0-9-]/g, "").toLowerCase());
  const primaryWord = words[0] || "custom-service";
  const secondaryWord = words[1] || "contextos-module";
  
  const formattedPrimary = `${primaryWord}-node`;
  const formattedSecondary = `${secondaryWord}-engine`;

  return {
    query,
    agentResponse: `### 🧩 Custom Context Extraction: "${query}"

A dynamic memory analysis was triggered for the custom token query. The Cognee cognitive pipeline has created a temporary schema mapping for this trace.

#### Generated Node Graph:
- **Primary Hub**: \`${formattedPrimary}\`
- **Secondary Adapter**: \`${formattedSecondary}\`
- **Utility Interface**: \`contextos-core-api\`

This local branch is currently active in sandbox memory. To store this permanently, deploy the graph schemas onto your live server.`,
    memoryResult: `${formattedPrimary} REQUIRES ${formattedSecondary}\n${formattedSecondary} REQUIRES contextos-core-api\ncontextos-core-api REQUIRES express\n${formattedPrimary} REQUIRES dotenv`
  };
}
