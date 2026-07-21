import React, { useState, useEffect, useRef } from 'react';

// API Server URL
const API_URL = 'http://localhost:8000';

// Inline SVG Icons with strict width and height attributes to prevent visual scaling bugs
const Icons = {
  Chat: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 10.742h.008v.008h-.008v-.008zm.37 0h.008v.008h-.008v-.008zm.37 0h.008v.008h-.008v-.008zm.37 0h.008v.008h-.008v-.008zm-7.643 7.828c.119-.48.334-.925.626-1.314A9.972 9.972 0 012.25 12c0-5.523 4.477-10 10-10s10 4.477 10 10-4.477 10-10 10a9.96 9.96 0 01-4.708-1.175l-4.57 1.22a.75.75 0 01-.926-.927l1.22-4.57z" />
    </svg>
  ),
  Docs: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
  ),
  Analytics: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
    </svg>
  ),
  Settings: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.43l-1.003.828c-.293.241-.438.613-.43.992a7.723 7.723 0 010 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.43l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.991l-1.004-.827a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.645-.869l.214-1.28z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  LogOut: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
    </svg>
  ),
  Plus: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-4 h-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
  ),
  Trash: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
    </svg>
  ),
  Send: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
    </svg>
  ),
  ChevronDown: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
    </svg>
  ),
  ChevronUp: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
    </svg>
  ),
  Upload: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
    </svg>
  )
};

export default function App() {
  const [activeTab, setActiveTab] = useState('chat');
  const [user, setUser] = useState(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [authError, setAuthError] = useState('');

  // Chat State
  const [sessions, setSessions] = useState([]);
  const [activeSession, setActiveSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  // Settings State
  const [apiProvider, setApiProvider] = useState('mock');
  const [geminiKey, setGeminiKey] = useState('');
  const [openaiKey, setOpenaiKey] = useState('');
  const [settingsSuccess, setSettingsSuccess] = useState('');

  // Documents State
  const [documents, setDocuments] = useState([]);
  const [fileToUpload, setFileToUpload] = useState(null);
  const [uploadStatus, setUploadStatus] = useState('');

  // Analytics State
  const [analytics, setAnalytics] = useState(null);

  // Load user session from LocalStorage
  useEffect(() => {
    const savedUser = localStorage.getItem('auraglow_user');
    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      setUser(parsed);
      loadSessions(parsed.id);
    }
  }, []);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Load dependencies when tab changes
  useEffect(() => {
    if (user) {
      if (activeTab === 'docs') loadDocuments();
      if (activeTab === 'analytics') loadAnalytics();
      if (activeTab === 'settings') loadSettings();
    }
  }, [activeTab, user]);

  // --- Auth Handlers ---
  const handleAuth = async (e) => {
    e.preventDefault();
    setAuthError('');
    const endpoint = isRegistering ? '/api/auth/register' : '/api/auth/login';
    try {
      const res = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Authentication failed');

      if (isRegistering) {
        setIsRegistering(false);
        setUsername('');
        setPassword('');
        setAuthError('Registration successful! Please login.');
      } else {
        const loggedUser = { id: data.user_id, username: data.username };
        setUser(loggedUser);
        localStorage.setItem('auraglow_user', JSON.stringify(loggedUser));
        loadSessions(data.user_id);
      }
    } catch (err) {
      setAuthError(err.message);
    }
  };

  const handleLogout = () => {
    setUser(null);
    setSessions([]);
    setActiveSession(null);
    setMessages([]);
    localStorage.removeItem('auraglow_user');
  };

  // --- Session Handlers ---
  const loadSessions = async (userId) => {
    try {
      const res = await fetch(`${API_URL}/api/chat/sessions?user_id=${userId}`);
      if (res.ok) {
        const data = await res.json();
        setSessions(data);
        if (data.length > 0 && !activeSession) {
          selectSession(data[0].session_id);
        }
      }
    } catch (err) {
      console.error("Failed to load sessions:", err);
    }
  };

  const createNewSession = async () => {
    if (!user) return;
    try {
      const res = await fetch(`${API_URL}/api/chat/sessions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id, title: `Chat Session ${sessions.length + 1}` })
      });
      if (res.ok) {
        const data = await res.json();
        setSessions(prev => [data, ...prev]);
        selectSession(data.session_id);
      }
    } catch (err) {
      console.error("Failed to create session:", err);
    }
  };

  const deleteSessionHandler = async (sessionId, e) => {
    e.stopPropagation();
    try {
      const res = await fetch(`${API_URL}/api/chat/sessions/${sessionId}`, { method: 'DELETE' });
      if (res.ok) {
        setSessions(prev => prev.filter(s => s.session_id !== sessionId));
        if (activeSession === sessionId) {
          setActiveSession(null);
          setMessages([]);
        }
      }
    } catch (err) {
      console.error("Failed to delete session:", err);
    }
  };

  const selectSession = async (sessionId) => {
    setActiveSession(sessionId);
    try {
      const res = await fetch(`${API_URL}/api/chat/history/${sessionId}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
    } catch (err) {
      console.error("Failed to load history:", err);
    }
  };

  // --- Message Sending ---
  const sendMessage = async (textToSend) => {
    const text = textToSend || inputMessage;
    if (!text || !text.trim()) return;
    if (!activeSession) return;

    const tempUserMsg = { sender: 'user', content: text, timestamp: new Date().toISOString() };
    setMessages(prev => [...prev, tempUserMsg]);
    setInputMessage('');
    setIsTyping(true);

    try {
      const res = await fetch(`${API_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: text, session_id: activeSession })
      });
      if (res.ok) {
        const data = await res.json();
        const tempAssistantMsg = {
          sender: 'assistant',
          content: data.response,
          agents_activated: data.active_agents || [],
          rag_sources: data.sources || [],
          routing_scores: data.routing_scores || {},
          timestamp: new Date().toISOString()
        };
        setMessages(prev => [...prev, tempAssistantMsg]);
      }
    } catch (err) {
      console.error("Failed to send message:", err);
    } finally {
      setIsTyping(false);
    }
  };

  // --- Document Handlers ---
  const loadDocuments = async () => {
    try {
      const res = await fetch(`${API_URL}/api/documents`);
      if (res.ok) setDocuments(await res.json());
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!fileToUpload) return;
    setUploadStatus('Uploading and indexing...');
    const formData = new FormData();
    formData.append('file', fileToUpload);

    try {
      const res = await fetch(`${API_URL}/api/documents/upload`, {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (res.ok) {
        setUploadStatus(`Success! Document indexed into RAG vector store.`);
        setFileToUpload(null);
        loadDocuments();
      } else {
        setUploadStatus(`Error: ${data.detail}`);
      }
    } catch (err) {
      setUploadStatus(`Error: ${err.message}`);
    }
  };

  const deleteDocumentHandler = async (filename) => {
    try {
      const res = await fetch(`${API_URL}/api/documents/${filename}`, { method: 'DELETE' });
      if (res.ok) loadDocuments();
    } catch (err) {
      console.error(err);
    }
  };

  // --- Settings Handlers ---
  const loadSettings = async () => {
    try {
      const res = await fetch(`${API_URL}/api/settings`);
      if (res.ok) {
        const data = await res.json();
        setApiProvider(data.api_provider);
        setGeminiKey(data.gemini_api_key);
        setOpenaiKey(data.openai_api_key);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const saveSettingsHandler = async (e) => {
    e.preventDefault();
    setSettingsSuccess('');
    try {
      const res = await fetch(`${API_URL}/api/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          api_provider: apiProvider,
          gemini_api_key: geminiKey,
          openai_api_key: openaiKey
        })
      });
      if (res.ok) {
        setSettingsSuccess('API Configuration updated successfully!');
      } else {
        setSettingsSuccess('Failed to update configuration.');
      }
    } catch (err) {
      setSettingsSuccess(`Error: ${err.message}`);
    }
  };

  // --- Analytics Handlers ---
  const loadAnalytics = async () => {
    try {
      const res = await fetch(`${API_URL}/api/analytics`);
      if (res.ok) setAnalytics(await res.json());
    } catch (err) {
      console.error(err);
    }
  };

  // Suggested Prompts
  const suggestions = [
    "How much is the AuraGlow Pro Projector?",
    "My projector image is blurry, how do I focus?",
    "Can I return my soundbar for a refund?",
    "What is the warranty period for hardware?"
  ];

  // Helper component for message routing trace
  const MessageTrace = ({ msg }) => {
    const [isOpen, setIsOpen] = useState(false);
    if (!msg.agents_activated || msg.agents_activated.length === 0) return null;

    return (
      <div className="mt-3 p-3 bg-white border border-slate-100 rounded-xl text-xs text-slate-700">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center justify-between w-full font-semibold text-gradient hover:opacity-80 transition cursor-pointer"
        >
          <div className="flex items-center gap-1.5">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4 text-coral">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 21l8.904-4.43m-8.904-.666L2.25 13.5l13.5-9 2.23 6.69a4.8 4.8 0 010 3.6l-2.23 6.69-2.23-6.69a4.8 4.8 0 00-3.6 0z" />
            </svg>
            Multi-Agent Execution Trace ({msg.agents_activated.join(', ')})
          </div>
          {isOpen ? Icons.ChevronUp() : Icons.ChevronDown()}
        </button>

        {isOpen && (
          <div className="mt-3 space-y-3 border-t border-slate-100 pt-2">
            {/* Intent Scores */}
            {msg.routing_scores && Object.keys(msg.routing_scores).length > 0 && (
              <div>
                <p className="font-semibold mb-1.5 text-slate-800">Intent Classifier Route Scores:</p>
                <div className="space-y-1.5">
                  {Object.entries(msg.routing_scores).map(([agent, score]) => (
                    <div key={agent} className="flex items-center gap-2">
                      <span className="w-16 capitalize">{agent}:</span>
                      <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-coral to-orange-400 rounded-full"
                          style={{ width: `${score * 100}%` }}
                        ></div>
                      </div>
                      <span className="w-8 text-right font-medium">{Math.round(score * 100)}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* RAG Sources */}
            {msg.rag_sources && msg.rag_sources.length > 0 && (
              <div>
                <p className="font-semibold mb-1 text-slate-800">Retrieved RAG Context Documents:</p>
                <div className="space-y-2">
                  {msg.rag_sources.map((src, index) => (
                    <div key={index} className="p-2 bg-amber-50 border border-amber-100 rounded-lg">
                      <div className="flex justify-between font-semibold text-amber-800 text-[10px] uppercase mb-1">
                        <span>📄 {src.doc_name}</span>
                        {src.agent && <span>Routed to: {src.agent}</span>}
                      </div>
                      <p className="text-[11px] leading-relaxed italic text-slate-600">"{src.text}"</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  // --- Auth View ---
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 relative">
        <div className="bg-blobs">
          <div className="blob blob-1"></div>
          <div className="blob blob-2"></div>
        </div>

        <div className="w-full max-w-sm glass-panel p-6 relative shadow-lg">
          <div className="text-center mb-6">
            <div className="inline-flex p-2 rounded-xl bg-gradient-to-tr from-coral to-orange-400 text-white mb-2 shadow-sm">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.042 21.672L13.684 16.6m0 0l-2.51 2.225.569-9.47 5.227 7.917-3.286-.672zm-7.518-.267A11.25 11.25 0 1120.47 9.75M11.25 15.75v-9" />
              </svg>
            </div>
            <h1 className="text-xl font-bold tracking-tight">AuraGlow Support</h1>
            <p className="text-slate-500 text-xs mt-1">Multi-Agent AI Support Portal</p>
          </div>

          <form onSubmit={handleAuth} className="space-y-4">
            <div className="flex flex-col">
              <label className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1">Username</label>
              <input
                type="text"
                required
                placeholder="Enter username (e.g. admin)"
                className="glass-input text-xs py-2 px-3"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            <div className="flex flex-col">
              <label className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1">Password</label>
              <input
                type="password"
                required
                placeholder="Enter password (e.g. 123)"
                className="glass-input text-xs py-2 px-3"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {authError && (
              <div className="text-xs font-medium text-rose-500 bg-rose-50 border border-rose-100 p-2.5 rounded-lg text-center">
                {authError}
              </div>
            )}

            <button type="submit" className="w-full btn-sunset py-2.5 text-sm shadow">
              {isRegistering ? 'Register Account' : 'Sign In'}
            </button>
          </form>

          <div className="text-center mt-4 pt-3 border-t border-slate-100">
            <button
              onClick={() => {
                setIsRegistering(!isRegistering);
                setAuthError('');
              }}
              className="text-xs font-semibold text-gradient hover:opacity-80 transition cursor-pointer"
            >
              {isRegistering ? 'Already have an account? Sign In' : "Don't have an account? Register"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- Main Layout ---
  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Background decoration */}
      <div className="bg-blobs">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
      </div>

      {/* Main Header */}
      <header className="glass-panel mx-6 mt-6 px-6 py-4 flex items-center justify-between rounded-2xl relative z-10">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-tr from-coral to-orange-400 text-white shadow-md">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.042 21.672L13.684 16.6m0 0l-2.51 2.225.569-9.47 5.227 7.917-3.286-.672zm-7.518-.267A11.25 11.25 0 1120.47 9.75M11.25 15.75v-9" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight">AuraGlow Support</h1>
            <p className="text-[10px] font-semibold tracking-wider text-slate-500 uppercase">Multi-Agent AI Hub</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition text-sm cursor-pointer ${activeTab === 'chat' ? 'bg-gradient-to-r from-coral/10 to-orange-400/10 text-coral border border-coral/20' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            {Icons.Chat()} Chat
          </button>
          <button
            onClick={() => setActiveTab('docs')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition text-sm cursor-pointer ${activeTab === 'docs' ? 'bg-gradient-to-r from-coral/10 to-orange-400/10 text-coral border border-coral/20' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            {Icons.Docs()} Knowledge Base
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition text-sm cursor-pointer ${activeTab === 'analytics' ? 'bg-gradient-to-r from-coral/10 to-orange-400/10 text-coral border border-coral/20' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            {Icons.Analytics()} Analytics
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition text-sm cursor-pointer ${activeTab === 'settings' ? 'bg-gradient-to-r from-coral/10 to-orange-400/10 text-coral border border-coral/20' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            {Icons.Settings()} Settings
          </button>
        </nav>

        {/* User Info / Logout */}
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-xs font-semibold text-slate-500">Logged in as</p>
            <p className="text-sm font-bold text-slate-800">@{user.username}</p>
          </div>
          <button
            onClick={handleLogout}
            className="p-2 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-500 border border-slate-200 transition cursor-pointer"
            title="Log Out"
          >
            {Icons.LogOut()}
          </button>
        </div>
      </header>

      {/* Main Grid */}
      <main className="flex-1 grid grid-cols-12 gap-6 p-6 overflow-hidden max-h-[calc(100vh-120px)]">
        
        {/* LEFT COLUMN: Chat Sessions (Only shown when on Chat tab) */}
        {activeTab === 'chat' && (
          <section className="col-span-3 flex flex-col glass-panel p-4 h-full overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-extrabold text-slate-800">Active Conversations</h2>
              <button
                onClick={createNewSession}
                className="p-2 rounded-xl bg-gradient-to-r from-coral to-orange-400 text-white hover:opacity-90 shadow-sm transition cursor-pointer"
                title="New Conversation"
              >
                {Icons.Plus()}
              </button>
            </div>

            <div className="flex-1 space-y-2 overflow-y-auto pr-1">
              {sessions.length === 0 ? (
                <div className="text-center py-8 text-xs font-medium text-slate-400">
                  No active chats. Click '+' to start.
                </div>
              ) : (
                sessions.map((s) => (
                  <div
                    key={s.session_id}
                    onClick={() => selectSession(s.session_id)}
                    className={`group flex items-center justify-between p-3 rounded-xl cursor-pointer transition ${activeSession === s.session_id ? 'bg-gradient-to-r from-coral/10 to-orange-400/10 border border-coral/20 font-semibold text-coral' : 'bg-white hover:bg-slate-50 border border-transparent text-slate-700'}`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={`w-4 h-4 flex-shrink-0 ${activeSession === s.session_id ? 'text-coral' : 'text-slate-400'}`}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 10.742h.008v.008h-.008v-.008zm.37 0h.008v.008h-.008v-.008zm.37 0h.008v.008h-.008v-.008zm.37 0h.008v.008h-.008v-.008zm-7.643 7.828c.119-.48.334-.925.626-1.314A9.972 9.972 0 012.25 12c0-5.523 4.477-10 10-10s10 4.477 10 10-4.477 10-10 10a9.96 9.96 0 01-4.708-1.175l-4.57 1.22a.75.75 0 01-.926-.927l1.22-4.57z" />
                      </svg>
                      <p className="truncate text-xs">{s.title}</p>
                    </div>
                    <button
                      onClick={(e) => deleteSessionHandler(s.session_id, e)}
                      className="p-1 rounded text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition cursor-pointer"
                      title="Delete Conversation"
                    >
                      {Icons.Trash()}
                    </button>
                  </div>
                ))
              )}
            </div>
          </section>
        )}

        {/* RIGHT/CENTER COLUMN: Tab Panels */}
        <section className={`${activeTab === 'chat' ? 'col-span-9' : 'col-span-12'} glass-panel flex flex-col h-full overflow-hidden p-6 relative`}>
          
          {/* TAB 1: Chat Feed */}
          {activeTab === 'chat' && (
            <div className="flex-1 flex flex-col h-full overflow-hidden">
              {activeSession ? (
                <>
                  {/* Messages Feed */}
                  <div className="flex-1 overflow-y-auto space-y-4 pr-2 mb-4">
                    {messages.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full text-center max-w-lg mx-auto">
                        <div className="p-3 rounded-full bg-coral/5 border border-coral/10 text-coral mb-3">
                          {Icons.Chat()}
                        </div>
                        <h3 className="text-lg font-extrabold text-slate-800">Start Your Consultation</h3>
                        <p className="text-slate-500 text-xs mt-1">
                          Type a question about AuraGlow Electronics. Our Multi-Agent Orchestrator will automatically classify your request and retrieve documents to give you specialized support.
                        </p>
                        
                        <div className="grid grid-cols-2 gap-3 mt-6 w-full">
                          {suggestions.map((s, idx) => (
                            <button
                              key={idx}
                              onClick={() => sendMessage(s)}
                              className="p-3 text-left bg-white border border-slate-100 hover:border-coral/30 rounded-xl text-[11px] font-semibold text-slate-700 transition cursor-pointer"
                            >
                              {s}
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : (
                      messages.map((msg, idx) => (
                        <div
                          key={idx}
                          className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`max-w-[75%] rounded-2xl p-4 border ${msg.sender === 'user' ? 'bg-gradient-to-tr from-coral to-orange-400 text-white border-transparent shadow-sm' : 'bg-white border-slate-100 shadow-sm text-slate-800'}`}>
                            <div className="flex items-center gap-1.5 mb-1">
                              <span className="text-[10px] font-bold uppercase tracking-wide opacity-80">
                                {msg.sender === 'user' ? 'You' : 'AuraGlow Support'}
                              </span>
                            </div>
                            <p className="text-xs leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                            
                            {/* Department Route & RAG traces */}
                            {msg.sender === 'assistant' && (
                              <MessageTrace msg={msg} />
                            )}
                          </div>
                        </div>
                      ))
                    )}
                    
                    {isTyping && (
                      <div className="flex justify-start">
                        <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm flex items-center gap-2">
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Orchestrator Routing...</span>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Input form */}
                  <form
                    onSubmit={(e) => { e.preventDefault(); sendMessage(); }}
                    className="flex gap-3 mt-auto border-t border-slate-100 pt-4"
                  >
                    <input
                      type="text"
                      className="flex-1 glass-input py-2.5"
                      placeholder="Ask about billing, setup, warranties, specs..."
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      disabled={isTyping}
                    />
                    <button
                      type="submit"
                      className="btn-sunset px-5 flex items-center justify-center gap-2"
                      disabled={isTyping}
                    >
                      {Icons.Send()}
                    </button>
                  </form>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center">
                  <div className="p-4 rounded-full bg-slate-100 border border-slate-200 text-slate-400 mb-3">
                    {Icons.Chat()}
                  </div>
                  <h3 className="text-base font-extrabold text-slate-700">No Session Selected</h3>
                  <p className="text-xs text-slate-400 mt-1 max-w-xs">Select an existing conversation from the sidebar or start a new one to begin chatting.</p>
                  <button onClick={createNewSession} className="btn-sunset mt-4 text-xs font-semibold py-2">New Conversation</button>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Knowledge Base Document Manager */}
          {activeTab === 'docs' && (
            <div className="flex-1 flex flex-col h-full overflow-hidden">
              <h2 className="text-xl font-extrabold text-slate-800 mb-1">Company Knowledge Base Documents</h2>
              <p className="text-slate-500 text-xs mb-6">Manage the manuals and policies ingested into the RAG system. Uploading or deleting documents triggers automatic vector store re-indexing.</p>

              <div className="grid grid-cols-12 gap-6 flex-1 overflow-hidden">
                {/* Upload Panel */}
                <div className="col-span-4 bg-white border border-slate-100 p-5 rounded-2xl flex flex-col h-fit">
                  <h3 className="text-sm font-bold text-slate-800 mb-3">Upload Document</h3>
                  <form onSubmit={handleUpload} className="space-y-4">
                    <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center cursor-pointer hover:border-coral transition relative">
                      <input
                        type="file"
                        accept=".txt,.pdf"
                        onChange={(e) => setFileToUpload(e.target.files[0])}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                      <div className="flex flex-col items-center justify-center gap-2 text-slate-500">
                        {Icons.Upload()}
                        <p className="text-xs font-semibold text-slate-700">
                          {fileToUpload ? fileToUpload.name : 'Choose PDF or TXT'}
                        </p>
                        <p className="text-[10px]">Maximum file size: 10MB</p>
                      </div>
                    </div>

                    {uploadStatus && (
                      <div className="text-xs font-medium text-center p-2.5 bg-slate-100 border border-slate-200 rounded-lg text-slate-700">
                        {uploadStatus}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={!fileToUpload}
                      className="w-full btn-sunset py-2.5 text-xs shadow"
                    >
                      Process & Index Document
                    </button>
                  </form>
                </div>

                {/* Document List */}
                <div className="col-span-8 flex flex-col h-full overflow-hidden">
                  <h3 className="text-sm font-bold text-slate-800 mb-3">Ingested Documents ({documents.length})</h3>
                  <div className="flex-1 overflow-y-auto space-y-2.5 pr-2">
                    {documents.length === 0 ? (
                      <div className="text-center py-12 text-slate-400 text-xs">No documents available. Upload one to begin.</div>
                    ) : (
                      documents.map((doc, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-white border border-slate-100 rounded-xl shadow-sm hover:border-coral transition">
                          <div className="flex items-center gap-3">
                            <span className="p-2 rounded-lg bg-orange-50 text-orange-500 font-bold text-xs uppercase">{doc.type}</span>
                            <div>
                              <p className="text-xs font-bold text-slate-800">{doc.name}</p>
                              <p className="text-[10px] text-slate-500">Size: {Math.round(doc.size / 1024)} KB</p>
                            </div>
                          </div>
                          <button
                            onClick={() => deleteDocumentHandler(doc.name)}
                            className="p-2 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition cursor-pointer"
                            title="Delete and Reindex"
                          >
                            {Icons.Trash()}
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Analytics Dashboard */}
          {activeTab === 'analytics' && (
            <div className="flex-1 flex flex-col h-full overflow-y-auto pr-2">
              <h2 className="text-xl font-extrabold text-slate-800 mb-1">Analytics & Usage Metrics</h2>
              <p className="text-slate-500 text-xs mb-6">Real-time usage and performance overview of the Multi-Agent System.</p>

              {analytics ? (
                <div className="space-y-6">
                  {/* Grid Cards */}
                  <div className="grid grid-cols-4 gap-4">
                    <div className="p-5 bg-white border border-slate-100 rounded-2xl shadow-sm text-center">
                      <p className="text-xs font-semibold text-slate-500">Total Conversations</p>
                      <p className="text-3xl font-extrabold text-gradient mt-1">{analytics.total_sessions}</p>
                    </div>
                    <div className="p-5 bg-white border border-slate-100 rounded-2xl shadow-sm text-center">
                      <p className="text-xs font-semibold text-slate-500">Total Queries</p>
                      <p className="text-3xl font-extrabold text-gradient mt-1">{analytics.total_messages}</p>
                    </div>
                    <div className="p-5 bg-white border border-slate-100 rounded-2xl shadow-sm text-center">
                      <p className="text-xs font-semibold text-slate-500">Avg Response Time</p>
                      <p className="text-3xl font-extrabold text-gradient mt-1">{analytics.avg_response_time}</p>
                    </div>
                    <div className="p-5 bg-white border border-slate-100 rounded-2xl shadow-sm text-center">
                      <p className="text-xs font-semibold text-slate-500">CSAT Score</p>
                      <p className="text-3xl font-extrabold text-gradient mt-1">{analytics.satisfaction_score} / 5.0</p>
                    </div>
                  </div>

                  {/* Agent Distribution Chart */}
                  <div className="p-5 bg-white border border-slate-100 rounded-2xl shadow-sm">
                    <h3 className="text-sm font-bold text-slate-800 mb-4">Trigger Frequency by Department Agent</h3>
                    <div className="space-y-4">
                      {Object.entries(analytics.agent_usage).map(([agent, count]) => {
                        const maxCount = Math.max(...Object.values(analytics.agent_usage)) || 1;
                        const percentage = (count / maxCount) * 100;
                        return (
                          <div key={agent} className="flex items-center gap-4">
                            <span className="w-48 text-xs font-semibold text-slate-700">{agent}</span>
                            <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-coral to-orange-400 rounded-full"
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                            <span className="w-12 text-xs font-bold text-slate-800 text-right">{count} hits</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-slate-400 text-xs">Loading analytics data...</div>
              )}
            </div>
          )}

          {/* TAB 4: API Settings Configuration */}
          {activeTab === 'settings' && (
            <div className="flex-1 flex flex-col h-full max-w-lg">
              <h2 className="text-xl font-extrabold text-slate-800 mb-1">API Key & Provider Settings</h2>
              <p className="text-slate-500 text-xs mb-6">Manage your Large Language Model provider and API keys. The system falls back to mock responses if set to 'Offline Mode'.</p>

              <form onSubmit={saveSettingsHandler} className="space-y-5">
                <div className="flex flex-col">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">AI Provider Model</label>
                  <select
                    className="glass-input cursor-pointer"
                    value={apiProvider}
                    onChange={(e) => setApiProvider(e.target.value)}
                  >
                    <option value="mock">Offline Mode (Mock Generator)</option>
                    <option value="gemini">Google Gemini API (gemini-1.5-flash)</option>
                    <option value="openai">OpenAI API (gpt-4o-mini)</option>
                  </select>
                </div>

                {apiProvider === 'gemini' && (
                  <div className="flex flex-col">
                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Gemini API Key</label>
                    <input
                      type="password"
                      className="glass-input"
                      placeholder="AIzaSy..."
                      value={geminiKey}
                      onChange={(e) => setGeminiKey(e.target.value)}
                    />
                  </div>
                )}

                {apiProvider === 'openai' && (
                  <div className="flex flex-col">
                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">OpenAI API Key</label>
                    <input
                      type="password"
                      className="glass-input"
                      placeholder="sk-proj-..."
                      value={openaiKey}
                      onChange={(e) => setOpenaiKey(e.target.value)}
                    />
                  </div>
                )}

                {settingsSuccess && (
                  <div className="text-xs font-semibold text-center p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-600">
                    {settingsSuccess}
                  </div>
                )}

                <button type="submit" className="btn-sunset w-full py-3 mt-4 shadow-md text-sm">
                  Save Configuration
                </button>
              </form>
            </div>
          )}

        </section>
      </main>
    </div>
  );
}
