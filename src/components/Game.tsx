"use client";

import { useGameLogic } from '@/hooks/use-game-logic';
import GameBoard from './GameBoard';
import Leaderboard from './Leaderboard';
import GameOverDialog from './GameOverDialog';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import type { LeaderboardEntry } from '@/lib/types';
import { Button } from './ui/button';
import { RefreshCw, Trophy, Zap } from 'lucide-react';
import { COLOR_MAP } from '@/lib/game-constants';

interface GameProps {
  player: { name: string };
  leaderboard: LeaderboardEntry[];
  onGameOver: (name: string, score: number) => void;
  onPlayAgain: () => void;
}

export default function Game({ player, leaderboard, onGameOver, onPlayAgain }: GameProps) {
  const {
    board,
    currentBubble,
    nextBubble,
    score,
    shotsRemaining,
    isGameOver,
    handleShot,
    resetGame,
    isAdvancing,
  } = useGameLogic(player, onGameOver);
  
  const handleReset = () => {
    onPlayAgain();
    resetGame();
  }

  return (
    <main className="flex flex-col min-h-screen items-center justify-center gap-4 p-4 sm:p-8 bg-background overflow-hidden">
      <div className="w-full max-w-4xl flex justify-between items-center px-4">
        <h1 className="text-3xl font-bold text-primary">Bubble Burst Blitz</h1>
        <Button onClick={handleReset} size="lg">
            <RefreshCw className="mr-2 h-4 w-4" />
            New Game
        </Button>
      </div>

      <Leaderboard entries={leaderboard} currentPlayer={player.name} />
      
      <div className="w-full flex justify-center items-start gap-8">
        <aside className="w-40 flex flex-col gap-6 items-center">
            <Card className="shadow-lg w-full">
                <CardHeader className="p-4">
                    <CardTitle className="text-center text-lg font-bold text-primary flex items-center justify-center gap-2">
                        <Trophy className="w-5 h-5 text-yellow-400"/> Score
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0 text-center">
                    <p className="text-3xl font-bold">{score}</p>
                </CardContent>
            </Card>
        </aside>

        <GameBoard
          board={board}
          onShot={handleShot}
          currentBubbleColor={currentBubble.color}
          isGameOver={isGameOver}
          isAdvancing={isAdvancing}
        />

        <aside className="w-40 flex flex-col gap-6 items-center">
            <Card className="shadow-lg w-full">
                <CardHeader className="p-4">
                    <CardTitle className="text-center text-lg font-bold text-primary flex items-center justify-center gap-2">
                        <Zap className="w-5 h-5 text-green-400"/> Shots
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0 text-center">
                    <p className="text-3xl font-bold">{shotsRemaining}</p>
                </CardContent>
            </Card>
            <Card className="w-full">
                <CardHeader className="pb-2 pt-4">
                    <CardTitle className="text-lg text-center">Next Up</CardTitle>
                </CardHeader>
                <CardContent className="flex items-center justify-center gap-4 pt-2">
                    <div className="w-10 h-10 rounded-full" style={{ backgroundColor: COLOR_MAP[currentBubble.color] }}></div>
                    <div className="w-8 h-8 rounded-full opacity-70" style={{ backgroundColor: COLOR_MAP[nextBubble.color] }}></div>
                </CardContent>
            </Card>
        </aside>

      </div>
      <GameOverDialog isOpen={isGameOver} score={score} onPlayAgain={handleReset} />
    </main>
  );
}
