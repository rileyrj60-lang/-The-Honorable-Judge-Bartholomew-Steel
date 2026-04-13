import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Room, Player, RoundMode } from "@/lib/types";
import { Users, Play, Shuffle, Zap, RotateCcw, Scale, Sparkles } from "lucide-react";

const ROUND_MODES: { mode: RoundMode; emoji: string; label: string; description: string; icon: typeof Zap }[] = [
  { mode: 'classic', emoji: '⚖️', label: 'Classic', description: 'Standard courtroom argument', icon: Scale },
  { mode: 'speed', emoji: '⚡', label: 'Speed Round', description: '15 seconds, no overthinking', icon: Zap },
  { mode: 'reverse', emoji: '🔄', label: 'Reverse Trial', description: 'Argue AGAINST yourself', icon: RotateCcw },
];

interface GameLobbyProps {
  room: Room;
  players: Player[];
  isHost: boolean;
  onStartGame: (mode: RoundMode) => void;
}

export default function GameLobby({ room, players, isHost, onStartGame }: GameLobbyProps) {
  const [selectedMode, setSelectedMode] = useState<RoundMode | 'random'>('random');

  const getStartMode = (): RoundMode => {
    if (selectedMode === 'random') {
      const modes: RoundMode[] = ['classic', 'classic', 'classic', 'speed', 'reverse'];
      return modes[Math.floor(Math.random() * modes.length)];
    }
    return selectedMode;
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-10 w-full min-h-screen relative z-10 pt-8 pb-12 font-[Georgia,serif]">
      {/* Background Exterior Image */}
      <div
        className="fixed inset-0 z-[-1] bg-cover bg-center"
        style={{ backgroundImage: "url('/exterior.png')" }}
      >
        <div className="absolute inset-0 bg-stone-900/40 mix-blend-multiply" />
        <div className="absolute inset-0 bg-amber-900/20 mix-blend-overlay" />
      </div>

      {/* Room Code */}
      <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.8 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 150, damping: 10 }}
        className="text-center bg-amber-50/95 p-8 border-x-4 border-y-2 border-stone-800 shadow-2xl relative"
      >
        <p className="text-lg font-bold text-stone-600 tracking-widest uppercase pb-3 border-b border-stone-400">Room Code</p>
        <div className="text-5xl md:text-7xl font-bold tracking-[0.3em] text-stone-900 mt-4 uppercase">
          {room.code}
        </div>
        <p className="text-stone-500 text-sm mt-3 italic">Share this code with your friends!</p>
      </motion.div>

      {/* Players List */}
      <div className="w-full max-w-4xl bg-amber-50/95 border border-stone-400 shadow-2xl p-8 relative">
        <h2 className="text-2xl md:text-3xl font-bold mb-6 flex items-center justify-center gap-3 text-stone-900 uppercase border-b-2 border-stone-300 pb-4">
          <Users className="text-stone-800 w-7 h-7" /> Players ({players.length})
        </h2>

        <div className="flex flex-wrap justify-center gap-4 min-h-[100px] pt-2">
          <AnimatePresence>
            {players.length === 0 && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-stone-600 text-xl font-bold italic py-6 animate-pulse"
              >
                Waiting for players to join...
              </motion.p>
            )}
            {players.map((player, idx) => (
              <motion.div
                key={player.id}
                initial={{ opacity: 0, scale: 0, y: 50 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 15, delay: idx * 0.1 }}
                className="bg-white text-stone-900 border-2 border-stone-400 font-bold px-5 py-3 rounded-xl shadow-lg text-xl flex items-center gap-2 hover:-translate-y-1 transition-transform"
              >
                <span className="text-lg">
                  {idx === 0 ? '👑' : '⚔️'}
                </span>
                {player.nickname}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Mode Selection (Host Only) */}
      {isHost && (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="w-full max-w-4xl"
        >
          <div className="bg-amber-50/95 border border-stone-400 p-8 shadow-2xl">
            <h3 className="text-xl font-bold text-stone-900 uppercase tracking-widest text-center mb-6 border-b border-stone-300 pb-3 flex items-center justify-center gap-2">
              <Sparkles size={20} /> Game Mode
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {/* Random option */}
              <button
                onClick={() => setSelectedMode('random')}
                className={`p-4 rounded-xl border-2 transition-all text-center ${
                  selectedMode === 'random'
                    ? 'border-stone-800 bg-stone-800 text-amber-50 shadow-lg scale-[1.02]'
                    : 'border-stone-300 bg-white text-stone-700 hover:border-stone-500 hover:bg-stone-50'
                }`}
              >
                <Shuffle className="mx-auto mb-2" size={24} />
                <div className="font-bold text-sm uppercase tracking-wider">Random</div>
                <div className={`text-xs mt-1 ${selectedMode === 'random' ? 'text-amber-200' : 'text-stone-500'}`}>
                  Mix it up!
                </div>
              </button>

              {ROUND_MODES.map((rm) => (
                <button
                  key={rm.mode}
                  onClick={() => setSelectedMode(rm.mode)}
                  className={`p-4 rounded-xl border-2 transition-all text-center ${
                    selectedMode === rm.mode
                      ? 'border-stone-800 bg-stone-800 text-amber-50 shadow-lg scale-[1.02]'
                      : 'border-stone-300 bg-white text-stone-700 hover:border-stone-500 hover:bg-stone-50'
                  }`}
                >
                  <div className="text-2xl mb-2">{rm.emoji}</div>
                  <div className="font-bold text-sm uppercase tracking-wider">{rm.label}</div>
                  <div className={`text-xs mt-1 ${selectedMode === rm.mode ? 'text-amber-200' : 'text-stone-500'}`}>
                    {rm.description}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Start / Waiting */}
      {isHost ? (
        <motion.button
          initial={{ opacity: 0, y: 50, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: "spring", stiffness: 150, damping: 12, delay: 0.3 }}
          onClick={() => onStartGame(getStartMode())}
          disabled={players.length < 1}
          className="text-2xl font-bold px-12 py-6 bg-stone-800 text-amber-50 rounded-xl shadow-[0_6px_0_rgba(0,0,0,0.5)] hover:-translate-y-2 hover:shadow-[0_12px_0_rgba(0,0,0,0.5)] hover:bg-stone-700 transition-all uppercase disabled:opacity-50 flex items-center gap-4 tracking-widest"
        >
          <Play size={24} className="fill-amber-50" />
          {players.length < 1 ? "Waiting for players..." : "Start Trial!"}
        </motion.button>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-amber-50 border-2 border-stone-800 rounded-xl text-stone-800 font-bold text-xl md:text-2xl p-6 shadow-xl italic animate-pulse"
        >
          Waiting for the host to start...
        </motion.div>
      )}
    </div>
  );
}
