"use client";

import { useRef, useState, useMemo, useEffect, useCallback } from 'react';
import type { GameBoard, Bubble, BubbleColor } from '@/lib/types';
import { BUBBLE_DIAMETER, BUBBLE_RADIUS, BOARD_COLS, BOARD_ROWS, COLOR_MAP, GAME_OVER_ROW } from '@/lib/game-constants';
import SingleBubble from './Bubble';
import { ArrowUp } from 'lucide-react';

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
  const [trajectory, setTrajectory] = useState<{ x: number, y: number }[]>([]);

  const getBubblePixelPosition = (row: number, col: number) => {
    const x = col * BUBBLE_DIAMETER + (row % 2 === 1 ? BUBBLE_RADIUS : 0);
    const y = row * HEX_HEIGHT;
    return { x, y };
  };

  const shooterPosition = useMemo(() => ({
    x: BOARD_PIXEL_WIDTH / 2 - BUBBLE_RADIUS,
    y: BOARD_PIXEL_HEIGHT + 10,
  }), []);

  const calculateTrajectory = useCallback((angle: number): { x: number, y: number }[] => {
    const points: { x: number, y: number }[] = [];
    const angleRad = angle * Math.PI / 180;
    
    let x = shooterPosition.x + BUBBLE_RADIUS;
    let y = shooterPosition.y + BUBBLE_RADIUS;
    points.push({ x, y });
    
    let dx = Math.cos(angleRad);
    let dy = Math.sin(angleRad);

    for (let i = 0; i < 5; i++) { // Max 5 bounces
        let wallHit = false;
        
        // Ray-casting loop
        let lastX = x;
        let lastY = y;

        let step = 0;
        const maxSteps = 200; // Prevent infinite loops

        while(step < maxSteps) {
            x += dx * 5;
            y += dy * 5;
            
            if (x < BUBBLE_RADIUS || x > BOARD_PIXEL_WIDTH - BUBBLE_RADIUS) {
                x = Math.max(BUBBLE_RADIUS, Math.min(x, BOARD_PIXEL_WIDTH - BUBBLE_RADIUS));
                dx *= -1;
                wallHit = true;
                break;
            }

            let bubbleHit = false;
            for (let r = 0; r < BOARD_ROWS; r++) {
                for (let c = 0; c < BOARD_COLS; c++) {
                    if (board[r][c]) {
                        const bubblePos = getBubblePixelPosition(r, c);
                        const dist = Math.sqrt(Math.pow(x - (bubblePos.x + BUBBLE_RADIUS), 2) + Math.pow(y - (bubblePos.y + BUBBLE_RADIUS), 2));
                        if (dist < BUBBLE_DIAMETER) {
                            bubbleHit = true;
                            break;
                        }
                    }
                }
                if (bubbleHit) break;
            }

            if (bubbleHit || y < -BUBBLE_DIAMETER) {
                break;
            }

            step++;
        }

        points.push({ x, y });
        if (!wallHit) break;
    }

    return points;
}, [shooterPosition, board]);


  useEffect(() => {
    if (!isGameOver) {
      setTrajectory(calculateTrajectory(aimAngle));
    } else {
      setTrajectory([]);
    }
  }, [aimAngle, isGameOver, calculateTrajectory]);


  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isGameOver || !boardRef.current) return;
    const rect = boardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - shooterPosition.x - BUBBLE_RADIUS;
    const y = e.clientY - rect.top - shooterPosition.y - BUBBLE_RADIUS;
    const angle = Math.atan2(y, x) * 180 / Math.PI;
    if (angle < -170 || angle > -10) return;
    setAimAngle(angle);
  };

  const handleClick = () => {
    if (isGameOver || trajectory.length < 2) return;
    
    const landingPoint = trajectory[trajectory.length - 1];

    // Find closest grid cell to landing position
    let closestCell = { row: -1, col: -1, dist: Infinity };
    for (let r = 0; r < BOARD_ROWS; r++) {
        for (let c = 0; c < BOARD_COLS; c++) {
            if (!board[r][c]) {
                const cellPos = getBubblePixelPosition(r, c);
                const dist = Math.sqrt(Math.pow(landingPoint.x - (cellPos.x + BUBBLE_RADIUS), 2) + Math.pow(landingPoint.y - (cellPos.y + BUBBLE_RADIUS), 2));
                if (dist < closestCell.dist && dist < BUBBLE_DIAMETER * 1.5) { // Only consider nearby cells
                    closestCell = { row: r, col: c, dist };
                }
            }
        }
    }
    
    if (closestCell.row !== -1) {
        onShot({ id: -1, row: closestCell.row, col: closestCell.col, color: currentBubbleColor, type: 'normal' });
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
        <svg className="absolute top-0 left-0 w-full h-full pointer-events-none">
            {trajectory.length > 1 && (
                <polyline
                    points={trajectory.map(p => `${p.x},${p.y}`).join(' ')}
                    stroke="hsl(var(--primary))"
                    strokeWidth="2"
                    strokeDasharray="4 4"
                    fill="none"
                    opacity={0.7}
                />
            )}
        </svg>

      {board.map((row, r) =>
        row.map((bubble, c) => {
          if (!bubble) return null;
          const { x, y } = getBubblePixelPosition(r, c);
          return <SingleBubble key={bubble.id} bubble={bubble} x={x} y={y} />;
        })
      )}

      {!isGameOver && (
          <>
            <div className="absolute pointer-events-none" style={{ left: shooterPosition.x, top: shooterPosition.y }}>
                <SingleBubble bubble={{id: -1, row: -1, col: -1, color: currentBubbleColor, type: 'normal'}} x={0} y={0} />
            </div>
            <div
                className="absolute origin-bottom-center pointer-events-none"
                style={{
                    left: shooterPosition.x + BUBBLE_RADIUS,
                    bottom: BUBBLE_DIAMETER + 5,
                    transform: `rotate(${aimAngle + 90}deg)`,
                    transformOrigin: 'bottom center',
                    transition: 'transform 0.1s ease-out'
                }}
            >
                <div className="w-1 h-20 bg-primary/50 rounded-full flex justify-center">
                    <ArrowUp className="w-6 h-6 text-primary absolute -top-2" />
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
