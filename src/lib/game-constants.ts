import type { BubbleColor } from './types';

export const BUBBLE_DIAMETER = 40;
export const BUBBLE_RADIUS = BUBBLE_DIAMETER / 2;
export const BOARD_COLS = 14;
export const BOARD_ROWS = 20;
export const GAME_OVER_ROW = 14;

export const SHOTS_BEFORE_ROW_ADVANCE = 5;

export const BUBBLE_COLORS: BubbleColor[] = ['red', 'green', 'blue', 'yellow', 'purple', 'orange'];

export const COLOR_MAP: Record<BubbleColor, string> = {
  red: '#ef4444',
  green: '#22c55e',
  blue: '#3b82f6',
  yellow: '#eab308',
  purple: '#a855f7',
  orange: '#f97316',
};

export const LEVEL_DESIGNS: (BubbleColor | null)[][][] = [
  // Level 1
  [
    [null, 'red', 'red', null, 'blue', 'blue', null, null, 'yellow', 'yellow', null, 'green', 'green', null],
    ['red', null, 'red', 'blue', null, 'blue', 'yellow', null, 'yellow', null, 'green', null, 'green', 'red'],
    [null, 'green', 'green', null, 'purple', 'purple', null, null, 'orange', 'orange', null, 'blue', 'blue', null],
    ['green', null, 'green', 'purple', null, 'purple', 'orange', null, 'orange', null, 'blue', null, 'blue', 'green'],
    [null, 'yellow', 'yellow', null, 'red', 'red', null, null, 'green', 'green', null, 'purple', 'purple', null],
  ],
  // Level 2
  [
    ['red', 'red', null, 'blue', 'blue', 'yellow', 'yellow', 'purple', 'purple', 'orange', 'orange', null, 'green', 'green'],
    ['red', null, 'blue', null, 'yellow', null, 'purple', null, 'orange', null, 'green', null, 'red', 'red'],
    [null, 'blue', 'blue', 'yellow', 'yellow', 'purple', 'purple', 'orange', 'orange', 'green', 'green', 'red', 'red', null],
    ['blue', null, 'yellow', null, 'purple', null, 'orange', null, 'green', null, 'red', null, 'blue', 'blue'],
    [null, 'yellow', 'yellow', null, 'purple', 'purple', null, 'orange', 'orange', null, 'green', 'green', null, 'yellow'],
    ['yellow', null, null, 'purple', null, null, 'orange', null, null, 'green', null, null, 'yellow', 'yellow'],
  ]
];
