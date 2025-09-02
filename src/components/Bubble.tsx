import { BUBBLE_DIAMETER_BASE, COLOR_MAP } from '@/lib/game-constants';
import type { Bubble } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Lock } from 'lucide-react';

interface BubbleProps {
  bubble: Bubble;
  x: number;
  y: number;
  scale: number;
  className?: string;
  onAnimationEnd?: () => void;
}

export default function SingleBubble({ bubble, x, y, scale, className, onAnimationEnd }: BubbleProps) {
  const animationClass = bubble.status === 'popping' 
    ? 'animate-bubble-pop' 
    : bubble.status === 'falling'
    ? 'animate-bubble-fall'
    : '';

  const bubbleSize = BUBBLE_DIAMETER_BASE * scale;

  return (
    <div
      onAnimationEnd={onAnimationEnd}
      className={cn("absolute rounded-full flex items-center justify-center", animationClass, className)}
      style={{
        width: bubbleSize,
        height: bubbleSize,
        transform: `translate(${x}px, ${y}px)`,
        backgroundColor: COLOR_MAP[bubble.color],
        boxShadow: `inset 0 -${4*scale}px ${8*scale}px rgba(0,0,0,0.2), inset 0 ${4*scale}px ${4*scale}px rgba(255,255,255,0.4)`,
      }}
    >
      {bubble.type === 'locked' && <Lock style={{ width: 16 * scale, height: 16 * scale}} className="text-white" />}
    </div>
  );
}
