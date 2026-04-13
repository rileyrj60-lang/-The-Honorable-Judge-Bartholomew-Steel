import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getVerdict } from "@/lib/gemini";
import type { Database } from "@/lib/types"; // Assuming types aren't fully typed for supabase-js right now, we can just use raw

export async function POST(req: Request) {
  try {
    const { room_id, round } = await req.json();

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

    // Get the current scenario from the room
    const { data: room, error: roomError } = await supabaseAdmin
      .from("rooms")
      .select("current_scenario")
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

    const verdictJSON = await getVerdict(room.current_scenario, mappedSubmissions);

    if (!verdictJSON) {
      return NextResponse.json({ error: "Judge failed to reach a verdict." }, { status: 500 });
    }

    // Find the winner player_id
    const winnerSub = submissions.find((s: any) => s.players?.nickname === verdictJSON.winner_nickname);
    const winner_player_id = winnerSub ? winnerSub.player_id : null;

    // Save verdict to database
    const { data: verdictResult, error: insertError } = await supabaseAdmin
      .from("verdicts")
      .insert({
        room_id,
        round,
        winner_player_id,
        verdict_json: verdictJSON,
      })
      .select()
      .single();

    if (insertError) {
      console.error("Failed to insert verdict", insertError);
      return NextResponse.json({ error: "Failed to save verdict" }, { status: 500 });
    }

    // If there is a winner, increment their score
    if (winner_player_id) {
      const { data: player } = await supabaseAdmin
        .from("players")
        .select("score")
        .eq("id", winner_player_id)
        .single();
      
      if (player) {
        await supabaseAdmin
          .from("players")
          .update({ score: (player.score || 0) + 1 })
          .eq("id", winner_player_id);
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
