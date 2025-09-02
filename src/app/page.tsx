"use client";

import { useState } from "react";
import Registration from "@/components/Registration";
import Game from "@/components/Game";
import type { LeaderboardEntry } from "@/lib/types";

const initialLeaderboard: LeaderboardEntry[] = [
  { name: "Bubblina", score: 15000 },
  { name: "Pop-Master", score: 12500 },
  { name: "Sir Burst-a-Lot", score: 9800 },
  { name: "Bubble-Wan Kenobi", score: 7200 },
];

export default function Home() {
  const [player, setPlayer] = useState<{ name: string } | null>(null);
  const [leaderboard, setLeaderboard] =
    useState<LeaderboardEntry[]>(initialLeaderboard);

  const handleRegister = (name: string) => {
    const newPlayer = { name, score: 0 };
    setPlayer({ name });
    const existingPlayer = leaderboard.find(p => p.name === name);
    if (!existingPlayer) {
      setLeaderboard(prev => [...prev, newPlayer].sort((a,b) => b.score - a.score));
    }
  };

  const updateLeaderboard = (name: string, score: number) => {
    setLeaderboard(prev => {
      const otherPlayers = prev.filter(p => p.name !== name);
      const updatedPlayer = { name, score };
      return [...otherPlayers, updatedPlayer].sort((a,b) => b.score - a.score);
    })
  };

  const handlePlayAgain = () => {
    if (player) {
      updateLeaderboard(player.name, 0);
    }
  };

  if (!player) {
    return <Registration onRegister={handleRegister} />;
  }

  return (
    <Game
      player={player}
      leaderboard={leaderboard}
      onGameOver={updateLeaderboard}
      onPlayAgain={handlePlayAgain}
    />
  );
}
