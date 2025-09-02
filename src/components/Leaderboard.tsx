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
  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
            <Crown className="text-yellow-400"/> Leaderboard
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-1/6">Rank</TableHead>
              <TableHead>Player</TableHead>
              <TableHead className="text-right">Score</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {entries.slice(0, 5).map((entry, index) => (
              <TableRow
                key={entry.name}
                className={cn(entry.name === currentPlayer && 'bg-primary/20')}
              >
                <TableCell className="font-medium">{index + 1}</TableCell>
                <TableCell>{entry.name}</TableCell>
                <TableCell className="text-right">{entry.score}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
