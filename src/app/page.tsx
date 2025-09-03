"use client";

import { useState, useEffect, useCallback } from "react";
import Registration from "@/components/Registration";
import Game from "@/components/Game";
import type { LeaderboardEntry } from "@/lib/types";
import { getLeaderboard, updatePlayerScore } from "./actions";
import { firestore } from "@/lib/firebase";
import { collection, onSnapshot, query, orderBy, limit } from "firebase/firestore";

export default function Home() {
  const [player, setPlayer] = useState<{ name: string } | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    if (!player) return;

    const q = query(
      collection(firestore, "leaderboard"),
      orderBy("score", "desc"),
      limit(10)
    );

    // Use onSnapshot for real-time updates
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const data: LeaderboardEntry[] = [];
      querySnapshot.forEach((doc) => {
        data.push(doc.data() as LeaderboardEntry);
      });
      setLeaderboard(data);
    });

    // Clean up the listener when the component unmounts or player changes
    return () => unsubscribe();
  }, [player]);


  const handleRegister = async (name: string) => {
    setPlayer({ name });
    // Set initial score to 0 to get the player on the board
    await updatePlayerScore(name, 0); 
  };

  const updateLeaderboard = useCallback(async (name: string, score: number) => {
    await updatePlayerScore(name, score);
  }, []);

  const handlePlayAgain = async () => {
    if (player) {
      // Reset score to 0, but keep player on the leaderboard
      await updatePlayerScore(player.name, 0);
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