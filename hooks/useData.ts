import { useState, useEffect } from 'react';
import { User, Group, Expense, Payment } from '../types';

const MOCK_USERS: User[] = [
  { id: 'user1', name: 'You', avatarUrl: 'https://picsum.photos/seed/you/100' },
  { id: 'user2', name: 'Alice', avatarUrl: 'https://picsum.photos/seed/alice/100' },
  { id: 'user3', name: 'Bob', avatarUrl: 'https://picsum.photos/seed/bob/100' },
  { id: 'user4', name: 'Charlie', avatarUrl: 'https://picsum.photos/seed/charlie/100' },
];

const MOCK_GROUPS: Group[] = [
  { id: 'group1', name: 'Trip to Bali', memberIds: ['user1', 'user2', 'user3'] },
  { id: 'group2', name: 'Apartment', memberIds: ['user1', 'user4'] },
];

const MOCK_EXPENSES: Expense[] = [
  {
    id: 'exp1',
    description: 'Flights',
    amount: 600,
    paidById: 'user1',
    groupId: 'group1',
    date: new Date('2023-10-01').toISOString(),
    category: 'Travel',
    splits: [
      { userId: 'user1', amount: 200 },
      { userId: 'user2', amount: 200 },
      { userId: 'user3', amount: 200 },
    ],
  },
  {
    id: 'exp2',
    description: 'Dinner',
    amount: 90,
    paidById: 'user2',
    groupId: 'group1',
    date: new Date('2023-10-02').toISOString(),
    category: 'Food & Drink',
    splits: [
      { userId: 'user1', amount: 30 },
      { userId: 'user2', amount: 30 },
      { userId: 'user3', amount: 30 },
    ],
  },
  {
    id: 'exp3',
    description: 'Rent',
    amount: 1000,
    paidById: 'user4',
    groupId: 'group2',
    date: new Date('2023-10-05').toISOString(),
    category: 'Housing',
    splits: [
      { userId: 'user1', amount: 500 },
      { userId: 'user4', amount: 500 },
    ],
  },
];

const MOCK_PAYMENTS: Payment[] = [];

const useData = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string>('user1');

  useEffect(() => {
    try {
      const storedUsers = localStorage.getItem('splitit-users');
      const storedGroups = localStorage.getItem('splitit-groups');
      const storedExpenses = localStorage.getItem('splitit-expenses');
      const storedPayments = localStorage.getItem('splitit-payments');
      const storedCurrentUser = localStorage.getItem('splitit-currentUser');

      if (storedUsers && storedGroups && storedExpenses && storedPayments && storedCurrentUser) {
        setUsers(JSON.parse(storedUsers));
        setGroups(JSON.parse(storedGroups));
        setExpenses(JSON.parse(storedExpenses));
        setPayments(JSON.parse(storedPayments));
        setCurrentUserId(JSON.parse(storedCurrentUser));
      } else {
        // First time load, use mock data
        setUsers(MOCK_USERS);
        setGroups(MOCK_GROUPS);
        setExpenses(MOCK_EXPENSES);
        setPayments(MOCK_PAYMENTS);
        setCurrentUserId('user1');
      }
    } catch (error) {
      console.error("Failed to parse from localStorage", error);
        setUsers(MOCK_USERS);
        setGroups(MOCK_GROUPS);
        setExpenses(MOCK_EXPENSES);
        setPayments(MOCK_PAYMENTS);
        setCurrentUserId('user1');
    }
  }, []);

  useEffect(() => {
    if (users.length > 0) localStorage.setItem('splitit-users', JSON.stringify(users));
    if (groups.length > 0) localStorage.setItem('splitit-groups', JSON.stringify(groups));
    localStorage.setItem('splitit-expenses', JSON.stringify(expenses));
    localStorage.setItem('splitit-payments', JSON.stringify(payments));
    localStorage.setItem('splitit-currentUser', JSON.stringify(currentUserId));
  }, [users, groups, expenses, payments, currentUserId]);

  const addExpense = (expense: Omit<Expense, 'id'>) => {
    setExpenses(prev => [...prev, { ...expense, id: `exp${Date.now()}` }]);
  };

  const updateExpense = (updatedExpense: Expense) => {
    setExpenses(prev => prev.map(exp => exp.id === updatedExpense.id ? updatedExpense : exp));
  };

  const addPayment = (payment: Omit<Payment, 'id'>) => {
    setPayments(prev => [...prev, { ...payment, id: `pay${Date.now()}` }]);
  };

  const addUser = (name: string) => {
    const newUser: User = {
      id: `user${Date.now()}`,
      name,
      avatarUrl: `https://picsum.photos/seed/${name.toLowerCase()}/100`,
    };
    setUsers(prev => [...prev, newUser]);
  };

  const addGroup = (group: Omit<Group, 'id'>) => {
    const newGroup: Group = {
      ...group,
      id: `group${Date.now()}`,
    };
    setGroups(prev => [...prev, newGroup]);
  };

  const addMemberToGroup = (groupId: string, userId: string) => {
    setGroups(prev => prev.map(group => {
      if (group.id === groupId && !group.memberIds.includes(userId)) {
        return { ...group, memberIds: [...group.memberIds, userId] };
      }
      return group;
    }));
  };

  return { users, groups, expenses, payments, currentUserId, setCurrentUserId, addExpense, updateExpense, addPayment, addUser, addGroup, addMemberToGroup };
};

export default useData;