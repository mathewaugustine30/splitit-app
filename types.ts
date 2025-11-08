export interface User {
  id: string;
  name: string;
  avatarUrl: string;
  email?: string;
  phone?: string;
}

export interface Group {
  id: string;
  name: string;
  memberIds: string[];
}

export interface Split {
  userId: string;
  amount: number;
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  paidById: string;
  groupId: string | null;
  date: string; // ISO string
  splits: Split[];
  category: string;
  notes?: string;
  receiptUrl?: string;
}

export interface Payment {
  id:string;
  fromUserId: string;
  toUserId: string;
  amount: number;
  date: string; // ISO string
}

export interface Balance {
  userId: string;
  amount: number; // positive if they owe you, negative if you owe them
}

export type View = { type: 'dashboard' } | { type: 'group'; groupId: string } | { type: 'activity' };

export interface Filters {
  categories: string[];
  payers: string[];
  startDate: string;
  endDate: string;
}

export interface ActivityFilters {
  groups: string[];
  participants: string[];
  startDate: string;
  endDate: string;
}