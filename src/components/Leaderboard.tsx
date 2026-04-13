import { motion } from "framer-motion";
import type { Player } from "@/lib/types";
import { Trophy } from "lucide-react";
import { useRouter } from "next/navigation";

interface LeaderboardProps {
  players: Player[];
}

export default function Leaderboard({ players }: LeaderboardProps) {
  const router = useRouter();
  
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);
  const winner = sortedPlayers[0];

  return (
    <div className="flex flex-col items-center w-full max-w-3xl mx-auto space-y-12">
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="text-center"
      >
        <div className="flex justify-center mb-6">
          <Trophy size={100} className="text-yellow-400 drop-shadow-[0_0_30px_rgba(250,204,21,0.6)]" />
        </div>
        <h1 className="jackbox-title text-5xl md:text-7xl mb-4">Final Verdict</h1>
        <p className="text-2xl text-slate-400 font-bold">The court has reached its decision.</p>
      </motion.div>

      <div className="jackbox-card w-full space-y-4">
        {sortedPlayers.map((player, idx) => (
          <motion.div
            key={player.id}
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: idx * 0.2 }}
            className={`flex items-center justify-between p-6 rounded-2xl border-4 ${
              idx === 0 
                ? 'bg-yellow-500/20 border-yellow-400 shadow-[0_0_30px_rgba(250,204,21,0.2)]' 
                : 'bg-slate-800 border-slate-700'
            }`}
          >
            <div className="flex items-center gap-6">
              <span className={`text-4xl font-black ${idx === 0 ? 'text-yellow-400' : 'text-slate-500'}`}>
                #{idx + 1}
              </span>
              <span className="text-3xl font-bold text-white">{player.nickname}</span>
            </div>
            <div className="text-3xl font-black text-slate-300">
              {player.score} <span className="text-xl text-slate-500">wins</span>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        onClick={() => router.push('/')}
        className="jackbox-button"
      >
        Play Again
      </motion.button>
    </div>
  );
}
