import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import type { LeaderboardEntry } from '@/lib/types';
import { Crown } from 'lucide-react';

interface LeaderboardProps {
  entries: LeaderboardEntry[];
  currentPlayer: string;
}

export default function Leaderboard({ entries, currentPlayer }: LeaderboardProps) {
  const topEntries = entries.slice(0, 5);
  return (
    <Card className="shadow-lg w-full max-w-4xl">
      <CardContent className="p-2">
        <div className="flex justify-around items-center">
            {topEntries.map((entry, index) => (
              <div
                key={entry.name}
                className={cn(
                    'flex items-center gap-3 p-2 rounded-lg',
                    entry.name === currentPlayer && 'bg-primary/20'
                )}
              >
                <div className="font-bold text-lg text-primary">#{index + 1}</div>
                <div>
                    <div className="font-semibold">{entry.name}</div>
                    <div className="text-sm text-muted-foreground">{entry.score.toLocaleString()}</div>
                </div>
                {index === 0 && <Crown className="w-6 h-6 text-yellow-400 ml-2"/>}
              </div>
            ))}
        </div>
      </CardContent>
    </Card>
  );
}
