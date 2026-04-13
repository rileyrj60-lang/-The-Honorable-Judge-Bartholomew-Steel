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
    <div className="flex flex-col items-center justify-center space-y-12 w-full min-h-screen relative z-10 pt-10">
      {/* Background Exterior Image */}
      <div 
        className="fixed inset-0 z-[-1] bg-cover bg-center" 
        style={{ backgroundImage: "url('/exterior.png')" }}
      >
        <div className="absolute inset-0 bg-indigo-900/60 mix-blend-multiply" />
      </div>

      <motion.div 
        initial={{ y: -50, opacity: 0, rotate: 10, scale: 0.8 }}
        animate={{ y: 0, opacity: 1, rotate: -3, scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 10 }}
        className="text-center bg-white p-8 border-8 border-slate-900 shadow-[15px_15px_0_rgba(0,0,0,1)] relative"
      >
        <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-yellow-400 px-6 py-2 border-4 border-slate-900 shadow-[4px_4px_0_rgba(0,0,0,1)] rotate-[-5deg]">
          <p className="text-xl font-black text-slate-900 tracking-widest uppercase">Room Code</p>
        </div>
        <div className="text-7xl md:text-9xl font-black tracking-[0.2em] text-slate-900 mt-4 uppercase">
          {room.code}
        </div>
      </motion.div>

      <div className="w-full max-w-4xl bg-orange-500 border-8 border-slate-900 shadow-[15px_15px_0_rgba(0,0,0,1)] rounded-3xl p-8 md:p-12 relative rotate-1">
        <h2 className="text-4xl md:text-5xl font-black mb-8 flex items-center justify-center gap-4 text-white uppercase drop-shadow-[4px_4px_0_rgba(0,0,0,0.8)]">
          <Users className="text-white w-12 h-12" /> Players Joined ({players.length})
        </h2>
        
        <div className="flex flex-wrap justify-center gap-6 min-h-[150px]">
          <AnimatePresence>
            {players.length === 0 && (
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-white text-2xl font-bold animate-pulse p-8"
              >
                Waiting for victims to arrive...
              </motion.p>
            )}
            {players.map((player, idx) => (
              <motion.div
                key={player.id}
                initial={{ scale: 0, rotate: -20, y: 50 }}
                animate={{ scale: 1, rotate: idx % 2 === 0 ? 5 : -5, y: 0 }}
                exit={{ scale: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 15 }}
                className="bg-white text-slate-900 font-black px-8 py-4 rounded-xl border-4 border-slate-900 shadow-[6px_6px_0_rgba(0,0,0,1)] text-2xl flex items-center gap-3 animate-bounce"
              >
                <span className="text-3xl">{['😎','😜','🤬','🤡','🕵️','🤠','💀','👽'][idx % 8]}</span> {player.nickname}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {isHost ? (
        <motion.button
          initial={{ scale: 0.1, opacity: 0, y: 100 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 150, damping: 12, delay: 0.2 }}
          onClick={onStartGame}
          disabled={players.length < 1}
          className="text-4xl font-black p-8 bg-green-500 text-white rounded-2xl border-8 border-slate-900 shadow-[10px_10px_0_rgba(0,0,0,1)] hover:-translate-y-2 hover:shadow-[15px_15px_0_rgba(0,0,0,1)] hover:bg-green-400 transition-all uppercase disabled:opacity-50 flex items-center gap-4 rotate-[-2deg]"
        >
          <Play size={40} className="fill-white" /> 
          {players.length < 1 ? "Waiting for players..." : "Start Trial!"}
        </motion.button>
      ) : (
        <motion.div 
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-slate-900 text-yellow-400 font-black text-2xl md:text-4xl p-6 border-8 border-slate-900 shadow-[10px_10px_0_rgba(0,0,0,0.8)] rotate-2 animate-pulse"
        >
          Waiting for the Host...
        </motion.div>
      )}
    </div>
  );
}
