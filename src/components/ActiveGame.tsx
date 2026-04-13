import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import type { Room, Player, RoundMode } from "@/lib/types";
import { CATEGORY_INFO, DIFFICULTY_INFO, SCENARIOS, REVERSE_SCENARIOS } from "@/lib/scenarios";
import { Clock, Send, Zap, RotateCcw, AlertTriangle } from "lucide-react";

const ROUND_MODE_INFO: Record<RoundMode, { emoji: string; label: string; description: string }> = {
  classic: { emoji: '⚖️', label: 'Classic', description: 'Argue your case to the Judge' },
  speed: { emoji: '⚡', label: 'Speed Round', description: '15 seconds — gut instinct only!' },
  reverse: { emoji: '🔄', label: 'Reverse Trial', description: 'Argue AGAINST yourself — worst self-defense wins' },
  objection: { emoji: '📢', label: 'Objection!', description: 'After submissions, write an objection to someone else\'s argument' },
};

interface ActiveGameProps {
  room: Room;
  player: Player | null;
  hasSubmitted: boolean;
  onSubmitArgument: (text: string) => void;
  timeRemaining: number;
}

export default function ActiveGame({ room, player, hasSubmitted, onSubmitArgument, timeRemaining }: ActiveGameProps) {
  const [argument, setArgument] = useState("");
  const [showModeIntro, setShowModeIntro] = useState(true);
  const argumentRef = useRef("");

  const mode = room.round_mode || 'classic';
  const modeInfo = ROUND_MODE_INFO[mode];
  const isSpeed = mode === 'speed';
  const isUrgent = timeRemaining <= 10;
  const isDanger = timeRemaining <= 5;

  // Keep ref in sync with state
  useEffect(() => { argumentRef.current = argument; }, [argument]);

  // Find scenario metadata for difficulty display
  const pool = mode === 'reverse' ? REVERSE_SCENARIOS : SCENARIOS;
  const scenarioMeta = pool.find(s => s.text === room.current_scenario);
  const difficulty = scenarioMeta ? DIFFICULTY_INFO[scenarioMeta.difficulty] : null;
  const category = scenarioMeta ? CATEGORY_INFO[scenarioMeta.category] : null;

  // Submit automatically if time runs out and hasn't submitted
  useEffect(() => {
    if (timeRemaining <= 0 && !hasSubmitted) {
      const defaultMessages = [
        "I have no defense. Have mercy!",
        "I plead the fifth!",
        "My lawyer didn't show up!",
        "*sweats nervously*",
        "I was told there would be snacks, not questions.",
      ];
      onSubmitArgument(argumentRef.current || defaultMessages[Math.floor(Math.random() * defaultMessages.length)]);
    }
  }, [timeRemaining, hasSubmitted, onSubmitArgument]);

  // Auto-hide mode intro after 2.5s
  useEffect(() => {
    setShowModeIntro(true);
    const timer = setTimeout(() => setShowModeIntro(false), 2500);
    return () => clearTimeout(timer);
  }, [room.current_round]);

  // Calculate timer bar width
  const maxTime = isSpeed ? 15 : 60;
  const timerPercent = (timeRemaining / maxTime) * 100;

  return (
    <div className={`flex flex-col items-center w-full max-w-5xl mx-auto space-y-6 relative z-10 pt-6 font-[Georgia,serif] ${isDanger ? 'urgency-flash' : ''}`}>
      {/* Mode Intro Splash */}
      {showModeIntro && (
        <motion.div
          initial={{ scale: 0, rotate: -15, opacity: 0 }}
          animate={{ scale: 1, rotate: 0, opacity: 1 }}
          exit={{ scale: 0.5, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 15 }}
          className="fixed inset-0 z-[200] flex items-center justify-center bg-stone-900/80 backdrop-blur-sm"
          onClick={() => setShowModeIntro(false)}
        >
          <div className="text-center space-y-4">
            <div className="text-8xl md:text-9xl">{modeInfo.emoji}</div>
            <h2 className="text-4xl md:text-6xl font-bold text-amber-50 uppercase tracking-widest">
              {modeInfo.label}
            </h2>
            <p className="text-xl md:text-2xl text-stone-300 italic max-w-md mx-auto">
              {modeInfo.description}
            </p>
            {isSpeed && (
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ repeat: Infinity, duration: 0.5 }}
                className="inline-flex items-center gap-2 bg-red-900/80 text-red-200 px-6 py-3 rounded-full font-bold text-lg mt-4"
              >
                <Zap size={20} /> ONLY 15 SECONDS!
              </motion.div>
            )}
          </div>
        </motion.div>
      )}

      {/* Timer + Progress Bar */}
      <div className="w-full max-w-3xl">
        <motion.div
          initial={{ y: -50, scale: 0.5, opacity: 0 }}
          animate={{ y: 0, scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 10 }}
          className={`flex items-center justify-between px-6 py-3 bg-amber-50/95 shadow-lg rounded-t-xl border border-stone-400 ${isSpeed ? 'speed-border border-2' : ''}`}
        >
          <div className="flex items-center gap-3">
            {/* Mode badge */}
            <span className="text-2xl">{modeInfo.emoji}</span>
            <span className="text-sm font-bold text-stone-600 uppercase tracking-widest hidden md:inline">
              {modeInfo.label}
            </span>
            {/* Difficulty */}
            {difficulty && (
              <span className="text-sm shimmer hidden md:inline">
                {difficulty.emoji} {difficulty.label}
              </span>
            )}
          </div>
          <div className={`flex items-center gap-3 text-3xl md:text-4xl font-bold ${
            isDanger ? 'text-red-700' : isUrgent ? 'text-amber-700' : 'text-stone-800'
          }`}>
            <Clock size={28} className={isDanger ? 'animate-spin' : isUrgent ? 'animate-pulse' : ''} />
            <span className={isDanger ? 'animate-pulse' : ''}>{timeRemaining}s</span>
          </div>
        </motion.div>
        {/* Timer bar */}
        <div className="w-full h-2 bg-stone-300 rounded-b-xl overflow-hidden">
          <motion.div
            className={`h-full ${
              isDanger ? 'bg-red-600' : isUrgent ? 'bg-amber-500' : 'bg-stone-700'
            }`}
            initial={{ width: '100%' }}
            animate={{ width: `${timerPercent}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Scenario Header */}
      <motion.div
        initial={{ scale: 0.8, y: 50, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 150, damping: 12, delay: 0.1 }}
        className="text-center bg-amber-50/95 border border-stone-400 p-6 md:p-10 shadow-2xl w-full relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 bg-stone-800 text-amber-50 font-bold px-6 py-1.5 text-sm uppercase tracking-widest flex items-center gap-2">
          Round #{room.current_round}
          {category && <span className="text-amber-300">{category.emoji}</span>}
        </div>
        {mode === 'reverse' && (
          <div className="absolute top-0 right-0 bg-red-800 text-amber-50 font-bold px-6 py-1.5 text-sm uppercase tracking-widest flex items-center gap-1.5">
            <RotateCcw size={14} /> REVERSE
          </div>
        )}
        <p className="text-stone-600 font-bold uppercase tracking-widest mt-6 mb-3 text-xs italic">
          {mode === 'reverse' ? 'ARGUE AGAINST YOURSELF' : 'The Scenario'}
        </p>
        <h2 className="text-2xl md:text-4xl font-bold leading-tight text-stone-900 border-b-2 border-stone-300 pb-6">
          &ldquo;{room.current_scenario}&rdquo;
        </h2>
        {difficulty && (
          <div className="flex items-center justify-center gap-2 mt-4 text-sm text-stone-500 font-bold">
            <span>{difficulty.emoji}</span>
            <span>{difficulty.points === 1 ? '1 Point' : `${difficulty.points} Points`} for winning</span>
          </div>
        )}
      </motion.div>

      {/* Input Area */}
      {!player ? (
        <div className="text-center p-8 bg-amber-50 border border-stone-400 w-full shadow-lg">
          <p className="text-2xl font-bold text-stone-600 uppercase tracking-widest">You are Spectating</p>
        </div>
      ) : hasSubmitted ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.5, rotate: 5 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 12 }}
          className="text-center p-10 bg-amber-50/95 border-t-8 border-stone-800 shadow-2xl w-full"
        >
          <div className="text-stone-800 text-5xl mb-4">🖋️</div>
          <h3 className="text-3xl md:text-4xl font-bold text-stone-900 mb-3 tracking-widest">Argument Filed!</h3>
          <p className="text-lg font-bold text-stone-600 italic">The court awaits the other attorneys...</p>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 150, damping: 15, delay: 0.2 }}
          className="w-full space-y-4"
        >
          <div className={`relative bg-amber-50/95 p-6 border shadow-2xl ${
            isSpeed ? 'border-2 speed-border' : 'border-stone-400'
          }`}>
            {mode === 'reverse' && (
              <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3 text-center">
                <p className="text-red-800 font-bold text-sm flex items-center justify-center gap-2">
                  <AlertTriangle size={16} /> Remember: argue why YOU are the WORST!
                </p>
              </div>
            )}
            <label className="block text-stone-700 font-bold uppercase tracking-widest mb-3 border-b border-stone-300 pb-2 text-sm">
              {isSpeed ? '⚡ TYPE FAST!' : mode === 'reverse' ? '🔄 Your Self-Roast' : 'Type Your Argument'}
            </label>
            <textarea
              className={`w-full resize-none text-xl p-4 border-4 bg-white text-stone-900 rounded-xl placeholder-stone-400 focus:outline-none focus:ring-4 font-sans font-bold shadow-inner ${
                isSpeed
                  ? 'min-h-[120px] border-red-400 focus:border-red-600 focus:ring-red-400/20'
                  : 'min-h-[200px] border-stone-500 focus:border-stone-900 focus:ring-stone-400'
              }`}
              placeholder={
                isSpeed ? "HURRY! First thing that comes to mind!" :
                mode === 'reverse' ? "I'm the worst because..." :
                "May it please the court..."
              }
              maxLength={isSpeed ? 200 : 500}
              value={argument}
              onChange={(e) => setArgument(e.target.value)}
              autoFocus
            />
            <div className={`absolute bottom-8 right-10 font-bold text-sm px-3 py-1 border-t border-stone-300 bg-white rounded-md ${
              argument.length >= (isSpeed ? 200 : 500) ? 'text-red-800' : 'text-stone-500'
            }`}>
              {argument.length}/{isSpeed ? 200 : 500}
            </div>
          </div>

          <button
            onClick={() => onSubmitArgument(argument)}
            disabled={argument.trim().length === 0}
            className={`w-full text-xl font-bold p-5 rounded-xl border border-stone-400 shadow-[0_6px_0_rgba(0,0,0,0.4)] hover:-translate-y-2 hover:shadow-[0_12px_0_rgba(0,0,0,0.4)] transition-all uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 ${
              isSpeed
                ? 'bg-red-700 text-amber-50 hover:bg-red-600'
                : 'bg-stone-800 text-amber-50 hover:bg-stone-700'
            }`}
          >
            {isSpeed && <Zap size={20} />}
            Submit {isSpeed ? 'NOW!' : 'Argument'}
            <Send size={20} className="text-amber-50" />
          </button>
        </motion.div>
      )}
    </div>
  );
}
