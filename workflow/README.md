# n8n Workflows

This folder contains all n8n workflow JSON files for ContextOS multi-agent orchestration.

## 📝 How to Use

1. Export your n8n workflows as JSON files
2. Upload them to this folder
3. Name them descriptively (e.g., `project-generator.json`, `memory-sync.json`)

## 🔗 Webhook Configuration

Update your `.env` with the n8n webhook URLs:

```bash
VITE_WEBHOOK_A_CENTRAL_AGENT=http://localhost:5678/webhook/your-webhook-path
VITE_WEBHOOK_B_MEMORY_RETRIEVAL=http://localhost:5678/webhook/your-memory-webhook
```

## 📂 Folder Structure

```
workflow/
├── project-generator.json
├── architecture-extractor.json
├── memory-indexer.json
└── README.md
```

Add your exported n8n workflows here!
