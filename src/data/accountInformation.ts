import data from "../db/accountInformation.json";

interface RawAccountInformation {
  "Account Information": string;
  "Header": string;
  "Field Name": string;
  "Field Value": string;
}

export interface AccountInformation {
  accountInformation: string;
  header: string;
  fieldName: string;
  fieldValue: string;
}

export const accountInformation: AccountInformation[] = (data as RawAccountInformation[]).map(item => ({
  accountInformation: item["Account Information"],
  header: item["Header"],
  fieldName: item["Field Name"],
  fieldValue: item["Field Value"],
}));
