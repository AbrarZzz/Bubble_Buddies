"use client";

import { useState, useEffect } from "react";
import Registration from "@/components/Registration";
import Game from "@/components/Game";
import type { LeaderboardEntry } from "@/lib/types";
import { getLeaderboard, updatePlayerScore } from "./actions";

export default function Home() {
  const [player, setPlayer] = useState<{ name: string } | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      const data = await getLeaderboard();
      setLeaderboard(data);
    };

    if (player) {
      fetchLeaderboard();
    }
  }, [player]);

  const handleRegister = async (name: string) => {
    setPlayer({ name });
    await updatePlayerScore(name, 0);
    const data = await getLeaderboard();
    setLeaderboard(data);
  };

  const updateLeaderboard = async (name: string, score: number) => {
    await updatePlayerScore(name, score);
    const data = await getLeaderboard();
    setLeaderboard(data);
  };

  const handlePlayAgain = async () => {
    if (player) {
      await updatePlayerScore(player.name, 0);
      const data = await getLeaderboard();
      setLeaderboard(data);
    }
  };

  if (!player) {
    return <Registration onRegister={handleRegister} />;
  }

  return (
    <Game
      player={player}
      leaderboard={leaderboard}
      onScoreUpdate={updateLeaderboard}
      onPlayAgain={handlePlayAgain}
    />
  );
}
