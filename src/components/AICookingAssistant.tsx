import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, Recipe, InventoryItem, UserPreferences } from '../types';
import { askAssistant } from '../services/gemini';
import { AiSparkleBadge, AiSparkleIcon } from './AiSparkleIcon';

interface AICookingAssistantProps {
  inventory: InventoryItem[];
  activeRecipe?: Recipe | null;
  preferences: UserPreferences;
  onSelectRecipe: (recipeId: string) => void;
}

const QUICK_PROMPTS = [
  'What can I cook tonight using my expiring produce?',
  'Suggest a dairy-free substitute for heavy cream',
  'How do I rescue vegetables that started wilting?',
  'What temperature should a chicken breast reach internally?',
  'How do I balance an overly acidic curry or sauce?',
  'What wine or non-alcoholic beverage pairs with Butter Chicken?',
];

export const AICookingAssistant: React.FC<AICookingAssistantProps> = ({
  inventory,
  activeRecipe,
  preferences,
  onSelectRecipe,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: "Hello! I'm Chef Gemini, your personal kitchen mentor. I know your inventory and dietary preferences. What culinary question or ingredient dilemma can I help you with today?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputPrompt, setInputPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || inputPrompt;
    if (!query.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user_${Date.now()}`,
      sender: 'user',
      text: query.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputPrompt('');
    setIsLoading(true);
    setErrorMessage(null);

    // Prepare conversation history for Gemini server
    const history = messages
      .filter((m) => m.id !== 'welcome')
      .map((m) => ({
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
      setErrorMessage(result.error || 'Failed to get answer. Please check your network or API key.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-black/[0.06]">
        <div className="flex items-center gap-3">
          <AiSparkleBadge size="lg" />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold text-stone-900 tracking-tight">
                Chef Gemini AI
              </h1>
              <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                Active Mentor
              </span>
            </div>
            <p className="text-xs text-stone-500 mt-0.5">
              Grounded in your {inventory.length} on-hand kitchen ingredients & dietary preferences
            </p>
          </div>
        </div>

        {activeRecipe && (
          <div className="px-3.5 py-1.5 rounded-xl bg-stone-100 border border-black/[0.06] text-xs font-bold text-stone-800 flex items-center gap-2 self-start sm:self-auto">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Active: {activeRecipe.name}</span>
          </div>
        )}
      </div>

      {/* Chat Messages Container */}
      <div className="bg-white rounded-3xl border border-black/[0.06] p-5 sm:p-6 shadow-xs h-[520px] flex flex-col justify-between overflow-hidden">
        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';
            return (
              <div
                key={msg.id}
                className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : ''}`}
              >
                {/* Minimal Avatar */}
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                    isUser
                      ? 'bg-stone-900 text-white'
                      : 'bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-xs'
                  }`}
                >
                  {isUser ? 'You' : <AiSparkleIcon size={14} className="text-white" />}
                </div>

                {/* Message Bubble */}
                <div
                  className={`max-w-[85%] sm:max-w-[75%] p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                    isUser
                      ? 'bg-stone-900 text-white rounded-tr-xs'
                      : 'bg-stone-50 text-stone-800 border border-black/[0.05] rounded-tl-xs space-y-2'
                  }`}
                >
                  <div className="whitespace-pre-line">{msg.text}</div>
                  <span
                    className={`block text-[10px] mt-1 ${
                      isUser ? 'text-white/60 text-right' : 'text-stone-400 text-left'
                    }`}
                  >
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            );
          })}

          {/* Loading Indicator */}
          {isLoading && (
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <AiSparkleIcon size={14} className="text-white" />
              </div>
              <div className="bg-stone-50 border border-black/[0.05] p-3.5 rounded-2xl rounded-tl-xs flex items-center gap-2 text-xs text-stone-500">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-bounce" />
                <div className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-bounce [animation-delay:0.2s]" />
                <div className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-bounce [animation-delay:0.4s]" />
                <span className="ml-1 text-stone-600 font-medium">Chef Gemini is formulating culinary advice...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Error notification if server error occurs */}
        {errorMessage && (
          <div className="mt-2 p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center justify-between">
            <span>{errorMessage}</span>
            <button
              onClick={() => handleSendMessage()}
              className="text-xs font-bold text-red-700 underline ml-2"
            >
              Retry
            </button>
          </div>
        )}

        {/* Input Bar */}
        <div className="pt-4 border-t border-black/[0.05] space-y-3">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputPrompt}
              onChange={(e) => setInputPrompt(e.target.value)}
              placeholder="Ask Chef Gemini (e.g. 'How do I substitute heavy cream with yogurt?')..."
              className="flex-1 px-4 py-3 rounded-2xl border border-black/[0.08] text-xs sm:text-sm bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-stone-900/10 focus:border-stone-900 transition-colors"
            />
            <button
              type="submit"
              disabled={!inputPrompt.trim() || isLoading}
              className="px-5 py-3 rounded-2xl bg-stone-900 text-white font-bold text-xs hover:bg-stone-800 disabled:opacity-40 transition-colors shadow-xs"
            >
              Send
            </button>
          </form>
        </div>
      </div>

      {/* Suggested Quick Prompt Chips */}
      <div className="space-y-2">
        <span className="text-xs font-bold text-stone-600">Suggested Inquiries:</span>
        <div className="flex flex-wrap gap-2">
          {QUICK_PROMPTS.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(prompt)}
              className="text-xs px-3.5 py-1.5 rounded-xl bg-white border border-black/[0.06] text-stone-700 font-medium hover:border-black/20 hover:text-stone-950 transition-colors text-left"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
