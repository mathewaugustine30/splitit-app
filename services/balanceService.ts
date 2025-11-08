import { User, Expense, Payment, Balance } from '../types';

export const calculateBalances = (
  currentUserId: string,
  users: User[],
  expenses: Expense[],
  payments: Payment[],
  groupId: string | null = null,
): Balance[] => {
  const balanceMap: { [key: string]: number } = {};
  const otherUsers = users.filter(u => u.id !== currentUserId);

  otherUsers.forEach(user => {
    balanceMap[user.id] = 0;
  });

  const relevantExpenses = groupId ? expenses.filter(e => e.groupId === groupId) : expenses;

  // Calculate balances from expenses
  for (const expense of relevantExpenses) {
    const isPayer = expense.paidById === currentUserId;
    const isSplittee = expense.splits.some(s => s.userId === currentUserId);

    if (isPayer && isSplittee) {
      const mySplit = expense.splits.find(s => s.userId === currentUserId)!;
      expense.splits.forEach(split => {
        if (split.userId !== currentUserId) {
          balanceMap[split.userId] = (balanceMap[split.userId] || 0) + split.amount;
        }
      });
    } else if (isPayer && !isSplittee) {
      expense.splits.forEach(split => {
        balanceMap[split.userId] = (balanceMap[split.userId] || 0) + split.amount;
      });
    } else if (!isPayer && isSplittee) {
      const mySplit = expense.splits.find(s => s.userId === currentUserId)!;
      balanceMap[expense.paidById] = (balanceMap[expense.paidById] || 0) - mySplit.amount;
    }
  }

  // Adjust balances with payments
  // Payments are global and not tied to a specific group in this model
  if (!groupId) {
    for (const payment of payments) {
      if (payment.fromUserId === currentUserId && payment.toUserId !== currentUserId) {
        // I paid someone, so I owe them less (or they owe me more). My debt to them decreases.
        balanceMap[payment.toUserId] = (balanceMap[payment.toUserId] || 0) + payment.amount;
      } else if (payment.toUserId === currentUserId && payment.fromUserId !== currentUserId) {
        // Someone paid me, so they owe me less (or I owe them more). Their debt to me decreases.
        balanceMap[payment.fromUserId] = (balanceMap[payment.fromUserId] || 0) - payment.amount;
      }
    }
  }
  
  return Object.entries(balanceMap)
    .map(([userId, amount]) => ({ userId, amount }))
    .filter(balance => Math.abs(balance.amount) > 0.005); // Filter out zero balances
};