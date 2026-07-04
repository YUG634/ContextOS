import React, { useRef, useEffect } from "react";
import { ArrowRight, Sparkles, Send, Brain, Code, User, FileText, RefreshCw } from "lucide-react";
import { Message, TelemetryNode } from "../types";
import MarkdownRenderer from "./MarkdownRenderer";

const getSubStatusLabel = (name: string, status: string) => {
  if (status === "loading") return "RESOLVING";
  if (status === "error") return "FAULT";
  if (status === "active") {
    if (name === "Memory Engine") return "GRAPH_INDEXED";
    if (name === "Architect") return "SYNCHRONIZED";
    if (name === "Developer") return "COMPILED";
    return "ACTIVE";
  }
  return "STANDBY";
};

interface CenterPanelProps {
  messages: Message[];
  telemetryNodes: TelemetryNode[];
  inputValue: string;
  onChangeInput: (val: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
  onSelectSuggestion: (text: string) => void;
}

export default function CenterPanel({
  messages,
  telemetryNodes,
  inputValue,
  onChangeInput,
  onSubmit,
  isLoading,
  onSelectSuggestion
}: CenterPanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const suggestions = [
    { title: "Service Graph Map", desc: "Verify microservices topology", query: "Verify microservices topology" },
    { title: "Secured Credentials", desc: "Deploy auth middleware requirements", query: "Deploy auth middleware requirements" },
    { title: "D3 Routing Spec", desc: "Configure telemetry visual routing specs", query: "Configure telemetry visual routing specs" }
  ];

  return (
    <main id="center-panel" className="flex-1 flex flex-col min-w-0 bg-[#070b0a] relative">
      {/* Absolute faint background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[400px] bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none z-0"></div>

      {/* Top Telemetry Row */}
      <div className="h-14 border-b border-white/10 bg-white/[0.01] backdrop-blur-md px-6 flex items-center justify-between shrink-0 relative z-10">
        <div className="flex items-center gap-1.5">
          <Brain className="w-4 h-4 text-[#5ed29c]" />
          <span className="font-display font-semibold text-xs tracking-wider uppercase text-white">
            System Telemetry Nodes
          </span>
        </div>

        {/* Telemetry nodes list */}
        <div className="flex items-center gap-3 md:gap-5.5 overflow-x-auto no-scrollbar py-1">
          {telemetryNodes.map((node) => {
            return (
              <div 
                key={node.id} 
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all duration-300 ${
                  node.status === "loading" 
                    ? "bg-[#5ed29c]/10 border-[#5ed29c]/30 shadow-[0_0_12px_rgba(94,210,156,0.08)]"
                    : node.status === "error"
                    ? "bg-red-500/10 border-red-500/30 shadow-[0_0_12px_rgba(239,68,68,0.08)]"
                    : node.status === "active"
                    ? "bg-emerald-950/25 border-emerald-500/20"
                    : "bg-white/[0.02] border border-white/5"
                } text-[10px] shrink-0 cursor-help`}
                title={`${node.name}: ${node.message}`}
              >
                <div className={`w-1.5 h-1.5 rounded-full ${
                  node.status === "loading" ? "bg-[#5ed29c] animate-pulse" :
                  node.status === "error" ? "bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.7)]" :
                  node.status === "active" ? "bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.7)]" :
                  "bg-gray-600"
                }`}></div>
                <div className="flex items-center gap-1.5">
                  <span className="font-mono font-bold text-white/80 uppercase tracking-wide">{node.name}</span>
                  <span className="text-[3px] text-white/20">•</span>
                  <span className={`font-mono text-[8px] font-semibold tracking-wider ${
                    node.status === "loading" ? "text-[#5ed29c]" :
                    node.status === "error" ? "text-red-400" :
                    node.status === "active" ? "text-emerald-400" :
                    "text-gray-500"
                  }`}>
                    {getSubStatusLabel(node.name, node.status)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Messages Thread Container */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 flex flex-col gap-5 scroll-smooth relative z-10"
      >
        {messages.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center max-w-xl mx-auto text-center py-10">
            {/* Visual Welcome Emblem */}
            <div className="relative mb-5">
              <div className="absolute inset-0 bg-[#5ed29c]/10 blur-xl rounded-full"></div>
              <div className="relative w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[#5ed29c]">
                <Code className="w-6 h-6 stroke-1.25" />
              </div>
            </div>

            <h2 className="font-display font-extrabold text-xl md:text-2xl text-white tracking-tight leading-snug">
              Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#5ed29c] to-emerald-400">ContextOS</span> Workstation
            </h2>
            <p className="text-white/40 text-xs mt-2.5 max-w-md leading-relaxed font-sans">
              An offline-first, high-performance workstation engineered for n8n webhooks and Cognee memory graphs. Run cognitive commands or select an action matrix to begin verification.
            </p>

            {/* Quick Suggestions Matrix */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full mt-8">
              {suggestions.map((s, idx) => (
                <button
                  key={idx}
                  onClick={() => onSelectSuggestion(s.query)}
                  className="flex flex-col text-left p-3.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#5ed29c]/30 rounded-lg transition-all duration-300 group relative overflow-hidden"
                >
                  <span className="text-[10px] font-mono font-semibold text-[#5ed29c] uppercase tracking-wider mb-1">
                    {s.title}
                  </span>
                  <span className="text-[11px] text-white/50 group-hover:text-white transition-colors line-clamp-2">
                    {s.desc}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#5ed29c] opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all absolute bottom-3.5 right-3.5" />
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="max-w-4xl w-full mx-auto flex flex-col gap-5">
            {messages.map((msg) => {
              const isUser = msg.role === "user";
              const timeStr = msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

              return (
                <div 
                  key={msg.id}
                  className={`flex gap-3.5 ${isUser ? "justify-end" : "justify-start"}`}
                >
                  {/* Avatar left side for agent */}
                  {!isUser && (
                    <div className="w-7 h-7 rounded bg-emerald-950/40 border border-[#5ed29c]/30 flex items-center justify-center shrink-0 text-[#5ed29c] self-start mt-0.5 shadow-sm">
                      <Brain className="w-4 h-4" />
                    </div>
                  )}

                  <div className={`flex flex-col max-w-[85%] md:max-w-[75%] gap-1`}>
                    {/* Header bar */}
                    <div className={`flex items-center gap-2 text-[10px] font-mono text-white/40 ${isUser ? "justify-end" : "justify-start"}`}>
                      <span>{isUser ? "OPERATOR (Me)" : "CONTEXT_ENGINE_A"}</span>
                      <span>•</span>
                      <span>{timeStr}</span>
                    </div>

                    {/* Chat Bubble with Obsidian Glassmorphism styling */}
                    <div 
                      className={`rounded-xl px-4 py-3.5 border transition-all ${
                        isUser 
                          ? "bg-[#5ed29c]/15 border-[#5ed29c]/30 text-white rounded-tr-none shadow-[0_4px_16px_-4px_rgba(94,210,156,0.15)]" 
                          : "bg-white/5 border border-white/10 text-white/90 rounded-tl-none backdrop-blur-md"
                      }`}
                    >
                      {isUser ? (
                        <p className="text-xs leading-relaxed text-gray-100 whitespace-pre-wrap">{msg.content}</p>
                      ) : (
                        <MarkdownRenderer content={msg.content} />
                      )}
                    </div>

                    {/* Rich Pipeline / Project Generation Summary Card */}
                    {msg.buildSummary && (
                      <div className="mt-2.5 bg-gradient-to-br from-slate-950/90 via-black/95 to-slate-900/85 border border-[#5ed29c]/30 rounded-xl overflow-hidden shadow-2xl relative">
                        <div className="absolute top-0 right-0 p-2.5 flex items-center gap-1 bg-[#5ed29c]/10 rounded-bl-xl border-l border-b border-[#5ed29c]/20">
                          <span className="w-1 h-1 rounded-full bg-[#5ed29c] animate-pulse"></span>
                          <span className="text-[8px] font-mono text-[#5ed29c] font-bold uppercase tracking-wider">PIPELINE SECURE</span>
                        </div>

                        {/* Header */}
                        <div className="p-3.5 border-b border-white/5 bg-white/[0.01]">
                          <h3 className="font-sans font-bold text-xs text-white tracking-tight flex items-center gap-2">
                            <Code className="w-3.5 h-3.5 text-[#5ed29c]" />
                            SYSTEM PIPELINE COMPILED
                          </h3>
                          <p className="text-[9px] text-white/40 mt-0.5">
                            Dynamic workspace generated and cached inside memory store.
                          </p>
                        </div>

                        {/* Body Grid */}
                        <div className="p-3.5 grid grid-cols-1 md:grid-cols-2 gap-3">
                          {/* Col 1 */}
                          <div className="space-y-2.5">
                            <div>
                              <span className="block text-[7.5px] font-mono text-white/40 uppercase tracking-widest">Active Project Target</span>
                              <span className="text-[10px] font-mono font-bold text-white bg-white/5 border border-white/10 rounded px-1.5 py-0.5 mt-0.5 inline-block">
                                {msg.buildSummary.projectName}
                              </span>
                            </div>

                            <div>
                              <span className="block text-[7.5px] font-mono text-white/40 uppercase tracking-widest">Memory Index Status</span>
                              <span className="text-[10px] font-sans text-[#5ed29c] font-semibold mt-0.5 block">
                                {msg.buildSummary.memoryIndexStatus}
                              </span>
                            </div>

                            <div>
                              <span className="block text-[7.5px] font-mono text-white/40 uppercase tracking-widest">Core Mapped Components</span>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {msg.buildSummary.components.map((comp, cIdx) => (
                                  <span key={cIdx} className="text-[8.5px] font-mono bg-white/5 border border-white/10 text-white/70 rounded px-1.5 py-0.5">
                                    {comp}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>

                          {/* Col 2 */}
                          <div>
                            <span className="block text-[7.5px] font-mono text-white/40 uppercase tracking-widest">Generated Files Layout</span>
                            <div className="mt-1.5 bg-black/40 border border-white/5 rounded-lg p-2 max-h-[110px] overflow-y-auto no-scrollbar space-y-1">
                              {msg.buildSummary.files.map((file, fIdx) => (
                                <div key={fIdx} className="flex items-center gap-1.5 text-[9.5px] font-mono text-white/60">
                                  <span className="text-[#5ed29c]">📄</span>
                                  <span className="hover:text-white transition-colors">{file}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Prompt */}
                        <div className="px-3.5 py-1.5 bg-[#5ed29c]/5 border-t border-white/5 flex items-center justify-between">
                          <span className="text-[8px] font-mono text-white/30">
                            Review generated source block below
                          </span>
                          <span className="text-[8px] font-mono text-[#5ed29c] font-bold uppercase tracking-wider">
                            SUCCESS STATE 100%
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Rich Memory Retrieval Summary Card */}
                    {msg.memorySummary && (
                      <div className="mt-2.5 bg-gradient-to-br from-slate-950/90 via-black/95 to-slate-900/85 border border-emerald-500/20 rounded-xl overflow-hidden shadow-2xl relative">
                        <div className="absolute top-0 right-0 p-2.5 flex items-center gap-1 bg-emerald-500/10 rounded-bl-xl border-l border-b border-emerald-500/20">
                          <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse"></span>
                          <span className="text-[8px] font-mono text-emerald-400 font-bold uppercase tracking-wider">COGNEE CACHE</span>
                        </div>

                        {/* Header */}
                        <div className="p-3.5 border-b border-white/5 bg-white/[0.01]">
                          <h3 className="font-sans font-bold text-xs text-[#5ed29c] tracking-tight flex items-center gap-2">
                            <Brain className="w-3.5 h-3.5" />
                            PERSISTENT MEMORY RETRIEVED
                          </h3>
                          <p className="text-[9px] text-white/40 mt-0.5">
                            Relational vectors successfully mapped to the workspace view.
                          </p>
                        </div>

                        {/* Body Grid */}
                        <div className="p-3.5 grid grid-cols-1 md:grid-cols-2 gap-3">
                          {/* Col 1 */}
                          <div className="space-y-2.5">
                            <div>
                              <span className="block text-[7.5px] font-mono text-white/40 uppercase tracking-widest">Active Memory Dataset</span>
                              <span className="text-[10px] font-mono font-bold text-white bg-white/5 border border-white/10 rounded px-1.5 py-0.5 mt-0.5 inline-block">
                                {msg.memorySummary.datasetName}
                              </span>
                            </div>

                            <div>
                              <span className="block text-[7.5px] font-mono text-white/40 uppercase tracking-widest">Index Match Density</span>
                              <span className="text-[10px] font-mono text-white font-semibold mt-0.5 block">
                                {msg.memorySummary.matchCount} Semantic Pairs Mapped
                              </span>
                            </div>
                          </div>

                          {/* Col 2 */}
                          <div>
                            <span className="block text-[7.5px] font-mono text-white/40 uppercase tracking-widest">Cognitive Context Summary</span>
                            <p className="text-[10px] text-white/60 leading-normal mt-1.5 bg-black/30 border border-white/5 rounded-lg p-2 font-sans">
                              {msg.memorySummary.contextSummary}
                            </p>
                          </div>
                        </div>

                        {/* Bottom bar */}
                        <div className="px-3.5 py-1.5 bg-emerald-500/5 border-t border-white/5 flex items-center justify-between">
                          <span className="text-[8px] font-mono text-white/30">
                            Review graph mapping in right side pane
                          </span>
                          <span className="text-[8px] font-mono text-emerald-400 font-bold uppercase tracking-wider">
                            ACTIVE & SYNCHRONIZED
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Rich Red/Slate Error Presentation Status Card */}
                    {msg.errorCard && (
                      <div className="mt-2 bg-gradient-to-br from-red-950/20 via-slate-950/90 to-slate-900/80 border border-red-900/30 rounded-xl overflow-hidden shadow-2xl relative">
                        <div className="absolute top-0 right-0 p-2.5 flex items-center gap-1 bg-red-500/15 rounded-bl-xl border-l border-b border-red-500/20">
                          <span className="w-1 h-1 rounded-full bg-red-500 shadow-[0_0_8px_#ef4444] animate-pulse"></span>
                          <span className="text-[8px] font-mono text-red-400 font-bold uppercase tracking-wider">PIPELINE BLOCKED</span>
                        </div>

                        {/* Header */}
                        <div className="p-3.5 border-b border-red-900/20 bg-red-950/10">
                          <h3 className="font-sans font-bold text-xs text-red-400 tracking-tight flex items-center gap-2">
                            <span className="text-sm">⚠️</span>
                            {msg.errorCard.title}
                          </h3>
                          <p className="text-[9px] text-white/40 mt-0.5">
                            Communication pipeline experienced a secure connection fault.
                          </p>
                        </div>

                        {/* Body */}
                        <div className="p-3.5 space-y-3">
                          <div>
                            <span className="block text-[7.5px] font-mono text-white/40 uppercase tracking-widest">Identified Issue</span>
                            <p className="text-[10px] text-white/80 leading-relaxed font-sans mt-0.5">
                              {msg.errorCard.issue}
                            </p>
                          </div>

                          <div>
                            <span className="block text-[7.5px] font-mono text-white/40 uppercase tracking-widest">Recommended Action / Resolution</span>
                            <div className="bg-black/30 border border-white/5 rounded-lg p-2 text-[10px] text-[#5ed29c] leading-relaxed flex items-start gap-1.5 mt-1">
                              <span className="text-xs">💡</span>
                              <span>{msg.errorCard.resolution}</span>
                            </div>
                          </div>

                          {msg.errorCard.rawError && (
                            <details className="group border border-white/5 bg-black/50 rounded-lg overflow-hidden transition-all duration-300">
                              <summary className="flex items-center justify-between px-2.5 py-1.5 text-[8px] font-mono text-white/40 hover:text-white/60 cursor-pointer select-none">
                                <span>SHOW SYSTEM TELEMETRY DIAGNOSTICS</span>
                                <span className="group-open:rotate-180 transition-transform">▼</span>
                              </summary>
                              <div className="px-2.5 pb-2 border-t border-white/5 pt-1.5">
                                <pre className="text-[8px] font-mono text-red-400/80 whitespace-pre-wrap leading-tight select-text overflow-x-auto">
                                  {msg.errorCard.rawError}
                                </pre>
                              </div>
                            </details>
                          )}
                        </div>

                        {/* Footer bar */}
                        <div className="px-3.5 py-1.5 bg-red-950/15 border-t border-red-900/20 flex items-center justify-between">
                          <span className="text-[8px] font-mono text-white/20">
                            Trace log ID: CONTEXT_ERR_CONN
                          </span>
                          <span className="text-[8px] font-mono text-red-400 font-bold uppercase tracking-wider">
                            PORT 3000 OFFLINE
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Avatar right side for operator */}
                  {isUser && (
                    <div className="w-7 h-7 rounded bg-white/5 border border-white/10 flex items-center justify-center shrink-0 text-white self-start mt-0.5 shadow-sm">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                </div>
              );
            })}

            {/* Simulated Loading agent response skeleton */}
            {isLoading && (
              <div className="flex gap-3.5 justify-start">
                <div className="w-7 h-7 rounded bg-[#5ed29c]/10 border border-[#5ed29c]/20 flex items-center justify-center shrink-0 text-[#5ed29c] self-start mt-0.5 animate-spin">
                  <RefreshCw className="w-4 h-4" />
                </div>
                <div className="flex flex-col gap-2.5 w-[85%] md:w-[70%]">
                  <div className="flex items-center gap-2 text-[9px] font-mono text-[#5ed29c] uppercase tracking-widest font-bold">
                    <span>COGNITIVE FLOW ACTIVE</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-[#5ed29c] animate-ping"></span>
                  </div>

                  <div className="bg-gradient-to-br from-slate-950/80 via-black/95 to-slate-900/60 border border-white/10 rounded-xl p-4 shadow-lg backdrop-blur-md">
                    <div className="flex items-center gap-2 pb-2.5 mb-3 border-b border-white/5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#5ed29c] animate-pulse"></span>
                      <span className="text-[9px] font-mono text-white/40">N8N COGNEE PIPELINE AGENT</span>
                    </div>

                    <div className="space-y-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-4 h-4 rounded-full bg-emerald-950 border border-emerald-500/30 flex items-center justify-center shrink-0">
                          <span className="text-[9px] text-[#5ed29c] font-bold">1</span>
                        </div>
                        <div className="flex-1">
                          <p className="text-[11px] font-mono text-white/80 font-semibold">Analyzing workspace architecture</p>
                          <p className="text-[9px] text-white/40">Evaluating code interfaces, packages, and dependency routes.</p>
                        </div>
                        <div className="w-1.5 h-1.5 rounded-full bg-[#5ed29c] animate-ping"></div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="w-4 h-4 rounded-full bg-emerald-950 border border-emerald-500/30 flex items-center justify-center shrink-0">
                          <span className="text-[9px] text-[#5ed29c] font-bold">2</span>
                        </div>
                        <div className="flex-1">
                          <p className="text-[11px] font-mono text-white/80 font-semibold">Compiling dynamic project context</p>
                          <p className="text-[9px] text-white/40">Generating and bundling microservice files and configuration specifications.</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="w-4 h-4 rounded-full bg-emerald-950 border border-emerald-500/30 flex items-center justify-center shrink-0">
                          <span className="text-[9px] text-[#5ed29c] font-bold">3</span>
                        </div>
                        <div className="flex-1">
                          <p className="text-[11px] font-mono text-white/80 font-semibold">Retrieving persistent memory & sync</p>
                          <p className="text-[9px] text-white/40">Querying active Cognee semantic graph and relational vectors.</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="w-4 h-4 rounded-full bg-emerald-950 border border-emerald-500/30 flex items-center justify-center shrink-0">
                          <span className="text-[9px] text-[#5ed29c] font-bold">4</span>
                        </div>
                        <div className="flex-1">
                          <p className="text-[11px] font-mono text-white/80 font-semibold">Synchronizing Cognee graph</p>
                          <p className="text-[9px] text-white/40">Updating visual network, coordinates, and relation cards.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Fixed Bottom Input Console */}
      <div className="p-4 md:p-6 border-t border-white/10 bg-gradient-to-t from-[#070b0a] via-[#070b0a]/90 to-[#070b0a]/30 relative z-10 shrink-0">
        <form onSubmit={onSubmit} className="max-w-4xl w-full mx-auto">
          <div className="relative flex items-center bg-white/5 border border-white/10 rounded-xl focus-within:border-[#5ed29c]/50 focus-within:ring-1 focus-within:ring-[#5ed29c]/20 transition-all backdrop-blur-lg">
            <input 
              type="text"
              value={inputValue}
              onChange={(e) => onChangeInput(e.target.value)}
              disabled={isLoading}
              className="flex-1 bg-transparent py-4.5 pl-5 pr-14 text-xs font-sans text-white focus:outline-none placeholder:text-gray-500 disabled:opacity-55"
              placeholder="Inject command or trace query (e.g. Verify microservices topology)..."
            />
            <div className="absolute right-3.5 flex items-center gap-2">
              <button
                type="submit"
                disabled={!inputValue.trim() || isLoading}
                className="w-10 h-10 rounded-lg bg-[#5ed29c] text-black hover:bg-[#5ed29c]/80 disabled:bg-white/5 disabled:text-gray-600 flex items-center justify-center transition-all cursor-pointer font-bold disabled:cursor-not-allowed"
                title="Send Command"
              >
                <ArrowRight className="w-5 h-5 shrink-0 stroke-[2.5]" />
              </button>
            </div>
          </div>
          <div className="flex items-center justify-between mt-2.5 px-2">
            <span className="text-[9px] font-mono text-white/30">
              {isLoading ? "Executing dual-webhook pipeline active..." : "Ready to accept instructions."}
            </span>
            <span className="text-[9px] font-mono text-white/30">
              Press Enter ↵ to submit
            </span>
          </div>
        </form>
      </div>
    </main>
  );
}
