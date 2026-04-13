import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Verdict } from "@/lib/types";
import { Gavel, Star, ArrowRight } from "lucide-react";

interface VerdictScreenProps {
  verdict: Verdict;
  isHost: boolean;
  onNextRound: () => void;
}

export default function VerdictScreen({ verdict, isHost, onNextRound }: VerdictScreenProps) {
  const [speechFinished, setSpeechFinished] = useState(false);
  const [displayedSpeech, setDisplayedSpeech] = useState("");
  const [currentRoastIndex, setCurrentRoastIndex] = useState(-1);

  const fullSpeech = verdict.verdict_json.verdict_speech;
  const roasts = verdict.verdict_json.roasts || [];

  // Typewriter effect for speech
  useEffect(() => {
    let i = 0;
    const intervalId = setInterval(() => {
      setDisplayedSpeech(fullSpeech.slice(0, i + 1));
      i++;
      if (i >= fullSpeech.length) {
        clearInterval(intervalId);
        setTimeout(() => setSpeechFinished(true), 400);
      }
    }, 10); // Typewriting speed

    return () => clearInterval(intervalId);
  }, [fullSpeech]);

  // Reveal roasts sequentially
  useEffect(() => {
    if (speechFinished && currentRoastIndex < roasts.length) {
      const timer = setTimeout(() => {
        setCurrentRoastIndex(prev => prev + 1);
      }, 1000); // Wait 1 second between each roast appearing
      return () => clearTimeout(timer);
    }
  }, [speechFinished, currentRoastIndex, roasts.length]);

  return (
    <div className="flex flex-col items-center w-full max-w-5xl mx-auto space-y-12">
      {/* Huge Judge Header */}
      <motion.div 
        initial={{ y: -50, scale: 0.8 }}
        animate={{ y: 0, scale: 1 }}
        className="flex items-center gap-4 text-yellow-400"
      >
        <Gavel size={60} className="rotate-12" />
        <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter drop-shadow-[0_4px_0_rgba(180,83,9,1)]">
          The Verdict
        </h1>
      </motion.div>

      {/* The Speech Box */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="jackbox-card w-full border-yellow-500/50 min-h-[200px]"
      >
        <p className="text-2xl md:text-4xl font-bold leading-relaxed text-slate-100">
          "{displayedSpeech}"
        </p>
      </motion.div>

      {/* The Winner Announcement */}
      <AnimatePresence>
        {speechFinished && (
          <motion.div 
            initial={{ scale: 0, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            className="bg-gradient-to-r from-yellow-500 to-orange-500 rounded-3xl p-8 md:p-12 shadow-[0_0_60px_rgba(234,179,8,0.4)] text-center w-full max-w-2xl border-4 border-yellow-300"
          >
            <div className="flex justify-center mb-4">
              <Star size={60} className="fill-yellow-100 text-yellow-100 animate-pulse" />
            </div>
            <p className="text-xl font-bold text-yellow-900 uppercase tracking-widest mb-2">Round Winner</p>
            <h2 className="text-5xl md:text-7xl font-black text-slate-900 uppercase">{verdict.verdict_json.winner_nickname}</h2>
          </motion.div>
        )}
      </AnimatePresence>

      {/* The Roasts */}
      <div className="grid md:grid-cols-2 gap-6 w-full mt-8">
        <AnimatePresence>
          {roasts.slice(0, currentRoastIndex + 1).map((roast, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-slate-900 border-2 border-red-500/50 rounded-2xl p-6 shadow-xl relative"
            >
              <div className="absolute -top-4 -left-4 bg-red-500 text-white font-black px-4 py-1 rounded-full rotate-[-5deg] border-2 border-slate-900 shadow-md">
                {roast.nickname}
              </div>
              <p className="text-xl font-medium text-slate-300 italic mt-2">
                "{roast.roast}"
              </p>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Next Round Button */}
      {isHost && speechFinished && currentRoastIndex >= roasts.length && (
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={onNextRound}
          className="jackbox-button flex items-center gap-3 mt-12"
        >
          {verdict.round >= 5 ? "Final Leaderboard" : "Next Round"} <ArrowRight />
        </motion.button>
      )}
    </div>
  );
}
