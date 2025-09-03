"use server";
import { neon } from "@neondatabase/serverless";
import { LeaderboardEntry } from "@/lib/types";

// Initialize Neon SQL
const sql = neon(process.env.DATABASE_URL!);

// Function to create the leaderboard table if it doesn't exist
async function createTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS leaderboard (
      name VARCHAR(255) PRIMARY KEY,
      score INT
    );
  `;
}

// Ensure table exists on startup
createTable().catch(console.error);

export async function getLeaderboard(): Promise<LeaderboardEntry[]> {
  try {
    const data = await sql`
      SELECT name, score 
      FROM leaderboard 
      ORDER BY score DESC 
      LIMIT 10;
    `;
    return data as LeaderboardEntry[];
  } catch (error) {
    console.error("Failed to fetch leaderboard:", error);
    return [];
  }
}

export async function updatePlayerScore(name: string, score: number): Promise<void> {
    try {
        await sql`
            INSERT INTO leaderboard (name, score)
            VALUES (${name}, ${score})
            ON CONFLICT (name) 
            DO UPDATE SET score = EXCLUDED.score;
        `;
    } catch (error) {
        console.error("Failed to update score for player:", name, error);
    }
}
