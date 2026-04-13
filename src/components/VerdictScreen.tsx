import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Verdict } from "@/lib/types";
import { Gavel, Star, ArrowRight, Trophy } from "lucide-react";
import Confetti from "./Confetti";

interface VerdictScreenProps {
  verdict: Verdict;
  isHost: boolean;
  onNextRound: () => void;
  currentNickname: string | null;
}

type Phase = 'loading' | 'arguments' | 'drumroll' | 'winner' | 'speech' | 'roasts';

export default function VerdictScreen({ verdict, isHost, onNextRound, currentNickname }: VerdictScreenProps) {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [phase, setPhase] = useState<Phase>('loading');
  const [currentArgIndex, setCurrentArgIndex] = useState(0);
  const [displayedSpeech, setDisplayedSpeech] = useState("");
  const [currentRoastIndex, setCurrentRoastIndex] = useState(-1);
  const [showConfetti, setShowConfetti] = useState(false);
  const [shaking, setShaking] = useState(false);

  const fullSpeech = verdict.verdict_json.verdict_speech;
  const roasts = verdict.verdict_json.roasts || [];
  const isWinner = currentNickname === verdict.verdict_json.winner_nickname;

  // Gavel slam effect
  const slamGavel = useCallback(() => {
    setShaking(true);
    // Vibrate if supported
    if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
    setTimeout(() => setShaking(false), 600);
  }, []);

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
        setPhase(data.length > 0 ? 'arguments' : 'drumroll');
      } else {
        setPhase('drumroll');
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
          setPhase('drumroll');
        }
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [phase, currentArgIndex, submissions.length]);

  // Drumroll → Winner reveal
  useEffect(() => {
    if (phase === 'drumroll') {
      slamGavel();
      const timer = setTimeout(() => {
        setShowConfetti(true);
        setPhase('winner');
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [phase, slamGavel]);

  // Winner → Speech (after a beat)
  useEffect(() => {
    if (phase === 'winner') {
      const timer = setTimeout(() => setPhase('speech'), 3000);
      return () => clearTimeout(timer);
    }
  }, [phase]);

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
    }, 18);
    return () => clearInterval(intervalId);
  }, [phase, fullSpeech]);

  // Reveal roasts sequentially
  useEffect(() => {
    if (phase === 'roasts' && currentRoastIndex < roasts.length) {
      const timer = setTimeout(() => {
        setCurrentRoastIndex(prev => prev + 1);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [phase, currentRoastIndex, roasts.length]);

  return (
    <div className={`flex flex-col items-center w-full max-w-5xl mx-auto space-y-8 relative z-10 min-h-screen pt-8 font-[Georgia,serif] ${shaking ? 'shake' : ''}`}>
      <Confetti active={showConfetti} />

      {/* Background Courtroom Image */}
      {phase !== 'loading' && (
        <div
          className="fixed inset-0 z-[-1] bg-cover bg-center transition-all duration-1000"
          style={{ backgroundImage: "url('/courtroom.png')" }}
        >
          <div className="absolute inset-0 bg-stone-900/60 mix-blend-multiply" />
          <div className="absolute inset-0 bg-amber-900/10 mix-blend-overlay" />
        </div>
      )}

      {/* Arguments Presentation Phase */}
      {phase === 'arguments' && submissions[currentArgIndex] && (
        <motion.div
          key={currentArgIndex}
          initial={{ opacity: 0, scale: 0.5, y: 100, rotate: -5 }}
          animate={{ opacity: 1, scale: 1, y: 0, rotate: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: -100 }}
          transition={{ type: "spring", stiffness: 150, damping: 12 }}
          className="flex flex-col items-center w-full max-w-3xl justify-center min-h-[50vh]"
        >
          {/* Progress dots */}
          <div className="flex gap-2 mb-8">
            {submissions.map((_: any, i: number) => (
              <div key={i} className={`w-3 h-3 rounded-full transition-all ${
                i === currentArgIndex ? 'bg-amber-400 scale-125' :
                i < currentArgIndex ? 'bg-stone-500' : 'bg-stone-700'
              }`} />
            ))}
          </div>
          <div className="w-full relative bg-amber-50/95 border-x-4 border-y-2 border-stone-800 p-10 shadow-2xl rounded-2xl">
            <p className="text-2xl md:text-4xl font-bold text-stone-900 italic leading-relaxed text-center">
              &ldquo;{submissions[currentArgIndex].argument_text}&rdquo;
            </p>
            <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-stone-800 text-amber-50 font-bold px-8 py-2 text-lg tracking-widest uppercase border-2 border-amber-50 shadow-lg rounded-xl transform -rotate-2">
              {submissions[currentArgIndex].players.nickname}
            </div>
          </div>
        </motion.div>
      )}

      {/* Drumroll Phase */}
      {phase === 'drumroll' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center min-h-[60vh] text-center"
        >
          <motion.div
            animate={{ rotate: [0, -20, 20, -10, 10, 0], scale: [1, 1.3, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="text-8xl mb-8"
          >
            <Gavel size={80} className="text-amber-400" />
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-4xl md:text-6xl font-bold text-amber-50 uppercase tracking-widest"
          >
            The Judge Deliberates...
          </motion.h2>
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 2, ease: "easeInOut" }}
            className="w-64 h-1 bg-amber-400 mt-6 origin-left"
          />
        </motion.div>
      )}

      {/* Winner + Speech + Roasts Phase */}
      {(phase === 'winner' || phase === 'speech' || phase === 'roasts') && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full flex flex-col items-center"
        >
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -100, scale: 0.5 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: "spring", stiffness: 120, damping: 10 }}
            className="flex items-center gap-4 text-stone-800 border-b-4 border-double border-stone-800 pb-3 mb-8 transform -rotate-1"
          >
            <Gavel size={40} />
            <h1 className="text-4xl md:text-6xl font-bold uppercase tracking-widest">
              The Verdict
            </h1>
          </motion.div>

          {/* The Winner Announcement — FIRST and BIG */}
          <motion.div
            initial={{ opacity: 0, scale: 0, rotate: -10 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ type: "spring", bounce: 0.5 }}
            className={`p-10 text-center w-full max-w-2xl shadow-[0_15px_30px_rgba(0,0,0,0.5)] rounded-2xl mb-10 relative overflow-hidden ${
              isWinner ? 'bg-amber-600 border-4 border-amber-300 glow-pulse' : 'bg-stone-800 border-4 border-amber-500'
            }`}
          >
            <div className="absolute inset-0 bg-[url('/exterior.png')] opacity-10 mix-blend-overlay pointer-events-none bg-cover" />
            <Trophy className="mx-auto text-amber-200 mb-3" size={40} />
            <h2 className="text-xl font-bold text-amber-200 mb-3 tracking-widest uppercase">
              {isWinner ? "🎉 YOU WON! 🎉" : "Winner"}
            </h2>
            <motion.div
              initial={{ scale: 0.5 }}
              animate={{ scale: [0.5, 1.15, 1] }}
              transition={{ duration: 0.6, times: [0, 0.7, 1] }}
              className="text-5xl md:text-6xl font-bold text-amber-50 uppercase tracking-widest bg-stone-900/50 shadow-inner rounded-xl py-4 px-8 border-2 border-stone-600 inline-block backdrop-blur-sm"
            >
              {verdict.verdict_json.winner_nickname}
            </motion.div>
          </motion.div>

          {/* Speech Document */}
          {(phase === 'speech' || phase === 'roasts') && (
            <div className="relative w-full max-w-4xl mb-16">
              <motion.div
                initial={{ opacity: 0, scale: 0.8, rotate: 2 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 100, damping: 12 }}
                className="bg-amber-50/95 w-full border border-stone-400 shadow-2xl p-10 rounded-xl relative z-20"
              >
                <div className="absolute top-3 left-3 right-3 bottom-3 border border-stone-300 rounded-lg pointer-events-none" />
                <p className={`text-2xl md:text-3xl font-bold italic leading-relaxed text-stone-800 font-serif relative z-10 text-center ${phase === 'speech' ? 'typewriter-cursor' : ''}`}>
                  &ldquo;{displayedSpeech}&rdquo;
                </p>
              </motion.div>

              {/* The Judge Character Panel */}
              <motion.div
                initial={{ opacity: 0, y: 150, rotate: 15 }}
                animate={{ opacity: 1, y: 0, rotate: -5 }}
                transition={{ type: "spring", stiffness: 80, damping: 10, delay: 0.3 }}
                className="absolute -bottom-24 md:-bottom-36 -right-4 md:-right-12 z-30 w-36 md:w-52"
              >
                <img src="/judge.png" alt="Judge Bartholomew" className="w-full h-auto drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)]" />
              </motion.div>
            </div>
          )}

          {/* The Roasts Reveal */}
          <AnimatePresence>
            {roasts.slice(0, currentRoastIndex + 1).map((r, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: i % 2 === 0 ? -100 : 100 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ type: "spring", stiffness: 120, damping: 12 }}
                className="w-full max-w-4xl bg-stone-100 border border-stone-300 p-6 shadow-lg flex flex-col md:flex-row items-center gap-6 mb-4 rounded-xl hover:-translate-y-1 transition-transform"
              >
                <div className="bg-stone-800 text-amber-50 font-bold px-5 py-2 text-lg whitespace-nowrap tracking-widest uppercase rounded-lg transform rotate-[-2deg]">
                  {r.nickname}
                </div>
                <div className="text-xl text-stone-700 italic border-l-4 border-stone-400 pl-5 w-full leading-relaxed font-serif">
                  &ldquo;{r.roast}&rdquo;
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Next Round Button */}
          {isHost && phase === 'roasts' && currentRoastIndex >= roasts.length && (
            <motion.button
              initial={{ opacity: 0, y: 50, scale: 0.5 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              onClick={onNextRound}
              className="text-2xl font-bold px-12 py-6 bg-stone-800 text-amber-50 border-2 border-stone-500 rounded-xl shadow-[0_6px_0_rgba(0,0,0,0.5)] hover:-translate-y-2 hover:shadow-[0_12px_0_rgba(0,0,0,0.5)] hover:bg-stone-700 transition-all uppercase flex items-center justify-center gap-4 tracking-widest mt-10 w-full max-w-sm"
            >
              {verdict.round >= 5 ? "Final Scores" : "Next Round"} <ArrowRight />
            </motion.button>
          )}
        </motion.div>
      )}
    </div>
  );
}
