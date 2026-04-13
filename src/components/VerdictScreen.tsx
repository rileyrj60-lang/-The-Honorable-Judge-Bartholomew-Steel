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
    <div className="flex flex-col items-center w-full max-w-5xl mx-auto space-y-12 relative z-10 min-h-screen pt-12 font-[Georgia,serif]">
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
          <div className="w-full relative bg-amber-50/95 border-x-4 border-y-2 border-stone-800 p-12 shadow-2xl rounded-2xl">
            <p className="text-3xl md:text-5xl font-bold text-stone-900 italic leading-relaxed text-center">
              "{submissions[currentArgIndex].argument_text}"
            </p>
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-stone-800 text-amber-50 font-bold px-8 py-2 text-xl tracking-widest uppercase border-2 border-amber-50 shadow-lg rounded-xl transform -rotate-2">
              {submissions[currentArgIndex].players.nickname}
            </div>
          </div>
        </motion.div>
      )}

      {/* Judgment Phase */}
      {phase !== 'arguments' && phase !== 'loading' && (
        <motion.div
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           transition={{ duration: 0.5 }}
           className="w-full flex w-full flex-col items-center"
        >
          <motion.div 
            initial={{ opacity: 0, y: -100, scale: 0.5 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: "spring", stiffness: 120, damping: 10 }}
            className="flex items-center gap-6 text-stone-800 border-b-4 border-double border-stone-800 pb-4 mb-12 transform -rotate-1"
          >
            <Gavel size={50} className="animate-bounce" />
            <h1 className="text-5xl md:text-7xl font-bold uppercase tracking-widest">
              The Verdict
            </h1>
          </motion.div>

          {/* The Vintage Document Envelope */}
          <div className="relative w-full max-w-4xl min-h-[250px] mb-24 mt-8">
            <motion.div 
              initial={{ opacity: 0, scale: 0.8, rotate: 2 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 100, damping: 12 }}
              className="bg-amber-50/95 w-full border border-stone-400 shadow-2xl p-12 rounded-xl relative z-20"
            >
              <div className="absolute top-4 left-4 right-4 bottom-4 border border-stone-300 rounded-lg pointer-events-none" />
              <p className="text-3xl md:text-4xl font-bold italic leading-relaxed text-stone-800 font-serif relative z-10 text-center">
                "{displayedSpeech}"
              </p>
            </motion.div>
            
            {/* The Judge Character Panel */}
            <motion.div 
              initial={{ opacity: 0, y: 150, rotate: 15 }}
              animate={{ opacity: 1, y: 0, rotate: -5 }}
              transition={{ type: "spring", stiffness: 80, damping: 10, delay: 0.3 }}
              className="absolute -bottom-32 md:-bottom-48 -right-8 md:-right-16 z-30 w-48 md:w-64"
            >
              <img src="/judge.png" alt="Judge Bartholomew" className="w-full h-auto drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)]" />
            </motion.div>
          </div>

          {/* The Winner Announcement */}
          <AnimatePresence>
            {phase === 'roasts' && (
              <motion.div 
                initial={{ opacity: 0, scale: 0, rotate: -10 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                transition={{ type: "spring", bounce: 0.6, delay: 0.2 }}
                className="bg-stone-800 border-4 border-amber-500 p-12 text-center w-full max-w-2xl shadow-[0_15px_30px_rgba(0,0,0,0.5)] rounded-2xl mb-12 relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-[url('/exterior.png')] opacity-10 mix-blend-overlay pointer-events-none bg-cover" />
                <h2 className="text-2xl font-bold text-amber-200 mb-4 tracking-widest uppercase">Winner</h2>
                <div className="text-6xl font-bold text-amber-50 uppercase tracking-widest bg-stone-900 shadow-inner rounded-xl py-4 px-8 border-2 border-stone-600 inline-block">
                  {verdict.verdict_json.winner_nickname}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* The Roasts Reveal */}
          <AnimatePresence>
            {roasts.slice(0, currentRoastIndex + 1).map((r, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, x: i % 2 === 0 ? -100 : 100 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ type: "spring", stiffness: 120, damping: 12 }}
                className="w-full max-w-4xl bg-stone-100 border border-stone-300 p-8 shadow-lg flex flex-col md:flex-row items-center gap-8 mb-6 rounded-xl hover:-translate-y-1 transition-transform"
              >
                <div className="bg-stone-800 text-amber-50 font-bold px-6 py-2 text-xl whitespace-nowrap tracking-widest uppercase rounded-lg transform rotate-[-2deg]">
                  {r.nickname}
                </div>
                <div className="text-2xl text-stone-700 italic border-l-4 border-stone-400 pl-6 w-full leading-relaxed font-serif">
                  "{r.roast}"
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
              className="text-2xl font-bold px-12 py-6 bg-stone-800 text-amber-50 border-2 border-stone-500 rounded-xl shadow-[0_6px_0_rgba(0,0,0,0.5)] hover:-translate-y-2 hover:shadow-[0_12px_0_rgba(0,0,0,0.5)] hover:bg-stone-700 transition-all uppercase flex items-center justify-center gap-4 tracking-widest mt-12 w-full max-w-sm"
            >
              {verdict.round >= 5 ? "Finish Game" : "Next Round"} <ArrowRight />
            </motion.button>
          )}
        </motion.div>
      )}
    </div>
  );
}
