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
    <div className="flex flex-col items-center justify-center space-y-8 w-full">
      <motion.div 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-center space-y-4"
      >
        <p className="text-2xl font-bold text-slate-400 tracking-widest uppercase">Room Code</p>
        <div className="text-6xl md:text-8xl font-black tracking-[0.2em] bg-slate-800 border-4 border-slate-700 py-4 px-8 rounded-2xl shadow-xl flex items-center justify-center">
          {room.code}
        </div>
      </motion.div>

      <div className="w-full max-w-2xl bg-slate-800/50 backdrop-blur border border-slate-700 rounded-3xl p-8 shadow-2xl">
        <h2 className="text-3xl font-bold mb-6 flex items-center justify-center gap-3">
          <Users className="text-yellow-400" /> Players Joined ({players.length})
        </h2>
        
        <div className="flex flex-wrap justify-center gap-4 min-h-[100px]">
          <AnimatePresence>
            {players.length === 0 && (
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-slate-500 italic"
              >
                Waiting for others to join...
              </motion.p>
            )}
            {players.map((player) => (
              <motion.div
                key={player.id}
                initial={{ scale: 0, rotate: -10 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0 }}
                className="bg-slate-700 font-bold px-6 py-3 rounded-full border-2 border-yellow-500/50 shadow-lg text-xl"
              >
                {player.nickname}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {isHost ? (
        <motion.button
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          onClick={onStartGame}
          disabled={players.length < 2}
          className="jackbox-button flex items-center gap-3 w-auto max-w-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Play size={24} /> 
          {players.length < 2 ? "Waiting for players..." : "Start Game"}
        </motion.button>
      ) : (
        <p className="text-slate-400 text-xl font-medium animate-pulse mt-8">
          Waiting for host to start...
        </p>
      )}
    </div>
  );
}
