"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Player } from "@/lib/types";
import { Vote, CheckCircle, Users } from "lucide-react";

interface VotingPhaseProps {
  players: Player[];
  currentPlayer: Player | null;
  submissions: { player_id: string; argument_text: string; players: { nickname: string } }[];
  onVote: (votedForPlayerId: string) => void;
  hasVoted: boolean;
  voteResults: { player_id: string; nickname: string; votes: number }[] | null;
  winnerNickname: string;
}

export default function VotingPhase({
  players,
  currentPlayer,
  submissions,
  onVote,
  hasVoted,
  voteResults,
  winnerNickname,
}: VotingPhaseProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);

  const handleVote = () => {
    if (!selectedId) return;
    setConfirmed(true);
    onVote(selectedId);
  };

  // Show vote results
  if (voteResults) {
    const maxVotes = Math.max(...voteResults.map(v => v.votes), 1);
    const sortedResults = [...voteResults].sort((a, b) => b.votes - a.votes);
    const crowdWinner = sortedResults[0];

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-3xl mx-auto space-y-6 font-[Georgia,serif]"
      >
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-amber-50 uppercase tracking-widest mb-2">
            The People Have Spoken
          </h2>
          <p className="text-stone-400 text-lg italic">
            {crowdWinner.nickname === winnerNickname
              ? "🔥 UNANIMOUS! The crowd agrees with the Judge!"
              : `The crowd picked ${crowdWinner.nickname}, but the Judge had other ideas...`}
          </p>
        </div>

        <div className="space-y-3">
          {sortedResults.map((result, i) => (
            <motion.div
              key={result.player_id}
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.15 }}
              className={`flex items-center gap-4 p-4 rounded-xl border ${
                i === 0
                  ? 'bg-amber-50/95 border-amber-500 shadow-lg'
                  : 'bg-stone-100/80 border-stone-300'
              }`}
            >
              <div className={`text-2xl font-bold w-10 h-10 flex items-center justify-center rounded-lg ${
                i === 0 ? 'bg-stone-800 text-amber-50' : 'bg-stone-300 text-stone-600'
              }`}>
                {i + 1}
              </div>
              <div className="flex-1">
                <span className={`text-xl font-bold ${i === 0 ? 'text-stone-900' : 'text-stone-700'}`}>
                  {result.nickname}
                </span>
              </div>
              {/* Vote bar */}
              <div className="flex-1 flex items-center gap-3">
                <div className="flex-1 bg-stone-200 rounded-full h-4 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(result.votes / maxVotes) * 100}%` }}
                    transition={{ duration: 0.8, delay: i * 0.15 + 0.3 }}
                    className={`h-full rounded-full ${i === 0 ? 'bg-stone-800' : 'bg-stone-500'}`}
                  />
                </div>
                <span className={`text-lg font-bold min-w-[3ch] text-right ${i === 0 ? 'text-stone-900' : 'text-stone-600'}`}>
                  {result.votes}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    );
  }

  // Voting UI
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 150, damping: 15 }}
      className="w-full max-w-4xl mx-auto space-y-8 font-[Georgia,serif]"
    >
      <div className="text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", bounce: 0.5 }}
          className="inline-flex items-center gap-3 bg-amber-50/95 border-2 border-stone-800 px-8 py-4 shadow-xl mb-4"
        >
          <Users className="text-stone-800" size={28} />
          <h2 className="text-3xl md:text-4xl font-bold text-stone-900 uppercase tracking-widest">
            Cast Your Vote
          </h2>
        </motion.div>
        <p className="text-stone-300 text-lg italic mt-2">
          {hasVoted
            ? "Your vote is in! Waiting for others..."
            : "Pick the argument that made you lose it (you can't vote for yourself)"}
        </p>
      </div>

      {hasVoted ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-16 bg-amber-50/10 border border-stone-700 rounded-2xl"
        >
          <CheckCircle className="mx-auto text-green-400 mb-4" size={48} />
          <p className="text-2xl font-bold text-amber-50 uppercase tracking-widest">Vote Recorded!</p>
          <p className="text-stone-400 mt-2 italic">Waiting for everyone else...</p>
        </motion.div>
      ) : (
        <div className="space-y-4">
          {submissions
            .filter(s => s.player_id !== currentPlayer?.id) // Can't vote for yourself
            .map((sub, i) => (
              <motion.button
                key={sub.player_id}
                initial={{ opacity: 0, x: i % 2 === 0 ? -60 : 60 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                onClick={() => setSelectedId(sub.player_id)}
                className={`w-full text-left p-6 rounded-xl border-2 transition-all ${
                  selectedId === sub.player_id
                    ? 'bg-amber-50/95 border-stone-800 shadow-xl scale-[1.02]'
                    : 'bg-stone-100/80 border-stone-400 hover:bg-amber-50/80 hover:border-stone-600'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-6 h-6 rounded-full border-2 mt-1 flex items-center justify-center flex-shrink-0 ${
                    selectedId === sub.player_id
                      ? 'border-stone-800 bg-stone-800'
                      : 'border-stone-400'
                  }`}>
                    {selectedId === sub.player_id && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-3 h-3 bg-amber-50 rounded-full"
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-bold text-stone-500 uppercase tracking-widest">
                      {sub.players.nickname}
                    </span>
                    <p className={`text-lg mt-1 leading-relaxed ${
                      selectedId === sub.player_id ? 'text-stone-900 font-bold' : 'text-stone-700'
                    }`}>
                      &ldquo;{sub.argument_text}&rdquo;
                    </p>
                  </div>
                </div>
              </motion.button>
            ))}

          {selectedId && (
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={handleVote}
              className="w-full text-2xl font-bold p-6 bg-stone-800 text-amber-50 rounded-xl shadow-[0_6px_0_rgba(0,0,0,0.5)] hover:-translate-y-2 hover:shadow-[0_12px_0_rgba(0,0,0,0.5)] hover:bg-stone-700 transition-all uppercase tracking-widest flex items-center justify-center gap-3"
            >
              <Vote size={24} /> Lock In Vote
            </motion.button>
          )}
        </div>
      )}
    </motion.div>
  );
}
