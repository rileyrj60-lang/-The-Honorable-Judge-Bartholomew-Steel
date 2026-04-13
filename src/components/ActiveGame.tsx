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
    <div className="flex flex-col items-center w-full max-w-5xl mx-auto space-y-8 relative z-10 pt-10">
      {/* Timer */}
      <motion.div 
        initial={{ y: -50, opacity: 0, scale: 0.5 }}
        animate={{ y: 0, opacity: 1, scale: timeRemaining <= 10 ? [1, 1.2, 1] : 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 10, repeat: timeRemaining <= 10 ? Infinity : 0 }}
        className={`flex items-center gap-3 text-5xl md:text-7xl font-black border-8 px-8 py-4 shadow-[10px_10px_0_rgba(0,0,0,1)] bg-white ${timeRemaining <= 10 ? 'text-red-600 border-red-600 rotate-2' : 'text-slate-900 border-slate-900 -rotate-2'}`}
      >
        <Clock size={48} className={timeRemaining <= 10 ? 'animate-pulse' : ''} />
        {timeRemaining}s
      </motion.div>

      {/* Scenario Header */}
      <motion.div 
        initial={{ scale: 0.1, opacity: 0, rotate: 10 }}
        animate={{ scale: 1, opacity: 1, rotate: 1 }}
        transition={{ type: "spring", stiffness: 100, damping: 12, delay: 0.1 }}
        className="text-center bg-yellow-400 border-8 border-slate-900 p-8 md:p-12 shadow-[15px_15px_0_rgba(0,0,0,1)] w-full relative overflow-hidden flex flex-col"
      >
        <div className="absolute top-4 left-[-40px] bg-red-600 text-white font-black px-12 py-1 rotate-[-25deg] border-4 border-slate-900 shadow-[4px_4px_0_rgba(0,0,0,1)] text-2xl uppercase">
          Case #{room.current_round}
        </div>
        <p className="text-slate-900 font-bold uppercase tracking-widest mt-8 mb-4 text-xl">The Allegation</p>
        <h2 className="text-4xl md:text-6xl font-black leading-tight text-slate-900">
          "{room.current_scenario}"
        </h2>
      </motion.div>

      {/* Input Area */}
      {!player ? (
        <div className="text-center p-8 bg-slate-900 border-8 border-slate-500 w-full shadow-[10px_10px_0_rgba(0,0,0,1)] rotate-[-1deg]">
          <p className="text-4xl font-black text-slate-400 uppercase">You are spectating.</p>
        </div>
      ) : hasSubmitted ? (
        <motion.div 
          initial={{ y: 200, opacity: 0, rotate: 10, scale: 0.5 }}
          animate={{ y: 0, opacity: 1, rotate: -2, scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="text-center p-12 bg-green-500 border-8 border-slate-900 shadow-[15px_15px_0_rgba(0,0,0,1)] w-full"
        >
          <div className="text-white text-8xl mb-6">✓</div>
          <h3 className="text-5xl md:text-7xl font-black text-slate-900 mb-4 uppercase drop-shadow-[2px_2px_0_rgba(255,255,255,0.5)]">Argument Submitted!</h3>
          <p className="text-2xl font-bold text-slate-900">Waiting for other players or the clock to run out...</p>
        </motion.div>
      ) : (
        <motion.div 
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 150, damping: 15, delay: 0.2 }}
          className="w-full space-y-6"
        >
          <div className="relative">
            <textarea
              className="w-full min-h-[250px] resize-none text-3xl font-black p-8 border-8 border-slate-900 bg-white placeholder-slate-400 shadow-[inset_6px_6px_0_rgba(0,0,0,0.1),_10px_10px_0_rgba(0,0,0,1)] focus:outline-none focus:ring-8 focus:ring-yellow-400 transition-all rounded-none"
              placeholder="Plead your case to Judge Bartholomew..."
              maxLength={500}
              value={argument}
              onChange={(e) => setArgument(e.target.value)}
            />
            <div className={`absolute bottom-6 right-6 font-black text-2xl px-4 py-2 border-4 border-slate-900 bg-white shadow-[4px_4px_0_rgba(0,0,0,1)] ${argument.length >= 500 ? 'text-red-600 bg-red-100' : 'text-slate-900'}`}>
              {argument.length}/500
            </div>
          </div>
          
          <button
            onClick={() => onSubmitArgument(argument)}
            disabled={argument.trim().length === 0}
            className="w-full text-4xl font-black p-8 bg-blue-500 text-white border-8 border-slate-900 shadow-[10px_10px_0_rgba(0,0,0,1)] hover:-translate-y-2 hover:shadow-[15px_15px_0_rgba(0,0,0,1)] hover:bg-blue-400 transition-all uppercase disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-4 rotate-1"
          >
            Submit Argument <Send size={40} className="fill-white" />
          </button>
        </motion.div>
      )}
    </div>
  );
}
