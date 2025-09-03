"use server";
import { neon, neonConfig } from "@neondatabase/serverless";
import { LeaderboardEntry } from "@/lib/types";

// Initialize Neon SQL only if the DATABASE_URL is set
const sql = process.env.DATABASE_URL ? neon(process.env.DATABASE_URL) : null;

if (!sql) {
    console.warn("DATABASE_URL environment variable is not set. Database functionality will be disabled.");
}

// Function to create the leaderboard table if it doesn't exist
async function createTable() {
    if (!sql) return;
    try {
        await sql`
            CREATE TABLE IF NOT EXISTS leaderboard (
            name VARCHAR(255) PRIMARY KEY,
            score INT
            );
        `;
    } catch (error) {
        console.error("Failed to create leaderboard table:", error);
    }
}

// Ensure table exists on startup
if (sql) {
    createTable().catch(console.error);
}


export async function getLeaderboard(): Promise<LeaderboardEntry[]> {
  if (!sql) return [];
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
    if (!sql) return;
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
