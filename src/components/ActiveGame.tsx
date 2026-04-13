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
    <div className="flex flex-col items-center w-full max-w-5xl mx-auto space-y-8 relative z-10 pt-10 font-[Georgia,serif]">
      {/* Timer */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className={`flex items-center gap-4 text-4xl md:text-5xl font-bold border-b-2 px-8 py-4 bg-amber-50/95 shadow-lg ${timeRemaining <= 10 ? 'text-red-800 border-red-800' : 'text-stone-800 border-stone-800'}`}
      >
        <Clock size={36} className={timeRemaining <= 10 ? 'animate-pulse text-red-800' : 'text-stone-700'} />
        {timeRemaining}
      </motion.div>

      {/* Scenario Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
        className="text-center bg-amber-50/95 border border-stone-400 p-8 md:p-12 shadow-2xl w-full relative overflow-hidden flex flex-col"
      >
        <div className="absolute top-0 left-0 bg-stone-800 text-amber-50 font-bold px-8 py-2 text-sm uppercase tracking-widest">
          Docket #{room.current_round}
        </div>
        <p className="text-stone-600 font-bold uppercase tracking-widest mt-8 mb-4 text-sm italic">The Allegation Presiding</p>
        <h2 className="text-3xl md:text-5xl font-bold leading-tight text-stone-900 border-b-2 border-stone-300 pb-8">
          "{room.current_scenario}"
        </h2>
      </motion.div>

      {/* Input Area */}
      {!player ? (
        <div className="text-center p-8 bg-amber-50 border border-stone-400 w-full shadow-lg">
          <p className="text-2xl font-bold text-stone-600 uppercase tracking-widest">Gallery Spectator</p>
        </div>
      ) : hasSubmitted ? (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center p-12 bg-amber-50/95 border-t-8 border-stone-800 shadow-2xl w-full"
        >
          <div className="text-stone-800 text-5xl mb-6">🖋️</div>
          <h3 className="text-4xl md:text-5xl font-bold text-stone-900 mb-4 tracking-widest">Deposition Submitted</h3>
          <p className="text-xl font-bold text-stone-600 italic">Please hold for the remaining counsel...</p>
        </motion.div>
      ) : (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="w-full space-y-6"
        >
          <div className="relative bg-amber-50/95 p-8 border border-stone-400 shadow-2xl">
            <label className="block text-stone-700 font-bold uppercase tracking-widest mb-4 border-b border-stone-300 pb-2 text-sm">Draft Your Argument</label>
            <textarea
              className="w-full min-h-[250px] resize-none text-2xl p-4 border-none bg-transparent placeholder-stone-400 focus:outline-none focus:ring-0 leading-relaxed italic"
              placeholder="May it please the court..."
              maxLength={500}
              value={argument}
              onChange={(e) => setArgument(e.target.value)}
            />
            <div className={`absolute bottom-6 right-6 font-bold text-lg px-4 py-2 border-t border-stone-300 ${argument.length >= 500 ? 'text-red-800' : 'text-stone-500'}`}>
              Word Count: {argument.length}/500
            </div>
          </div>
          
          <button
            onClick={() => onSubmitArgument(argument)}
            disabled={argument.trim().length === 0}
            className="w-full text-2xl font-bold p-6 bg-stone-800 text-amber-50 border border-stone-400 shadow-lg hover:bg-stone-700 transition-all uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-4"
          >
            Submit to the Clerk <Send size={24} className="text-amber-50" />
          </button>
        </motion.div>
      )}
    </div>
  );
}
