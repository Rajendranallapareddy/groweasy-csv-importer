'use client';

import { useMemo, useState } from 'react';
import { CSVRecord } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CSVPreviewProps {
  data: CSVRecord[];
  fileName: string;
  onConfirm: () => void;
  onBack: () => void;
  isProcessing: boolean;
}

export function CSVPreview({ data, fileName, onConfirm, onBack, isProcessing }: CSVPreviewProps) {
  const [page, setPage] = useState(1);
  const pageSize = 100;
  const totalPages = Math.ceil(data.length / pageSize);
  const start = (page - 1) * pageSize;
  const end = Math.min(start + pageSize, data.length);
  const pageData = data.slice(start, end);

  const columns = useMemo(() => {
    if (data.length === 0) return [];
    return Object.keys(data[0]);
  }, [data]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold">Preview</h2>
          <p className="text-sm text-muted-foreground">
            {data.length} rows · {columns.length} columns · {fileName}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onBack} disabled={isProcessing}>
            Back
          </Button>
          <Button onClick={onConfirm} disabled={isProcessing}>
            {isProcessing ? 'Processing...' : 'Confirm Import'}
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          {/* Wrap in a container with both vertical and horizontal overflow */}
          <div className="relative h-[500px] overflow-auto">
            <div className="min-w-max">
              <Table>
                <TableHeader className="sticky top-0 bg-background z-10 shadow-sm">
                  <TableRow>
                    {columns.map((col) => (
                      <TableHead key={col} className="whitespace-nowrap px-4 py-2 border-r last:border-r-0">
                        {col}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pageData.map((row, idx) => (
                    <TableRow key={idx}>
                      {columns.map((col) => (
                        <TableCell key={col} className="whitespace-nowrap px-4 py-2 border-r last:border-r-0 truncate max-w-xs">
                          {row[col] || '-'}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <Badge variant="outline">
          Page {page} of {totalPages}
        </Badge>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}