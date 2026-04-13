import { motion, AnimatePresence } from "framer-motion";
import type { Room, Player } from "@/lib/types";
import { Users, Play } from "lucide-react";

interface GameLobbyProps {
  room: Room;
  players: Player[];
  isHost: boolean;
  onStartGame: () => void;
}

export default function GameLobby({ room, players, isHost, onStartGame }: GameLobbyProps) {
  return (
    <div className="flex flex-col items-center justify-center space-y-12 w-full min-h-screen relative z-10 pt-10 font-[Georgia,serif]">
      {/* Background Exterior Image */}
      <div 
        className="fixed inset-0 z-[-1] bg-cover bg-center" 
        style={{ backgroundImage: "url('/exterior.png')" }}
      >
        <div className="absolute inset-0 bg-stone-900/40 mix-blend-multiply" />
        <div className="absolute inset-0 bg-amber-900/20 mix-blend-overlay" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="text-center bg-amber-50/95 p-10 border-x-4 border-y-2 border-stone-800 shadow-2xl relative"
      >
        <p className="text-xl font-bold text-stone-600 tracking-widest uppercase pb-4 border-b border-stone-400">Docket Number</p>
        <div className="text-6xl md:text-8xl font-bold tracking-[0.3em] text-stone-900 mt-6 uppercase">
          {room.code}
        </div>
      </motion.div>

      <div className="w-full max-w-4xl bg-amber-50/95 border border-stone-400 shadow-2xl p-10 relative">
        <h2 className="text-3xl md:text-4xl font-bold mb-8 flex items-center justify-center gap-4 text-stone-900 uppercase border-b-2 border-stone-300 pb-6">
          <Users className="text-stone-800 w-8 h-8" /> Present Council ({players.length})
        </h2>
        
        <div className="flex flex-wrap justify-center gap-6 min-h-[150px] pt-4">
          <AnimatePresence>
            {players.length === 0 && (
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-stone-600 text-xl italic p-8"
              >
                Awaiting representation...
              </motion.p>
            )}
            {players.map((player, idx) => (
              <motion.div
                key={player.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="bg-transparent text-stone-900 font-bold px-6 py-3 border-b-2 border-stone-800 text-2xl flex items-center gap-3"
              >
                Counsel {player.nickname}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {isHost ? (
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          onClick={onStartGame}
          disabled={players.length < 1}
          className="text-2xl font-bold px-12 py-6 bg-stone-800 text-amber-50 border border-stone-400 shadow-xl hover:bg-stone-700 transition-all uppercase disabled:opacity-50 flex items-center gap-4 tracking-widest mt-8"
        >
          <Play size={24} className="fill-amber-50" /> 
          {players.length < 1 ? "Court is Adjourned..." : "Call to Order"}
        </motion.button>
      ) : (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-amber-50 border border-stone-800 text-stone-800 font-bold text-xl md:text-2xl p-6 shadow-xl mt-8 italic"
        >
          The Bailiff is preparing the courtroom...
        </motion.div>
      )}
    </div>
  );
}
