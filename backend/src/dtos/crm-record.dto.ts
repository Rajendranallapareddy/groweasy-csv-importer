import { z } from 'zod';

const allowedStatuses = ['GOOD_LEAD_FOLLOW_UP', 'DID_NOT_CONNECT', 'BAD_LEAD', 'SALE_DONE'] as const;
const allowedSources = ['leads_on_demand', 'meridian_tower', 'eden_park', 'varah_swamy', 'sarjapur_plots'] as const;

export const CRMRecordSchema = z.object({
  created_at: z.string().datetime({ offset: true }),
  name: z.string().default(''),
  email: z.string().email().or(z.string().default('')),
  country_code: z.string().default(''),
  mobile_without_country_code: z.string().default(''),
  company: z.string().default(''),
  city: z.string().default(''),
  state: z.string().default(''),
  country: z.string().default(''),
  lead_owner: z.string().default(''),
  crm_status: z.enum(allowedStatuses).default('GOOD_LEAD_FOLLOW_UP'),
  crm_note: z.string().default(''),
  data_source: z.enum([...allowedSources, '']).default(''),
  possession_time: z.string().default(''),
  description: z.string().default(''),
});

export type CRMRecordDTO = z.infer<typeof CRMRecordSchema>;