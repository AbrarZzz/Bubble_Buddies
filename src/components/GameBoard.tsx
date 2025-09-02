"use client";

import { useRef, useState, useMemo, useCallback } from 'react';
import type { GameBoard, Bubble, BubbleColor } from '@/lib/types';
import { BUBBLE_DIAMETER, BUBBLE_RADIUS, BOARD_COLS, BOARD_ROWS, GAME_OVER_ROW, HEX_HEIGHT, COLOR_MAP } from '@/lib/game-constants';
import SingleBubble from './Bubble';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

interface GameBoardProps {
  board: GameBoard;
  onShot: (bubble: Bubble) => void;
  currentBubbleColor: BubbleColor;
  nextBubbleColor: BubbleColor;
  isGameOver: boolean;
  isAdvancing: boolean;
}

const BOARD_PIXEL_WIDTH = BOARD_COLS * BUBBLE_DIAMETER + BUBBLE_RADIUS;
const BOARD_PIXEL_HEIGHT = (BOARD_ROWS -1) * HEX_HEIGHT + BUBBLE_DIAMETER;

export default function GameBoard({ board, onShot, currentBubbleColor, nextBubbleColor, isGameOver, isAdvancing }: GameBoardProps) {
  const boardRef = useRef<HTMLDivElement>(null);
  const [aimAngle, setAimAngle] = useState(0);

  const getBubblePixelPosition = (row: number, col: number) => {
    const x = col * BUBBLE_DIAMETER + (row % 2 === 1 ? BUBBLE_RADIUS : 0);
    const y = row * HEX_HEIGHT;
    return { x, y };
  };

  const shooterPosition = useMemo(() => ({
    x: BOARD_PIXEL_WIDTH / 2 - BUBBLE_RADIUS,
    y: BOARD_PIXEL_HEIGHT + 10,
  }), []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isGameOver || !boardRef.current || isAdvancing) return;
    const rect = boardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - shooterPosition.x - BUBBLE_RADIUS;
    const y = e.clientY - rect.top - shooterPosition.y - BUBBLE_RADIUS;
    const angle = Math.atan2(y, x) * 180 / Math.PI;
    if (angle < -170 || angle > -10) return;
    setAimAngle(angle);
  };

  const handleClick = () => {
    if (isGameOver || isAdvancing) return;

    const angleRad = aimAngle * Math.PI / 180;
    
    // Simplified trajectory simulation to find landing spot
    let x = shooterPosition.x + BUBBLE_RADIUS;
    let y = shooterPosition.y + BUBBLE_RADIUS;
    let dx = Math.cos(angleRad) * 4;
    let dy = Math.sin(angleRad) * 4;

    while (y > -BUBBLE_DIAMETER) {
        x += dx;
        y += dy;

        if (x < BUBBLE_RADIUS || x > BOARD_PIXEL_WIDTH - BUBBLE_RADIUS) {
            dx *= -1; // Bounce off walls
        }

        let hit = false;
        for (let r = 0; r < BOARD_ROWS; r++) {
            for (let c = 0; c < BOARD_COLS; c++) {
                if (board[r][c]) {
                    const bubblePos = getBubblePixelPosition(r, c);
                    const dist = Math.sqrt(Math.pow(x - (bubblePos.x + BUBBLE_RADIUS), 2) + Math.pow(y - (bubblePos.y + BUBBLE_RADIUS), 2));
                    if (dist < BUBBLE_DIAMETER) {
                        hit = true;
                        break;
                    }
                }
            }
            if (hit) break;
        }
        if(hit) break;
    }

    let closestCell = { row: -1, col: -1, dist: Infinity };
    for (let r = 0; r < BOARD_ROWS; r++) {
        for (let c = 0; c < BOARD_COLS; c++) {
            const cellPos = getBubblePixelPosition(r, c);
            const dist = Math.sqrt(Math.pow(x - (cellPos.x + BUBBLE_RADIUS), 2) + Math.pow(y - (cellPos.y + BUBBLE_RADIUS), 2));
            const isNeighborToExisting = (
              (r > 0 && board[r-1][c]) ||
              (r < BOARD_ROWS-1 && board[r+1][c]) ||
              (c > 0 && board[r][c-1]) ||
              (c < BOARD_COLS-1 && board[r][c+1]) ||
              (r > 0 && c > 0 && board[r-1][c + (r % 2 === 1 ? 0 : -1)]) ||
              (r > 0 && c < BOARD_COLS -1 && board[r-1][c + (r % 2 === 1 ? 1 : 0)])
            );
            
            if (!board[r][c] && (r === 0 || isNeighborToExisting) && dist < closestCell.dist) {
                closestCell = { row: r, col: c, dist };
            }
        }
    }
    
    if (closestCell.row !== -1) {
        const shotBubble: Bubble = { id: Date.now() + Math.random(), row: closestCell.row, col: closestCell.col, color: currentBubbleColor, type: 'normal' };
        onShot(shotBubble);
    }
  };


  return (
    <div
      ref={boardRef}
      className="relative bg-card/50 rounded-lg shadow-inner overflow-hidden"
      style={{ width: BOARD_PIXEL_WIDTH, height: BOARD_PIXEL_HEIGHT + 60, cursor: isAdvancing ? 'wait' : 'pointer' }}
      onMouseMove={handleMouseMove}
      onClick={handleClick}
    >
      <div className={cn("absolute top-0 left-0 w-full h-full transition-transform duration-500 ease-in-out", isAdvancing && 'translate-y-[--hex-height]') } style={{ '--hex-height': `${HEX_HEIGHT}px` } as React.CSSProperties}>
      {board.map((row, r) =>
        row.map((bubble, c) => {
          if (!bubble) return null;
          const { x, y } = getBubblePixelPosition(r, c);
          return <SingleBubble key={bubble.id} bubble={bubble} x={x} y={y} />;
        })
      )}
      </div>

      {!isGameOver && !isAdvancing && (
          <>
            <div className="absolute pointer-events-none" style={{ left: shooterPosition.x, top: shooterPosition.y }}>
                <SingleBubble bubble={{id: -1, row: -1, col: -1, color: currentBubbleColor, type: 'normal'}} x={0} y={0} />
            </div>
             <div className="absolute pointer-events-none" style={{ right: BUBBLE_RADIUS, bottom: BUBBLE_RADIUS, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="text-sm font-bold text-primary">Next:</span>
                <div className="w-8 h-8 rounded-full" style={{ backgroundColor: COLOR_MAP[nextBubbleColor] }}></div>
            </div>
            <div
              className="absolute pointer-events-none"
              style={{
                  left: shooterPosition.x + BUBBLE_RADIUS,
                  bottom: 30,
                  transform: `rotate(${aimAngle + 90}deg)`,
                  transformOrigin: 'bottom center',
                  transition: 'transform 0.1s ease-out'
              }}
            >
              <div className="w-1.5 h-24 bg-gradient-to-t from-primary/20 to-primary/80 rounded-t-full relative flex justify-center">
                <div className="absolute -top-1 w-4 h-4 border-2 border-primary rounded-full bg-background" />
              </div>
            </div>
          </>
      )}

      <div 
        className="absolute w-full border-t-2 border-dashed border-red-500/50 pointer-events-none"
        style={{ top: GAME_OVER_ROW * HEX_HEIGHT }}
      />
    </div>
  );
}
