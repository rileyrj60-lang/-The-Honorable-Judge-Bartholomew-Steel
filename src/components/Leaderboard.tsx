import { motion, AnimatePresence } from "framer-motion";
import { Trophy, ArrowRight } from "lucide-react";
import type { Player } from "@/lib/types";
import { useRouter } from "next/navigation";

interface LeaderboardProps {
  players: Player[];
  isHost?: boolean;
  onPlayAgain?: () => void;
}

export default function Leaderboard({ players, isHost = true, onPlayAgain }: LeaderboardProps) {
  const router = useRouter();
  
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);
  const winner = sortedPlayers[0];

  return (
    <div className="flex flex-col items-center w-full max-w-4xl mx-auto space-y-12 relative z-10 pt-16 font-[Georgia,serif]">
      {/* Background Exterior Image */}
      <div 
        className="fixed inset-0 z-[-1] bg-cover bg-center transition-all duration-1000" 
        style={{ backgroundImage: "url('/exterior.png')" }}
      >
        <div className="absolute inset-0 bg-stone-900/50 mix-blend-multiply" />
        <div className="absolute inset-0 bg-amber-900/20 mix-blend-overlay" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="w-full text-center bg-amber-50/95 border border-stone-400 p-12 shadow-2xl relative"
      >
        <div className="absolute top-0 left-0 right-0 h-4 bg-[url('/exterior.png')] opacity-10" />
        <h1 className="text-5xl md:text-7xl font-bold text-stone-900 uppercase tracking-widest mb-4 border-b-4 border-double border-stone-800 pb-6 inline-block">
          Final Judgment
        </h1>
        <p className="text-2xl text-stone-600 font-bold italic mt-4">The Court recognizes the following counsel:</p>
      </motion.div>

      <div className="w-full space-y-6">
        <AnimatePresence>
          {sortedPlayers.map((player, index) => (
            <motion.div 
              key={player.id}
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: index * 0.2, ease: "easeOut" }}
              className={`flex items-center justify-between p-8 shadow-xl border border-stone-400 relative overflow-hidden ${
                index === 0 ? 'bg-amber-50/95 border-l-8 border-l-stone-800' : 'bg-stone-100/90'
              }`}
            >
              <div className="absolute right-0 top-0 bottom-0 w-32 bg-stone-800/5 rotate-12 scale-150 transform origin-right pointer-events-none" />
              
              <div className="flex items-center gap-6 relative z-10">
                <div className={`text-3xl font-bold flex items-center justify-center w-16 h-16 ${
                  index === 0 ? 'bg-stone-800 text-amber-50' : 'bg-stone-300 text-stone-700'
                }`}>
                  #{index + 1}
                </div>
                <h3 className={`text-4xl font-bold uppercase tracking-widest ${index === 0 ? 'text-stone-900' : 'text-stone-700'}`}>
                  {player.nickname}
                </h3>
              </div>
              
              <div className={`text-5xl font-bold font-serif ${index === 0 ? 'text-stone-900' : 'text-stone-600'} relative z-10`}>
                {player.score} <span className="text-xl tracking-widest uppercase">Sustained</span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {isHost && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1 }}
          onClick={onPlayAgain || (() => router.push('/'))}
          className="text-2xl font-bold px-12 py-6 bg-stone-800 text-amber-50 border border-stone-400 shadow-xl hover:bg-stone-700 transition-all uppercase flex items-center justify-center gap-4 tracking-widest w-full max-w-sm mt-12 mb-12"
        >
          Convene New Court
        </motion.button>
      )}
    </div>
  );
}
