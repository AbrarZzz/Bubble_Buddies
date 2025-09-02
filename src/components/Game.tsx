"use client";

import { useGameLogic } from '@/hooks/use-game-logic';
import GameBoard from './GameBoard';
import Leaderboard from './Leaderboard';
import GameOverDialog from './GameOverDialog';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import type { LeaderboardEntry } from '@/lib/types';
import { Button } from './ui/button';
import { RefreshCw, Trophy, Zap, ArrowDown } from 'lucide-react';
import { COLOR_MAP, SHOTS_UNTIL_BOARD_ADVANCE } from '@/lib/game-constants';

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
    shotsUntilAdvance,
  } = useGameLogic(player, onGameOver);
  
  const handleReset = () => {
    onPlayAgain();
    resetGame();
  }

  return (
    <main className="flex flex-col lg:flex-row min-h-screen items-center justify-center gap-8 p-4 sm:p-8 bg-background overflow-hidden">
      <div className="w-full lg:w-auto flex flex-col items-center gap-4">
        <GameBoard
          board={board}
          onShot={handleShot}
          currentBubbleColor={currentBubble.color}
          isGameOver={isGameOver}
          isAdvancing={isAdvancing}
        />
      </div>
      <aside className="w-full lg:w-80 flex flex-col gap-6">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-center text-2xl font-bold text-primary">
              Bubble Burst Blitz
            </CardTitle>
          </CardHeader>
          <CardContent className="flex justify-around text-center">
            <div>
              <p className="text-sm text-muted-foreground">Score</p>
              <p className="text-2xl font-bold flex items-center gap-2"><Trophy className="w-5 h-5 text-yellow-400"/> {score}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Shots</p>
              <p className="text-2xl font-bold flex items-center gap-2"><Zap className="w-5 h-5 text-green-400"/> {shotsRemaining}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="text-xl">Next Up</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-center gap-4 pt-2">
                <div className="w-10 h-10 rounded-full" style={{ backgroundColor: COLOR_MAP[currentBubble.color] }}></div>
                <div className="w-8 h-8 rounded-full opacity-70" style={{ backgroundColor: COLOR_MAP[nextBubble.color] }}></div>
            </CardContent>
        </Card>
        
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="text-xl flex items-center gap-2">
                    <ArrowDown className="w-5 h-5"/> Next Advance
                </CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-center gap-4 pt-2">
                <p className="text-2xl font-bold">{shotsUntilAdvance}</p>
                <p className="text-muted-foreground">shots</p>
            </CardContent>
        </Card>

        <Leaderboard entries={leaderboard} currentPlayer={player.name} />
        
        <Button onClick={handleReset} size="lg" className="w-full">
            <RefreshCw className="mr-2 h-4 w-4" />
            New Game
        </Button>
      </aside>
      <GameOverDialog isOpen={isGameOver} score={score} onPlayAgain={handleReset} />
    </main>
  );
}
