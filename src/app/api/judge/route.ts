import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getVerdict } from "@/lib/gemini";

export async function POST(req: Request) {
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
  );

  let room_id: string | undefined;

  try {
    const body = await req.json();
    room_id = body.room_id;
    const round = body.round;
    const vote_results = body.vote_results;

    if (!room_id || !round) {
      return NextResponse.json({ error: "Missing room_id or round" }, { status: 400 });
    }

    // Get submissions for this room and round
    const { data: submissions, error: subError } = await supabaseAdmin
      .from("submissions")
      .select("*, players(nickname)")
      .eq("room_id", room_id)
      .eq("round", round);

    if (subError || !submissions) {
      console.error("Failed to fetch submissions", subError);
      // Still move to verdict so game doesn't hang
      await supabaseAdmin.from("rooms").update({ status: "verdict" }).eq("id", room_id);
      return NextResponse.json({ error: "Failed to fetch submissions" }, { status: 500 });
    }

    // Get the current scenario from the room
    // Only select current_scenario — round_mode might not exist if migration wasn't run
    const { data: room, error: roomError } = await supabaseAdmin
      .from("rooms")
      .select("current_scenario")
      .eq("id", room_id)
      .single();

    if (roomError || !room?.current_scenario) {
      console.error("Failed to fetch room", roomError);
      await supabaseAdmin.from("rooms").update({ status: "verdict" }).eq("id", room_id);
      return NextResponse.json({ error: "Failed to fetch room scenario" }, { status: 500 });
    }

    // Try to get round_mode separately (graceful if column doesn't exist)
    let roundMode = 'classic';
    try {
      const { data: modeData } = await supabaseAdmin
        .from("rooms")
        .select("round_mode")
        .eq("id", room_id)
        .single();
      if (modeData?.round_mode) roundMode = modeData.round_mode;
    } catch {
      // Column doesn't exist, that's fine — use classic
    }

    // Prepare data for Gemini
    const mappedSubmissions = submissions.map((s: any) => ({
      nickname: s.players?.nickname || "Unknown",
      argument: s.argument_text,
    }));

    const verdictJSON = await getVerdict(
      room.current_scenario,
      mappedSubmissions,
      roundMode as any
    );

    if (!verdictJSON) {
      console.error("Gemini returned null verdict");
      await supabaseAdmin.from("rooms").update({ status: "verdict" }).eq("id", room_id);
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

    // Save verdict — try with vote_winner_player_id first, fall back without it
    let verdictResult: any = null;
    const { data: vr1, error: insertError1 } = await supabaseAdmin
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

    if (insertError1) {
      console.error("Insert with vote_winner failed, trying without:", insertError1.message);
      // Retry without vote_winner_player_id (column might not exist)
      const { data: vr2, error: insertError2 } = await supabaseAdmin
        .from("verdicts")
        .insert({
          room_id,
          round,
          winner_player_id,
          verdict_json: verdictJSON,
        })
        .select()
        .single();

      if (insertError2) {
        console.error("Verdict insert fully failed:", insertError2);
        await supabaseAdmin.from("rooms").update({ status: "verdict" }).eq("id", room_id);
        return NextResponse.json({ error: "Failed to save verdict" }, { status: 500 });
      }
      verdictResult = vr2;
    } else {
      verdictResult = vr1;
    }

    // ═══════════════════════════════════════
    // SCORING: Judge pick = 2pts, Vote winner = 1pt, Unanimous = 3pts
    // ═══════════════════════════════════════
    const isUnanimous = winner_player_id && vote_winner_player_id && winner_player_id === vote_winner_player_id;

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
    console.error("Judge API Error:", error);
    // CRITICAL: Always try to move room to verdict so game doesn't hang
    if (room_id) {
      try {
        await supabaseAdmin.from("rooms").update({ status: "verdict" }).eq("id", room_id);
      } catch (e) {
        console.error("Failed to recover room status:", e);
      }
    }
    return NextResponse.json({ error: error.message || "Unknown error" }, { status: 500 });
  }
}
