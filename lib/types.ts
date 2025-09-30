export type AccountStatus = "free" | "busy";

export interface Account {
  id: string;
  username: string;
  email: string;
  status: AccountStatus;
  owner?: string | null;
  ownerId?: string | null;
  lastUsedAt?: string | null;
  history?: AccountHistoryEntry[];
}

export interface AccountHistoryEntry {
  id: string;
  action: "checkout" | "checkin";
  userId: string;
  userName?: string | null;
  email?: string | null;
  timestamp: string;
}

export interface AccountLogInput {
  accountId: string;
  action: "checkout" | "checkin";
  userId: string;
  userName?: string | null;
  email?: string | null;
}

export interface Invite {
  id: string;
  token: string;
  createdAt: string;
  createdBy: string;
  inviteeEmail?: string;
  label?: string;
  expiresAt?: string;
  maxUses?: number;
  remainingUses?: number;
}
