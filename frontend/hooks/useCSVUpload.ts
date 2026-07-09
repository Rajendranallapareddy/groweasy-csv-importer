import { useState } from "react";
import { CSVRecord } from "@/types";
import { parseCSV } from "@/utils/csvParser";

export function useCSVUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [data, setData] = useState<CSVRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const upload = async (acceptedFile: File) => {
    setIsLoading(true);
    setError(null);
    try {
      const parsed = await parseCSV(acceptedFile);
      setFile(acceptedFile);
      setData(parsed);
    } catch (err) {
      setError("Failed to parse CSV");
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setFile(null);
    setData([]);
    setError(null);
  };

  return { file, data, isLoading, error, upload, reset };
}