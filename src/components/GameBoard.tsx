
"use client";

import { useRef, useState, useMemo, useCallback, useEffect } from 'react';
import type { GameBoard, Bubble, BubbleColor } from '@/lib/types';
import { BUBBLE_DIAMETER_BASE, BUBBLE_RADIUS_BASE, BOARD_COLS, BOARD_ROWS, GAME_OVER_ROW, HEX_HEIGHT_RATIO, COLOR_MAP } from '@/lib/game-constants';
import SingleBubble from './Bubble';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';


interface GameBoardProps {
  board: GameBoard;
  onShot: (bubble: Bubble) => void;
  currentBubbleColor: BubbleColor;
  nextBubbleColor: BubbleColor;
  isGameOver: boolean;
  isAdvancing: boolean;
}

export default function GameBoard({ board, onShot, currentBubbleColor, nextBubbleColor, isGameOver, isAdvancing }: GameBoardProps) {
  const boardRef = useRef<HTMLDivElement>(null);
  const [aimAngle, setAimAngle] = useState(0);
  const [shootingBubble, setShootingBubble] = useState<{ bubble: Bubble; start: { x: number; y: number }; end: { x: number; y: number } } | null>(null);
  const [trajectory, setTrajectory] = useState<string>("");
  const isMobile = useIsMobile();
  const [scale, setScale] = useState(1);
  
  const BUBBLE_DIAMETER = BUBBLE_DIAMETER_BASE * scale;
  const BUBBLE_RADIUS = BUBBLE_RADIUS_BASE * scale;
  const HEX_HEIGHT = BUBBLE_DIAMETER * HEX_HEIGHT_RATIO;
  
  const BOARD_PIXEL_WIDTH = BOARD_COLS * BUBBLE_DIAMETER + BUBBLE_RADIUS;
  const BOARD_PIXEL_HEIGHT = (BOARD_ROWS - 1) * HEX_HEIGHT + BUBBLE_DIAMETER;

  useEffect(() => {
    const calculateScale = () => {
      const baseBoardWidth = BOARD_COLS * BUBBLE_DIAMETER_BASE + BUBBLE_RADIUS_BASE;
      const screenWidth = window.innerWidth;
      const availableWidth = isMobile ? screenWidth - 16 : 480; // p-2 on each side for mobile
      const newScale = Math.min(1, availableWidth / baseBoardWidth);
      setScale(newScale);
    };

    calculateScale();
    window.addEventListener('resize', calculateScale);
    return () => window.removeEventListener('resize', calculateScale);
  }, [isMobile]);

  const getBubblePixelPosition = useCallback((row: number, col: number) => {
    const x = col * BUBBLE_DIAMETER + (row % 2 === 1 ? BUBBLE_RADIUS : 0);
    const y = row * HEX_HEIGHT;
    return { x, y };
  }, [BUBBLE_DIAMETER, BUBBLE_RADIUS, HEX_HEIGHT]);

  const shooterPosition = useMemo(() => ({
    x: BOARD_PIXEL_WIDTH / 2 - BUBBLE_RADIUS,
    y: BOARD_PIXEL_HEIGHT + (isMobile ? 10 : 20),
  }), [BOARD_PIXEL_WIDTH, BOARD_PIXEL_HEIGHT, BUBBLE_RADIUS, isMobile]);

  const calculateTrajectory = (angle: number) => {
    const angleRad = angle * Math.PI / 180;
    
    let x = shooterPosition.x + BUBBLE_RADIUS;
    let y = shooterPosition.y + BUBBLE_RADIUS;
    let dx = Math.cos(angleRad) * 8 * scale;
    let dy = Math.sin(angleRad) * 8 * scale;

    const points = [`${x},${y}`];

    for (let i = 0; i < 100; i++) { // Limit simulation steps
      x += dx;
      y += dy;

      if (x < BUBBLE_RADIUS || x > BOARD_PIXEL_WIDTH - BUBBLE_RADIUS) {
        dx *= -1; // Bounce off walls
        points.push(`${x},${y}`);
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
      if(hit || y < 0) {
        points.push(`${x},${y}`);
        break;
      }
    }
    setTrajectory(points.join(' '));
  }

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isGameOver || !boardRef.current || isAdvancing || shootingBubble) {
      if (trajectory !== "") setTrajectory("");
      return;
    };
    const rect = boardRef.current.getBoundingClientRect();
    const cannonCenterX = shooterPosition.x + BUBBLE_RADIUS;
    const cannonCenterY = shooterPosition.y + BUBBLE_RADIUS;
    const x = e.clientX - rect.left - cannonCenterX;
    const y = e.clientY - rect.top - cannonCenterY;
    const angle = Math.atan2(y, x) * 180 / Math.PI;
    if (angle < -170 || angle > -10) {
        if (trajectory !== "") setTrajectory("");
        return;
    };
    setAimAngle(angle);
    calculateTrajectory(angle);
  };

  const handleClick = () => {
    if (isGameOver || isAdvancing || shootingBubble || aimAngle === 0) return;

    const angleRad = aimAngle * Math.PI / 180;
    
    // Simplified trajectory simulation to find landing spot
    let x = shooterPosition.x + BUBBLE_RADIUS;
    let y = shooterPosition.y;
    let dx = Math.cos(angleRad) * 8 * scale;
    let dy = Math.sin(angleRad) * 8 * scale;

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
                    (r > 0 && board[r - 1]?.[c + (r % 2 === 1 ? 0 : -1)]) || // Top-left
                    (r > 0 && board[r - 1]?.[c + (r % 2 === 1 ? 1 : 0)]) || // Top-right
                    (c > 0 && board[r]?.[c - 1]) || // Left
                    (c < BOARD_COLS - 1 && board[r]?.[c + 1]) || // Right
                    (r < BOARD_ROWS - 1 && board[r + 1]?.[c + (r % 2 === 0 ? 0 : -1)]) || // Bottom-left
                    (r < BOARD_ROWS - 1 && board[r + 1]?.[c + (r % 2 === 0 ? 1 : 0)]) || // Bottom-right
                    (r === 0);
                
                if (isNeighborToExisting && dist < closestCell.dist) {
                    closestCell = { row: r, col: c, dist };
                }
            }
        }
    }
    
    if (closestCell.row !== -1) {
        const landingPos = getBubblePixelPosition(closestCell.row, closestCell.col);
        const shotBubble: Bubble = { id: Date.now() + Math.random(), row: closestCell.row, col: closestCell.col, color: currentBubbleColor, type: 'normal' };
        setShootingBubble({ bubble: shotBubble, start: { x: shooterPosition.x, y: shooterPosition.y }, end: landingPos });
        setTrajectory("");
        setAimAngle(0);
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
      className="relative bg-card/50 rounded-lg shadow-inner touch-none"
      style={{ width: BOARD_PIXEL_WIDTH, height: BOARD_PIXEL_HEIGHT + (isMobile ? 50 : 80), cursor: isAdvancing || shootingBubble ? 'wait' : 'crosshair' }}
      onPointerMove={handlePointerMove}
      onClick={handleClick}
      onPointerLeave={() => setTrajectory("")}
    >
      <div className={cn("absolute top-0 left-0 w-full h-full transition-transform duration-500 ease-in-out", isAdvancing && 'translate-y-[--hex-height]') } style={{ '--hex-height': `${HEX_HEIGHT}px` } as React.CSSProperties}>
      {board.map((row, r) =>
        row.map((bubble, c) => {
          if (!bubble) return null;
          const { x, y } = getBubblePixelPosition(r, c);
          return <SingleBubble key={bubble.id} bubble={bubble} x={x} y={y} scale={scale} />;
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
            scale={scale}
          />
        </div>
      )}

      {/* Aiming UI */}
      {!isGameOver && !shootingBubble && (
        <>
            <svg className="absolute top-0 left-0 w-full h-full pointer-events-none">
              <polyline
                  points={trajectory}
                  stroke="hsl(var(--primary))"
                  strokeWidth="2"
                  strokeDasharray="4 4"
                  fill="none"
                  opacity="0.7"
              />
            </svg>
            <div className="absolute" style={{ left: shooterPosition.x, top: shooterPosition.y }}>
              {/* Current Bubble */}
              {!isAdvancing && !shootingBubble && (
                  <div className="absolute pointer-events-none">
                      <SingleBubble bubble={{id: -1, row: -1, col: -1, color: currentBubbleColor, type: 'normal'}} x={0} y={0} scale={scale} />
                  </div>
              )}
            </div>
        </>
      )}

      {/* Next Bubble */}
      {!isGameOver && !isAdvancing && (
        <div className="absolute pointer-events-none" style={{ left: BUBBLE_RADIUS, bottom: BUBBLE_RADIUS, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="text-sm font-bold text-primary">Next:</span>
            <div className="rounded-full" style={{ width: BUBBLE_DIAMETER * 0.8, height: BUBBLE_DIAMETER * 0.8, backgroundColor: COLOR_MAP[nextBubbleColor] }}></div>
        </div>
      )}
      
      <div 
        className="absolute w-full border-t-2 border-dashed border-red-500/50 pointer-events-none"
        style={{ top: GAME_OVER_ROW * HEX_HEIGHT }}
      />
    </div>
  );
}
