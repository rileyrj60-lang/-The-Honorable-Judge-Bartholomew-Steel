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
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [phase, setPhase] = useState<'loading' | 'arguments' | 'speech' | 'roasts'>('loading');
  const [currentArgIndex, setCurrentArgIndex] = useState(0);
  const [displayedSpeech, setDisplayedSpeech] = useState("");
  const [currentRoastIndex, setCurrentRoastIndex] = useState(-1);

  const fullSpeech = verdict.verdict_json.verdict_speech;
  const roasts = verdict.verdict_json.roasts || [];

  // Fetch submissions to show
  useEffect(() => {
    async function loadSubs() {
      const { supabase } = await import("@/lib/supabase");
      const { data } = await supabase
        .from("submissions")
        .select("*, players(nickname)")
        .eq("room_id", verdict.room_id)
        .eq("round", verdict.round);
      if (data) {
        setSubmissions(data);
        setPhase(data.length > 0 ? 'arguments' : 'speech');
      } else {
        setPhase('speech');
      }
    }
    loadSubs();
  }, [verdict]);

  // Argument presentation sequencer
  useEffect(() => {
    if (phase === 'arguments' && submissions.length > 0) {
      const timer = setTimeout(() => {
        if (currentArgIndex < submissions.length - 1) {
          setCurrentArgIndex(prev => prev + 1);
        } else {
          setPhase('speech');
        }
      }, 5000); // 5 seconds per argument
      return () => clearTimeout(timer);
    }
  }, [phase, currentArgIndex, submissions.length]);

  // Typewriter effect for speech
  useEffect(() => {
    if (phase !== 'speech') return;
    let i = 0;
    const intervalId = setInterval(() => {
      setDisplayedSpeech(fullSpeech.slice(0, i + 1));
      i++;
      if (i >= fullSpeech.length) {
        clearInterval(intervalId);
        setTimeout(() => setPhase('roasts'), 1000);
      }
    }, 10);
    return () => clearInterval(intervalId);
  }, [phase, fullSpeech]);

  // Reveal roasts sequentially
  useEffect(() => {
    if (phase === 'roasts' && currentRoastIndex < roasts.length) {
      const timer = setTimeout(() => {
        setCurrentRoastIndex(prev => prev + 1);
      }, 1500); // Wait 1.5 seconds between each roast
      return () => clearTimeout(timer);
    }
  }, [phase, currentRoastIndex, roasts.length]);

  return (
    <div className="flex flex-col items-center w-full max-w-5xl mx-auto space-y-12">
      {/* Arguments Presentation Phase */}
      {phase === 'arguments' && submissions[currentArgIndex] && (
        <motion.div 
          key={currentArgIndex}
          initial={{ opacity: 0, scale: 0.8, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, x: -100 }}
          className="flex flex-col items-center w-full max-w-3xl justify-center min-h-[50vh]"
        >
          <div className="w-full relative">
            {/* The Speech Bubble */}
            <div className="bg-white text-slate-900 border-8 border-slate-800 rounded-3xl rounded-br-none p-8 md:p-12 mb-8 shadow-[12px_12px_0_rgba(0,0,0,0.6)] relative z-10">
              <p className="text-3xl md:text-5xl font-black italic mb-2">"{submissions[currentArgIndex].argument_text}"</p>
            </div>
            {/* The Cartoonish Speaker */}
            <div className="flex justify-end w-full pr-8">
              <div className="flex flex-col items-center animate-bounce">
                <div className="bg-yellow-400 border-4 border-slate-800 w-24 h-24 rounded-full flex items-center justify-center text-4xl shadow-[4px_4px_0_rgba(0,0,0,0.5)]">
                  🗣️
                </div>
                <div className="bg-slate-800 text-white font-bold px-4 py-2 mt-2 rounded-xl border-2 border-slate-600">
                  {submissions[currentArgIndex].players.nickname}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Judgment Phase */}
      {phase !== 'arguments' && phase !== 'loading' && (
        <>
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
            {phase === 'roasts' && (
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
                  initial={{ opacity: 0, y: 50, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  className="bg-slate-900 border-2 border-red-500/50 rounded-2xl p-6 shadow-[4px_4px_0_rgba(239,68,68,0.5)] relative"
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
          {isHost && phase === 'roasts' && currentRoastIndex >= roasts.length && (
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={onNextRound}
              className="jackbox-button flex items-center justify-center gap-3 mt-12 w-full max-w-sm"
            >
              {verdict.round >= 5 ? "Final Leaderboard" : "Next Round"} <ArrowRight />
            </motion.button>
          )}
        </>
      )}
    </div>
  );
}
