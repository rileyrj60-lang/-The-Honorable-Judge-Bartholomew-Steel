import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Crown, Medal, ArrowRight } from "lucide-react";
import type { Player } from "@/lib/types";
import { useRouter } from "next/navigation";
import Confetti from "./Confetti";

interface LeaderboardProps {
  players: Player[];
  isHost?: boolean;
  onPlayAgain?: () => void;
}

const PLACE_STYLES = [
  { bg: 'bg-amber-50/95', border: 'border-l-8 border-l-amber-600', text: 'text-stone-900', badge: 'bg-amber-600 text-white', icon: Crown },
  { bg: 'bg-stone-100/90', border: 'border-l-8 border-l-stone-500', text: 'text-stone-800', badge: 'bg-stone-500 text-white', icon: Medal },
  { bg: 'bg-stone-100/80', border: 'border-l-8 border-l-amber-800', text: 'text-stone-700', badge: 'bg-amber-800 text-white', icon: Medal },
];

export default function Leaderboard({ players, isHost = true, onPlayAgain }: LeaderboardProps) {
  const router = useRouter();

  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);
  const maxScore = Math.max(...sortedPlayers.map(p => p.score), 1);
  const winner = sortedPlayers[0];

  return (
    <div className="flex flex-col items-center w-full max-w-4xl mx-auto space-y-10 relative z-10 pt-12 pb-16 font-[Georgia,serif]">
      <Confetti active={true} duration={5000} />

      {/* Background Exterior Image */}
      <div
        className="fixed inset-0 z-[-1] bg-cover bg-center transition-all duration-1000"
        style={{ backgroundImage: "url('/exterior.png')" }}
      >
        <div className="absolute inset-0 bg-stone-900/50 mix-blend-multiply" />
        <div className="absolute inset-0 bg-amber-900/20 mix-blend-overlay" />
      </div>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -50, scale: 0.8 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 150, damping: 10 }}
        className="w-full text-center bg-amber-50/95 border border-stone-400 p-10 shadow-2xl rounded-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-amber-600 via-amber-400 to-amber-600" />
        <Trophy className="mx-auto text-amber-600 mb-4" size={48} />
        <h1 className="text-4xl md:text-6xl font-bold text-stone-900 uppercase tracking-widest mb-3 border-b-4 border-double border-stone-800 pb-4 inline-block">
          Final Judgment
        </h1>
        {winner && (
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-xl text-stone-600 font-bold italic mt-4"
          >
            🏆 {winner.nickname} reigns supreme with {winner.score} point{winner.score !== 1 ? 's' : ''}!
          </motion.p>
        )}
      </motion.div>

      {/* Player Rankings */}
      <div className="w-full space-y-4">
        <AnimatePresence>
          {sortedPlayers.map((player, index) => {
            const style = PLACE_STYLES[index] || {
              bg: 'bg-stone-100/80',
              border: 'border-l-4 border-l-stone-400',
              text: 'text-stone-600',
              badge: 'bg-stone-400 text-stone-800',
              icon: null,
            };
            const Icon = style.icon;

            return (
              <motion.div
                key={player.id}
                initial={{ opacity: 0, x: -100, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                transition={{ type: "spring", stiffness: 120, damping: 12, delay: index * 0.15 }}
                className={`flex items-center justify-between p-6 shadow-[0_10px_20px_rgba(0,0,0,0.15)] border-2 border-stone-400 rounded-xl relative overflow-hidden hover:-translate-y-1 transition-transform ${style.bg} ${style.border}`}
              >
                {/* Rank number */}
                <div className="flex items-center gap-5 relative z-10">
                  <div className={`text-2xl font-bold flex items-center justify-center w-14 h-14 rounded-xl ${style.badge}`}>
                    {index === 0 && Icon ? (
                      <Icon size={28} />
                    ) : (
                      `#${index + 1}`
                    )}
                  </div>
                  <div>
                    <h3 className={`text-3xl font-bold uppercase tracking-wider ${style.text}`}>
                      {player.nickname}
                    </h3>
                    {index === 0 && (
                      <span className="text-amber-700 text-sm font-bold uppercase tracking-widest">
                        Champion
                      </span>
                    )}
                  </div>
                </div>

                {/* Score + Bar */}
                <div className="flex items-center gap-4 relative z-10">
                  <div className="hidden md:block w-32">
                    <div className="bg-stone-200 rounded-full h-3 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(player.score / maxScore) * 100}%` }}
                        transition={{ duration: 1, delay: index * 0.15 + 0.5 }}
                        className={`h-full rounded-full ${index === 0 ? 'bg-amber-600' : 'bg-stone-500'}`}
                      />
                    </div>
                  </div>
                  <div className={`text-4xl font-bold font-serif ${style.text} relative z-10 min-w-[80px] text-right`}>
                    {player.score} <span className="text-lg tracking-widest uppercase">pts</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Play Again */}
      {isHost && (
        <motion.button
          initial={{ opacity: 0, scale: 0.5, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 150, damping: 10, delay: 0.5 }}
          onClick={onPlayAgain || (() => router.push('/'))}
          className="text-2xl font-bold px-12 py-6 bg-stone-800 text-amber-50 border-2 border-stone-500 rounded-xl shadow-[0_6px_0_rgba(0,0,0,0.4)] hover:-translate-y-2 hover:shadow-[0_12px_0_rgba(0,0,0,0.4)] hover:bg-stone-700 transition-all uppercase flex items-center justify-center gap-4 tracking-widest w-full max-w-sm"
        >
          Play Again <ArrowRight />
        </motion.button>
      )}
    </div>
  );
}
