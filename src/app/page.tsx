"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { motion } from "framer-motion";
import { Gavel, Users, Play } from "lucide-react";

export default function Home() {
  const router = useRouter();
  const [joinCode, setJoinCode] = useState("");
  const [nickname, setNickname] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCreateRoom = async () => {
    if (!nickname) {
      setError("Enter a nickname to host the game!");
      return;
    }

    setIsLoading(true);
    setError("");
    const code = Math.random().toString(36).substring(2, 6).toUpperCase();
    
    // Create the room
    const { data: room, error: roomError } = await supabase
      .from("rooms")
      .insert({ code, host_id: nickname })
      .select()
      .single();

    if (roomError) {
      setError("Failed to create room.");
      setIsLoading(false);
      return;
    }

    // Add host as player
    const { error: playerError } = await supabase
      .from("players")
      .insert({ room_id: room.id, nickname });

    if (playerError) {
      setError("Failed to join as host.");
      setIsLoading(false);
      return;
    }

    router.push(`/room/${code}?host=true&nickname=${encodeURIComponent(nickname)}`);
  };

  const handleJoinRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCode || !nickname) {
      setError("Enter both a room code and a nickname!");
      return;
    }

    setIsLoading(true);
    setError("");
    const code = joinCode.toUpperCase();

    // Check if room exists
    const { data: room, error: roomError } = await supabase
      .from("rooms")
      .select("id, status")
      .eq("code", code)
      .single();

    if (roomError || !room) {
      setError("Room not found!");
      setIsLoading(false);
      return;
    }

    if (room.status !== "lobby") {
      setError("Game already in progress!");
      setIsLoading(false);
      return;
    }

    // Add player
    const { error: playerError } = await supabase
      .from("players")
      .insert({ room_id: room.id, nickname });

    if (playerError) {
      // Supabase UNIQUE constraint error
      if (playerError.code === '23505') {
        setError("Nickname already taken in this room!");
      } else {
        setError("Failed to join room.");
      }
      setIsLoading(false);
      return;
    }

    router.push(`/room/${code}?nickname=${encodeURIComponent(nickname)}`);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 relative z-10 w-full overflow-hidden">
      {/* Background Exterior Image */}
      <div 
        className="fixed inset-0 z-[-1] bg-cover bg-center" 
        style={{ backgroundImage: "url('/exterior.png')" }}
      >
        <div className="absolute inset-0 bg-indigo-900/40 mix-blend-multiply" />
      </div>

      <motion.div 
        initial={{ scale: 0.1, opacity: 0, rotate: -20, y: -200 }}
        animate={{ scale: 1, opacity: 1, rotate: -5, y: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 12 }}
        className="text-center space-y-4 mb-16 bg-red-600 border-8 border-slate-900 p-8 shadow-[15px_15px_0_rgba(0,0,0,1)] px-12 transform -skew-x-6"
      >
        <div className="flex justify-center mb-2">
          <Gavel size={100} className="text-yellow-400 rotate-12 drop-shadow-[4px_4px_0_rgba(0,0,0,0.8)] animate-pulse" />
        </div>
        <h1 className="text-6xl md:text-8xl font-black text-white uppercase tracking-tighter drop-shadow-[5px_5px_0_rgba(0,0,0,1)]">
          Plead Your Case!
        </h1>
        <p className="text-2xl md:text-3xl font-bold text-yellow-300 drop-shadow-[2px_2px_0_rgba(0,0,0,1)] max-w-lg mx-auto">
          The Honorable Judge is waiting... don't make him angry.
        </p>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-12 w-full max-w-5xl mt-12 relative z-20">
        <motion.div 
          initial={{ x: -200, opacity: 0, rotate: -15, scale: 0.5 }}
          animate={{ x: 0, opacity: 1, rotate: -2, scale: 1 }}
          transition={{ type: "spring", stiffness: 150, damping: 10, delay: 0.2 }}
          className="bg-white border-8 border-slate-900 p-8 shadow-[12px_12px_0_rgba(0,0,0,0.8)] space-y-6 transform hover:scale-105 transition-transform duration-200"
        >
          <div className="space-y-2 bg-yellow-400 border-4 border-slate-900 p-4 -mt-12 -ml-12 w-[110%] rotate-3 shadow-[4px_4px_0_rgba(0,0,0,0.8)]">
            <h2 className="text-4xl font-black text-slate-900 flex items-center justify-center gap-3 uppercase">
              <Play className="text-slate-900 fill-slate-900" /> Summon the Court
            </h2>
            <p className="text-slate-800 text-lg font-bold text-center">Create a room and invite your friends</p>
          </div>
          
          <div className="space-y-4 pt-4">
            <input
              type="text"
              placeholder="YOUR NICKNAME"
              maxLength={15}
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className="w-full text-3xl font-black text-center p-4 border-4 border-slate-900 rounded-xl bg-slate-100 uppercase tracking-wider placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-yellow-400 focus:border-yellow-400 transition-all shadow-inner"
            />
            <button 
              onClick={handleCreateRoom} 
              disabled={isLoading}
              className="w-full text-3xl font-black p-6 bg-red-600 text-white rounded-2xl border-4 border-slate-900 shadow-[6px_6px_0_rgba(0,0,0,1)] hover:-translate-y-2 hover:shadow-[10px_10px_0_rgba(0,0,0,1)] hover:bg-red-500 transition-all uppercase disabled:opacity-50"
            >
              {isLoading ? "Creating..." : "Start Trial"}
            </button>
          </div>
        </motion.div>

        <motion.div 
          initial={{ x: 200, opacity: 0, rotate: 15, scale: 0.5 }}
          animate={{ x: 0, opacity: 1, rotate: 2, scale: 1 }}
          transition={{ type: "spring", stiffness: 150, damping: 10, delay: 0.4 }}
          className="bg-white border-8 border-slate-900 p-8 shadow-[12px_12px_0_rgba(0,0,0,0.8)] space-y-6 flex flex-col transform hover:scale-105 transition-transform duration-200"
        >
          <div className="space-y-2 bg-indigo-500 border-4 border-slate-900 p-4 -mt-12 -mr-12 w-[110%] -rotate-2 shadow-[4px_4px_0_rgba(0,0,0,0.8)] self-end relative right-[-32px]">
            <h2 className="text-4xl font-black text-white flex items-center justify-center gap-3 uppercase">
              <Users className="text-white fill-white" /> Enter Courtroom
            </h2>
            <p className="text-indigo-100 text-lg font-bold text-center">Look at the host screen for the code</p>
          </div>

          <form onSubmit={handleJoinRoom} className="space-y-6 flex-grow flex flex-col pt-4">
            <input
              type="text"
              placeholder="ROOM CODE"
              maxLength={4}
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              className="w-full text-4xl md:text-5xl font-black text-center p-6 border-4 border-slate-900 rounded-xl bg-yellow-200 uppercase tracking-[0.4em] placeholder-slate-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500 focus:border-indigo-500 transition-all shadow-[inset_4px_4px_0_rgba(0,0,0,0.1)]"
            />
            <input
              type="text"
              placeholder="YOUR NICKNAME"
              maxLength={15}
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className="w-full text-3xl font-black text-center p-4 border-4 border-slate-900 rounded-xl bg-slate-100 uppercase tracking-wider placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500 focus:border-indigo-500 transition-all shadow-inner"
            />
            {error && <p className="text-red-600 font-black text-center bg-red-200 border-4 border-red-600 py-3 rounded-xl uppercase animate-bounce shadow-[4px_4px_0_rgba(220,38,38,1)]">{error}</p>}
            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full text-3xl font-black p-6 bg-indigo-500 text-white rounded-2xl border-4 border-slate-900 shadow-[6px_6px_0_rgba(0,0,0,1)] hover:-translate-y-2 hover:shadow-[10px_10px_0_rgba(0,0,0,1)] hover:bg-indigo-400 transition-all uppercase disabled:opacity-50 mt-auto"
            >
              {isLoading ? "Joining..." : "Join Game"}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
