"use client";

import { useRef, useState, useMemo, useCallback } from 'react';
import type { GameBoard, Bubble, BubbleColor } from '@/lib/types';
import { BUBBLE_DIAMETER, BUBBLE_RADIUS, BOARD_COLS, BOARD_ROWS, GAME_OVER_ROW, HEX_HEIGHT, COLOR_MAP } from '@/lib/game-constants';
import SingleBubble from './Bubble';
import { cn } from '@/lib/utils';
import { Target } from 'lucide-react';

interface GameBoardProps {
  board: GameBoard;
  onShot: (bubble: Bubble) => void;
  currentBubbleColor: BubbleColor;
  nextBubbleColor: BubbleColor;
  isGameOver: boolean;
  isAdvancing: boolean;
}

const BOARD_PIXEL_WIDTH = BOARD_COLS * BUBBLE_DIAMETER + BUBBLE_RADIUS;
const BOARD_PIXEL_HEIGHT = (BOARD_ROWS - 1) * HEX_HEIGHT + BUBBLE_DIAMETER;

export default function GameBoard({ board, onShot, currentBubbleColor, nextBubbleColor, isGameOver, isAdvancing }: GameBoardProps) {
  const boardRef = useRef<HTMLDivElement>(null);
  const [aimAngle, setAimAngle] = useState(0);
  const [shootingBubble, setShootingBubble] = useState<{ bubble: Bubble; start: { x: number; y: number }; end: { x: number; y: number } } | null>(null);

  const getBubblePixelPosition = (row: number, col: number) => {
    const x = col * BUBBLE_DIAMETER + (row % 2 === 1 ? BUBBLE_RADIUS : 0);
    const y = row * HEX_HEIGHT;
    return { x, y };
  };

  const shooterPosition = useMemo(() => ({
    x: BOARD_PIXEL_WIDTH / 2 - BUBBLE_RADIUS,
    y: BOARD_PIXEL_HEIGHT + 20, // Adjusted for cannon
  }), []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isGameOver || !boardRef.current || isAdvancing || shootingBubble) return;
    const rect = boardRef.current.getBoundingClientRect();
    const cannonCenterX = shooterPosition.x + BUBBLE_RADIUS;
    const cannonCenterY = shooterPosition.y;
    const x = e.clientX - rect.left - cannonCenterX;
    const y = e.clientY - rect.top - cannonCenterY;
    const angle = Math.atan2(y, x) * 180 / Math.PI;
    if (angle < -170 || angle > -10) return;
    setAimAngle(angle);
  };

  const handleClick = () => {
    if (isGameOver || isAdvancing || shootingBubble) return;

    const angleRad = aimAngle * Math.PI / 180;
    
    // Simplified trajectory simulation to find landing spot
    let x = shooterPosition.x + BUBBLE_RADIUS;
    let y = shooterPosition.y;
    let dx = Math.cos(angleRad) * 8;
    let dy = Math.sin(angleRad) * 8;

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
            if (!board[r][c]) {
                const cellPos = getBubblePixelPosition(r, c);
                const dist = Math.sqrt(Math.pow(x - (cellPos.x + BUBBLE_RADIUS), 2) + Math.pow(y - (cellPos.y + BUBBLE_RADIUS), 2));
                const isNeighborToExisting = 
                  (r === 0) ||
                  (board[r - 1]?.[c + (r % 2 === 1 ? 0 : -1)]) ||
                  (board[r-1]?.[c + (r % 2 === 1 ? 1 : 0)]) ||
                  board[r]?.[c - 1] || board[r]?.[c + 1] || 
                  board[r + 1]?.[c + (r % 2 === 0 ? 0 : -1)] ||
                  board[r+1]?.[c + (r % 2 === 0 ? 1 : 0)];
                
                if ((r === 0 || isNeighborToExisting) && dist < closestCell.dist) {
                    closestCell = { row: r, col: c, dist };
                }
            }
        }
    }
    
    if (closestCell.row !== -1) {
        const landingPos = getBubblePixelPosition(closestCell.row, closestCell.col);
        const shotBubble: Bubble = { id: Date.now() + Math.random(), row: closestCell.row, col: closestCell.col, color: currentBubbleColor, type: 'normal' };
        setShootingBubble({ bubble: shotBubble, start: { x: shooterPosition.x, y: shooterPosition.y }, end: landingPos });
    }
  };

  const handleAnimationEnd = () => {
    if (shootingBubble) {
      onShot(shootingBubble.bubble);
      setShootingBubble(null);
    }
  };

  return (
    <div
      ref={boardRef}
      className="relative bg-card/50 rounded-lg shadow-inner overflow-hidden"
      style={{ width: BOARD_PIXEL_WIDTH, height: BOARD_PIXEL_HEIGHT + 80, cursor: isAdvancing || shootingBubble ? 'wait' : 'pointer' }}
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

      {shootingBubble && (
        <div onAnimationEnd={handleAnimationEnd}>
          <style>{`
            @keyframes shoot-bubble {
              to {
                transform: translate(${shootingBubble.end.x}px, ${shootingBubble.end.y}px);
              }
            }
            .shooting-bubble {
              animation: shoot-bubble 0.2s linear forwards;
            }
          `}</style>
          <SingleBubble
            bubble={shootingBubble.bubble}
            x={shootingBubble.start.x}
            y={shootingBubble.start.y}
            className="shooting-bubble z-10"
          />
        </div>
      )}

      {/* Cannon and Aiming UI */}
      {!isGameOver && (
          <div className="absolute" style={{ left: shooterPosition.x - 10, top: shooterPosition.y - 10 }}>
              {/* Cannon Base */}
              <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center shadow-lg">
                  <div className="w-16 h-16 bg-card rounded-full" />
              </div>

              {/* Cannon Barrel and Arrow */}
              <div
                className="absolute w-20 h-20 top-0 left-0 flex justify-center pointer-events-none"
                style={{
                    transform: `rotate(${aimAngle + 90}deg)`,
                    transformOrigin: 'center center',
                    transition: 'transform 0.1s ease-out'
                }}
              >
                  {/* Barrel */}
                  <div className="absolute top-[-20px] w-8 h-12 bg-muted rounded-t-md shadow-inner" />
                  
                  {/* Arrow */}
                  {!isAdvancing && !shootingBubble && (
                    <svg
                      width="12"
                      height="100"
                      viewBox="0 0 12 100"
                      className="absolute -top-24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <defs>
                        <linearGradient id="arrow-gradient" x1="0.5" y1="0" x2="0.5" y2="1">
                          <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0" />
                          <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.8" />
                        </linearGradient>
                      </defs>
                      <path d="M6 100 L6 10" stroke="url(#arrow-gradient)" strokeWidth="2" />
                      <path d="M6 0 L11 10 L1 10 Z" fill="hsl(var(--primary))" />
                    </svg>
                  )}
              </div>

              {/* Current Bubble */}
              {!isAdvancing && !shootingBubble && (
                  <div className="absolute pointer-events-none" style={{ left: 10, top: 10 }}>
                      <SingleBubble bubble={{id: -2, row: -1, col: -1, color: currentBubbleColor, type: 'normal'}} x={0} y={0} />
                  </div>
              )}
          </div>
      )}

      {/* Next Bubble */}
      {!isGameOver && !isAdvancing && (
        <div className="absolute pointer-events-none" style={{ right: BUBBLE_RADIUS, bottom: BUBBLE_RADIUS, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="text-sm font-bold text-primary">Next:</span>
            <div className="w-8 h-8 rounded-full" style={{ backgroundColor: COLOR_MAP[nextBubbleColor] }}></div>
        </div>
      )}
      
      <div 
        className="absolute w-full border-t-2 border-dashed border-red-500/50 pointer-events-none"
        style={{ top: GAME_OVER_ROW * HEX_HEIGHT }}
      />
    </div>
  );
}

    