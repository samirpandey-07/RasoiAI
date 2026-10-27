import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Clock,
  Play,
  Pause,
  RotateCcw,
  ChefHat,
  Sparkles,
  CheckCircle2,
  Volume2,
  Layers,
  HelpCircle,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import { Recipe, RecipeStep } from '../types';
import { askAssistant } from '../services/gemini';

interface CookingModeProps {
  recipe: Recipe;
  onExit: () => void;
}

export const CookingMode: React.FC<CookingModeProps> = ({ recipe, onExit }) => {
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showIngredients, setShowIngredients] = useState<boolean>(false);
  const [showSousChef, setShowSousChef] = useState<boolean>(false);
  const [sousChefQuestion, setSousChefQuestion] = useState<string>('');
  const [sousChefAnswer, setSousChefAnswer] = useState<string | null>(null);
  const [sousChefLoading, setSousChefLoading] = useState<boolean>(false);

  // Timer states
  const [timerSecondsLeft, setTimerSecondsLeft] = useState<number>(0);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const timerIntervalRef = useRef<any>(null);

  const steps = recipe.instructions;
  const currentStep: RecipeStep = steps[currentStepIndex];
  const isFinished = currentStepIndex >= steps.length;

  // Initialize timer whenever step changes if step has defined timer
  useEffect(() => {
    if (currentStep?.timerSeconds && currentStep.timerSeconds > 0) {
      setTimerSecondsLeft(currentStep.timerSeconds);
      setIsTimerRunning(false);
    } else {
      setTimerSecondsLeft(0);
      setIsTimerRunning(false);
    }
    setSousChefAnswer(null);
  }, [currentStepIndex, currentStep]);

  // Timer ticking effect
  useEffect(() => {
    if (isTimerRunning && timerSecondsLeft > 0) {
      timerIntervalRef.current = setInterval(() => {
        setTimerSecondsLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerIntervalRef.current);
            setIsTimerRunning(false);
            playTimerChime();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(timerIntervalRef.current);
    }
    return () => clearInterval(timerIntervalRef.current);
  }, [isTimerRunning, timerSecondsLeft]);

  // Audio tone using Web Audio API for timer completion
  const playTimerChime = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.2); // A5
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.8);
    } catch {
      // Audio autoplay policy fallback
    }
  };

  const handleNextStep = () => {
    if (currentStepIndex < steps.length) {
      setCurrentStepIndex((prev) => prev + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAskSousChef = async () => {
    if (!sousChefQuestion.trim()) return;
    setSousChefLoading(true);
    setSousChefAnswer(null);

    const result = await askAssistant(
      `Cooking ${recipe.name}, Step ${currentStepIndex + 1} ("${currentStep?.title}"): ${sousChefQuestion}`,
      [],
      {
        activeRecipe: recipe,
        currentStep: currentStepIndex,
      }
    );

    setSousChefLoading(false);
    if (result.success && result.reply) {
      setSousChefAnswer(result.reply);
    } else {
      setSousChefAnswer('Could not reach sous-chef. Keep eyes on pan heat and continue.');
    }
  };

  // Keyboard controls: ArrowRight for next, ArrowLeft for prev
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['input', 'textarea'].includes((e.target as HTMLElement).tagName.toLowerCase())) return;
      if (e.key === 'ArrowRight') handleNextStep();
      if (e.key === 'ArrowLeft') handlePrevStep();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentStepIndex]);

  return (
    <div
      className={`min-h-screen bg-[#FAF8F5] text-stone-900 flex flex-col justify-between selection:bg-emerald-200 ${
        isFullscreen ? 'fixed inset-0 z-50 overflow-y-auto' : ''
      }`}
    >
      {/* Top Header Bar */}
      <header className="px-4 sm:px-8 py-4 bg-white border-b border-[#E2EBE5] flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <button
            onClick={onExit}
            className="p-2 rounded-xl text-stone-500 hover:text-stone-800 hover:bg-stone-100 transition-colors"
            title="Exit cooking mode"
          >
            <X className="w-5 h-5" />
          </button>
          <div>
            <h1 className="font-bold text-base sm:text-lg text-[#143628] truncate max-w-xs sm:max-w-md">
              {recipe.name}
            </h1>
            <p className="text-xs text-stone-500">
              Step {Math.min(currentStepIndex + 1, steps.length)} of {steps.length}
            </p>
          </div>
        </div>

        {/* Header Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowIngredients(!showIngredients)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
              showIngredients
                ? 'bg-[#1B4332] text-white border-[#1B4332]'
                : 'bg-white border-stone-300 text-stone-700 hover:bg-stone-50'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Ingredients</span>
          </button>

          <button
            onClick={() => setShowSousChef(!showSousChef)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
              showSousChef
                ? 'bg-amber-600 text-white border-amber-600'
                : 'bg-white border-stone-300 text-stone-700 hover:bg-stone-50'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span className="hidden sm:inline">Ask Sous-Chef</span>
          </button>

          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 rounded-xl text-stone-500 hover:text-stone-800 hover:bg-stone-100 transition-colors"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="w-full bg-stone-200 h-2">
        <div
          className="bg-[#1B4332] h-full transition-all duration-300 ease-out"
          style={{ width: `${((currentStepIndex + 1) / steps.length) * 100}%` }}
        />
      </div>

      {/* Main Cooking Arena */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-8 py-8 sm:py-12 flex flex-col justify-center">
        {isFinished ? (
          /* Completion Screen */
          <div className="bg-white rounded-3xl border border-[#E2EBE5] p-8 sm:p-12 text-center space-y-6 shadow-sm">
            <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div className="space-y-2">
              <h2 className="text-3xl font-extrabold text-[#143628]">Bon Appétit!</h2>
              <p className="text-stone-600 max-w-md mx-auto text-sm">
                You’ve finished cooking <strong>{recipe.name}</strong>. Plate your dish, garnish with fresh herbs, and enjoy your meal!
              </p>
            </div>
            <div className="flex justify-center gap-3 pt-4">
              <button
                onClick={() => setCurrentStepIndex(0)}
                className="px-5 py-2.5 rounded-xl border border-stone-300 text-stone-700 text-xs font-semibold hover:bg-stone-50"
              >
                Review Steps Again
              </button>
              <button
                onClick={onExit}
                className="px-6 py-2.5 rounded-xl bg-[#1B4332] text-white text-xs font-bold hover:bg-[#143628] shadow-sm"
              >
                Back to Kitchen
              </button>
            </div>
          </div>
        ) : (
          /* Step Instruction Card */
          <div className="bg-white rounded-3xl border border-[#E2EBE5] p-6 sm:p-12 shadow-sm space-y-8">
            {/* Step Header */}
            <div className="flex items-center justify-between pb-4 border-b border-stone-100">
              <div className="flex items-center gap-3">
                <span className="w-9 h-9 rounded-xl bg-[#1B4332] text-white font-bold flex items-center justify-center text-sm shadow-xs">
                  {currentStep.stepNumber}
                </span>
                <h2 className="text-xl sm:text-2xl font-extrabold text-stone-800">
                  {currentStep.title}
                </h2>
              </div>
            </div>

            {/* Oversized Instruction Text for Counter Visibility */}
            <p className="text-lg sm:text-2xl text-stone-800 font-normal leading-relaxed tracking-normal">
              {currentStep.instruction}
            </p>

            {/* Chef Tip Callout */}
            {currentStep.chefTip && (
              <div className="p-4 sm:p-5 rounded-2xl bg-[#F0F4F1] border border-[#d6e3db] text-sm text-stone-800 flex items-start gap-3">
                <ChefHat className="w-5 h-5 text-[#1B4332] shrink-0 mt-0.5" />
                <div>
                  <strong className="font-bold text-[#1B4332] block mb-0.5">Chef&apos;s Pro Tip</strong>
                  {currentStep.chefTip}
                </div>
              </div>
            )}

            {/* Interactive Countdown Timer */}
            {timerSecondsLeft > 0 || currentStep.timerSeconds ? (
              <div className="p-5 rounded-2xl bg-[#FAF8F5] border border-amber-200/80 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      timerSecondsLeft === 0
                        ? 'bg-rose-500 text-white animate-bounce'
                        : isTimerRunning
                        ? 'bg-amber-500 text-white'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    <Clock className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-xs uppercase font-bold text-amber-900 tracking-wider block">
                      Step Timer
                    </span>
                    <span className="text-3xl font-mono font-black text-stone-800">
                      {formatTimer(timerSecondsLeft)}
                    </span>
                  </div>
                </div>

                {/* Timer Controls */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsTimerRunning(!isTimerRunning)}
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors ${
                      isTimerRunning
                        ? 'bg-amber-600 text-white hover:bg-amber-700'
                        : 'bg-[#1B4332] text-white hover:bg-[#143628]'
                    }`}
                  >
                    {isTimerRunning ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
                    <span>{isTimerRunning ? 'Pause' : 'Start'}</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsTimerRunning(false);
                      setTimerSecondsLeft(currentStep.timerSeconds || 0);
                    }}
                    className="p-2.5 rounded-xl border border-stone-300 text-stone-600 hover:bg-stone-100"
                    title="Reset Timer"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => setTimerSecondsLeft((s) => s + 60)}
                    className="px-3 py-2 rounded-xl border border-stone-300 text-stone-700 text-xs font-semibold hover:bg-stone-100"
                  >
                    +1 min
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        )}
      </main>

      {/* Slide-out Ingredients Drawer */}
      {showIngredients && (
        <div className="fixed inset-y-0 right-0 z-40 w-full max-w-sm bg-white border-l border-[#E2EBE5] p-6 shadow-2xl flex flex-col justify-between overflow-y-auto">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <h3 className="font-bold text-base text-stone-800">Recipe Ingredients</h3>
              <button onClick={() => setShowIngredients(false)} className="p-1 text-stone-400 hover:text-stone-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="py-4 space-y-2">
              {recipe.ingredients.map((ing, i) => (
                <div key={i} className="text-xs p-2 rounded-lg bg-stone-50 border border-stone-100 flex items-center justify-between">
                  <span className="font-semibold text-stone-800">{ing.name}</span>
                  <span className="text-stone-500 font-mono">
                    {ing.amount} {ing.unit}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <button
            onClick={() => setShowIngredients(false)}
            className="w-full py-2.5 rounded-xl bg-stone-100 text-stone-700 text-xs font-semibold hover:bg-stone-200"
          >
            Close Ingredients
          </button>
        </div>
      )}

      {/* Slide-out Sous-Chef Drawer */}
      {showSousChef && (
        <div className="fixed inset-y-0 right-0 z-40 w-full max-w-md bg-white border-l border-[#E2EBE5] p-6 shadow-2xl flex flex-col justify-between overflow-y-auto space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                <h3 className="font-bold text-base text-stone-800">Ask Sous-Chef Gemini</h3>
              </div>
              <button onClick={() => setShowSousChef(false)} className="p-1 text-stone-400 hover:text-stone-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-stone-500">
              Stuck on Step {currentStepIndex + 1}? Ask quick questions about timing, burning, or adjustments.
            </p>

            <div className="flex gap-2">
              <input
                type="text"
                value={sousChefQuestion}
                onChange={(e) => setSousChefQuestion(e.target.value)}
                placeholder="e.g. 'Is medium-high heat too hot?'"
                onKeyDown={(e) => e.key === 'Enter' && handleAskSousChef()}
                className="flex-1 px-3 py-2 text-xs border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1B4332]"
              />
              <button
                onClick={handleAskSousChef}
                disabled={sousChefLoading}
                className="px-3.5 py-2 rounded-xl bg-[#1B4332] text-white text-xs font-semibold hover:bg-[#143628] disabled:opacity-50"
              >
                {sousChefLoading ? '...' : 'Ask'}
              </button>
            </div>

            {sousChefAnswer && (
              <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E2EBE5] text-xs text-stone-800 leading-relaxed space-y-1">
                <strong className="text-[#1B4332] block font-bold">Chef&apos;s Guidance:</strong>
                <p>{sousChefAnswer}</p>
              </div>
            )}
          </div>

          <button
            onClick={() => setShowSousChef(false)}
            className="w-full py-2.5 rounded-xl bg-stone-100 text-stone-700 text-xs font-semibold hover:bg-stone-200"
          >
            Close
          </button>
        </div>
      )}

      {/* Bottom Sticky Counter Navigation */}
      <footer className="px-4 sm:px-8 py-4 bg-white border-t border-[#E2EBE5] sticky bottom-0 z-30">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <button
            onClick={handlePrevStep}
            disabled={currentStepIndex === 0}
            className="flex items-center gap-1.5 px-5 py-3 rounded-xl border border-stone-300 text-stone-700 text-xs sm:text-sm font-semibold hover:bg-stone-50 disabled:opacity-40 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          <span className="text-xs text-stone-500 font-medium hidden sm:inline">
            Use keyboard &larr; / &rarr; keys to advance
          </span>

          <button
            onClick={handleNextStep}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#1B4332] text-white text-xs sm:text-sm font-bold shadow-md hover:bg-[#143628] transition-all"
          >
            <span>{currentStepIndex >= steps.length - 1 ? 'Finish Meal' : 'Next Step'}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </footer>
    </div>
  );
};
