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
    <div className="flex flex-col items-center justify-center min-h-screen p-4 relative z-10 w-full overflow-hidden font-[Georgia,serif]">
      {/* Background Exterior Image */}
      <div 
        className="fixed inset-0 z-[-1] bg-cover bg-center" 
        style={{ backgroundImage: "url('/exterior.png')" }}
      >
        <div className="absolute inset-0 bg-stone-900/40 mix-blend-multiply" />
        <div className="absolute inset-0 bg-amber-900/20 mix-blend-overlay" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="text-center space-y-4 mb-16 bg-amber-50/95 border-x-4 border-y-2 border-stone-800 p-12 shadow-2xl max-w-4xl"
      >
        <div className="flex justify-center mb-6">
          <Gavel size={60} className="text-stone-800" />
        </div>
        <h1 className="text-5xl md:text-7xl font-bold text-stone-900 tracking-wider uppercase border-b-4 border-stone-800 pb-4">
          Plead Your Case
        </h1>
        <p className="text-xl md:text-2xl italic text-stone-700 max-w-lg mx-auto pt-4">
          The Honorable Judge Bartholomew awaits your testimony. Approach the bench with dignity.
        </p>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-12 w-full max-w-5xl mt-8 relative z-20">
        {/* CREATE ROOM */}
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="bg-amber-50/95 border border-stone-400 p-10 shadow-2xl space-y-8"
        >
          <div className="space-y-2 pb-6 border-b-2 border-stone-300">
            <h2 className="text-3xl font-bold text-stone-900 flex items-center justify-center gap-3">
              <Play className="text-stone-800" /> Convene a Court
            </h2>
            <p className="text-stone-600 text-lg text-center italic">Create a docket and summon your peers</p>
          </div>
          
          <div className="space-y-6 pt-4">
            <div>
              <label className="block text-sm font-bold text-stone-600 uppercase tracking-widest mb-2">Clerk's Signature (Your Name)</label>
              <input
                type="text"
                placeholder="Entry..."
                maxLength={15}
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                className="w-full text-2xl text-center p-4 border-b-2 border-stone-400 bg-transparent focus:outline-none focus:border-stone-800 transition-all font-serif"
              />
            </div>
            <button 
              onClick={handleCreateRoom} 
              disabled={isLoading}
              className="w-full text-2xl font-bold p-6 bg-stone-800 text-amber-50 rounded shadow-lg hover:bg-stone-700 transition-all uppercase tracking-widest disabled:opacity-50"
            >
              {isLoading ? "Preparing Docket..." : "Start Trial"}
            </button>
          </div>
        </motion.div>

        {/* JOIN ROOM */}
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
          className="bg-amber-50/95 border border-stone-400 p-10 shadow-2xl space-y-8 flex flex-col"
        >
          <div className="space-y-2 pb-6 border-b-2 border-stone-300">
            <h2 className="text-3xl font-bold text-stone-900 flex items-center justify-center gap-3">
              <Users className="text-stone-800" /> Enter Courtroom
            </h2>
            <p className="text-stone-600 text-lg text-center italic">Provide the docket number assigned</p>
          </div>

          <form onSubmit={handleJoinRoom} className="space-y-6 flex-grow flex flex-col pt-4">
            <div>
              <label className="block text-sm font-bold text-stone-600 uppercase tracking-widest mb-2">Docket Reference</label>
              <input
                type="text"
                placeholder="CODE"
                maxLength={4}
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                className="w-full text-4xl font-bold text-center p-4 border border-stone-300 bg-stone-100 uppercase tracking-[0.3em] focus:outline-none focus:border-stone-800 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-stone-600 uppercase tracking-widest mb-2">Clerk's Signature (Your Name)</label>
              <input
                type="text"
                placeholder="Entry..."
                maxLength={15}
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                className="w-full text-2xl text-center p-4 border-b-2 border-stone-400 bg-transparent focus:outline-none focus:border-stone-800 transition-all font-serif"
              />
            </div>
            
            {error && <p className="text-red-800 font-bold text-center bg-red-100/50 py-3 rounded italic">{error}</p>}
            
            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full text-2xl font-bold p-6 bg-stone-200 text-stone-900 border border-stone-400 rounded shadow-lg hover:bg-stone-300 transition-all uppercase tracking-widest disabled:opacity-50 mt-auto"
            >
              {isLoading ? "Swearing In..." : "Join Proceeding"}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
