"use client";

import { useRef, useState, useMemo, useCallback } from 'react';
import type { GameBoard, Bubble, BubbleColor } from '@/lib/types';
import { BUBBLE_DIAMETER, BUBBLE_RADIUS, BOARD_COLS, BOARD_ROWS, GAME_OVER_ROW } from '@/lib/game-constants';
import SingleBubble from './Bubble';
import { MoveUp } from 'lucide-react';

interface GameBoardProps {
  board: GameBoard;
  onShot: (bubble: Bubble) => void;
  currentBubbleColor: BubbleColor;
  isGameOver: boolean;
}

const HEX_HEIGHT = BUBBLE_DIAMETER * 0.866; // Math.sqrt(3) / 2 * diameter
const BOARD_PIXEL_WIDTH = BOARD_COLS * BUBBLE_DIAMETER + BUBBLE_RADIUS;
const BOARD_PIXEL_HEIGHT = (BOARD_ROWS -1) * HEX_HEIGHT + BUBBLE_DIAMETER;

export default function GameBoard({ board, onShot, currentBubbleColor, isGameOver }: GameBoardProps) {
  const boardRef = useRef<HTMLDivElement>(null);
  const [aimAngle, setAimAngle] = useState(0);
  const [shootingBubble, setShootingBubble] = useState<Bubble | null>(null);

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
    if (isGameOver || !boardRef.current || shootingBubble) return;
    const rect = boardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - shooterPosition.x - BUBBLE_RADIUS;
    const y = e.clientY - rect.top - shooterPosition.y - BUBBLE_RADIUS;
    const angle = Math.atan2(y, x) * 180 / Math.PI;
    if (angle < -170 || angle > -10) return;
    setAimAngle(angle);
  };

  const handleClick = () => {
    if (isGameOver || shootingBubble) return;

    const angleRad = aimAngle * Math.PI / 180;
    let x = shooterPosition.x + BUBBLE_RADIUS;
    let y = shooterPosition.y + BUBBLE_RADIUS;
    let dx = Math.cos(angleRad);
    let dy = Math.sin(angleRad);

    let landingPoint = { x, y };
    
    // Simplified trajectory simulation to find landing spot
    while (y > -BUBBLE_DIAMETER) {
        x += dx * 2;
        y += dy * 2;

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
    landingPoint = {x, y};

    let closestCell = { row: -1, col: -1, dist: Infinity };
    for (let r = 0; r < BOARD_ROWS; r++) {
        for (let c = 0; c < BOARD_COLS; c++) {
            if (!board[r][c]) {
                const cellPos = getBubblePixelPosition(r, c);
                const dist = Math.sqrt(Math.pow(landingPoint.x - (cellPos.x + BUBBLE_RADIUS), 2) + Math.pow(landingPoint.y - (cellPos.y + BUBBLE_RADIUS), 2));
                
                // Find nearest valid empty cell
                if (dist < closestCell.dist) {
                    closestCell = { row: r, col: c, dist };
                }
            }
        }
    }
    
    if (closestCell.row !== -1) {
        const shotBubble: Bubble = { id: Date.now(), row: closestCell.row, col: closestCell.col, color: currentBubbleColor, type: 'normal' };
        setShootingBubble(shotBubble);
        
        setTimeout(() => {
            onShot(shotBubble);
            setShootingBubble(null);
        }, 300);
    }
  };


  return (
    <div
      ref={boardRef}
      className="relative bg-card/50 rounded-lg shadow-inner overflow-hidden cursor-pointer"
      style={{ width: BOARD_PIXEL_WIDTH, height: BOARD_PIXEL_HEIGHT + 60 }}
      onMouseMove={handleMouseMove}
      onClick={handleClick}
    >
      {board.map((row, r) =>
        row.map((bubble, c) => {
          if (!bubble) return null;
          const { x, y } = getBubblePixelPosition(r, c);
          return <SingleBubble key={bubble.id} bubble={bubble} x={x} y={y} />;
        })
      )}

      {shootingBubble && (
        <div 
          className="absolute animate-bubble-shoot" 
          style={{
            '--start-x': `${shooterPosition.x}px`,
            '--start-y': `${shooterPosition.y}px`,
            '--end-x': `${getBubblePixelPosition(shootingBubble.row, shootingBubble.col).x}px`,
            '--end-y': `${getBubblePixelPosition(shootingBubble.row, shootingBubble.col).y}px`,
          } as React.CSSProperties}
          >
          <SingleBubble bubble={shootingBubble} x={0} y={0} />
        </div>
      )}

      {!isGameOver && !shootingBubble && (
          <>
            <div className="absolute pointer-events-none" style={{ left: shooterPosition.x, top: shooterPosition.y }}>
                <SingleBubble bubble={{id: -1, row: -1, col: -1, color: currentBubbleColor, type: 'normal'}} x={0} y={0} />
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
              <div className="w-1.5 h-24 rounded-t-full bg-gradient-to-t from-primary/80 to-transparent flex justify-center items-start pt-2">
                <MoveUp className="w-6 h-6 text-white/80" />
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
