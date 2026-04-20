import React, { useState, useEffect, useRef } from 'react';
import { 
  Activity, 
  LayoutDashboard, 
  MessageSquare, 
  Settings, 
  Box, 
  Terminal, 
  Send,
  CheckCircle2,
  Clock
} from 'lucide-react';
import ClusterMap from './components/ClusterMap';

const SidebarItem = ({ icon: Icon, label, active = false }: { icon: any, label: string, active?: boolean }) => (
  <div className={`flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition-all ${active ? 'bg-accent/10 text-accent' : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-100'}`}>
    <Icon size={20} />
    <span className="font-medium text-sm">{label}</span>
  </div>
);

type Message = { role: 'user' | 'agent'; content: string };

const App: React.FC = () => {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { role: 'agent', content: 'Hello Commander. I am monitoring the **Online Boutique** cluster. How would you like me to proceed?' }
  ]);
  const [reasoningLogs, setReasoningLogs] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeService, setActiveService] = useState<string | undefined>();
  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    ws.current = new WebSocket('ws://localhost:8000/ws/stream');
    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'info') {
        setReasoningLogs(prev => [...prev, data.message]);
        
        // fallback heuristic if update_map wasn't sent
        const words = data.message.split(/[\s'"_\\-]+/);
        for (let word of words) {
          if ((word.includes('service') || word.includes('redis') || word.includes('frontend')) && word.length > 5) {
             setActiveService(word);
          }
        }
      } else if (data.type === 'update_map') {
        setActiveService(data.resource);
      }
    };
    return () => ws.current?.close();
  }, []);

  const sendMessage = async () => {
    if (!query.trim() || loading) return;
    
    const userQuery = query;
    setQuery('');
    setMessages(prev => [...prev, { role: 'user', content: userQuery }]);
    setLoading(true);

    try {
      if (ws.current?.readyState === WebSocket.OPEN) {
        ws.current.send(userQuery);
      }

      const res = await fetch('http://localhost:8000/api/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: userQuery, namespace: 'default' })
      });
      
      const data = await res.json();
      setMessages(prev => [...prev, { role: 'agent', content: data.response }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'agent', content: 'Error communicating with backend.' }]);
    } finally {
      setLoading(false);
      setActiveService(undefined);
    }
  };

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
        </header>

        <div className="flex-1 flex overflow-hidden">
          <section className="flex-1 p-6 flex flex-col gap-6 overflow-y-auto custom-scrollbar">
            <div className="h-64 bg-sidebar/30 border border-border rounded-2xl overflow-hidden shrink-0">
              <ClusterMap activeService={activeService} />
            </div>

            <div className="flex-1 bg-sidebar/30 border border-border rounded-2xl relative p-6 flex flex-col overflow-hidden">
              <div className="flex-1 space-y-4 mb-6 overflow-y-auto pr-2 custom-scrollbar">
                {messages.map((msg, idx) => (
                  <div key={idx} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border ${msg.role === 'user' ? 'bg-zinc-800 border-border' : 'bg-accent/20 border-accent/30'}`}>
                      {msg.role === 'user' ? <span className="text-xs font-bold text-muted">ME</span> : <Activity size={14} className="text-accent" />}
                    </div>
                    <div className={`space-y-1.5 max-w-[80%] ${msg.role === 'user' ? 'items-end flex flex-col' : ''}`}>
                      <p className="text-sm font-medium text-zinc-300">{msg.role === 'user' ? 'ADMIN' : 'SYSTEM OPS AGENT'}</p>
                      <div className={`p-3 rounded-2xl text-sm whitespace-pre-wrap ${msg.role === 'user' ? 'bg-accent/10 rounded-tr-none border border-accent/20' : 'bg-zinc-800/50 rounded-tl-none border border-border leading-relaxed'}`}>
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
                    <div className="p-3 bg-zinc-800/50 rounded-2xl rounded-tl-none border border-border text-sm italic text-zinc-400">
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
          </section>

          <aside className="w-80 border-l border-border bg-sidebar flex flex-col">
            <div className="h-16 border-b border-border flex items-center px-6 gap-2 shrink-0">
              <Terminal size={16} className="text-accent" />
              <h2 className="text-sm font-bold tracking-tight">AGENT REASONING</h2>
            </div>
            <div className="flex-1 p-4 overflow-y-auto custom-scrollbar space-y-4">
              {reasoningLogs.map((log, i) => (
                <div key={i} className="relative pl-4 border-l border-zinc-800 py-1">
                  <div className="absolute left-[-5px] top-1.5 w-2 h-2 rounded-full bg-accent" />
                  <p className="text-xs leading-relaxed text-zinc-300 font-mono">{log}</p>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
};

export default App;
