import type { CorporateAction } from '../mappers/corporateAction';

export const SPINOFF_REGEX = /^.*\(.*\)\s+Spinoff\s+.*\(([^,]+),/;

export const isSpinoffAction = (action: CorporateAction): boolean =>
  action.header === 'Data' && SPINOFF_REGEX.test(action.description);
