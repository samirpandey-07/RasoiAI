import React, { useState, useRef, useEffect } from 'react';
import {
  Plus,
  Send,
  Paperclip,
  Mic,
  ThumbsUp,
  ThumbsDown,
  Copy,
  RotateCcw,
  Sparkles,
  Check,
  Trash2,
  MessageSquare,
} from 'lucide-react';
import { ChatMessage, Recipe, InventoryItem, UserPreferences } from '../types';
import { askAssistant } from '../services/gemini';

interface AICookingAssistantProps {
  inventory: InventoryItem[];
  activeRecipe?: Recipe | null;
  preferences: UserPreferences;
  onSelectRecipe: (recipeId: string) => void;
}

interface ChatSession {
  id: string;
  title: string;
  createdAt: number;
  messages: ChatMessage[];
}

const STORAGE_KEY = 'rasoi_chat_sessions_v2';

const CREATE_INITIAL_SESSION = (): ChatSession => ({
  id: `session_${Date.now()}`,
  title: 'Culinary Inquiry',
  createdAt: Date.now(),
  messages: [
    {
      id: `welcome_${Date.now()}`,
      sender: 'assistant',
      text: "Hello! I'm Chef RasoiAI, your personal kitchen mentor. What culinary question or ingredient dilemma can I help you resolve?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ],
});

const SUGGESTED_CHIPS = [
  'What can I cook with ingredients expiring soon?',
  'Suggest a quick 20-min dinner recipe',
  'Healthy high-protein meal idea',
  'How do I balance overly spicy curry?',
];

export const AICookingAssistant: React.FC<AICookingAssistantProps> = ({
  inventory,
  activeRecipe,
  preferences,
}) => {
  // Load real sessions from localStorage
  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // fallback to initial
    }
    return [CREATE_INITIAL_SESSION()];
  });

  const [activeSessionId, setActiveSessionId] = useState<string>(() => sessions[0]?.id || 'default');
  const [inputPrompt, setInputPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);

  // Messages container ref for strictly internal scrolling (no window jump)
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Active session
  const currentSession = sessions.find((s) => s.id === activeSessionId) || sessions[0];
  const messages = currentSession?.messages || [];

  // Save sessions to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
    } catch (e) {
      console.error('Failed to save sessions to localStorage:', e);
    }
  }, [sessions]);

  // Keep internal messages scrolled to bottom without moving the page window
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages.length, isLoading]);

  const handleNewChat = () => {
    const newSession = CREATE_INITIAL_SESSION();
    setSessions((prev) => [newSession, ...prev]);
    setActiveSessionId(newSession.id);
  };

  const handleDeleteSession = (e: React.MouseEvent, sessionId: string) => {
    e.stopPropagation();
    const remaining = sessions.filter((s) => s.id !== sessionId);
    if (remaining.length === 0) {
      const fresh = [CREATE_INITIAL_SESSION()];
      setSessions(fresh);
      setActiveSessionId(fresh[0].id);
    } else {
      setSessions(remaining);
      if (activeSessionId === sessionId) {
        setActiveSessionId(remaining[0].id);
      }
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || inputPrompt;
    if (!query.trim() || isLoading) return;

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMessage: ChatMessage = {
      id: `user_${Date.now()}`,
      sender: 'user',
      text: query.trim(),
      timestamp: timeStr,
    };

    // Determine updated session title if it's the first user question
    const isFirstUserMsg = !messages.some((m) => m.sender === 'user');
    const newTitle = isFirstUserMsg
      ? query.trim().length > 30
        ? query.trim().slice(0, 30) + '...'
        : query.trim()
      : currentSession.title;

    // Update active session with user message
    setSessions((prev) =>
      prev.map((s) => {
        if (s.id === currentSession.id) {
          return {
            ...s,
            title: newTitle,
            messages: [...s.messages, userMessage],
          };
        }
        return s;
      })
    );

    setInputPrompt('');
    setIsLoading(true);

    const history = messages.map((m) => ({
      role: (m.sender === 'user' ? 'user' : 'model') as 'user' | 'model',
      text: m.text,
    }));

    const result = await askAssistant(query, history, {
      activeRecipe: activeRecipe
        ? {
            name: activeRecipe.name,
            servings: activeRecipe.servings,
            totalMinutes: activeRecipe.totalMinutes,
            instructions: activeRecipe.instructions,
          }
        : undefined,
      inventory: inventory.map((i) => i.name),
      dietaryPreferences: preferences.dietaryPreferences,
      allergies: preferences.allergies,
    });

    setIsLoading(false);

    const replyText =
      result.success && result.reply
        ? result.reply
        : result.error || 'Sorry, I ran into an error. Please try asking again!';

    const assistantMessage: ChatMessage = {
      id: `chef_${Date.now()}`,
      sender: 'assistant',
      text: replyText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setSessions((prev) =>
      prev.map((s) => {
        if (s.id === currentSession.id) {
          return {
            ...s,
            messages: [...s.messages, assistantMessage],
          };
        }
        return s;
      })
    );
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClearCurrentChat = () => {
    const welcome = CREATE_INITIAL_SESSION().messages[0];
    setSessions((prev) =>
      prev.map((s) => {
        if (s.id === currentSession.id) {
          return {
            ...s,
            title: 'New Conversation',
            messages: [welcome],
          };
        }
        return s;
      })
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-7 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl border border-[#EBE6DD] overflow-hidden shadow-[0_2px_15px_rgba(0,0,0,0.03)] flex flex-col md:flex-row h-[620px] sm:h-[680px] md:h-[700px]">
        {/* Left Sidebar: Real Saved Chats */}
        <div className={`w-full md:w-72 lg:w-80 bg-[#FAF7F2] border-r border-[#EBE6DD] p-4 sm:p-5 flex-col justify-between shrink-0 ${showMobileSidebar ? 'flex' : 'hidden md:flex'}`}>
          <div className="space-y-4 sm:space-y-5 flex-1 flex flex-col overflow-hidden">
            {/* Chef Profile Header */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#E67E22] text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-extrabold text-stone-900 text-sm">Chef RasoiAI</h3>
                <p className="text-[11px] text-stone-500 font-medium">Your personal kitchen mentor</p>
              </div>
            </div>

            {/* + New Chat Button */}
            <button
              onClick={() => {
                handleNewChat();
                setShowMobileSidebar(false);
              }}
              className="w-full flex items-center justify-center gap-2 bg-[#163828] hover:bg-[#122D20] text-white py-2.5 rounded-full text-xs font-semibold shadow-xs transition-colors shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Chat</span>
            </button>

            {/* Real History List */}
            <div className="space-y-1.5 flex-1 overflow-y-auto pr-1">
              <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block px-2 pb-1">
                Your Conversations
              </span>

              {sessions.length === 0 ? (
                <div className="p-4 text-center text-xs text-stone-400">
                  No saved conversations yet.
                </div>
              ) : (
                sessions.map((session) => {
                  const isActive = session.id === currentSession.id;
                  const dateStr = new Date(session.createdAt).toLocaleDateString([], {
                    month: 'short',
                    day: 'numeric',
                  });

                  return (
                    <div
                      key={session.id}
                      onClick={() => {
                        setActiveSessionId(session.id);
                        setShowMobileSidebar(false);
                      }}
                      className={`group w-full flex items-center justify-between text-left text-xs px-3.5 py-2.5 rounded-xl transition-all cursor-pointer ${
                        isActive
                          ? 'bg-[#E9F0E8] text-[#163828] font-bold shadow-xs'
                          : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/50 font-medium'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate pr-2">
                        <MessageSquare className="w-3.5 h-3.5 shrink-0 opacity-60" />
                        <span className="truncate">{session.title}</span>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="text-[10px] text-stone-400 group-hover:hidden">
                          {dateStr}
                        </span>
                        <button
                          onClick={(e) => handleDeleteSession(e, session.id)}
                          className="hidden group-hover:block p-1 text-stone-400 hover:text-rose-600 transition-colors"
                          title="Delete chat"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right Main Chat Area */}
        <div className={`flex-1 flex-col justify-between bg-white h-full overflow-hidden ${showMobileSidebar ? 'hidden md:flex' : 'flex'}`}>
          {/* Top Bar with Mobile Toggle and Clear Chat */}
          <div className="p-3.5 sm:p-4 px-4 sm:px-6 border-b border-[#EBE6DD] flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <button
                onClick={() => setShowMobileSidebar(!showMobileSidebar)}
                className="md:hidden flex items-center gap-1 text-[11px] font-bold px-3 py-1.5 rounded-full bg-[#E9F0E8] text-[#163828] shrink-0 hover:bg-[#DDEAE1] transition-colors"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>{sessions.length}</span>
              </button>
              <div className="min-w-0">
                <h2 className="font-bold text-stone-900 text-sm truncate">{currentSession.title}</h2>
                <p className="text-[11px] text-stone-500 hidden sm:block">Live culinary advice tailored to your pantry</p>
              </div>
            </div>
            <button
              onClick={handleClearCurrentChat}
              className="flex items-center gap-1.5 text-xs text-stone-500 hover:text-stone-800 font-medium px-2.5 sm:px-3 py-1.5 rounded-lg hover:bg-stone-100 transition-colors shrink-0"
              title="Clear conversation"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Clear Chat</span>
            </button>
          </div>

          {/* Messages Feed — strictly scrollable container */}
          <div
            ref={messagesContainerRef}
            className="flex-1 overflow-y-auto p-6 space-y-5 scroll-smooth"
          >
            {messages.map((msg) => {
              const isUser = msg.sender === 'user';

              if (isUser) {
                return (
                  <div key={msg.id} className="flex justify-end items-end gap-2.5">
                    <div className="max-w-lg bg-[#E9F0E8] text-[#163828] p-4 rounded-2xl rounded-br-xs text-xs sm:text-sm font-medium shadow-xs">
                      <p className="whitespace-pre-line">{msg.text}</p>
                      <span className="block text-[10px] text-[#163828]/60 text-right mt-1.5 font-normal">
                        {msg.timestamp}
                      </span>
                    </div>
                    <img
                      src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80"
                      alt="User avatar"
                      className="w-7 h-7 rounded-full object-cover shrink-0"
                    />
                  </div>
                );
              }

              return (
                <div key={msg.id} className="flex items-start gap-3 max-w-2xl">
                  {/* Orange Chef Avatar */}
                  <div className="w-8 h-8 rounded-full bg-[#E67E22] text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>

                  {/* Bubble */}
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-stone-900">Chef RasoiAI</span>
                      <span className="text-[10px] text-stone-400">{msg.timestamp}</span>
                    </div>

                    <div className="text-xs sm:text-sm text-stone-700 leading-relaxed whitespace-pre-line bg-[#FAF7F2] p-4 rounded-2xl border border-[#EBE6DD]">
                      {msg.text}
                    </div>

                    {/* Action icons */}
                    <div className="flex items-center gap-3 text-stone-400 pt-1">
                      <button className="hover:text-stone-700 transition-colors" title="Helpful">
                        <ThumbsUp className="w-3.5 h-3.5" />
                      </button>
                      <button className="hover:text-stone-700 transition-colors" title="Not helpful">
                        <ThumbsDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleCopy(msg.text, msg.id)}
                        className="hover:text-stone-700 transition-colors"
                        title="Copy to clipboard"
                      >
                        {copiedId === msg.id ? (
                          <Check className="w-3.5 h-3.5 text-green-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

            {isLoading && (
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-[#E67E22] text-white flex items-center justify-center shrink-0">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div className="bg-[#FAF7F2] border border-[#EBE6DD] p-3 rounded-2xl flex items-center gap-2 text-xs text-stone-500">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#163828] animate-bounce" />
                  <div className="w-1.5 h-1.5 rounded-full bg-[#163828] animate-bounce [animation-delay:0.2s]" />
                  <div className="w-1.5 h-1.5 rounded-full bg-[#163828] animate-bounce [animation-delay:0.4s]" />
                  <span className="ml-1 text-stone-600">Chef RasoiAI is thinking...</span>
                </div>
              </div>
            )}
          </div>

          {/* Prompt Chips & Input Footer */}
          <div className="p-4 border-t border-[#EBE6DD] bg-[#FAF7F2]/60 space-y-3">
            {/* Suggested Chips that send real queries */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {SUGGESTED_CHIPS.map((chip, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(chip)}
                  className="text-xs px-3 py-1 rounded-full bg-white border border-[#EBE6DD] text-stone-700 hover:bg-stone-50 hover:border-stone-400 whitespace-nowrap transition-colors"
                >
                  {chip}
                </button>
              ))}
            </div>

            {/* Input Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2 bg-white rounded-full border border-[#EBE6DD] px-4 py-2 shadow-xs focus-within:border-[#163828] focus-within:ring-2 focus-within:ring-[#163828]/10"
            >
              <input
                type="text"
                value={inputPrompt}
                onChange={(e) => setInputPrompt(e.target.value)}
                placeholder="Ask Chef RasoiAI anything about cooking, ingredients, or recipes..."
                className="flex-1 text-xs sm:text-sm text-stone-800 placeholder-stone-400 bg-transparent focus:outline-none"
              />

              <div className="flex items-center gap-1.5 text-stone-400">
                <button type="button" className="p-1 hover:text-stone-700" title="Attach image">
                  <Paperclip className="w-4 h-4" />
                </button>
                <button type="button" className="p-1 hover:text-stone-700" title="Voice dictation">
                  <Mic className="w-4 h-4" />
                </button>
                <button
                  type="submit"
                  disabled={!inputPrompt.trim() || isLoading}
                  className="w-8 h-8 rounded-full bg-[#163828] text-white flex items-center justify-center hover:bg-[#122D20] disabled:opacity-40 transition-all ml-1 shadow-xs"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
