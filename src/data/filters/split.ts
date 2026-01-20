import type { CorporateAction } from "../mappers/corporateAction";

export const SPLIT_REGEX = /^([A-Z.]+)\(.*\)\s+Split\s+(\d+)\s+for\s+(\d+)/;

export const isSplitAction = (action: CorporateAction): boolean => 
  SPLIT_REGEX.test(action.description);
