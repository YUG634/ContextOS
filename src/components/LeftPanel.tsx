import React, { useState } from "react";
import { 
  Database, 
  Key, 
  Terminal, 
  Settings, 
  ShieldAlert, 
  Server, 
  Power, 
  Trash2, 
  Sparkles,
  Link2
} from "lucide-react";
import { ConsoleEvent, WorkstationConfig } from "../types";

interface LeftPanelProps {
  config: WorkstationConfig;
  onChangeConfig: (newConfig: WorkstationConfig) => void;
  consoleEvents: ConsoleEvent[];
  onClearConsole: () => void;
}

export default function LeftPanel({ 
  config, 
  onChangeConfig, 
  consoleEvents, 
  onClearConsole 
}: LeftPanelProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleTextChange = (field: keyof WorkstationConfig, value: string) => {
    onChangeConfig({
      ...config,
      [field]: value
    });
  };

  const handleToggleSandbox = () => {
    onChangeConfig({
      ...config,
      sandboxMode: !config.sandboxMode
    });
  };

  return (
    <aside id="left-panel" className="w-full lg:w-80 xl:w-96 flex flex-col gap-5 border-r border-white/10 bg-white/[0.02] backdrop-blur-xl p-5 shrink-0 overflow-y-auto">
      {/* Brand Header */}
      <div className="flex items-center justify-between pb-4 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-950/40 border border-[#5ed29c]/30">
            <div className="absolute inset-0 bg-[#5ed29c]/10 blur-sm rounded-lg"></div>
            <Sparkles className="w-4.5 h-4.5 text-[#5ed29c] relative z-10" />
          </div>
          <div>
            <h1 className="font-display font-bold text-lg tracking-tight text-[#5ed29c]">
              ContextOS
            </h1>
            <p className="text-[9px] uppercase tracking-[0.2em] text-white/40 mt-0.5 font-mono">v1.0.4-stable</p>
          </div>
        </div>
        
        {/* Sandbox Indicator */}
        <button 
          onClick={handleToggleSandbox}
          className={`flex items-center gap-1.5 px-2 py-1 rounded text-[9px] font-mono font-semibold tracking-wider transition-all ${
            config.sandboxMode 
              ? "bg-[#5ed29c]/10 text-[#5ed29c] border border-[#5ed29c]/30" 
              : "bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10"
          }`}
          title="Toggle between Mock/Sandbox data and real n8n webhook calls"
        >
          <span className={`w-1.5 h-1.5 rounded-full ${config.sandboxMode ? "bg-[#5ed29c] animate-pulse" : "bg-gray-400"}`}></span>
          {config.sandboxMode ? "SANDBOX" : "LIVE NETWORK"}
        </button>
      </div>

      {/* Dataset Configuration */}
      <div className="flex flex-col gap-3.5 bg-white/5 border border-white/10 rounded-lg p-3.5 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-3xl rounded-full -mr-8 -mt-8"></div>
        
        <div className="flex items-center gap-2 pb-1">
          <Database className="w-4 h-4 text-[#5ed29c]" />
          <h2 className="font-display font-bold text-xs tracking-wide uppercase text-white/80">
            Dataset Configuration
          </h2>
        </div>

        {/* Dataset Name */}
        <div className="space-y-1">
          <label className="text-[10px] text-white/40 uppercase font-mono tracking-wider flex items-center justify-between">
            Dataset Name
            <span className="text-[9px] text-[#5ed29c]">active</span>
          </label>
          <div className="relative">
            <input 
              type="text" 
              value={config.datasetName}
              onChange={(e) => handleTextChange("datasetName", e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded px-2.5 py-1.5 text-xs text-[#5ed29c] font-mono focus:outline-none focus:border-[#5ed29c]/40 focus:ring-1 focus:ring-[#5ed29c]/20 transition-all placeholder:text-gray-600"
              placeholder="e.g. contextos_memories_v1"
            />
          </div>
        </div>

        {/* API Token */}
        <div className="space-y-1">
          <label className="text-[10px] text-white/40 uppercase font-mono tracking-wider flex items-center justify-between">
            API Token
            <span className="text-[9px] text-white/30">Optional</span>
          </label>
          <div className="relative">
            <input 
              type="password" 
              value={config.apiToken}
              onChange={(e) => handleTextChange("apiToken", e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded px-2.5 py-1.5 text-xs text-white/60 font-mono focus:outline-none focus:border-[#5ed29c]/40 focus:ring-1 focus:ring-[#5ed29c]/20 transition-all placeholder:text-gray-600"
              placeholder="••••••••••••••••"
            />
            <Key className="absolute right-2.5 top-2.5 w-3.5 h-3.5 text-white/20" />
          </div>
        </div>

        {/* Webhook URLs toggler */}
        <div className="border-t border-white/10 pt-3 mt-1">
          <button 
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="w-full flex items-center justify-between text-[9px] font-mono text-[#5ed29c] hover:text-[#5ed29c]/80 transition-colors uppercase tracking-wider"
          >
            <span className="flex items-center gap-1.5">
              <Settings className={`w-3 h-3 transition-transform duration-300 ${showAdvanced ? "rotate-90" : ""}`} />
              Webhook Gateways
            </span>
            <span>{showAdvanced ? "[ Hide ]" : "[ Configure ]"}</span>
          </button>
          
          {showAdvanced && (
            <div className="flex flex-col gap-3 mt-3 pt-2 border-t border-white/10 animate-fadeIn">
              {/* Webhook A */}
              <div className="flex flex-col gap-1">
                <label className="text-[9px] font-mono text-gray-500 uppercase tracking-wider flex items-center gap-1">
                  <Server className="w-2.5 h-2.5" />
                  Webhook A (Central Agent)
                </label>
                <input 
                  type="text" 
                  value={config.webhookAUrl}
                  onChange={(e) => handleTextChange("webhookAUrl", e.target.value)}
                  className="w-full bg-black/60 border border-white/10 rounded py-1.5 px-2 text-[10px] font-mono text-gray-300 focus:outline-none focus:border-[#5ed29c]/40 focus:ring-1 focus:ring-[#5ed29c]/20"
                  placeholder="Paste n8n Webhook A URL..."
                />
              </div>

              {/* Webhook B */}
              <div className="flex flex-col gap-1">
                <label className="text-[9px] font-mono text-gray-500 uppercase tracking-wider flex items-center gap-1">
                  <Link2 className="w-2.5 h-2.5" />
                  Webhook B (Memory retrieval)
                </label>
                <input 
                  type="text" 
                  value={config.webhookBUrl}
                  onChange={(e) => handleTextChange("webhookBUrl", e.target.value)}
                  className="w-full bg-black/60 border border-white/10 rounded py-1.5 px-2 text-[10px] font-mono text-gray-300 focus:outline-none focus:border-[#5ed29c]/40 focus:ring-1 focus:ring-[#5ed29c]/20"
                  placeholder="Paste n8n Webhook B URL..."
                />
              </div>
              <p className="text-[9px] text-white/30 font-sans leading-relaxed">
                Configure your custom n8n local or production webhooks. When Sandbox mode is inactive, queries will execute directly to these targets.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Agent Console Monitor */}
      <div className="flex-1 flex flex-col min-h-[220px] bg-black/60 border border-white/10 rounded-lg overflow-hidden">
        {/* Terminal Header */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-white/5 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Terminal className="w-3.5 h-3.5 text-[#5ed29c]" />
            <span className="font-mono text-[10px] font-bold text-white/60 uppercase tracking-wider">
              Agent Console Monitor
            </span>
          </div>
          <button 
            onClick={onClearConsole}
            title="Clear Console Event Logs"
            className="text-white/40 hover:text-white/80 p-1 hover:bg-white/5 rounded transition-all"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>

        {/* Terminal Logs Area */}
        <div className="flex-1 p-3.5 font-mono text-[10px] leading-relaxed overflow-y-auto flex flex-col gap-2.5 custom-scrollbar bg-black/20">
          {consoleEvents.length === 0 ? (
            <div className="flex flex-col items-start justify-start h-full py-2 gap-1.5">
              <div className="text-[#5ed29c] font-mono">[SYSTEM] Boot sequence complete.</div>
              <div className="text-white/40">[INFO] Webhook A: Ready</div>
              <div className="text-white/40">[INFO] Webhook B: Connected</div>
              <div className="text-[#5ed29c] animate-pulse mt-1">&gt; Monitoring active streams...</div>
              <div className="text-white/20 mt-4">awaiting query input...</div>
            </div>
          ) : (
            consoleEvents.map((event) => {
              const dateStr = event.timestamp.toLocaleTimeString();
              let badgeColor = "text-gray-400 bg-white/5";
              if (event.type === "webhook-a") badgeColor = "text-emerald-400 bg-emerald-950/20 border border-emerald-500/20";
              if (event.type === "webhook-b") badgeColor = "text-cyan-400 bg-cyan-950/20 border border-cyan-500/20";
              if (event.type === "success") badgeColor = "text-green-400 bg-green-950/20 border border-green-500/20";
              if (event.type === "error") badgeColor = "text-red-400 bg-red-950/20 border border-red-500/20";

              return (
                <div key={event.id} className="border-b border-white/[0.02] pb-2 last:border-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded uppercase tracking-wide shrink-0 ${badgeColor}`}>
                      {event.type}
                    </span>
                    <span className="text-[9px] text-gray-500 shrink-0">{dateStr}</span>
                  </div>
                  <p className="text-gray-300 word-break-all font-medium">{event.message}</p>
                  {event.payload && (
                    <pre className="mt-1.5 p-1.5 bg-black/40 rounded border border-white/5 text-[9px] text-gray-400 overflow-x-auto whitespace-pre-wrap max-h-32">
                      {event.payload}
                    </pre>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </aside>
  );
}
