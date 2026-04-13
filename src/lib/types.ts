export type Room = {
  id: string;
  code: string;
  host_id: string | null;
  status: 'lobby' | 'playing' | 'verdict' | 'finished';
  current_round: number;
  current_scenario: string | null;
  created_at: string;
};

export type Player = {
  id: string;
  room_id: string;
  nickname: string;
  score: number;
  created_at: string;
};

export type Submission = {
  id: string;
  room_id: string;
  player_id: string;
  round: number;
  argument_text: string;
  created_at: string;
};

export type Verdict = {
  id: string;
  room_id: string;
  round: number;
  winner_player_id: string | null;
  verdict_json: {
    winner_nickname: string;
    verdict_speech: string;
    roasts: { nickname: string; roast: string }[];
  };
  created_at: string;
};
