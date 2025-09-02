import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import type { LeaderboardEntry } from '@/lib/types';
import { Crown } from 'lucide-react';
import { ScrollArea } from './ui/scroll-area';

interface LeaderboardProps {
  entries: LeaderboardEntry[];
  currentPlayer: string;
}

export default function Leaderboard({ entries, currentPlayer }: LeaderboardProps) {
  const topEntries = entries.slice(0, 10);
  return (
    <Card className="shadow-lg w-full">
      <CardHeader className="p-2 sm:p-4">
        <CardTitle className="text-center text-xl sm:text-2xl font-bold text-primary flex items-center justify-center gap-2">
            <Crown className="w-6 h-6 text-yellow-400"/> Leaderboard
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 sm:p-2">
        <ScrollArea className="h-48 sm:h-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[40px] text-xs sm:text-sm">Rank</TableHead>
                  <TableHead className="text-xs sm:text-sm">Player</TableHead>
                  <TableHead className="text-right text-xs sm:text-sm">Score</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topEntries.map((entry, index) => (
                  <TableRow key={entry.name} className={cn(entry.name === currentPlayer && 'bg-primary/20')}>
                    <TableCell className="font-medium text-center text-xs sm:text-sm">{index + 1}</TableCell>
                    <TableCell className="text-xs sm:text-sm">{entry.name}</TableCell>
                    <TableCell className="text-right text-xs sm:text-sm">{entry.score.toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
