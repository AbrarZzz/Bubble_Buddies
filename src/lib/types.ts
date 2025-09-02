export type BubbleColor = 'red' | 'green' | 'blue' | 'yellow' | 'purple' | 'orange';

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
  level: number;
  shots: number;
  isGameOver: boolean;
}

export interface LeaderboardEntry {
  name: string;
  score: number;
}
