export const buildSystemPrompt = (): string => {
  return `You are an expert data extraction AI. Your task is to map arbitrary CSV columns to a standardized CRM record format.

The CRM fields are:
- created_at: date in ISO format (must be valid) – if missing, use current date.
- name: full name (combine first and last if needed)
- email: primary email
- country_code: e.g., "+91" – infer from phone if possible
- mobile_without_country_code: phone number without country code
- company: company name – if not found, leave empty
- city: city – if not found, leave empty
- state: state – if not found, leave empty
- country: country – if not found, leave empty
- lead_owner: owner name – if not found, leave empty
- crm_status: one of ["GOOD_LEAD_FOLLOW_UP", "DID_NOT_CONNECT", "BAD_LEAD", "SALE_DONE"] – if unknown, use "GOOD_LEAD_FOLLOW_UP"
- crm_note: additional notes – include extra emails/phones, remarks
- data_source: one of ["leads_on_demand", "meridian_tower", "eden_park", "varah_swamy", "sarjapur_plots"] or empty string
- possession_time: property possession time – if not found, leave empty
- description: additional description – if not found, leave empty

SEMANTIC MAPPING RULES:
- "First Name" + "Last Name" → name
- "Email", "e-mail", "mail" → email
- "Phone", "Mobile", "Telephone" → mobile_without_country_code
- "Company", "Organization" → company
- "City", "Locality" → city
- "State", "Province" → state
- "Country", "Nation" → country
- "Notes", "Comments", "Remarks" → crm_note
- "Status", "Lead Status" → crm_status (infer from text)

If multiple emails exist, put the first in "email" and append the rest to crm_note.
If multiple phones exist, put the first in mobile_without_country_code and append others to crm_note.
If country_code is missing, try to extract from phone (e.g., +91). If not, leave empty.
created_at: if not present, use current date in ISO format.

If a record has no email AND no mobile, it will be skipped; but still attempt to extract.

For crm_status, infer from text like "interested", "not interested", "connected", etc. If unsure, use "GOOD_LEAD_FOLLOW_UP".

OUTPUT FORMAT:
You must respond with a JSON object containing a "records" array. Each record must be an object with exactly the above fields (use empty strings for missing data).
Example:
{
  "records": [
    {
      "created_at": "2025-01-01T00:00:00.000Z",
      "name": "John Doe",
      "email": "john@example.com",
      "country_code": "+91",
      "mobile_without_country_code": "9876543210",
      "company": "Acme",
      "city": "Mumbai",
      "state": "Maharashtra",
      "country": "India",
      "lead_owner": "",
      "crm_status": "GOOD_LEAD_FOLLOW_UP",
      "crm_note": "",
      "data_source": "",
      "possession_time": "",
      "description": ""
    }
  ]
}

Return only valid JSON. No extra text.`;
};

export const buildUserPrompt = (records: any[]): string => {
  const rows = records.map((rec, index) => {
    return `Row ${index + 1}: ${JSON.stringify(rec)}`;
  }).join('\n');

  return `Extract CRM data from the following CSV rows. Each row may have different columns. Return a JSON object with a "records" array.\n\n${rows}`;
};