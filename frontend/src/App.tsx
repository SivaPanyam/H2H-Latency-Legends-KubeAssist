import React, { useState } from 'react';
import { 
  Activity, 
  LayoutDashboard, 
  MessageSquare, 
  Settings, 
  Box, 
  Terminal, 
  ChevronRight,
  Send,
  AlertCircle,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { motion } from 'framer-motion';

const SidebarItem = ({ icon: Icon, label, active = false }: { icon: any, label: string, active?: boolean }) => (
  <div className={`flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition-all ${active ? 'bg-accent/10 text-accent' : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-100'}`}>
    <Icon size={20} />
    <span className="font-medium text-sm">{label}</span>
  </div>
);

const App: React.FC = () => {
  const [query, setQuery] = useState('');

  return (
    <div className="flex h-screen bg-background font-sans">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border bg-sidebar flex flex-col p-4">
        <div className="flex items-center gap-3 px-2 mb-8">
          <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
            <Activity className="text-white" size={18} />
          </div>
          <span className="text-lg font-bold tracking-tight">KubeAssist</span>
        </div>

        <nav className="space-y-1 flex-1">
          <SidebarItem icon={LayoutDashboard} label="Cluster Map" active />
          <SidebarItem icon={MessageSquare} label="AI Assistant" />
          <SidebarItem icon={Activity} label="Performance" />
          <SidebarItem icon={Clock} label="Audit History" />
        </nav>

        <div className="mt-auto border-t border-border pt-4">
          <SidebarItem icon={Settings} label="Settings" />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-16 border-b border-border flex items-center justify-between px-6 bg-background/50 backdrop-blur-md">
          <div className="flex items-center gap-6">
            <h1 className="text-sm font-semibold text-zinc-400 uppercase tracking-widest">H2H-Latency-Legends Operations</h1>
            <div className="h-4 w-px bg-border" />
            <div className="flex items-center gap-2 text-xs font-medium text-success">
              <CheckCircle2 size={14} />
              <span>MINIKUBE: RUNNING</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-medium text-zinc-400">
              <Box size={14} />
              <span>11 PODS ACTIVE</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="px-3 py-1 bg-zinc-800/50 rounded-full border border-border text-xs text-zinc-400">
              API Latency: <span className="text-accent">42ms</span>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Main Visualizer */}
          <section className="flex-1 p-6 flex flex-col gap-6 overflow-y-auto custom-scrollbar">
            <div className="grid grid-cols-3 gap-4 h-32">
              <div className="bg-sidebar/50 border border-border rounded-xl p-4 flex flex-col justify-center">
                <span className="text-xs text-muted font-medium mb-1">CPU UTILIZATION</span>
                <span className="text-2xl font-bold font-mono">14.2%</span>
              </div>
              <div className="bg-sidebar/50 border border-border rounded-xl p-4 flex flex-col justify-center">
                <span className="text-xs text-muted font-medium mb-1">MEMORY PRESSURE</span>
                <span className="text-2xl font-bold font-mono text-success">42.8%</span>
              </div>
              <div className="bg-sidebar/50 border border-border rounded-xl p-4 flex flex-col justify-center">
                <span className="text-xs text-muted font-medium mb-1">ACTIVE SERVICES</span>
                <span className="text-2xl font-bold font-mono">11/11</span>
              </div>
            </div>

            {/* Topology / Chat Area */}
            <div className="flex-1 bg-sidebar/30 border border-border rounded-2xl relative p-6 flex flex-col overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-accent to-transparent opacity-50" />
              
              {/* Chat Messages */}
              <div className="flex-1 space-y-4 mb-6 overflow-y-auto pr-2 custom-scrollbar">
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center shrink-0 border border-accent/30">
                    <Activity size={14} className="text-accent" />
                  </div>
                  <div className="space-y-1.5 max-w-[80%]">
                    <p className="text-sm font-medium text-zinc-300">SYSTEM OPS AGENT</p>
                    <div className="p-3 bg-zinc-800/50 rounded-2xl rounded-tl-none border border-border text-sm leading-relaxed">
                      Hello Commander. I am monitoring the **Online Boutique** cluster. Current status: **DEGRADED**. 
                      One pod (adservice) is stuck in **PENDING**. How would you like me to proceed?
                    </div>
                  </div>
                </div>

                {/* Example User Message */}
                <div className="flex gap-4 flex-row-reverse">
                  <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center shrink-0 border border-border">
                    <span className="text-xs font-bold text-muted">ME</span>
                  </div>
                  <div className="space-y-1.5 max-w-[80%] items-end flex flex-col">
                    <p className="text-sm font-medium text-zinc-300">ADMIN</p>
                    <div className="p-3 bg-accent/10 rounded-2xl rounded-tr-none border border-accent/20 text-sm">
                      Check why it's pending.
                    </div>
                  </div>
                </div>
              </div>

              {/* Chat Input */}
              <div className="mt-auto relative">
                <input 
                  type="text" 
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Ask KubeAssist to diagnose your cluster..."
                  className="w-full bg-zinc-800/50 border border-border rounded-xl py-4 pl-4 pr-14 text-sm focus:outline-none focus:border-accent transition-colors"
                />
                <button className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-accent hover:bg-accent/90 rounded-lg flex items-center justify-center transition-colors shadow-lg shadow-accent/20">
                  <Send size={16} className="text-white" />
                </button>
              </div>
            </div>
          </section>

          {/* Right Sidebar - Reasoning & Logs */}
          <aside className="w-80 border-l border-border bg-sidebar flex flex-col">
            <div className="h-16 border-b border-border flex items-center px-6 gap-2 shrink-0">
              <Terminal size={16} className="text-accent" />
              <h2 className="text-sm font-bold tracking-tight">AGENT REASONING</h2>
            </div>
            <div className="flex-1 p-4 overflow-y-auto custom-scrollbar space-y-6">
              
              {/* Reasoning Step */}
              <div className="relative pl-4 border-l border-zinc-800 py-1">
                <div className="absolute left-[-5px] top-1.5 w-2 h-2 rounded-full bg-accent" />
                <span className="text-[10px] font-mono text-muted uppercase tracking-widest block mb-1">STEP 1: INITIAL SCAN</span>
                <p className="text-xs leading-relaxed text-zinc-300">Executing `kubectl get pods -n default` to identify unhealthy resources.</p>
                <div className="mt-2 p-2 bg-black/40 rounded border border-border font-mono text-[10px] text-zinc-400">
                  $ kubectl get pods<br/>
                  adservice-fault ... 0/1 Pending
                </div>
              </div>

              {/* Reasoning Step */}
              <div className="relative pl-4 border-l border-accent/50 py-1 bg-accent/5 rounded-r-lg">
                <div className="absolute left-[-5px] top-1.5 w-2 h-2 rounded-full bg-accent animate-pulse" />
                <span className="text-[10px] font-mono text-accent uppercase tracking-widest block mb-1">STEP 2: DEEP DIVE</span>
                <p className="text-xs leading-relaxed text-zinc-300">Pod is stuck. Fetching events to check for resource constraints.</p>
                <div className="mt-2 p-2 bg-black/40 rounded border border-accent/20 font-mono text-[10px] text-zinc-300">
                  $ kubectl describe pod adservice-fault<br/>
                  Events:<br/>
                  0/1 nodes are available: 1 Insufficient cpu.
                </div>
              </div>

            </div>
          </aside>
        </div>
      </main>
    </div>
  );
};

export default App;
