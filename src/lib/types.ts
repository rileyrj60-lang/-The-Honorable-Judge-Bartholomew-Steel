export type RoundMode = 'classic' | 'speed' | 'reverse' | 'objection';

export type Room = {
  id: string;
  code: string;
  host_id: string | null;
  status: 'lobby' | 'playing' | 'voting' | 'verdict' | 'finished';
  current_round: number;
  current_scenario: string | null;
  round_mode: RoundMode;
  used_scenarios: string[];
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

export type Vote = {
  id: string;
  room_id: string;
  voter_player_id: string;
  voted_for_player_id: string;
  round: number;
  created_at: string;
};

export type Verdict = {
  id: string;
  room_id: string;
  round: number;
  winner_player_id: string | null;
  vote_winner_player_id: string | null;
  verdict_json: {
    winner_nickname: string;
    verdict_speech: string;
    roasts: { nickname: string; roast: string }[];
  };
  created_at: string;
};

export type ScenarioCategory = 'absurd' | 'philosophical' | 'personal' | 'pop-culture' | 'workplace' | 'food' | 'animals' | 'technology' | 'hypothetical';

export type Scenario = {
  text: string;
  category: ScenarioCategory;
  difficulty: 1 | 2 | 3; // 1=easy, 2=medium, 3=hard
};

export type EmojiReaction = {
  emoji: string;
  x: number; // 0-100 percentage across screen
  id: string;
  sender: string;
};
