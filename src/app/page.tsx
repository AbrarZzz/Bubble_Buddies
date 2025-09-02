"use client";

import { useState, useEffect } from "react";
import Registration from "@/components/Registration";
import Game from "@/components/Game";
import type { LeaderboardEntry } from "@/lib/types";
import { db } from "@/lib/firebase";
import {
  collection,
  onSnapshot,
  doc,
  setDoc,
  orderBy,
  query,
} from "firebase/firestore";

export default function Home() {
  const [player, setPlayer] = useState<{ name: string } | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    const q = query(collection(db, "leaderboard"), orderBy("score", "desc"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const leaderboardData: LeaderboardEntry[] = [];
      querySnapshot.forEach((doc) => {
        leaderboardData.push(doc.data() as LeaderboardEntry);
      });
      setLeaderboard(leaderboardData);
    });

    return () => unsubscribe();
  }, []);

  const handleRegister = async (name: string) => {
    const newPlayer = { name, score: 0 };
    setPlayer({ name });
    const playerDocRef = doc(db, "leaderboard", name);
    await setDoc(playerDocRef, newPlayer, { merge: true });
  };

  const updateLeaderboard = async (name: string, score: number) => {
    const playerDocRef = doc(db, "leaderboard", name);
    await setDoc(playerDocRef, { name, score }, { merge: true });
  };

  const handlePlayAgain = async () => {
    if (player) {
      await updateLeaderboard(player.name, 0);
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
