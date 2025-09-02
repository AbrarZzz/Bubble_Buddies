import type { BubbleColor } from './types';

export const BUBBLE_DIAMETER = 40;
export const BUBBLE_RADIUS = BUBBLE_DIAMETER / 2;
export const BOARD_COLS = 14;
export const BOARD_ROWS = 20;
export const GAME_OVER_ROW = 14;
export const HEX_HEIGHT = BUBBLE_DIAMETER * 0.866;

export const INITIAL_SHOTS = 35;
export const BONUS_SHOTS = 10;
export const SCORE_THRESHOLD_FOR_BONUS = 5000;
export const SHOTS_UNTIL_BOARD_ADVANCE = 5;

export const BUBBLE_COLORS: BubbleColor[] = ['pink-1', 'pink-2', 'pink-3', 'pink-4', 'pink-5', 'pink-6'];

export const COLOR_MAP: Record<BubbleColor, string> = {
  'pink-1': '#FFC0CB',
  'pink-2': '#FFB6C1',
  'pink-3': '#FF69B4',
  'pink-4': '#FF1493',
  'pink-5': '#DB7093',
  'pink-6': '#C71585',
};

export const GAME_BOARD_LAYOUT: (BubbleColor | null)[][] = [
  [null, 'pink-1', 'pink-1', null, 'pink-2', 'pink-2', null, null, 'pink-3', 'pink-3', null, 'pink-4', 'pink-4', null],
  ['pink-1', null, 'pink-1', 'pink-2', null, 'pink-2', 'pink-3', null, 'pink-3', null, 'pink-4', null, 'pink-4', 'pink-1'],
  [null, 'pink-4', 'pink-4', null, 'pink-5', 'pink-5', null, null, 'pink-6', 'pink-6', null, 'pink-2', 'pink-2', null],
  ['pink-4', null, 'pink-4', 'pink-5', null, 'pink-5', 'pink-6', null, 'pink-6', null, 'pink-2', null, 'pink-2', 'pink-4'],
  [null, 'pink-3', 'pink-3', null, 'pink-1', 'pink-1', null, null, 'pink-4', 'pink-4', null, 'pink-5', 'pink-5', null],
  ['pink-3', 'pink-1', 'pink-1', 'pink-4', 'pink-4', 'pink-2', 'pink-2', 'pink-5', 'pink-5', 'pink-6', 'pink-6', 'pink-3', 'pink-3', 'pink-1'],
  [null, 'pink-2', 'pink-2', null, 'pink-3', 'pink-3', null, null, 'pink-1', 'pink-1', null, 'pink-5', 'pink-5', null],
  ['pink-2', null, 'pink-2', 'pink-3', null, 'pink-3', 'pink-1', null, 'pink-1', null, 'pink-5', null, 'pink-5', 'pink-2'],
];
