import { rawCorporateActions } from "../db";
import { mapCorporateAction } from "./mappers/corporateAction";

export const corporateActions = rawCorporateActions.map(mapCorporateAction);
