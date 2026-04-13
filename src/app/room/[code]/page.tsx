"use client";

import { useEffect, useState, use, useRef, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import type { RealtimeChannel } from "@supabase/supabase-js";
import type { Room, Player, Verdict as VerdictType, RoundMode } from "@/lib/types";
import { getRandomScenario } from "@/lib/scenarios";

import GameLobby from "@/components/GameLobby";
import ActiveGame from "@/components/ActiveGame";
import VerdictScreen from "@/components/VerdictScreen";
import VotingPhase from "@/components/VotingPhase";
import Leaderboard from "@/components/Leaderboard";
import EmojiReactions from "@/components/EmojiReactions";
import { Gavel } from "lucide-react";

const ROUND_TIME = 60;
const SPEED_ROUND_TIME = 15;
const VOTE_TIMEOUT = 10; // seconds before auto-proceeding
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

  // Voting state
  const [hasVoted, setHasVoted] = useState(false);
  const [voteResults, setVoteResults] = useState<{ player_id: string; nickname: string; votes: number }[] | null>(null);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [voteTimeRemaining, setVoteTimeRemaining] = useState(VOTE_TIMEOUT);

  // Track if judge was already called this round to prevent double-calls
  const judgeCalledRef = useRef(false);

  // Emoji reactions enabled during argument viewing in verdict
  const [emojisEnabled, setEmojisEnabled] = useState(false);

  // Helper: calculate vote results and proceed to judge
  const finalizeVotesAndCallJudge = useCallback(async (roomId: string, round: number) => {
    if (judgeCalledRef.current) return; // Prevent double-calls
    judgeCalledRef.current = true;

    // Fetch whatever votes exist (may be partial if timeout)
    const { data: votes } = await supabase
      .from("votes")
      .select("*")
      .eq("room_id", roomId)
      .eq("round", round);

    const { data: currentPlayers } = await supabase
      .from("players")
      .select("id, nickname")
      .eq("room_id", roomId);

    const results = (currentPlayers || []).map(p => ({
      player_id: p.id,
      nickname: p.nickname,
      votes: (votes || []).filter((v: any) => v.voted_for_player_id === p.id).length,
    })).sort((a, b) => b.votes - a.votes);

    setVoteResults(results);

    // Broadcast results to everyone
    if (channelRef.current) {
      channelRef.current.send({
        type: 'broadcast',
        event: 'vote_results',
        payload: { results },
      });
    }

    // After showing results briefly, call the judge
    setTimeout(async () => {
      try {
        const res = await fetch('/api/judge', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            room_id: roomId,
            round: round,
            vote_results: results
          })
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          console.error('Judge API failed:', res.status, err);
        }
      } catch (e) {
        console.error('Judge API network error:', e);
      }
    }, 4000);
  }, []);

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

      // If we loaded into voting status, load submissions
      if (roomData.status === "voting") {
        const { data: subData } = await supabase
          .from("submissions")
          .select("*, players(nickname)")
          .eq("room_id", roomData.id)
          .eq("round", roomData.current_round);
        if (mounted && subData) setSubmissions(subData);
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
          setHasVoted(false);
          setVoteResults(null);
          setSubmissions([]);
          setVerdict(null);
          setEmojisEnabled(false);
          judgeCalledRef.current = false;
          // Set timer based on round mode
          const time = newRoom.round_mode === 'speed' ? SPEED_ROUND_TIME : ROUND_TIME;
          setTimeRemaining(time);
        }
        if (newRoom.status === 'voting') {
          setEmojisEnabled(true);
          setVoteTimeRemaining(VOTE_TIMEOUT);
          judgeCalledRef.current = false;
          // Load submissions for voting
          loadSubmissions(newRoom.id, newRoom.current_round);
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
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'votes' }, async () => {
        // Host checks if all votes are in whenever ANY vote is inserted
        if (!isHost || !mounted) return;
        const { data: rData } = await supabase.from("rooms").select("id, current_round").eq("code", code).single();
        if (!rData) return;
        const { data: votes } = await supabase
          .from("votes")
          .select("id")
          .eq("room_id", rData.id)
          .eq("round", rData.current_round);
        const { data: currentPlayers } = await supabase
          .from("players")
          .select("id")
          .eq("room_id", rData.id);
        if (votes && currentPlayers && votes.length >= currentPlayers.length) {
          finalizeVotesAndCallJudge(rData.id, rData.current_round);
        }
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'submissions' }, async () => {
        // Host checks if all submissions are in whenever ANY submission is inserted
        if (!isHost || !mounted) return;
        const { data: rData } = await supabase.from("rooms").select("id, current_round, status").eq("code", code).single();
        if (!rData || rData.status !== 'playing') return;
        const { data: subs } = await supabase
          .from("submissions")
          .select("id")
          .eq("room_id", rData.id)
          .eq("round", rData.current_round);
        const { data: currentPlayers } = await supabase
          .from("players")
          .select("id")
          .eq("room_id", rData.id);
        if (subs && currentPlayers && subs.length >= currentPlayers.length) {
          // Everyone submitted! Move to voting
          supabase.from("rooms").update({ status: "voting" }).eq("id", rData.id).then(() => {});
        }
      })
      .on('broadcast', { event: 'tick' }, payload => {
        if (!isHost && mounted) {
          setTimeRemaining(payload.payload.time);
        }
      })
      .on('broadcast', { event: 'vote_tick' }, payload => {
        if (!isHost && mounted) {
          setVoteTimeRemaining(payload.payload.time);
        }
      })
      .on('broadcast', { event: 'vote_results' }, payload => {
        if (mounted) {
          setVoteResults(payload.payload.results);
        }
      })
      .subscribe();

    channelRef.current = subChannel;

    return () => {
      mounted = false;
      supabase.removeChannel(subChannel);
    };
  }, [code, nickname, router, isHost, finalizeVotesAndCallJudge]);

  // Load submissions for the voting phase
  const loadSubmissions = async (roomId: string, round: number) => {
    const { data } = await supabase
      .from("submissions")
      .select("*, players(nickname)")
      .eq("room_id", roomId)
      .eq("round", round);
    if (data) setSubmissions(data);
  };

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
      // Time's up — move to voting phase
      supabase.from("rooms").update({ status: "voting" }).eq("id", room.id).then(() => {});
    }
    return () => clearTimeout(timer);
  }, [room?.status, room?.id, timeRemaining, isHost]);

  // ═══════════════════════════════════════
  // VOTE TIMEOUT — 10 second countdown
  // If not all votes are in after 10s, proceed anyway
  // ═══════════════════════════════════════
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (room?.status === 'voting' && voteTimeRemaining > 0 && isHost && !voteResults) {
      timer = setTimeout(() => {
        const newTime = voteTimeRemaining - 1;
        setVoteTimeRemaining(newTime);
        if (channelRef.current) {
          channelRef.current.send({
            type: 'broadcast',
            event: 'vote_tick',
            payload: { time: newTime }
          });
        }
      }, 1000);
    } else if (room?.status === 'voting' && voteTimeRemaining === 0 && isHost && !voteResults) {
      // Timeout! Proceed with whatever votes we have
      finalizeVotesAndCallJudge(room.id, room.current_round);
    }
    return () => clearTimeout(timer);
  }, [room?.status, room?.id, room?.current_round, voteTimeRemaining, isHost, voteResults, finalizeVotesAndCallJudge]);

  // Solo play: skip voting entirely
  useEffect(() => {
    if (room?.status === 'voting' && players.length <= 1 && isHost) {
      finalizeVotesAndCallJudge(room.id, room.current_round);
    }
  }, [room?.status, room?.id, room?.current_round, players.length, isHost, finalizeVotesAndCallJudge]);

  const handleStartGame = async (mode: RoundMode = 'classic') => {
    if (!room) return;
    const usedScenarios = room.used_scenarios || [];
    const scenario = getRandomScenario(usedScenarios, mode);
    const time = mode === 'speed' ? SPEED_ROUND_TIME : ROUND_TIME;
    setTimeRemaining(time);

    const { error } = await supabase
      .from("rooms")
      .update({
        status: "playing",
        current_scenario: scenario.text,
        current_round: 1,
        round_mode: mode,
        used_scenarios: [...usedScenarios, scenario.text],
      })
      .eq("id", room.id);

    // Fallback if new columns don't exist yet
    if (error) {
      console.warn("Start game with new columns failed, falling back:", error.message);
      await supabase
        .from("rooms")
        .update({
          status: "playing",
          current_scenario: scenario.text,
          current_round: 1,
        })
        .eq("id", room.id);
    }
  };

  const handleNextRound = async () => {
    if (!room) return;
    if (room.current_round >= MAX_ROUNDS) {
      await supabase.from("rooms").update({ status: "finished" }).eq("id", room.id);
    } else {
      const modes: RoundMode[] = ['classic', 'classic', 'speed', 'reverse', 'classic'];
      const nextMode = modes[Math.floor(Math.random() * modes.length)];
      const usedScenarios = room.used_scenarios || [];
      const scenario = getRandomScenario(usedScenarios, nextMode);
      const time = nextMode === 'speed' ? SPEED_ROUND_TIME : ROUND_TIME;
      setTimeRemaining(time);

      const { error } = await supabase
        .from("rooms")
        .update({
          status: "playing",
          current_scenario: scenario.text,
          current_round: room.current_round + 1,
          round_mode: nextMode,
          used_scenarios: [...usedScenarios, scenario.text],
        })
        .eq("id", room.id);

      if (error) {
        console.warn("Next round with new columns failed, falling back:", error.message);
        await supabase
          .from("rooms")
          .update({
            status: "playing",
            current_scenario: scenario.text,
            current_round: room.current_round + 1,
          })
          .eq("id", room.id);
      }
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
    // Submission count checking is handled by realtime subscription
  };

  const handleVote = async (votedForPlayerId: string) => {
    if (!room || !player) return;
    setHasVoted(true);
    await supabase.from("votes").insert({
      room_id: room.id,
      voter_player_id: player.id,
      voted_for_player_id: votedForPlayerId,
      round: room.current_round,
    });
    // Vote count checking is handled by realtime subscription
  };

  if (!room) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-stone-900">
      <Gavel size={48} className="text-amber-400 animate-bounce mb-4" />
      <div className="text-amber-50 text-3xl font-bold animate-pulse uppercase tracking-widest font-[Georgia,serif]">
        Entering Courtroom...
      </div>
    </div>
  );

  return (
    <div className="min-h-screen p-4 md:p-8 relative z-10 w-full overflow-hidden flex flex-col justify-center">
      {/* Emoji Reactions — active during voting and verdict phases */}
      <EmojiReactions
        channel={channelRef.current}
        nickname={nickname || 'Anonymous'}
        enabled={emojisEnabled || room.status === 'verdict'}
      />

      {/* Dynamic Backgrounds */}
      {room.status === 'playing' && (
        <div className="fixed inset-0 z-[-1] bg-cover bg-center" style={{ backgroundImage: "url('/exterior.png')" }}>
          <div className="absolute inset-0 bg-red-900/50 mix-blend-multiply" />
        </div>
      )}

      {room.status === 'voting' && (
        <div className="fixed inset-0 z-[-1] bg-cover bg-center" style={{ backgroundImage: "url('/courtroom.png')" }}>
          <div className="absolute inset-0 bg-indigo-900/50 mix-blend-multiply" />
        </div>
      )}

      {room.status === 'finished' && (
        <div className="fixed inset-0 z-[-1] bg-cover bg-center" style={{ backgroundImage: "url('/exterior.png')" }}>
          <div className="absolute inset-0 bg-stone-900/70 mix-blend-multiply" />
        </div>
      )}

      {/* Game Phases */}
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

      {room.status === 'voting' && (
        <VotingPhase
          players={players}
          currentPlayer={player}
          submissions={submissions}
          onVote={handleVote}
          hasVoted={hasVoted}
          voteResults={voteResults}
          voteTimeRemaining={voteTimeRemaining}
        />
      )}

      {room.status === 'verdict' && (
        verdict ? (
          <VerdictScreen
            verdict={verdict}
            isHost={isHost}
            onNextRound={handleNextRound}
            currentNickname={nickname}
          />
        ) : (
          <div className="flex flex-col flex-1 items-center justify-center min-h-[50vh] text-center w-full">
            <Gavel size={60} className="text-amber-400 animate-bounce mb-6" />
            <h1 className="text-4xl md:text-6xl mb-6 text-amber-50 font-bold uppercase tracking-widest font-[Georgia,serif]">
              Judge Bartholomew<br/>is deliberating...
            </h1>
            <p className="text-xl text-stone-400 italic font-[Georgia,serif]">The Honorable Judge is reviewing your pathetic excuses.</p>
          </div>
        )
      )}

      {room.status === 'finished' && (
        <Leaderboard players={players} isHost={isHost} />
      )}
    </div>
  );
}
