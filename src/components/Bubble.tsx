import { BUBBLE_DIAMETER, COLOR_MAP } from '@/lib/game-constants';
import type { Bubble } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Lock } from 'lucide-react';

interface BubbleProps {
  bubble: Bubble;
  x: number;
  y: number;
}

export default function SingleBubble({ bubble, x, y }: BubbleProps) {
  const animationClass = bubble.status === 'popping' 
    ? 'animate-bubble-pop' 
    : bubble.status === 'falling'
    ? 'animate-bubble-fall'
    : '';

  return (
    <div
      className={cn("absolute rounded-full flex items-center justify-center transition-all duration-300 ease-out", animationClass)}
      style={{
        width: BUBBLE_DIAMETER,
        height: BUBBLE_DIAMETER,
        transform: `translate(${x}px, ${y}px)`,
        backgroundColor: COLOR_MAP[bubble.color],
        boxShadow: 'inset 0 -4px 8px rgba(0,0,0,0.2), inset 0 4px 4px rgba(255,255,255,0.4)',
      }}
    >
      {bubble.type === 'locked' && <Lock className="w-4 h-4 text-white" />}
    </div>
  );
}
