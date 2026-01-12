import data from "../db/notesLegalNotes.json";

interface RawNotesLegalNotes {
  "Notes/Legal Notes": string;
  "Header": string;
  "Type": string;
  "Note": string;
}

export interface NotesLegalNotes {
  notesLegalNotes: string;
  header: string;
  type: string;
  note: string;
}

export const notesLegalNotes: NotesLegalNotes[] = (data as RawNotesLegalNotes[]).map(item => ({
  notesLegalNotes: item["Notes/Legal Notes"],
  header: item["Header"],
  type: item["Type"],
  note: item["Note"],
}));
