export interface CSVRecord {
  [key: string]: string | undefined;
}

export interface CRMRecord {
  created_at: string;
  name: string;
  email: string;
  country_code: string;
  mobile_without_country_code: string;
  company: string;
  city: string;
  state: string;
  country: string;
  lead_owner: string;
  crm_status: string; // one of allowed statuses
  crm_note: string;
  data_source: string; // one of allowed sources or empty
  possession_time: string;
  description: string;
}

export interface ProcessedResult {
  imported: CRMRecord[];
  skipped: Array<{ record: CSVRecord; reason: string }>;
  total: number;
}