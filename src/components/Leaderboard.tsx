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
  const topEntries = entries.slice(0, 10);
  return (
    <Card className="shadow-lg w-full">
      <CardHeader>
        <CardTitle className="text-center text-2xl font-bold text-primary flex items-center justify-center gap-2">
            <Crown className="w-6 h-6 text-yellow-400"/> Leaderboard
        </CardTitle>
      </CardHeader>
      <CardContent className="p-2">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40px]">Rank</TableHead>
              <TableHead>Player</TableHead>
              <TableHead className="text-right">Score</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {topEntries.map((entry, index) => (
              <TableRow key={entry.name} className={cn(entry.name === currentPlayer && 'bg-primary/20')}>
                <TableCell className="font-medium text-center">{index + 1}</TableCell>
                <TableCell>{entry.name}</TableCell>
                <TableCell className="text-right">{entry.score.toLocaleString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
