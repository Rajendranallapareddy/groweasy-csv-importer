'use client';

import { useState } from 'react';
import { UploadZone } from '@/components/upload/UploadZone';
import { CSVPreview } from '@/components/preview/CSVPreview';
import { ResultView } from '@/components/result/ResultView';
import { ThemeToggle } from '@/components/shared/ThemeToggle';
import { motion, AnimatePresence } from 'framer-motion';
import { CSVRecord, ProcessedResult } from '@/types';
import { parseCSV } from '@/utils/csvParser';
import { uploadCSV } from '@/services/api';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

export default function Home() {
  const [step, setStep] = useState<'upload' | 'preview' | 'result'>('upload');
  const [csvData, setCsvData] = useState<CSVRecord[]>([]);
  const [fileName, setFileName] = useState<string>('');
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<ProcessedResult | null>(null);

  const handleFileAccepted = async (acceptedFile: File) => {
    setFile(acceptedFile);
    setFileName(acceptedFile.name);
    try {
      const data = await parseCSV(acceptedFile);
      setCsvData(data);
      setStep('preview');
      toast.success(`CSV parsed: ${data.length} rows`);
    } catch (error) {
      toast.error('Failed to parse CSV');
    }
  };

  const handleConfirm = async () => {
    if (!file) return;
    setIsProcessing(true);
    try {
      const response = await uploadCSV(file);
      setResult(response.data);
      setStep('result');
      toast.success('Import completed!');
    } catch (error) {
      toast.error('Import failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setStep('upload');
    setCsvData([]);
    setFileName('');
    setFile(null);
    setResult(null);
  };

  return (
    <main className="container max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">GrowEasy CSV Importer</h1>
        <ThemeToggle />
      </div>

      <AnimatePresence mode="wait">
        {step === 'upload' && (
          <motion.div
            key="upload"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <UploadZone onFileAccepted={handleFileAccepted} />
          </motion.div>
        )}

        {step === 'preview' && (
          <motion.div
            key="preview"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <CSVPreview
              data={csvData}
              fileName={fileName}
              onConfirm={handleConfirm}
              onBack={handleReset}
              isProcessing={isProcessing}
            />
          </motion.div>
        )}

        {step === 'result' && result && (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <ResultView result={result} onReset={handleReset} />
          </motion.div>
        )}
      </AnimatePresence>

      {isProcessing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background p-8 rounded-lg shadow-lg flex flex-col items-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="mt-4 text-lg font-medium">Processing with AI...</p>
            <p className="text-sm text-muted-foreground">This may take a moment</p>
          </div>
        </div>
      )}
    </main>
  );
}