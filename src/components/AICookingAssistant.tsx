import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Send,
  User,
  ChefHat,
  RotateCcw,
  BookOpen,
  AlertCircle,
  HelpCircle,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { ChatMessage, Recipe, InventoryItem, UserPreferences } from '../types';
import { askAssistant } from '../services/gemini';

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
  'How do I balance an overly spicy or acidic curry?',
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
      text: "Hello! I'm Chef Gemini, your personal kitchen mentor. I know what's in your inventory and your dietary preferences. What culinary question or ingredient dilemma can I help you resolve today?",
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

    const inventoryNames = inventory.map((i) => `${i.name} (${i.quantity} ${i.unit})`);

    const result = await askAssistant(query.trim(), history, {
      activeRecipe: activeRecipe || undefined,
      inventory: inventoryNames,
      dietaryPreferences: preferences.dietaryPreferences,
      allergies: preferences.allergies,
    });

    setIsLoading(false);

    if (result.success && result.reply) {
      const assistantMessage: ChatMessage = {
        id: `chef_${Date.now()}`,
        sender: 'assistant',
        text: result.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } else {
      setErrorMessage(result.error || 'Failed to reach Chef Gemini. Please try again.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E2EBE5]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#1B4332] text-white flex items-center justify-center shadow-xs">
            <Sparkles className="w-5 h-5 text-emerald-200" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#143628] tracking-tight">
              Chef Gemini AI Assistant
            </h1>
            <p className="text-xs text-stone-500">
              Executive chef guidance grounded in your kitchen inventory & allergies
            </p>
          </div>
        </div>

        {activeRecipe && (
          <div className="px-3 py-1.5 rounded-xl bg-[#E7EFEA] border border-[#C3D5C8] text-xs font-semibold text-[#1B4332] flex items-center gap-1.5 self-start sm:self-auto">
            <ChefHat className="w-3.5 h-3.5" />
            <span>Active context: {activeRecipe.name}</span>
          </div>
        )}
      </div>

      {/* Chat Messages Container */}
      <div className="bg-white rounded-3xl border border-[#E2EBE5] p-5 sm:p-6 shadow-xs h-[520px] flex flex-col justify-between overflow-hidden">
        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';
            return (
              <div
                key={msg.id}
                className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : ''}`}
              >
                {/* Avatar */}
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                    isUser
                      ? 'bg-stone-200 text-stone-700'
                      : 'bg-[#1B4332] text-white'
                  }`}
                >
                  {isUser ? <User className="w-4 h-4" /> : <ChefHat className="w-4 h-4 text-emerald-200" />}
                </div>

                {/* Message Bubble */}
                <div
                  className={`max-w-[85%] sm:max-w-[75%] p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                    isUser
                      ? 'bg-[#1B4332] text-white rounded-tr-xs'
                      : 'bg-[#FAF8F5] text-stone-800 border border-stone-200/80 rounded-tl-xs space-y-2'
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
              <div className="w-8 h-8 rounded-full bg-[#1B4332] text-white flex items-center justify-center shrink-0">
                <ChefHat className="w-4 h-4 text-emerald-200" />
              </div>
              <div className="bg-[#FAF8F5] border border-stone-200/80 p-3.5 rounded-2xl rounded-tl-xs flex items-center gap-2 text-xs text-stone-500">
                <div className="w-2 h-2 rounded-full bg-[#1B4332] animate-bounce" />
                <div className="w-2 h-2 rounded-full bg-[#1B4332] animate-bounce [animation-delay:0.2s]" />
                <div className="w-2 h-2 rounded-full bg-[#1B4332] animate-bounce [animation-delay:0.4s]" />
                <span className="ml-1">Chef Gemini is thinking...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Error notification if server error occurs */}
        {errorMessage && (
          <div className="mt-2 p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button
              onClick={() => handleSendMessage()}
              className="text-xs font-bold text-red-700 underline ml-2"
            >
              Retry
            </button>
          </div>
        )}

        {/* Input Bar */}
        <div className="pt-4 border-t border-stone-100 space-y-3">
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
              placeholder="Ask Chef Gemini anything (e.g. 'How do I substitute heavy cream?')..."
              className="flex-1 px-4 py-3 rounded-2xl border border-stone-300 text-xs sm:text-sm bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1B4332]/20 focus:border-[#1B4332] transition-colors"
            />
            <button
              type="submit"
              disabled={!inputPrompt.trim() || isLoading}
              className="p-3 rounded-2xl bg-[#1B4332] text-white hover:bg-[#143628] disabled:opacity-40 transition-colors shadow-xs"
              title="Send question"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>

      {/* Suggested Quick Prompt Chips */}
      <div className="space-y-2">
        <span className="text-xs font-bold text-stone-600">Quick Prompt Suggestions:</span>
        <div className="flex flex-wrap gap-2">
          {QUICK_PROMPTS.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(prompt)}
              className="text-xs px-3 py-1.5 rounded-xl bg-white border border-[#E2EBE5] text-stone-700 font-medium hover:bg-[#F0F4F1] hover:text-[#1B4332] transition-colors text-left"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
