"use server";

import { firestore } from "@/lib/firebase";
import type { LeaderboardEntry } from "@/lib/types";
import { collection, getDocs, orderBy, query, limit, doc, setDoc } from "firebase/firestore";

const LEADERBOARD_COLLECTION = "leaderboard";

// Note: Firestore security rules should be configured to manage access.
// For this example, we'll assume they are open for authenticated users.

export async function getLeaderboard(): Promise<LeaderboardEntry[]> {
  try {
    const q = query(
      collection(firestore, LEADERBOARD_COLLECTION),
      orderBy("score", "desc"),
      limit(10)
    );
    const querySnapshot = await getDocs(q);
    const leaderboard: LeaderboardEntry[] = [];
    querySnapshot.forEach((doc) => {
      leaderboard.push(doc.data() as LeaderboardEntry);
    });
    return leaderboard;
  } catch (error) {
    console.error("Failed to fetch leaderboard:", error);
    // In case of error (e.g., permissions), return an empty array.
    return [];
  }
}

export async function updatePlayerScore(name: string, score: number): Promise<void> {
  try {
    const playerDocRef = doc(firestore, LEADERBOARD_COLLECTION, name);
    // Using setDoc with merge: true will create the document if it doesn't exist,
    // or update it if it does.
    await setDoc(playerDocRef, { name, score }, { merge: true });
  } catch (error) {
    console.error("Failed to update score for player:", name, error);
  }
}