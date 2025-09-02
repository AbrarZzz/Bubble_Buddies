export type BubbleColor = 'pink-1' | 'pink-2' | 'pink-3' | 'pink-4' | 'pink-5' | 'pink-6';

export interface Bubble {
  id: number;
  color: BubbleColor;
  row: number;
  col: number;
  type: 'normal' | 'locked';
  status?: 'popping' | 'falling';
}

export type GameBoard = (Bubble | null)[][];

export interface GameState {
  board: GameBoard;
  currentBubble: Bubble;
  nextBubble: Bubble;
  score: number;
  shotsRemaining: number;
  isGameOver: boolean;
}

export interface LeaderboardEntry {
  name: string;
  score: number;
}
