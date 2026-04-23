import React, { useState, useEffect, useRef } from 'react';
import { 
  Activity, 
  LayoutDashboard, 
  MessageSquare, 
  Box, 
  Terminal, 
  Send,
  CheckCircle2,
  ShieldAlert,
  Zap,
  RefreshCcw,
  BarChart3,
  Server,
  Cpu,
  Database,
  FileText,
  AlertTriangle
} from 'lucide-react';
import ClusterMap from './components/ClusterMap';

// Types
type Message = {
  role: 'user' | 'agent';
  content: string;
};

type PodDetails = {
  name: string;
  status: string;
  metrics: { cpu: string; memory: string };
  logs: string;
  events: string;
};

type ClusterIssue = {
  id: string;
  category: string;
  severity: string;
  resource: string;
  description: string;
  root_cause: string;
  suggested_fix: string;
  patch_data?: any;
};

type AuditReport = {
  summary: string;
  issues: ClusterIssue[];
};

type PerformanceData = {
  node_metrics: string;
  top_pods: { name: string, cpu: string, memory: string }[];
  timestamp: string;
};

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'map' | 'assistant' | 'audit' | 'performance'>('map');
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { role: 'agent', content: 'Hello Commander. I am monitoring the **Online Boutique** cluster. How would you like me to proceed?' }
  ]);
  const [reasoningLogs, setReasoningLogs] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeService, setActiveService] = useState<string | undefined>();
  const [auditReport, setAuditReport] = useState<AuditReport | null>(null);
  const [selectedPod, setSelectedPod] = useState<PodDetails | null>(null);
  const [performanceData, setPerformanceData] = useState<PerformanceData | null>(null);
  const [podStatuses, setPodStatuses] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const ws = useRef<WebSocket | null>(null);

  const fetchPodStatuses = async () => {
    try {
      const res = await fetch('http://localhost:8110/api/pod-statuses', {
        headers: { 'X-API-Key': import.meta.env.VITE_KUBEASSIST_API_KEY || '' }
      });
      if (res.ok) {
        const data = await res.json();
        setPodStatuses(data);
      }
    } catch (err) {
      console.error("Failed to fetch pod statuses", err);
    }
  };

  useEffect(() => {
    fetchPodStatuses();
    const interval = setInterval(fetchPodStatuses, 5000);
    ws.current = new WebSocket('ws://localhost:8110/ws/stream');
    ws.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'info') {
          setReasoningLogs(prev => [data.message, ...prev].slice(0, 100));
        } else if (data.type === 'update_map') {
          setActiveService(data.resource);
        }
      } catch (err) {
        console.error("WS Message Error", err);
      }
    };
    return () => {
      ws.current?.close();
      if (interval) clearInterval(interval);
    };
  }, []);

  const fetchPodDetails = async (podName: string) => {
    setLoading(true);
    setSelectedPod(null);
    setError(null);
    try {
      const res = await fetch(`http://localhost:8110/api/pod-details/${podName}`, {
        headers: { 'X-API-Key': import.meta.env.VITE_KUBEASSIST_API_KEY || '' }
      });
      if (!res.ok) throw new Error("Failed to fetch pod details");
      const data = await res.json();
      setSelectedPod(data);
    } catch (err: any) {
      setError(err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPerformance = async () => {
    setLoading(true);
    setError(null);
    setActiveTab('performance');
    try {
      const res = await fetch('http://localhost:8110/api/performance', {
        headers: { 'X-API-Key': import.meta.env.VITE_KUBEASSIST_API_KEY || '' }
      });
      if (!res.ok) throw new Error("Failed to fetch performance metrics");
      const data = await res.json();
      setPerformanceData(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!query.trim() || loading) return;
    
    const userQuery = query;
    setQuery('');
    setMessages(prev => [...prev, { role: 'user', content: userQuery }]);
    setLoading(true);
    setActiveTab('assistant');
    setError(null);

    try {
      const res = await fetch('http://localhost:8110/api/query', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-API-Key': import.meta.env.VITE_KUBEASSIST_API_KEY || ''
        },
        body: JSON.stringify({ query: userQuery, namespace: 'default' })
      });
      
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setMessages(prev => [...prev, { role: 'agent', content: data.response }]);
    } catch (err: any) {
      setMessages(prev => [...prev, { role: 'agent', content: `Error: ${err.message}` }]);
    } finally {
      setLoading(false);
    }
  };

  const runFullAudit = async () => {
    setLoading(true);
    setAuditReport(null);
    setError(null);
    setActiveTab('audit');
    try {
      const res = await fetch('http://localhost:8110/api/scan-cluster?namespace=default', {
        method: 'POST',
        headers: { 'X-API-Key': import.meta.env.VITE_KUBEASSIST_API_KEY || '' }
      });
      if (!res.ok) throw new Error("Cluster audit failed");
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setAuditReport(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const applyFix = async (issue: ClusterIssue) => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:8110/api/apply-fix', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-API-Key': import.meta.env.VITE_KUBEASSIST_API_KEY || ''
        },
        body: JSON.stringify(issue)
      });
      const data = await res.json();
      if (data.success) {
        alert(`Pull Request created: ${data.pr_url}`);
      } else {
        alert(`Fix failed: ${data.error}`);
      }
    } catch (err) {
      console.error("Fix application failed", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-background font-sans text-zinc-100">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border bg-sidebar flex flex-col p-4">
        <div className="flex items-center gap-3 px-2 mb-8">
          <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center shadow-lg shadow-accent/20">
            <Activity className="text-white" size={18} />
          </div>
          <span className="text-lg font-bold tracking-tight">KubeAssist</span>
        </div>
        <nav className="space-y-1 flex-1">
          <SidebarItem icon={LayoutDashboard} label="Cluster Map" active={activeTab === 'map'} onClick={() => { setActiveTab('map'); setError(null); }} />
          <SidebarItem icon={MessageSquare} label="AI Assistant" active={activeTab === 'assistant'} onClick={() => { setActiveTab('assistant'); setError(null); }} />
          <SidebarItem icon={ShieldAlert} label="Security Audit" active={activeTab === 'audit'} onClick={() => { setActiveTab('audit'); setError(null); }} />
          <SidebarItem icon={BarChart3} label="Performance" active={activeTab === 'performance'} onClick={() => fetchPerformance()} />
        </nav>
        <div className="mt-auto border-t border-border pt-4 text-[10px] text-zinc-500 font-mono px-2">
          H2H OPERATIONS CENTER v1.0
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-border flex items-center justify-between px-6 bg-background/50 backdrop-blur-md z-10">
          <div className="flex items-center gap-6">
            <h1 className="text-sm font-semibold text-zinc-400 uppercase tracking-widest">H2H-Latency-Legends Operations</h1>
            <div className="h-4 w-px bg-border" />
            <div className="flex items-center gap-2 text-xs font-medium text-success">
              <CheckCircle2 size={14} />
              <span>MINIKUBE: RUNNING</span>
            </div>
          </div>
          {error && (
            <div className="flex items-center gap-2 bg-red-500/10 text-red-500 px-4 py-1.5 rounded-lg text-xs font-medium border border-red-500/20">
              <AlertTriangle size={14} />
              <span>{error}</span>
            </div>
          )}
        </header>

        <div className="flex-1 flex overflow-hidden">
          <section className="flex-1 p-6 flex flex-col gap-6 overflow-y-auto custom-scrollbar">
            
            {activeTab === 'map' && (
              <div className="flex-1 flex flex-col gap-6">
                <div className="flex-1 bg-sidebar/30 border border-border rounded-2xl overflow-hidden shadow-2xl relative">
                  <ClusterMap 
                    activeService={activeService} 
                    podStatuses={podStatuses}
                    onNodeClick={(id) => fetchPodDetails(id)} 
                  />
                  {!selectedPod && !loading && (
                    <div className="absolute top-4 left-4 bg-zinc-900/80 backdrop-blur-md border border-border p-3 rounded-lg text-[10px] text-zinc-400 font-bold uppercase pointer-events-none">
                      Select a pod to view real-time operations data
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'assistant' && (
              <div className="flex-1 bg-sidebar/30 border border-border rounded-2xl relative p-6 flex flex-col overflow-hidden">
                <div className="flex-1 space-y-4 mb-6 overflow-y-auto pr-2 custom-scrollbar">
                  {messages.map((msg, idx) => (
                    <div key={idx} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border ${msg.role === 'user' ? 'bg-zinc-800 border-border' : 'bg-accent/20 border-accent/30'}`}>
                        {msg.role === 'user' ? <span className="text-xs font-bold text-muted">ME</span> : <Activity size={14} className="text-accent" />}
                      </div>
                      <div className={`space-y-1.5 max-w-[80%] ${msg.role === 'user' ? 'items-end flex flex-col' : ''}`}>
                        <p className="text-sm font-medium text-zinc-300">{msg.role === 'user' ? 'ADMIN' : 'SYSTEM OPS AGENT'}</p>
                        <div className={`p-4 rounded-2xl text-sm whitespace-pre-wrap shadow-sm ${msg.role === 'user' ? 'bg-accent/10 rounded-tr-none border border-accent/20' : 'bg-zinc-800/50 rounded-tl-none border border-border leading-relaxed'}`}>
                          {msg.content}
                        </div>
                      </div>
                    </div>
                  ))}
                  {loading && (
                    <div className="flex gap-4">
                      <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center shrink-0 border border-accent/30">
                        <Activity size={14} className="text-accent animate-pulse" />
                      </div>
                      <div className="p-4 bg-zinc-800/50 rounded-2xl rounded-tl-none border border-border text-sm italic text-zinc-400">
                        Analyzing cluster state...
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-auto relative">
                  <input 
                    type="text" 
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder="Ask KubeAssist to diagnose your cluster..."
                    className="w-full bg-zinc-800/50 border border-border rounded-xl py-4 pl-4 pr-14 text-sm focus:outline-none focus:border-accent transition-colors"
                  />
                  <button onClick={sendMessage} className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-accent hover:bg-accent/90 rounded-lg flex items-center justify-center transition-colors shadow-lg shadow-accent/20">
                    <Send size={16} className="text-white" />
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'audit' && (
              <div className="flex-1 flex flex-col gap-6">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-lg font-bold flex items-center gap-2">
                    <ShieldAlert className="text-accent" size={20} />
                    Cluster Security & Health Audit
                  </h2>
                  <button 
                    onClick={runFullAudit}
                    disabled={loading}
                    className="flex items-center gap-2 bg-accent hover:bg-accent/90 px-6 py-2.5 rounded-xl text-xs font-bold transition-all shadow-lg shadow-accent/20 disabled:opacity-50"
                  >
                    <RefreshCcw size={14} className={loading ? 'animate-spin' : ''} />
                    RUN COMPREHENSIVE SCAN
                  </button>
                </div>
                
                {!auditReport && !loading && (
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-12 bg-sidebar/30 border border-dashed border-border rounded-2xl">
                    <ShieldAlert size={48} className="text-zinc-600 mb-4" />
                    <h2 className="text-xl font-bold mb-2">Ready for Audit</h2>
                    <p className="text-zinc-400 text-sm max-w-md">Gemini 2.0 Flash will analyze the entire cluster state, security vulnerabilities, and performance bottlenecks in a single one-shot scan.</p>
                  </div>
                )}

                {loading && !auditReport && (
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-12">
                    <RefreshCcw size={48} className="text-accent animate-spin mb-4" />
                    <h2 className="text-xl font-bold mb-2">Scanning Cluster...</h2>
                    <p className="text-zinc-400 text-sm">Aggregating resources and security scans...</p>
                  </div>
                )}

                {auditReport && auditReport.issues && (
                  <div className="space-y-6">
                    <div className="bg-accent/10 border border-accent/20 rounded-2xl p-6">
                      <h2 className="text-lg font-bold mb-2 flex items-center gap-2">
                        <CheckCircle2 size={20} className="text-accent" />
                        Audit Summary
                      </h2>
                      <p className="text-sm text-zinc-300 leading-relaxed">{auditReport.summary}</p>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                      {auditReport.issues.map((issue) => (
                        <div key={issue.id} className="bg-sidebar/30 border border-border rounded-2xl p-6 hover:border-accent/30 transition-colors group">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                                issue.severity === 'Critical' ? 'bg-red-500/20 text-red-500' :
                                issue.severity === 'High' ? 'bg-orange-500/20 text-orange-500' :
                                'bg-yellow-500/20 text-yellow-500'
                              }`}>
                                {issue.severity}
                              </span>
                              <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">{issue.category}</span>
                            </div>
                            <span className="text-xs font-mono text-zinc-500">{issue.resource}</span>
                          </div>
                          
                          <h3 className="text-base font-bold mb-2 group-hover:text-accent transition-colors">{issue.description}</h3>
                          <p className="text-sm text-zinc-400 mb-4">{issue.root_cause}</p>
                          
                          <div className="bg-zinc-900/50 rounded-xl p-4 mb-4 border border-zinc-800">
                             <h4 className="text-[10px] font-bold text-zinc-500 uppercase mb-2">Suggested Fix</h4>
                             <p className="text-xs text-zinc-300 leading-relaxed">{issue.suggested_fix}</p>
                          </div>

                          <div className="flex items-center gap-3">
                            {issue.patch_data && (
                              <button 
                                onClick={() => applyFix(issue)}
                                className="flex items-center gap-2 bg-accent/20 hover:bg-accent/30 text-accent px-4 py-2 rounded-lg text-xs font-bold transition-all"
                              >
                                <Zap size={14} />
                                GENERATE GITOPS FIX
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'performance' && (
              <div className="flex-1 flex flex-col gap-6">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-lg font-bold flex items-center gap-2">
                    <BarChart3 className="text-accent" size={20} />
                    Cluster-Wide Performance Dashboard
                  </h2>
                  <button 
                    onClick={fetchPerformance}
                    disabled={loading}
                    className="flex items-center gap-2 bg-accent/20 hover:bg-accent/30 text-accent px-6 py-2.5 rounded-xl text-xs font-bold transition-all shadow-lg shadow-accent/5 disabled:opacity-50"
                  >
                    <RefreshCcw size={14} className={loading ? 'animate-spin' : ''} />
                    REFRESH METRICS
                  </button>
                </div>

                {performanceData && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-sidebar/30 border border-border rounded-2xl p-6">
                       <h3 className="text-sm font-bold mb-4 flex items-center gap-2 text-zinc-400">
                         <Server size={16} /> Node Resource Utilization
                       </h3>
                       <div className="bg-zinc-950 p-4 rounded-xl font-mono text-xs text-zinc-300 whitespace-pre overflow-x-auto border border-zinc-800">
                         {performanceData.node_metrics}
                       </div>
                    </div>

                    <div className="bg-sidebar/30 border border-border rounded-2xl p-6">
                       <h3 className="text-sm font-bold mb-4 flex items-center gap-2 text-zinc-400">
                         <Zap size={16} /> Top Resource Consuming Pods
                       </h3>
                       <div className="space-y-3">
                         {performanceData.top_pods && performanceData.top_pods.map((pod, i) => (
                           <div key={i} className="flex items-center justify-between p-3 bg-zinc-800/30 border border-border rounded-xl">
                              <span className="text-xs font-bold text-zinc-300 truncate pr-2">{pod.name}</span>
                              <div className="flex items-center gap-4">
                                <div className="flex flex-col items-end">
                                  <span className="text-[10px] text-zinc-500 uppercase font-bold">CPU</span>
                                  <span className="text-xs font-mono font-bold text-accent">{pod.cpu}</span>
                                </div>
                                <div className="flex flex-col items-end">
                                  <span className="text-[10px] text-zinc-500 uppercase font-bold">MEM</span>
                                  <span className="text-xs font-mono font-bold text-success">{pod.memory}</span>
                                </div>
                              </div>
                           </div>
                         ))}
                       </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </section>

          <aside className="w-96 border-l border-border bg-sidebar flex flex-col overflow-hidden">
            {activeTab === 'map' ? (
              <div className="flex flex-col h-full">
                <div className="h-16 border-b border-border flex items-center px-6 gap-2 shrink-0">
                  <Activity size={16} className="text-accent" />
                  <h2 className="text-sm font-bold tracking-tight uppercase">Pod Operations</h2>
                </div>
                <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
                  {loading && !selectedPod ? (
                    <div className="flex flex-col items-center justify-center h-full text-zinc-500 space-y-4">
                      <RefreshCcw size={32} className="animate-spin text-accent" />
                      <p className="text-xs font-bold uppercase tracking-widest">Fetching Telemetry...</p>
                    </div>
                  ) : selectedPod ? (
                    <>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="text-xl font-bold truncate pr-2">{selectedPod.name}</h3>
                          <span className="px-2 py-0.5 rounded-full bg-success/20 text-success text-[10px] font-bold uppercase border border-success/30">
                            {selectedPod.status}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-zinc-800/50 border border-border p-3 rounded-xl flex flex-col gap-1">
                            <div className="flex items-center gap-1.5 text-[10px] font-bold text-zinc-500 uppercase">
                              <Cpu size={12} /> CPU Usage
                            </div>
                            <span className="text-lg font-mono font-bold text-accent">{selectedPod.metrics.cpu}</span>
                          </div>
                          <div className="bg-zinc-800/50 border border-border p-3 rounded-xl flex flex-col gap-1">
                            <div className="flex items-center gap-1.5 text-[10px] font-bold text-zinc-500 uppercase">
                              <Database size={12} /> Memory
                            </div>
                            <span className="text-lg font-mono font-bold text-accent">{selectedPod.metrics.memory}</span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-500 uppercase">
                          <Terminal size={12} /> Recent Logs
                        </div>
                        <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 font-mono text-[10px] leading-relaxed text-zinc-400 overflow-x-auto whitespace-pre h-48 custom-scrollbar">
                          {selectedPod.logs}
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-500 uppercase">
                          <FileText size={12} /> Cluster Events
                        </div>
                        <div className="bg-zinc-900/30 p-4 rounded-xl border border-border text-[10px] leading-relaxed text-zinc-300 whitespace-pre-wrap max-h-64 overflow-y-auto custom-scrollbar">
                          {selectedPod.events}
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center text-zinc-500 space-y-4 px-8">
                      <div className="w-16 h-16 rounded-full bg-zinc-800/50 flex items-center justify-center border border-dashed border-zinc-700">
                        <Box size={32} className="text-zinc-600" />
                      </div>
                      <p className="text-xs leading-relaxed uppercase font-bold tracking-widest">No Node Selected</p>
                      <p className="text-[10px] leading-relaxed">Click any pod in the cluster map to stream real-time telemetry and diagnostic data.</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex flex-col h-full">
                <div className="h-16 border-b border-border flex items-center px-6 gap-2 shrink-0">
                  <Terminal size={16} className="text-accent" />
                  <h2 className="text-sm font-bold tracking-tight uppercase">Agent Reasoning</h2>
                </div>
                <div className="flex-1 p-4 overflow-y-auto custom-scrollbar flex flex-col-reverse gap-4">
                  {reasoningLogs.map((log, i) => (
                    <div key={i} className="relative pl-4 border-l border-zinc-800 py-1 transition-all animate-in fade-in slide-in-from-left-1">
                      <div className="absolute left-[-5px] top-1.5 w-2 h-2 rounded-full bg-accent shadow-[0_0_8px_rgba(2,132,199,0.5)]" />
                      <p className="text-[11px] leading-relaxed text-zinc-400 font-mono">{log}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </aside>
        </div>
      </main>
    </div>
  );
};

interface SidebarItemProps {
  icon: any;
  label: string;
  active?: boolean;
  onClick: () => void;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ icon: Icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
      active 
        ? 'bg-accent/10 text-accent border border-accent/20 shadow-lg shadow-accent/5' 
        : 'text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800/50'
    }`}
  >
    <Icon size={18} />
    {label}
  </button>
);

export default App;
