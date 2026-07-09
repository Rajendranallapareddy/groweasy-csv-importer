'use client';

import { useDropzone } from 'react-dropzone';
import { Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface UploadZoneProps {
  onFileAccepted: (file: File) => void;
}

export function UploadZone({ onFileAccepted }: UploadZoneProps) {
  const [file, setFile] = useState<File | null>(null);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'text/csv': ['.csv'] },
    maxFiles: 1,
    onDrop: (acceptedFiles) => {
      const accepted = acceptedFiles[0];
      if (accepted) {
        setFile(accepted);
        onFileAccepted(accepted);
      }
    },
  });

  const handleRemove = () => {
    setFile(null);
  };

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <div
          {...getRootProps()}
          className={cn(
            'border-2 border-dashed rounded-lg p-12 text-center transition-colors cursor-pointer',
            isDragActive ? 'border-primary bg-primary/10' : 'border-muted-foreground/25',
            file ? 'bg-muted/50' : ''
          )}
        >
          <input {...getInputProps()} />
          {file ? (
            <div className="flex items-center justify-center gap-4">
              <span className="font-medium">{file.name}</span>
              <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); handleRemove(); }}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <Upload className="h-12 w-12 mx-auto text-muted-foreground" />
              <div>
                <p className="text-lg font-medium">Drop CSV here, or click to browse</p>
                <p className="text-sm text-muted-foreground">Only .csv files accepted</p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}