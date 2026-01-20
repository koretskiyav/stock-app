import data from '../db/changeInNav.json';

interface RawChangeInNav {
  'Change in NAV': string;
  Header: string;
  'Field Name': string;
  'Field Value': string;
}

export interface ChangeInNav {
  changeInNav: string;
  header: string;
  fieldName: string;
  fieldValue: number;
}

export const changeInNav: ChangeInNav[] = (data as RawChangeInNav[]).map((item) => ({
  changeInNav: item['Change in NAV'],
  header: item['Header'],
  fieldName: item['Field Name'],
  fieldValue: Number(item['Field Value'] || 0),
}));
