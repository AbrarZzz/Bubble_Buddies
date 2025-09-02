"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from './ui/button';

interface GameOverDialogProps {
  isOpen: boolean;
  score: number;
  onPlayAgain: () => void;
}

export default function GameOverDialog({ isOpen, score, onPlayAgain }: GameOverDialogProps) {
  return (
    <AlertDialog open={isOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="text-3xl text-center text-primary">Game Over!</AlertDialogTitle>
          <AlertDialogDescription className="text-center text-lg pt-4">
            You scored
            <span className="font-bold text-xl text-foreground"> {score} </span>
            points!
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <Button onClick={onPlayAgain} className="w-full" size="lg">
            Play Again
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
