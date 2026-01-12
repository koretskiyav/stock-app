import data from "../db/interestAccruals.json";

interface RawInterestAccruals {
  "Interest Accruals": string;
  "Header": string;
  "Currency": string;
  "Field Name": string;
  "Field Value": string;
}

export interface InterestAccruals {
  interestAccruals: string;
  header: string;
  currency: string;
  fieldName: string;
  fieldValue: number;
}

export const interestAccruals: InterestAccruals[] = (data as RawInterestAccruals[]).map(item => ({
  interestAccruals: item["Interest Accruals"],
  header: item["Header"],
  currency: item["Currency"],
  fieldName: item["Field Name"],
  fieldValue: Number(item["Field Value"] || 0),
}));
