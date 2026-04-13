"use client";

import { useEffect, useState, use, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import type { RealtimeChannel } from "@supabase/supabase-js";
import type { Room, Player, Verdict as VerdictType } from "@/lib/types";
import { getRandomScenario } from "@/lib/scenarios";

import GameLobby from "@/components/GameLobby";
import ActiveGame from "@/components/ActiveGame";
import VerdictScreen from "@/components/VerdictScreen";
import Leaderboard from "@/components/Leaderboard";

const ROUND_TIME = 60;
const MAX_ROUNDS = 5;

export default function RoomPage({ params }: { params: Promise<{ code: string }> }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { code } = use(params);
  
  const nickname = searchParams.get("nickname");
  const isHost = searchParams.get("host") === "true";

  const [room, setRoom] = useState<Room | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [player, setPlayer] = useState<Player | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(ROUND_TIME);
  const [verdict, setVerdict] = useState<VerdictType | null>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);

  // Initial Fetch & Realtime Subscription
  useEffect(() => {
    let mounted = true;

    async function init() {
      // Fetch Room
      const { data: roomData, error: roomError } = await supabase
        .from("rooms")
        .select("*")
        .eq("code", code)
        .single();
      
      if (roomError || !roomData) {
        if (mounted) router.push("/");
        return;
      }

      if (mounted) setRoom(roomData);

      // Fetch Players
      const { data: playersData } = await supabase
        .from("players")
        .select("*")
        .eq("room_id", roomData.id);

      if (mounted && playersData) {
        setPlayers(playersData);
        if (nickname) {
          const me = playersData.find((p) => p.nickname === nickname);
          if (me) setPlayer(me);
        }
      }

      // Fetch Verdict if in verdict state
      if (roomData.status === "verdict") {
        const { data: vData } = await supabase
          .from("verdicts")
          .select("*")
          .eq("room_id", roomData.id)
          .eq("round", roomData.current_round)
          .single();
        if (mounted && vData) setVerdict(vData);
      }
    }

    init();

    // Setup Subscriptions
    const subChannel = supabase.channel(`game_room:${code}`, { config: { broadcast: { self: false } } });
    
    subChannel
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'rooms', filter: `code=eq.${code}` }, payload => {
        const newRoom = payload.new as Room;
        setRoom(newRoom);
        if (newRoom.status === 'playing') {
          setHasSubmitted(false);
          setTimeRemaining(ROUND_TIME);
          setVerdict(null);
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'players' }, async () => {
        const { data: rData } = await supabase.from("rooms").select("id").eq("code", code).single();
        if (rData) {
          const { data } = await supabase.from("players").select("*").eq("room_id", rData.id);
          if (data && mounted) {
            setPlayers(data);
            if (nickname) {
              const me = data.find((p) => p.nickname === nickname);
              if (me) setPlayer(me);
            }
          }
        }
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'verdicts' }, payload => {
        if (mounted) setVerdict(payload.new as VerdictType);
      })
      .on('broadcast', { event: 'tick' }, payload => {
        if (!isHost && mounted) {
          setTimeRemaining(payload.payload.time);
        }
      })
      .subscribe();

    channelRef.current = subChannel;

    return () => {
      mounted = false;
      supabase.removeChannel(subChannel);
    };
  }, [code, nickname, router, isHost]);

  // Timer logic for Active Game - Host Controls It!
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (room?.status === 'playing' && timeRemaining > 0 && isHost) {
      timer = setTimeout(() => {
        const newTime = timeRemaining - 1;
        setTimeRemaining(newTime);
        if (channelRef.current) {
          channelRef.current.send({
            type: 'broadcast',
            event: 'tick',
            payload: { time: newTime }
          });
        }
      }, 1000);
    } else if (room?.status === 'playing' && timeRemaining === 0 && isHost) {
      // Time's up, host calls the judge API
      callJudge();
    }
    return () => clearTimeout(timer);
  }, [room?.status, timeRemaining, isHost]);

  const callJudge = async () => {
    if (!room) return;
    try {
      await fetch('/api/judge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ room_id: room.id, round: room.current_round })
      });
    } catch (e) {
      console.error(e);
    }
  };

  const handleStartGame = async () => {
    if (!room) return;
    const scenario = getRandomScenario();
    await supabase
      .from("rooms")
      .update({ status: "playing", current_scenario: scenario, current_round: 1 })
      .eq("id", room.id);
  };

  const handleNextRound = async () => {
    if (!room) return;
    if (room.current_round >= MAX_ROUNDS) {
      await supabase.from("rooms").update({ status: "finished" }).eq("id", room.id);
    } else {
      const scenario = getRandomScenario();
      await supabase
        .from("rooms")
        .update({ 
          status: "playing", 
          current_scenario: scenario, 
          current_round: room.current_round + 1 
        })
        .eq("id", room.id);
    }
  };

  const handleSubmitArgument = async (text: string) => {
    if (!room || !player) return;
    setHasSubmitted(true);
    await supabase.from("submissions").insert({
      room_id: room.id,
      player_id: player.id,
      round: room.current_round,
      argument_text: text,
    });
    
    // Check if everyone has submitted (host handles this logic)
    if (isHost) {
      const { data: subs } = await supabase
        .from("submissions")
        .select("id")
        .eq("room_id", room.id)
        .eq("round", room.current_round);
        
      if (subs && subs.length >= players.length) {
        // Everyone submitted!
        setTimeRemaining(0); // Trigger judge
      }
    }
  };

  if (!room) return (
    <div className="flex items-center justify-center min-h-screen bg-slate-900">
      <div className="text-white text-4xl font-black animate-bounce uppercase tracking-widest">
        Loading Courtroom...
      </div>
    </div>
  );

  return (
    <div className="min-h-screen p-4 md:p-12 relative z-10 w-full overflow-hidden flex flex-col justify-center">
      {/* Dynamic Backgrounds controlled centrally! */}
      {room.status === 'lobby' && (
        <div className="fixed inset-0 z-[-1] bg-cover bg-center" style={{ backgroundImage: "url('/exterior.png')" }}>
          <div className="absolute inset-0 bg-indigo-900/40 mix-blend-multiply" />
        </div>
      )}
      
      {room.status === 'playing' && (
        <div className="fixed inset-0 z-[-1] bg-cover bg-center" style={{ backgroundImage: "url('/exterior.png')" }}>
          <div className="absolute inset-0 bg-red-900/60 mix-blend-multiply" />
        </div>
      )}

      {/* verdict screen actually handles its own background for the transition, but we can set a base */}
      {(room.status === 'finished') && (
        <div className="fixed inset-0 z-[-1] bg-cover bg-center" style={{ backgroundImage: "url('/exterior.png')" }}>
          <div className="absolute inset-0 bg-slate-900/80 mix-blend-multiply" />
        </div>
      )}
      {room.status === 'lobby' && (
        <GameLobby 
          room={room} 
          players={players} 
          isHost={isHost} 
          onStartGame={handleStartGame} 
        />
      )}

      {room.status === 'playing' && (
        <ActiveGame 
          room={room} 
          player={player} 
          hasSubmitted={hasSubmitted} 
          onSubmitArgument={handleSubmitArgument} 
          timeRemaining={timeRemaining} 
        />
      )}

      {room.status === 'verdict' && (
        verdict ? (
          <VerdictScreen 
            verdict={verdict} 
            isHost={isHost} 
            onNextRound={handleNextRound} 
          />
        ) : (
          <div className="flex flex-col flex-1 items-center justify-center min-h-[50vh] text-center w-full">
            <h1 className="jackbox-title text-5xl md:text-7xl mb-8 animate-pulse text-yellow-400 font-bold uppercase tracking-widest drop-shadow-[0_0_15px_rgba(250,204,21,0.5)]">Judge Bartholomew <br/>is deliberating...</h1>
            <p className="text-2xl text-slate-400">The Honorable Judge is reviewing your pathetic excuses.</p>
          </div>
        )
      )}

      {room.status === 'finished' && (
        <Leaderboard players={players} />
      )}
    </div>
  );
}
