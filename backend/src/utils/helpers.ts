export const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const chunkArray = <T>(array: T[], size: number): T[][] => {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
};

export const isValidDate = (dateStr: string): boolean => {
  const d = new Date(dateStr);
  return !isNaN(d.getTime());
};