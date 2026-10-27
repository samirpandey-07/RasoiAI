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
} from 'lucide-react';
import { ChatMessage, Recipe, InventoryItem, UserPreferences } from '../types';
import { askAssistant } from '../services/gemini';

interface AICookingAssistantProps {
  inventory: InventoryItem[];
  activeRecipe?: Recipe | null;
  preferences: UserPreferences;
  onSelectRecipe: (recipeId: string) => void;
}

const CHAT_HISTORY = {
  Today: [
    'Substitute for cream',
    'Use spinach before expiry',
    'High protein breakfast ideas',
    'Make pasta without cheese',
  ],
  Yesterday: [
    'What can I cook with paneer?',
    'Low calorie dinner options',
  ],
  'This Week': [
    'Meal prep for the week',
  ],
};

const SUGGESTED_CHIPS = [
  'Suggest a full pasta recipe',
  'Make it high-protein',
  'What other substitutes work?',
  'Show step-by-step',
];

export const AICookingAssistant: React.FC<AICookingAssistantProps> = ({
  inventory,
  activeRecipe,
  preferences,
}) => {
  const [activeChatTitle, setActiveChatTitle] = useState('Substitute for cream');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg_1',
      sender: 'user',
      text: 'How do I substitute heavy cream with yogurt in pasta?',
      timestamp: '02:01 PM',
    },
    {
      id: 'msg_2',
      sender: 'assistant',
      text: `You can definitely substitute heavy cream with yogurt in pasta! Here's how to do it while keeping the sauce creamy and delicious:

1. Use plain, unsweetened yogurt (preferably Greek yogurt).
2. Add it at low heat to prevent curdling.
3. Mix with a little pasta water to get a smooth, creamy texture.
4. You can also add a bit of olive oil or butter for richness.
5. Works great with garlic, herbs, and parmesan.

Tip: Add the yogurt after removing the pan from high heat and stir continuously.`,
      timestamp: '02:01 PM',
    },
  ]);

  const [inputPrompt, setInputPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

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

    setMessages((prev) => [...prev, userMessage]);
    setInputPrompt('');
    setIsLoading(true);

    const history = messages.map((m) => ({
      role: (m.sender === 'user' ? 'user' : 'model') as 'user' | 'model',
      text: m.text,
    }));

    const result = await askAssistant(query, history, {
      activeRecipe: activeRecipe ? {
        name: activeRecipe.name,
        servings: activeRecipe.servings,
        totalMinutes: activeRecipe.totalMinutes,
        instructions: activeRecipe.instructions,
      } : undefined,
      inventory: inventory.map((i) => i.name),
      dietaryPreferences: preferences.dietaryPreferences,
      allergies: preferences.allergies,
    });

    setIsLoading(false);

    if (result.success && result.reply) {
      setMessages((prev) => [
        ...prev,
        {
          id: `chef_${Date.now()}`,
          sender: 'assistant',
          text: result.reply!,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } else {
      setMessages((prev) => [
        ...prev,
        {
          id: `chef_${Date.now()}`,
          sender: 'assistant',
          text: result.error || 'Sorry, I ran into a network hiccup. Please ask again!',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: `welcome_${Date.now()}`,
        sender: 'assistant',
        text: "Hello! I'm Chef RasoiAI, your personal kitchen mentor. What culinary question or ingredient dilemma can I help you resolve?",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-7 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl border border-[#EBE6DD] overflow-hidden shadow-[0_2px_15px_rgba(0,0,0,0.03)] flex flex-col md:flex-row h-[700px]">
        {/* Left Sidebar */}
        <div className="w-full md:w-72 lg:w-80 bg-[#FAF7F2] border-r border-[#EBE6DD] p-5 flex flex-col justify-between shrink-0">
          <div className="space-y-5">
            {/* Chef Profile Header */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#E67E22] text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-extrabold text-stone-900 text-sm">Chef RasoiAI</h3>
                <p className="text-[11px] text-stone-500 font-medium">Your personal kitchen mentor</p>
              </div>
            </div>

            {/* + New Chat Button */}
            <button
              onClick={handleClearChat}
              className="w-full flex items-center justify-center gap-2 bg-[#163828] hover:bg-[#122D20] text-white py-2.5 rounded-full text-xs font-semibold shadow-xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Chat</span>
            </button>

            {/* History List */}
            <div className="space-y-4 pt-1 overflow-y-auto max-h-[460px] pr-1">
              {Object.entries(CHAT_HISTORY).map(([section, items]) => (
                <div key={section} className="space-y-1.5">
                  <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block px-2">
                    {section}
                  </span>
                  {items.map((title) => {
                    const isActive = activeChatTitle === title;
                    return (
                      <button
                        key={title}
                        onClick={() => setActiveChatTitle(title)}
                        className={`w-full text-left text-xs px-3.5 py-2 rounded-xl transition-all truncate block ${
                          isActive
                            ? 'bg-[#E9F0E8] text-[#163828] font-bold shadow-xs'
                            : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/50 font-medium'
                        }`}
                      >
                        {title}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Main Chat Area */}
        <div className="flex-1 flex flex-col justify-between bg-white h-full overflow-hidden">
          {/* Top Bar with Clear Chat */}
          <div className="p-4 px-6 border-b border-[#EBE6DD] flex items-center justify-between">
            <div>
              <h2 className="font-bold text-stone-900 text-sm">Chef RasoiAI</h2>
              <p className="text-[11px] text-stone-500">Live culinary advice tailored to your pantry</p>
            </div>
            <button
              onClick={handleClearChat}
              className="flex items-center gap-1.5 text-xs text-stone-500 hover:text-stone-800 font-medium px-3 py-1.5 rounded-lg hover:bg-stone-100 transition-colors"
              title="Clear conversation"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Clear Chat</span>
            </button>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 overflow-y-auto p-6 space-y-5">
            {messages.map((msg) => {
              const isUser = msg.sender === 'user';

              if (isUser) {
                return (
                  <div key={msg.id} className="flex justify-end items-end gap-2.5">
                    <div className="max-w-lg bg-[#E9F0E8] text-[#163828] p-4 rounded-2xl rounded-br-xs text-xs sm:text-sm font-medium shadow-xs">
                      <p>{msg.text}</p>
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

            <div ref={messagesEndRef} />
          </div>

          {/* Prompt Chips & Input Footer */}
          <div className="p-4 border-t border-[#EBE6DD] bg-[#FAF7F2]/60 space-y-3">
            {/* Chips */}
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
