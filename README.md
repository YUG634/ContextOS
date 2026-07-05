# ContextOS

> **Production-grade multi-agent AI workspace featuring real-time project generation, semantic memory persistence, and intelligent context retrieval.**

<div align="center">

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![React 19](https://img.shields.io/badge/React-19.x-61DAFB?logo=react&logoColor=white)](https://reactjs.org/)
[![TypeScript 5.8](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![n8n](https://img.shields.io/badge/n8n-Workflow_Automation-EA4B6A?logo=n8n&logoColor=white)](https://n8n.io/)
[![Vite](https://img.shields.io/badge/Vite-5.x-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)

[Live Demo](https://context-os-gules.vercel.app) • [Documentation](#-documentation) • [Getting Started](#-quick-start) • [Architecture](#-system-architecture)

</div>

---

## 🎯 The Problem

AI-generated project knowledge is **ephemeral and trapped**. When multi-agent systems create software architectures, the critical context—design decisions, dependency relationships, component interactions—vanishes after generation.

**Result?** 
- ❌ Lost architectural decisions
- ❌ No semantic understanding of components
- ❌ Impossible to query project context later
- ❌ Manual documentation that rots immediately
- ❌ Zero reusability across projects

---

## 💡 The Solution

**ContextOS** is a persistent semantic workspace that captures, indexes, and retrieves project context as it's being generated.

Instead of ephemeral AI workflows, ContextOS creates a **living knowledge graph** of your entire codebase—queryable, explorable, and always in sync.

### How It Works

```
User Request
    ↓
[Central Agent] → Generate full project
    ↓
[Architecture Extractor] → Parse components & dependencies
    ↓
[Memory Indexer] → Embed into semantic graph (Cognee)
    ↓
[Persistent Storage] → Query anytime via natural language
    ↓
React Dashboard → Visualize & explore relationships
```

---

## 🏗️ System Architecture

```mermaid
graph TB
    subgraph Frontend["🎨 Frontend Layer"]
        UI["React 19 Dashboard<br/>Real-time telemetry"]
        UI -->|Webhook Trigger| WH1["Webhook Client A"]
    end

    subgraph Orchestration["⚙️ Orchestration Layer"]
        WH1 -->|HTTP| n8n["n8n Workflow Engine<br/>Multi-agent coordinator"]
        n8n -->|Orchestrate| Agent1["🤖 Project Generator"]
        n8n -->|Orchestrate| Agent2["🔍 Architecture Extractor"]
        n8n -->|Orchestrate| Agent3["🧠 Memory Indexer"]
    end

    subgraph Storage["💾 Storage Layer"]
        Agent1 & Agent2 & Agent3 -->|Persist| DB["PostgreSQL<br/>Supabase"]
        Agent3 -->|Embed| Cognee["Cognee<br/>Semantic Graph DB"]
    end

    subgraph Retrieval["🔎 Retrieval Layer"]
        WH2["Webhook Client B<br/>Memory Query"]
        DB -->|Query| WH2
        Cognee -->|Vector Search| WH2
        WH2 -->|Results| UI
    end

    subgraph Sync["🔄 Synchronization"]
        DB ←→|Bidirectional Sync| Cognee
    end

    style Frontend fill:#e1f5fe,stroke:#01579b,stroke-width:2px
    style Orchestration fill:#f3e5f5,stroke:#4a148c,stroke-width:2px
    style Storage fill:#e8f5e9,stroke:#1b5e20,stroke-width:2px
    style Retrieval fill:#fff3e0,stroke:#e65100,stroke-width:2px
    style Sync fill:#fce4ec,stroke:#880e4f,stroke-width:2px
```

---

## ✨ Core Features

| Feature | Description |
|---------|-------------|
| 🤖 **Multi-Agent Orchestration** | Coordinated workflow across specialized agents for generation, extraction, and indexing |
| 🧠 **Semantic Knowledge Graph** | Persistent memory indexed via Cognee for intelligent context retrieval |
| ⚡ **Dual-Webhook Architecture** | Asynchronous request routing for generation and memory queries |
| 💾 **Persistent Context** | All metadata, architecture, and relationships stored in PostgreSQL |
| 🔍 **Natural Language Queries** | Ask questions about your codebase in plain English |
| 📊 **Real-Time Visualization** | Interactive dashboards showing workflow execution and component relationships |
| 🎯 **Telemetry Pipeline** | Live status updates from all agents (Architect, Developer, PM Coordinator, Memory Engine) |
| 🔄 **Auto-Synchronization** | Continuous bidirectional sync between structured and semantic storage |

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18+
- **npm** or **yarn**
- n8n instance (local or cloud)
- Supabase project
- Cognee API access

### Installation

```bash
# Clone the repository
git clone https://github.com/YUG634/ContextOS.git
cd ContextOS

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your webhook URLs and API tokens
```

### Environment Variables

```bash
# Frontend Configuration
VITE_APP_NAME=ContextOS

# Webhook Routes (n8n instances)
VITE_WEBHOOK_A_CENTRAL_AGENT=http://localhost:5678/webhook/project-generator
VITE_WEBHOOK_B_MEMORY_RETRIEVAL=http://localhost:5678/webhook/memory-sync

# Storage Backend
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_KEY=eyJxxx...

# Semantic Memory
VITE_COGNEE_API_URL=http://localhost:8000
VITE_COGNEE_API_KEY=your_api_key

# Development
VITE_SANDBOX_MODE=false
VITE_DEBUG_MODE=false
```

### Run Locally

```bash
# Development server (HMR enabled)
npm run dev

# Access dashboard
# Open http://localhost:3000
```

### Production Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

---

## 📋 Usage Examples

### Generate a Project

```
📝 User Input:
"Create a JWT authentication service with rate limiting and Redis caching"

🤖 ContextOS Response:
✅ Project Generator → Creates complete auth service
✅ Architecture Extractor → Identifies 12 components, 31 dependencies
✅ Memory Indexer → Embeds into Cognee (4.2s)

📊 Result Card:
├── Project: jwt-auth-service
├── Components: [JWTValidator, RedisCache, RateLimiter, ...]
├── Dependencies: [express, redis, jsonwebtoken, ...]
└── Memory Status: "Fully Synchronized"
```

### Query Project Context

```
📝 User Query:
"How does authentication work in this project?"

🔍 ContextOS Search:
Querying semantic graph...

✅ Found 3 relevant contexts:

1️⃣ JWT Authentication Flow
   • JWTValidator validates incoming tokens
   • Uses RedisCache for blacklist storage
   • RateLimiter enforces max attempts
   🔗 Related files: auth.service.ts, middleware.ts

2️⃣ Session Persistence
   • Sessions stored in PostgreSQL
   • Refresh tokens rotated on each use
   • Cognee indexed all auth boundaries

3️⃣ Permission Middleware
   • Role-based access control (RBAC)
   • Protected routes via authentication decorator
   • 4 permission levels enforced
```

---

## 🛠️ Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | React 19 + TypeScript 5.8 | Interactive dashboard & telemetry UI |
| **Build Tool** | Vite 6.2 | Lightning-fast HMR & production builds |
| **Styling** | Tailwind CSS 4.1 | Utility-first design system |
| **Orchestration** | n8n | Multi-agent workflow coordination |
| **Communication** | Webhooks (HTTP) | Asynchronous request routing |
| **Database** | Supabase (PostgreSQL) | Structured metadata storage |
| **Semantic Memory** | Cognee | Vector embeddings & knowledge graphs |
| **UI Components** | Lucide React | Consistent iconography |
| **Animation** | Motion 12 | Smooth transitions & effects |

---

## 🏛️ Project Structure

```
ContextOS/
├── src/
│   ├── components/
│   │   ├── LeftPanel.tsx          # Configuration & console logger
│   │   ├── CenterPanel.tsx        # Chat interface & telemetry nodes
│   │   ├── RightPanel.tsx         # Memory graph visualization
│   │   ├── MarkdownRenderer.tsx   # Code block rendering
│   │   ├── MockData.ts            # Sandbox mode responses
│   │   └── ...
│   ├── lib/
│   │   └── api.ts                 # Webhook clients & API integration
│   ├── App.tsx                    # Main orchestration logic
│   ├── types.ts                   # TypeScript interfaces
│   ├── main.tsx                   # React entry point
│   └── index.css                  # Global styles
├── index.html                     # HTML shell
├── package.json                   # Dependencies & scripts
├── tsconfig.json                  # TypeScript configuration
├── vite.config.ts                 # Vite build configuration
├── .env.example                   # Environment template
└── README.md                       # This file
```

---

## 🔄 Workflow Pipeline

### Generation Flow (Build Projects)

```
1. User submits: "Create an e-commerce API"
                  ↓
2. Frontend triggers Webhook A (Central Agent)
                  ↓
3. n8n orchestrates multi-agent generation:
   ├─ Project Generator → Creates boilerplate
   ├─ Dependency Resolver → Installs packages
   └─ Code Generator → Writes implementation
                  ↓
4. Response parsed & formatted
                  ↓
5. Auto-trigger Architecture Extraction:
   ├─ Identify components (services, controllers, models)
   ├─ Extract dependency graph
   └─ Capture design patterns
                  ↓
6. Index into Cognee semantic graph
                  ↓
7. Telemetry updates: ✅ Complete
```

### Retrieval Flow (Query Memory)

```
1. User queries: "Show me all database operations"
                  ↓
2. Detect retrieval intent
                  ↓
3. Trigger Webhook B (Memory Retrieval)
                  ↓
4. Execute dual search:
   ├─ Semantic Search: Vector similarity in Cognee
   └─ Structured Query: SQL on PostgreSQL
                  ↓
5. Merge & rank results by relevance
                  ↓
6. Format response with related components
                  ↓
7. Visualize relationships in D3.js graph
```

---

## 🎯 Real-Time Telemetry

The dashboard includes **4 autonomous agents** that report live status:

| Agent | Role | Lifecycle |
|-------|------|-----------|
| 🏗️ **Architect** | Analyzes requirements & validates schema | idle → loading → active → complete |
| 👨‍💻 **Developer** | Implements structure & resolves dependencies | idle → loading → active → complete |
| 📋 **PM Coordinator** | Organizes tasks & prioritizes workflow | idle → active → complete |
| 🧠 **Memory Engine** | Indexes into Cognee & syncs storage | idle → loading → active → synchronized |

Each agent broadcasts status in real-time, visible in the **CenterPanel telemetry view**.

---

## 🔧 Advanced Configuration

### Webhook URLs

**Webhook A (Central Agent)** — n8n project generation workflow:
```
POST /webhook/project-generator
Body: { query, datasetName, apiToken }
Response: { payload: { summary, files, ... } }
```

**Webhook B (Memory Retrieval)** — Cognee search & sync:
```
POST /webhook/memory-sync
Body: { query, datasetName }
Response: [{ search_result: "...", ... }]
```

### Sandbox Mode

Toggle sandbox mode to test without live webhooks:
```typescript
// .env
VITE_SANDBOX_MODE=true  // Uses mock data generator

// Uses getDynamicMockResponse() for instant testing
```

---

## 🧩 Component Breakdown

### **LeftPanel** — Configuration & Logging
- API token input
- Webhook URL configuration
- Dataset name selector
- Live console event stream (50 events max)
- Clear history action

### **CenterPanel** — Chat Interface & Telemetry
- Message history (user ↔ agent)
- Input form with suggestions
- Telemetry node status display
- Build/memory summary cards
- Error boundary with recovery hints

### **RightPanel** — Memory Visualization
- D3.js knowledge graph rendering
- Component relationship explorer
- Raw memory text view
- Manual sync trigger button
- Memory loading indicator

---

## 🔐 Security Considerations

- **API Tokens**: Store securely, rotate periodically
- **Webhook Auth**: Validate webhook signatures (HMAC)
- **CORS**: Configure for trusted origins only
- **Database**: Use row-level security (RLS) in Supabase
- **Cognee**: Encrypt sensitive embeddings

---

## 🚨 Troubleshooting

### Webhook Connection Failed

```
Error: "Failed to establish secure gateway websocket"

Solution:
1. Verify n8n instance is running: http://localhost:5678
2. Check ngrok tunnel is active (if using remote)
3. Validate webhook URLs in .env
4. Enable VITE_SANDBOX_MODE=true to test UI offline
```

### Memory Sync Timeout

```
Error: "Memory retrieval sync returned null response"

Solution:
1. Check Cognee API is accessible
2. Verify VITE_COGNEE_API_KEY is set
3. Check PostgreSQL connection in Supabase
4. Review n8n Webhook B workflow logs
```

### Build Output is Empty

```
Error: "Memory Index Status: Not Indexed"

Solution:
1. Ensure agent response includes ===FILE: markers
2. Check buildParser.ts regex patterns match your format
3. Verify package.json is included in response
4. Review console logs for parsing errors
```

---

## 🎨 UI Customization

### Color Scheme
- **Primary**: `#5ed29c` (Emerald)
- **Background**: `#070b0a` (Deep Navy)
- **Accent**: `#e1f5fe` (Light Blue)

Modify in tailwind config or override CSS variables in `src/index.css`.

### Theme Toggle (Future)
Plans to add dark/light mode toggle in header.

---

## 📊 Performance Metrics

Expected performance on standard hardware:

| Operation | Typical Duration |
|-----------|------------------|
| Project Generation | 2-5 seconds |
| Architecture Extraction | 1-2 seconds |
| Cognee Indexing | 1-3 seconds |
| Memory Retrieval Query | 500-1500ms |
| Graph Visualization Render | 200-500ms |

---

## 🔮 Roadmap

### Phase 1 (Current) ✅
- ✅ Multi-agent orchestration
- ✅ Dual-webhook architecture
- ✅ Semantic memory persistence
- ✅ Real-time telemetry dashboard

### Phase 2 (Planned) 🎯
- 🔄 GitHub/GitLab integration for live repo sync
- 🔄 Advanced graph algorithms (pattern detection)
- 🔄 Collaborative workspace (multi-user)
- 🔄 IDE plugin (VS Code)

### Phase 3 (Aspirational) 🌟
- 🌟 Fine-tuned embedding models
- 🌟 Predictive architecture suggestions
- 🌟 Anomaly detection in codebases
- 🌟 Cross-project knowledge federation

---

## 📚 Learning Resources

Concepts used in ContextOS:

- [**Multi-Agent Orchestration**](https://n8n.io/docs/workflows/) — n8n workflows
- [**Vector Embeddings**](https://cognee.ai/docs/) — Cognee semantic search
- [**Webhook Architecture**](https://en.wikipedia.org/wiki/Webhook) — Event-driven systems
- [**Knowledge Graphs**](https://en.wikipedia.org/wiki/Knowledge_graph) — Graph databases
- [**React Patterns**](https://react.dev/) — Hooks, custom components
- [**TypeScript Strict Mode**](https://www.typescriptlang.org/docs/handbook/2/types-from-types.html) — Type safety

---

## 🎓 What We Learned

Building ContextOS required deep expertise in:

✅ **Distributed Workflows** — State management across async services  
✅ **Memory Systems** — Persistent knowledge graphs and vector search  
✅ **Data Pipelines** — ETL for heterogeneous agent outputs  
✅ **Real-Time UX** — Telemetry dashboards and WebSocket patterns  
✅ **Error Recovery** — Resilient webhook handling and graceful degradation  
✅ **Type Safety** — Strict TypeScript for complex domain models  

---

## 🤝 Contributing

We welcome contributions! Areas of interest:

- 🐛 Bug reports & fixes
- ✨ UI/UX improvements
- 📚 Documentation enhancements
- 🧪 Test coverage
- 🔌 New agent integrations
- 📈 Performance optimizations

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

---

## 📄 License

This project is [MIT licensed](LICENSE) — freely usable for personal and commercial projects.

---

## 👤 Credits

**Built with ❤️ for the Hangover hackathon**

- **Creator**: Yug Agrawal ([@YUG634](https://github.com/YUG634))
- **Email**: yugagrawalmng@gmail.com
- **LinkedIn**: [yug-agrawal](https://www.linkedin.com/in/yug-agrawal-101bb11a0)

### Powered By

- [**React**](https://react.dev/) — The UI foundation
- [**n8n**](https://n8n.io/) — Workflow orchestration engine
- [**Supabase**](https://supabase.com/) — PostgreSQL backend
- [**Cognee**](https://cognee.ai/) — Semantic knowledge graphs
- [**Vite**](https://vitejs.dev/) — Next-gen build tool

---

<div align="center">

### 🌟 Star this repo if ContextOS helps you manage AI-generated projects!

[⬆ back to top](#contextos)

</div>
