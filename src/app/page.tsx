"use client";

import { useState, useEffect, useCallback } from "react";
import Registration from "@/components/Registration";
import Game from "@/components/Game";
import type { LeaderboardEntry } from "@/lib/types";
import { getLeaderboard, updatePlayerScore } from "./actions";

export default function Home() {
  const [player, setPlayer] = useState<{ name: string } | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);

  // Function to fetch the leaderboard
  const fetchLeaderboard = useCallback(async () => {
    const data = await getLeaderboard();
    setLeaderboard(data);
  }, []);

  // Fetch initial leaderboard data when the component mounts
  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  const handleRegister = async (name: string) => {
    await updatePlayerScore(name, 0); // Add player to leaderboard
    setPlayer({ name });
    fetchLeaderboard(); // Refresh leaderboard after registering
  };

  const updateLeaderboard = useCallback(async (name: string, score: number) => {
    await updatePlayerScore(name, score);
    fetchLeaderboard(); // Refresh leaderboard after score update
  }, [fetchLeaderboard]);

  const handlePlayAgain = async () => {
    if (player) {
      // Reset score to 0, but keep player on the leaderboard
      await updatePlayerScore(player.name, 0);
      fetchLeaderboard(); // Refresh leaderboard
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