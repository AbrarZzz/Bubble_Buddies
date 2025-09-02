"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import type { GameBoard, Bubble, BubbleColor } from '@/lib/types';
import {
  BOARD_COLS,
  BOARD_ROWS,
  BUBBLE_COLORS,
  GAME_BOARD_LAYOUT,
  GAME_OVER_ROW,
  INITIAL_SHOTS,
  BONUS_SHOTS,
  SCORE_THRESHOLD_FOR_BONUS,
  SHOTS_UNTIL_BOARD_ADVANCE
} from '@/lib/game-constants';

let bubbleIdCounter = 0;

const createBubble = (row: number, col: number, color?: BubbleColor, type: 'normal' | 'locked' = 'normal'): Bubble => {
  return {
    id: bubbleIdCounter++,
    row,
    col,
    color: color || BUBBLE_COLORS[Math.floor(Math.random() * BUBBLE_COLORS.length)],
    type,
  };
};

const createBoardFromLayout = (layout: (BubbleColor | null)[][]): GameBoard => {
  const board: GameBoard = Array(BOARD_ROWS).fill(0).map(() => Array(BOARD_COLS).fill(null));
  layout.forEach((row, r) => {
    row.forEach((color, c) => {
      if (color) {
        board[r][c] = createBubble(r, c, color);
      }
    });
  });
  return board;
};


export const useGameLogic = (player: {name: string}, onGameOver: (name: string, score: number) => void) => {
  const [board, setBoard] = useState<GameBoard>(() => createBoardFromLayout(GAME_BOARD_LAYOUT));
  const [currentBubble, setCurrentBubble] = useState<Bubble>(() => createBubble(-2, -1, 'red'));
  const [nextBubble, setNextBubble] = useState<Bubble>(() => createBubble(-3, -1, 'blue'));
  const [shotsRemaining, setShotsRemaining] = useState(INITIAL_SHOTS);
  const [score, setScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const scoreMilestone = useRef(SCORE_THRESHOLD_FOR_BONUS);
  const [shotsUntilAdvance, setShotsUntilAdvance] = useState(SHOTS_UNTIL_BOARD_ADVANCE);
  const [isAdvancing, setIsAdvancing] = useState(false);

  const availableColors = useMemo(() => {
    const colorsOnBoard = new Set<BubbleColor>();
    board.forEach(row => row.forEach(bubble => {
      if (bubble) colorsOnBoard.add(bubble.color);
    }));
    if (colorsOnBoard.size === 0) return BUBBLE_COLORS;
    return Array.from(colorsOnBoard);
  }, [board]);

  const getNextBubbleColor = useCallback(() => {
    return availableColors[Math.floor(Math.random() * availableColors.length)];
  }, [availableColors]);
  
  const resetBubbles = useCallback(() => {
    setCurrentBubble(createBubble(-2, -1, getNextBubbleColor()));
    setNextBubble(createBubble(-3, -1, getNextBubbleColor()));
  }, [getNextBubbleColor]);

  const resetGame = useCallback(() => {
    setBoard(createBoardFromLayout(GAME_BOARD_LAYOUT));
    setShotsRemaining(INITIAL_SHOTS);
    setScore(0);
    setIsGameOver(false);
    resetBubbles();
    scoreMilestone.current = SCORE_THRESHOLD_FOR_BONUS;
    setShotsUntilAdvance(SHOTS_UNTIL_BOARD_ADVANCE);
  }, [resetBubbles]);

  useEffect(() => {
    resetBubbles();
  }, [availableColors, resetBubbles]);

  useEffect(() => {
    if (score >= scoreMilestone.current) {
        setShotsRemaining(s => s + BONUS_SHOTS);
        scoreMilestone.current += SCORE_THRESHOLD_FOR_BONUS;
    }
  }, [score]);

  const advanceBoard = () => {
    setIsAdvancing(true);
    setTimeout(() => {
      setBoard(prevBoard => {
        const newBoard = prevBoard.map(row => row.map(b => b ? {...b, row: b.row + 1} : null));
        newBoard.pop();
        
        const newRow: (Bubble | null)[] = Array(BOARD_COLS).fill(null);
        for(let c = 0; c < BOARD_COLS; c++) {
          if (Math.random() > 0.4) {
             newRow[c] = createBubble(0, c, getNextBubbleColor());
          }
        }
        newBoard.unshift(newRow);

        newBoard.forEach((row, r) => row.forEach((bubble, c) => {
            if(bubble) {
                bubble.row = r;
            }
        }));

        if (newBoard[GAME_OVER_ROW].some(b => b !== null)) {
            endGame();
        }

        return newBoard;
      });
      setIsAdvancing(false);
    }, 500);
  };
  
  const handleShot = (newBubble: Bubble) => {
    if (isGameOver || isAdvancing) return;
    
    setShotsRemaining(s => s - 1);

    const newBoard = board.map(row => [...row]);
    
    if (newBubble.row < 0 || newBubble.row >= BOARD_ROWS || newBubble.col < 0 || newBubble.col >= BOARD_COLS || newBoard[newBubble.row][newBubble.col]) {
        if (shotsRemaining - 1 <= 0) endGame();
        else prepareNextShot();
        return;
    }
    
    newBoard[newBubble.row][newBubble.col] = newBubble;
    
    const matches = findMatches(newBubble, newBoard);
    
    let didPop = false;
    if (matches.length >= 3) {
      didPop = true;
      matches.forEach(b => {
          if (newBoard[b.row][b.col]) {
              (newBoard[b.row][b.col] as Bubble).status = 'popping';
          }
      });
      setScore(s => s + matches.length * 10);
    }
    
    setTimeout(() => {
      let boardAfterPop = newBoard.map(row => row.map(b => (b && b.status === 'popping' ? null : b)));
      const floating = findFloatingBubbles(boardAfterPop);
      if(floating.length > 0) {
        didPop = true;
        floating.forEach(b => {
          if (boardAfterPop[b.row][b.col]) {
              (boardAfterPop[b.row][b.col] as Bubble).status = 'falling';
          }
        });
        setScore(s => s + floating.length * 20);

        setTimeout(() => {
           let finalBoard = boardAfterPop.map(row => row.map(b => (b && b.status === 'falling' ? null : b)));
           setBoard(finalBoard);
           checkWinCondition(finalBoard);
        }, 300);
      } else {
        setBoard(boardAfterPop);
        checkWinCondition(boardAfterPop);
      }
      
      if (!didPop) {
        if (shotsUntilAdvance - 1 <= 0) {
          advanceBoard();
          setShotsUntilAdvance(SHOTS_UNTIL_BOARD_ADVANCE);
        } else {
          setShotsUntilAdvance(s => s - 1);
        }
      } else {
         if (shotsUntilAdvance - 1 <= 0) {
          advanceBoard();
          setShotsUntilAdvance(SHOTS_UNTIL_BOARD_ADVANCE);
        }
      }

    }, 300);

    if (newBubble.row >= GAME_OVER_ROW) {
      endGame();
    } else if (shotsRemaining - 1 <= 0) {
      endGame();
    } else {
      prepareNextShot();
    }
  };

  const prepareNextShot = () => {
    setCurrentBubble(nextBubble);
    setNextBubble(createBubble(-3, -1, getNextBubbleColor()));
  };

  const endGame = () => {
    setIsGameOver(true);
    onGameOver(player.name, score);
  };
  
  const checkWinCondition = (currentBoard: GameBoard) => {
    const bubblesLeft = currentBoard.flat().filter(b => b !== null).length;
    if (bubblesLeft === 0) {
      setScore(s => s + 1000);
      setTimeout(() => {
        // Reset board for continuous play
        setBoard(createBoardFromLayout(GAME_BOARD_LAYOUT));
      }, 1000);
    }
  }

  const findMatches = (bubble: Bubble, board: GameBoard): Bubble[] => {
    const toCheck = [bubble];
    const checked = new Set<string>();
    const matches: Bubble[] = [];
    checked.add(`${bubble.row},${bubble.col}`);
    
    if (bubble.type === 'normal') {
      matches.push(bubble);
    }

    while(toCheck.length > 0) {
      const current = toCheck.pop()!;
      const neighbors = getNeighbors(current, board);
      for(const neighbor of neighbors) {
        const key = `${neighbor.row},${neighbor.col}`;
        if(!checked.has(key) && neighbor.color === bubble.color) {
          if (neighbor.type === 'normal') {
             matches.push(neighbor);
             toCheck.push(neighbor);
          }
          checked.add(key);
        }
      }
    }
    return matches;
  };

  const getNeighbors = (bubble: Bubble, board: GameBoard): Bubble[] => {
    const { row, col } = bubble;
    const neighbors: Bubble[] = [];
    const isOddRow = row % 2 !== 0;

    const neighborCoords = [
      { r: row, c: col - 1 }, // left
      { r: row, c: col + 1 }, // right
      { r: row - 1, c: col }, // top-middle
      { r: row + 1, c: col }, // bottom-middle
      { r: row - 1, c: isOddRow ? col + 1 : col - 1 }, // top-right/left
      { r: row + 1, c: isOddRow ? col + 1 : col - 1 }, // bottom-right/left
    ];

    neighborCoords.forEach(n => {
        if(n.r >= 0 && n.r < BOARD_ROWS && n.c >= 0 && n.c < BOARD_COLS && board[n.r][n.c]) {
            neighbors.push(board[n.r][n.c] as Bubble);
        }
    });

    return neighbors;
  };

  const findFloatingBubbles = (board: GameBoard): Bubble[] => {
    const connected = new Set<string>();
    const toCheck: Bubble[] = [];

    board[0].forEach(bubble => {
      if (bubble) {
        toCheck.push(bubble);
        connected.add(`${bubble.row},${bubble.col}`);
      }
    });
    
    while (toCheck.length > 0) {
      const current = toCheck.pop()!;
      const neighbors = getNeighbors(current, board);
      for (const neighbor of neighbors) {
        const key = `${neighbor.row},${neighbor.col}`;
        if (!connected.has(key)) {
          connected.add(key);
          toCheck.push(neighbor);
        }
      }
    }

    const floating: Bubble[] = [];
    board.forEach(row => row.forEach(bubble => {
      if (bubble && !connected.has(`${bubble.row},${bubble.col}`)) {
        floating.push(bubble);
      }
    }));
    return floating;
  };

  return {
    board,
    currentBubble,
    nextBubble,
    score,
    shotsRemaining,
    isGameOver,
    handleShot,
    resetGame,
    isAdvancing,
    shotsUntilAdvance,
  };
};
