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
    setIsLoading(true);
    setError("");
    const code = Math.random().toString(36).substring(2, 6).toUpperCase();
    
    // Create the room
    const { data: room, error: roomError } = await supabase
      .from("rooms")
      .insert({ code })
      .select()
      .single();

    if (roomError) {
      setError("Failed to create room.");
      setIsLoading(false);
      return;
    }

    // Set host_id to a random session id for now, but really anyone joining first feels like host in this demo
    router.push(`/room/${code}?host=true`);
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
    <div className="flex flex-col items-center justify-center space-y-12">
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="text-center space-y-4"
      >
        <div className="flex justify-center mb-6">
          <Gavel size={80} className="text-yellow-400 rotate-12" />
        </div>
        <h1 className="jackbox-title">Plead Your Case</h1>
        <p className="text-2xl md:text-3xl font-medium text-slate-400">
          The Honorable Judge is waiting...
        </p>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-8 w-full max-w-4xl">
        <motion.div 
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="jackbox-card space-y-6"
        >
          <div className="space-y-2">
            <h2 className="text-3xl font-bold flex items-center gap-3">
              <Play className="text-yellow-400" /> Start a New Game
            </h2>
            <p className="text-slate-400 text-lg">Create a room and invite your friends</p>
          </div>
          
          <button 
            onClick={handleCreateRoom} 
            disabled={isLoading}
            className="jackbox-button"
          >
            {isLoading ? "Creating..." : "Create Room"}
          </button>
        </motion.div>

        <motion.div 
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="jackbox-card space-y-6"
        >
          <div className="space-y-2">
            <h2 className="text-3xl font-bold flex items-center gap-3">
              <Users className="text-yellow-400" /> Join a Game
            </h2>
            <p className="text-slate-400 text-lg">Enter the 4-letter code on the host screen</p>
          </div>

          <form onSubmit={handleJoinRoom} className="space-y-4">
            <input
              type="text"
              placeholder="ROOM CODE"
              maxLength={4}
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              className="jackbox-input text-center uppercase tracking-[0.5em] font-black"
            />
            <input
              type="text"
              placeholder="YOUR NICKNAME"
              maxLength={15}
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className="jackbox-input text-center"
            />
            {error && <p className="text-red-400 font-medium text-center bg-red-900/30 py-2 rounded-lg">{error}</p>}
            <button 
              type="submit" 
              disabled={isLoading}
              className="jackbox-button mt-4"
            >
              {isLoading ? "Joining..." : "Join Game"}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
