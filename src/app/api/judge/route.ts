import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getVerdict } from "@/lib/gemini";

export async function POST(req: Request) {
  try {
    const { room_id, round, vote_results } = await req.json();

    if (!room_id || !round) {
      return NextResponse.json({ error: "Missing room_id or round" }, { status: 400 });
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || "",
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
    );

    // Get submissions for this room and round
    const { data: submissions, error: subError } = await supabaseAdmin
      .from("submissions")
      .select("*, players(nickname)")
      .eq("room_id", room_id)
      .eq("round", round);

    if (subError || !submissions) {
      return NextResponse.json({ error: "Failed to fetch submissions" }, { status: 500 });
    }

    // Get the current scenario and round mode from the room
    const { data: room, error: roomError } = await supabaseAdmin
      .from("rooms")
      .select("current_scenario, round_mode")
      .eq("id", room_id)
      .single();

    if (roomError || !room?.current_scenario) {
      return NextResponse.json({ error: "Failed to fetch room scenario" }, { status: 500 });
    }

    // Prepare data for Gemini
    const mappedSubmissions = submissions.map((s: any) => ({
      nickname: s.players?.nickname || "Unknown",
      argument: s.argument_text,
    }));

    const verdictJSON = await getVerdict(
      room.current_scenario,
      mappedSubmissions,
      room.round_mode || 'classic'
    );

    if (!verdictJSON) {
      return NextResponse.json({ error: "Judge failed to reach a verdict." }, { status: 500 });
    }

    // Find the winner player_id (judge's pick)
    const winnerSub = submissions.find((s: any) => s.players?.nickname === verdictJSON.winner_nickname);
    const winner_player_id = winnerSub ? winnerSub.player_id : null;

    // Find the vote winner (if voting happened)
    let vote_winner_player_id: string | null = null;
    if (vote_results && vote_results.length > 0) {
      const sorted = [...vote_results].sort((a: any, b: any) => b.votes - a.votes);
      if (sorted[0].votes > 0) {
        vote_winner_player_id = sorted[0].player_id;
      }
    }

    // Save verdict to database
    const { data: verdictResult, error: insertError } = await supabaseAdmin
      .from("verdicts")
      .insert({
        room_id,
        round,
        winner_player_id,
        vote_winner_player_id,
        verdict_json: verdictJSON,
      })
      .select()
      .single();

    if (insertError) {
      console.error("Failed to insert verdict", insertError);
      return NextResponse.json({ error: "Failed to save verdict" }, { status: 500 });
    }

    // ═══════════════════════════════════════
    // SCORING SYSTEM:
    // Judge pick = 2 points
    // Player vote winner = 1 point
    // If unanimous (both agree) = 3 points total to winner
    // ═══════════════════════════════════════

    const isUnanimous = winner_player_id && vote_winner_player_id && winner_player_id === vote_winner_player_id;

    // Award judge pick points
    if (winner_player_id) {
      const { data: playerData } = await supabaseAdmin
        .from("players")
        .select("score")
        .eq("id", winner_player_id)
        .single();

      if (playerData) {
        const judgePoints = isUnanimous ? 3 : 2;
        await supabaseAdmin
          .from("players")
          .update({ score: (playerData.score || 0) + judgePoints })
          .eq("id", winner_player_id);
      }
    }

    // Award vote winner points (only if different from judge pick)
    if (vote_winner_player_id && vote_winner_player_id !== winner_player_id) {
      const { data: voteWinnerData } = await supabaseAdmin
        .from("players")
        .select("score")
        .eq("id", vote_winner_player_id)
        .single();

      if (voteWinnerData) {
        await supabaseAdmin
          .from("players")
          .update({ score: (voteWinnerData.score || 0) + 1 })
          .eq("id", vote_winner_player_id);
      }
    }

    // Move room to verdict status
    await supabaseAdmin
      .from("rooms")
      .update({ status: "verdict" })
      .eq("id", room_id);

    return NextResponse.json({ success: true, verdict: verdictResult });

  } catch (error: any) {
    console.error("Judge API Error", error);
    return NextResponse.json({ error: error.message || "Unknown error" }, { status: 500 });
  }
}
