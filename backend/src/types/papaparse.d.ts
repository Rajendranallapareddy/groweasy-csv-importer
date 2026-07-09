declare module 'papaparse' {
  export interface ParseResult<T> {
    data: T[];
    errors: ParseError[];
    meta: ParseMeta;
  }

  export interface ParseError {
    type: string;
    code: string;
    message: string;
    row: number;
  }

  export interface ParseMeta {
    delimiter: string;
    linebreak: string;
    aborted: boolean;
    truncated: boolean;
    cursor: number;
  }

  export function parse<T>(
    input: string,
    config: {
      header?: boolean;
      skipEmptyLines?: boolean;
      trimHeaders?: boolean;
      transformHeader?: (header: string) => string;
      complete?: (results: ParseResult<T>) => void;
      error?: (error: Error) => void;
    }
  ): void;

  export function parse<T>(input: string): ParseResult<T>;
}