export type AccountStatus = "free" | "busy";

export interface Account {
  id: string;
  username: string;
  email: string;
  password?: string | null;
  status: AccountStatus;
  owner?: string | null;
  ownerId?: string | null;
  lastUsedAt?: string | null;
  lastReturnedAt?: string | null;
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

export type UserRole = "admin" | "user";

export interface AccountLog {
  id: string;
  accountId: string;
  action: "checkout" | "checkin";
  userId: string;
  userName?: string | null;
  email?: string | null;
  timestamp: string | null;
}
