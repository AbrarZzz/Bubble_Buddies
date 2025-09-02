"use client";

import { useGameLogic } from '@/hooks/use-game-logic';
import GameBoard from './GameBoard';
import Leaderboard from './Leaderboard';
import GameOverDialog from './GameOverDialog';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import type { LeaderboardEntry } from '@/lib/types';
import { Button } from './ui/button';
import { RefreshCw, Trophy, Zap } from 'lucide-react';

interface GameProps {
  player: { name: string };
  leaderboard: LeaderboardEntry[];
  onScoreUpdate: (name: string, score: number) => void;
  onPlayAgain: () => void;
}

export default function Game({ player, leaderboard, onScoreUpdate, onPlayAgain }: GameProps) {
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
  } = useGameLogic(player, onScoreUpdate);
  
  const handleReset = () => {
    onPlayAgain();
    resetGame();
  }

  return (
    <main className="flex flex-col lg:flex-row min-h-screen items-center justify-center gap-8 p-4 sm:p-8 bg-background overflow-hidden">
      <div className="w-full lg:w-auto flex flex-col items-center gap-4">
        <div className="w-full flex justify-between items-center px-4">
            <h1 className="text-3xl font-bold text-primary">Bubble Buddies</h1>
            <Button onClick={handleReset}>
                <RefreshCw className="mr-2 h-4 w-4" />
                New Game
            </Button>
        </div>
        <GameBoard
          board={board}
          onShot={handleShot}
          currentBubbleColor={currentBubble.color}
          nextBubbleColor={nextBubble.color}
          isGameOver={isGameOver}
          isAdvancing={isAdvancing}
        />
        <div className="w-full max-w-md flex justify-around items-center">
          <Card className="shadow-lg">
              <CardHeader className="p-4">
                  <CardTitle className="text-center text-lg font-bold text-primary flex items-center justify-center gap-2">
                      <Trophy className="w-5 h-5 text-yellow-400"/> Score
                  </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0 text-center">
                  <p className="text-3xl font-bold">{score}</p>
              </CardContent>
          </Card>
          <Card className="shadow-lg">
              <CardHeader className="p-4">
                  <CardTitle className="text-center text-lg font-bold text-primary flex items-center justify-center gap-2">
                      <Zap className="w-5 h-5 text-green-400"/> Shots
                  </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0 text-center">
                  <p className="text-3xl font-bold">{shotsRemaining}</p>
              </CardContent>
          </Card>
        </div>
      </div>

      <aside className="w-full lg:w-72 flex flex-col gap-6 items-center">
          <Leaderboard entries={leaderboard} currentPlayer={player.name} />
      </aside>

      <GameOverDialog isOpen={isGameOver} score={score} onPlayAgain={handleReset} />
    </main>
  );
}
