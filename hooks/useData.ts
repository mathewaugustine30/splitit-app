import { useState, useCallback, useEffect } from 'react';
import { User, Group, Expense, Payment } from '../types';

// Function to safely get data from localStorage
const getFromStorage = <T,>(key: string, defaultValue: T): T => {
  try {
    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error reading from localStorage key “${key}”:`, error);
    return defaultValue;
  }
};

// Function to safely set data in localStorage
const setInStorage = <T,>(key: string, value: T) => {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error writing to localStorage key “${key}”:`, error);
  }
};


// Mock Data - only used if localStorage is empty
const MOCK_USERS: User[] = [
  { id: 'user-1', name: 'Demo User', avatarUrl: 'https://i.pravatar.cc/150?u=user-1', email: 'demo@example.com', phone: '111-222-3333', password: 'password123', friendIds: ['user-2', 'user-3', 'user-4'] },
  { id: 'user-2', name: 'Alice', avatarUrl: 'https://i.pravatar.cc/150?u=user-2', password: 'password123', friendIds: ['user-1'] },
  { id: 'user-3', name: 'Bob', avatarUrl: 'https://i.pravatar.cc/150?u=user-3', password: 'password123', friendIds: ['user-1'] },
  { id: 'user-4', name: 'Charlie', avatarUrl: 'https://i.pravatar.cc/150?u=user-4', password: 'password123', friendIds: ['user-1'] },
];

const MOCK_GROUPS: Group[] = [
  { id: 'group-1', name: 'Trip to Mountains', memberIds: ['user-1', 'user-2', 'user-3'] },
  { id: 'group-2', name: 'Apartment', memberIds: ['user-1', 'user-4'] },
];

const MOCK_EXPENSES: Expense[] = [
    // ... same as before
];

const MOCK_PAYMENTS: Payment[] = [
    // ... same as before
];


export const useData = () => {
  const [users, setUsers] = useState<User[]>(() => getFromStorage('splitit_users', MOCK_USERS));
  const [groups, setGroups] = useState<Group[]>(() => getFromStorage('splitit_groups', MOCK_GROUPS));
  const [expenses, setExpenses] = useState<Expense[]>(() => getFromStorage('splitit_expenses', MOCK_EXPENSES));
  const [payments, setPayments] = useState<Payment[]>(() => getFromStorage('splitit_payments', MOCK_PAYMENTS));
  const [loggedInUser, setLoggedInUser] = useState<User | null>(null);

  useEffect(() => {
    const loggedInUserId = getFromStorage<string | null>('splitit_loggedInUserId', null);
    if (loggedInUserId) {
        const user = users.find(u => u.id === loggedInUserId);
        setLoggedInUser(user || null);
    }
  }, [users]);

  useEffect(() => { setInStorage('splitit_users', users); }, [users]);
  useEffect(() => { setInStorage('splitit_groups', groups); }, [groups]);
  useEffect(() => { setInStorage('splitit_expenses', expenses); }, [expenses]);
  useEffect(() => { setInStorage('splitit_payments', payments); }, [payments]);

  const getNextId = (prefix: string) => `${prefix}-${Date.now()}`;

  const login = useCallback((email: string, password_param: string): boolean => {
      const user = users.find(u => u.email === email && u.password === password_param);
      if (user) {
          setLoggedInUser(user);
          setInStorage('splitit_loggedInUserId', user.id);
          return true;
      }
      return false;
  }, [users]);
  
  const logout = useCallback(() => {
      setLoggedInUser(null);
      window.localStorage.removeItem('splitit_loggedInUserId');
  }, []);

  const signup = useCallback((name: string, email: string, password_param: string): boolean => {
    if (users.some(u => u.email === email)) {
        alert('An account with this email already exists.');
        return false;
    }
    const newUser: User = {
        id: getNextId('user'),
        name,
        email,
        password: password_param,
        avatarUrl: `https://i.pravatar.cc/150?u=${Date.now()}`,
        friendIds: [],
    };
    setUsers(prev => [...prev, newUser]);
    setLoggedInUser(newUser);
    setInStorage('splitit_loggedInUserId', newUser.id);
    return true;
  }, [users]);

  const addFriend = useCallback((name: string) => {
    if (!loggedInUser) return;

    // In a real app, you'd search for an existing user. Here, we create one.
    const newUser: User = {
      id: getNextId('user'),
      name,
      avatarUrl: `https://i.pravatar.cc/150?u=${Date.now()}`,
      password: 'password123', // dummy password
      friendIds: [loggedInUser.id], // The new user is friends with the logged-in user
    };

    const updatedLoggedInUser: User = {
        ...loggedInUser,
        friendIds: [...(loggedInUser.friendIds || []), newUser.id]
    };
    
    // Update the global users list and the logged-in user state
    setUsers(prev => [...prev.filter(u => u.id !== loggedInUser.id), updatedLoggedInUser, newUser]);
    setLoggedInUser(updatedLoggedInUser);

  }, [loggedInUser]);

  const updateUser = useCallback((updatedUser: User) => {
    setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
    if (loggedInUser && loggedInUser.id === updatedUser.id) {
        setLoggedInUser(updatedUser);
    }
  }, [loggedInUser]);

  const addGroup = useCallback((group: { name: string; memberIds: string[] }) => {
    const newGroup: Group = {
      id: getNextId('group'),
      ...group,
    };
    setGroups(prev => [...prev, newGroup]);
  }, []);

  const addMembersToGroup = useCallback((groupId: string, userIds: string[]) => {
    setGroups(prev =>
      prev.map(g =>
        g.id === groupId ? { ...g, memberIds: [...new Set([...g.memberIds, ...userIds])] } : g
      )
    );
  }, []);

  const addExpense = useCallback((expense: Omit<Expense, 'id'>) => {
    const newExpense: Expense = {
      id: getNextId('exp'),
      ...expense,
    };
    setExpenses(prev => [...prev, newExpense]);
  }, []);
  
  const updateExpense = useCallback((updatedExpense: Expense) => {
      setExpenses(prev => prev.map(e => e.id === updatedExpense.id ? updatedExpense : e));
  }, []);

  const addPayment = useCallback((payment: Omit<Payment, 'id'>) => {
    const newPayment: Payment = {
      id: getNextId('pay'),
      ...payment,
    };
    setPayments(prev => [...prev, newPayment]);
  }, []);

  return {
    users,
    groups,
    expenses,
    payments,
    loggedInUser,
    login,
    logout,
    signup,
    addFriend,
    updateUser,
    addGroup,
    addMembersToGroup,
    addExpense,
    updateExpense,
    addPayment,
  };
};