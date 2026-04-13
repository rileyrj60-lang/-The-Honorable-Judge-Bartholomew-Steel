import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import type { Room, Player } from "@/lib/types";
import { Clock, Send } from "lucide-react";

interface ActiveGameProps {
  room: Room;
  player: Player | null;
  hasSubmitted: boolean;
  onSubmitArgument: (text: string) => void;
  timeRemaining: number;
}

export default function ActiveGame({ room, player, hasSubmitted, onSubmitArgument, timeRemaining }: ActiveGameProps) {
  const [argument, setArgument] = useState("");
  
  // Submit automatically if time runs out and hasn't submitted
  useEffect(() => {
    if (timeRemaining <= 0 && !hasSubmitted) {
      onSubmitArgument(argument || "I have no defense. Have mercy!");
    }
  }, [timeRemaining, hasSubmitted, argument, onSubmitArgument]);

  return (
    <div className="flex flex-col items-center w-full max-w-4xl mx-auto space-y-8">
      {/* Timer */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className={`flex items-center gap-3 text-4xl md:text-5xl font-black bg-slate-900 border-4 px-8 py-4 rounded-full shadow-lg ${timeRemaining <= 10 ? 'text-red-500 border-red-500 animate-pulse' : 'text-slate-200 border-slate-700'}`}
      >
        <Clock size={40} />
        {timeRemaining}s
      </motion.div>

      {/* Scenario Header */}
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="text-center bg-gradient-to-br from-indigo-900 to-purple-900 border-4 border-indigo-500 rounded-3xl p-8 md:p-12 shadow-2xl w-full relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-yellow-400 to-orange-500" />
        <p className="text-yellow-400 font-bold uppercase tracking-widest mb-4">Round {room.current_round} • The Scenario</p>
        <h2 className="text-4xl md:text-5xl font-black leading-tight text-white drop-shadow-md">
          "{room.current_scenario}"
        </h2>
      </motion.div>

      {/* Input Area */}
      {!player ? (
        <div className="text-center p-8 bg-slate-800 rounded-2xl w-full">
          <p className="text-2xl font-bold text-slate-400">You are spectating.</p>
        </div>
      ) : hasSubmitted ? (
        <motion.div 
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center p-12 bg-slate-800/80 border-4 border-emerald-500 rounded-3xl w-full"
        >
          <div className="text-emerald-400 text-6xl mb-4">✓</div>
          <h3 className="text-4xl font-black text-white mb-2">Argument Submitted!</h3>
          <p className="text-xl text-slate-400">Waiting for other players or the clock to run out...</p>
        </motion.div>
      ) : (
        <motion.div 
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="w-full space-y-4"
        >
          <div className="relative">
            <textarea
              className="jackbox-input min-h-[200px] resize-none"
              placeholder="Plead your case to Judge Bartholomew..."
              maxLength={500}
              value={argument}
              onChange={(e) => setArgument(e.target.value)}
            />
            <div className={`absolute bottom-4 right-4 font-bold ${argument.length >= 500 ? 'text-red-400' : 'text-slate-500'}`}>
              {argument.length}/500
            </div>
          </div>
          
          <button
            onClick={() => onSubmitArgument(argument)}
            disabled={argument.trim().length === 0}
            className="jackbox-button flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Submit Argument <Send size={20} />
          </button>
        </motion.div>
      )}
    </div>
  );
}
