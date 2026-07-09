'use client';

import { ProcessedResult } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Download, RefreshCw } from 'lucide-react';
import { useMemo, useState } from 'react';

interface ResultViewProps {
  result: ProcessedResult;
  onReset: () => void;
}

export function ResultView({ result, onReset }: ResultViewProps) {
  const [showSkipped, setShowSkipped] = useState(false);

  const successRate = useMemo(() => {
    if (result.total === 0) return 0;
    return ((result.imported.length / result.total) * 100).toFixed(1);
  }, [result]);

  const columns = useMemo(() => {
    if (result.imported.length === 0) return [];
    return Object.keys(result.imported[0]);
  }, [result.imported]);

  const downloadJSON = () => {
    const json = JSON.stringify(result, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'imported_data.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  // 👇 CSV download function
  const downloadCSV = () => {
    if (result.imported.length === 0) return;

    const headers = Object.keys(result.imported[0]);
    const rows = result.imported.map((record) =>
      headers.map((h) => record[h as keyof typeof record] || '').join(',')
    );
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'imported_data.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Import Results</h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={downloadJSON}>
            <Download className="h-4 w-4 mr-2" />
            Export JSON
          </Button>
          {/* 👇 NEW: Export CSV button */}
          <Button variant="outline" onClick={downloadCSV}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button onClick={onReset}>
            <RefreshCw className="h-4 w-4 mr-2" />
            New Import
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Rows</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{result.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-600">Imported</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{result.imported.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-red-600">Skipped</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{result.skipped.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{successRate}%</div>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center gap-4">
        <Button
          variant={!showSkipped ? 'default' : 'outline'}
          onClick={() => setShowSkipped(false)}
        >
          Imported ({result.imported.length})
        </Button>
        <Button
          variant={showSkipped ? 'default' : 'outline'}
          onClick={() => setShowSkipped(true)}
        >
          Skipped ({result.skipped.length})
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="relative h-[400px] overflow-auto">
            <div className="min-w-max">
              <Table>
                <TableHeader className="sticky top-0 bg-background z-10 shadow-sm">
                  <TableRow>
                    {!showSkipped ? (
                      columns.map((col) => (
                        <TableHead key={col} className="whitespace-nowrap px-4 py-2 border-r last:border-r-0">
                          {col}
                        </TableHead>
                      ))
                    ) : (
                      <>
                        <TableHead className="whitespace-nowrap px-4 py-2 border-r">Row Data</TableHead>
                        <TableHead className="whitespace-nowrap px-4 py-2">Reason</TableHead>
                      </>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {!showSkipped &&
                    result.imported.map((record, idx) => (
                      <TableRow key={idx}>
                        {columns.map((col) => (
                          <TableCell key={col} className="whitespace-nowrap px-4 py-2 border-r last:border-r-0 truncate max-w-xs">
                            {record[col as keyof typeof record] || '-'}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  {showSkipped &&
                    result.skipped.map((item, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="whitespace-nowrap px-4 py-2 border-r truncate max-w-xs">
                          {JSON.stringify(item.record)}
                        </TableCell>
                        <TableCell className="whitespace-nowrap px-4 py-2">{item.reason}</TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}