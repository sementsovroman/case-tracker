export type Case = {
  id: string;
  title: string;
  description: string;
  court: string;
  judge: string;
  plaintiff: string;
  defendant: string;
  color: string;
  notes: string;
  archived?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type HearingKind = "hearing" | "meeting";

export type Hearing = {
  id: string;
  caseId: string;
  kind: HearingKind;
  start: string; // ISO
  end: string; // ISO
  createdAt?: string;
  updatedAt?: string;
  case?: Pick<Case, "id" | "title" | "description" | "color"> | null;
};
