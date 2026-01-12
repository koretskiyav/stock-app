import data from "../db/codes.json";

interface RawCodes {
  "Codes": string;
  "Header": string;
  "Code": string;
  "Meaning": string;
}

export interface Codes {
  codes: string;
  header: string;
  code: string;
  meaning: string;
}

export const codes: Codes[] = (data as RawCodes[]).map(item => ({
  codes: item["Codes"],
  header: item["Header"],
  code: item["Code"],
  meaning: item["Meaning"],
}));
