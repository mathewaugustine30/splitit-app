
import { User, Expense, Payment, Balance } from '../types';

export const calculateBalances = (
  currentUserId: string,
  users: User[],
  expenses: Expense[],
  payments: Payment[]
): Balance[] => {
  const balanceMap: { [key: string]: number } = {};
  const otherUsers = users.filter(u => u.id !== currentUserId);

  otherUsers.forEach(user => {
    balanceMap[user.id] = 0;
  });

  // Calculate balances from expenses
  for (const expense of expenses) {
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
  for (const payment of payments) {
    if (payment.fromUserId === currentUserId && payment.toUserId !== currentUserId) {
      balanceMap[payment.toUserId] = (balanceMap[payment.toUserId] || 0) - payment.amount;
    } else if (payment.toUserId === currentUserId && payment.fromUserId !== currentUserId) {
      balanceMap[payment.fromUserId] = (balanceMap[payment.fromUserId] || 0) + payment.amount;
    }
  }

  return Object.entries(balanceMap)
    .map(([userId, amount]) => ({ userId, amount }))
    .filter(balance => Math.abs(balance.amount) > 0.005); // Filter out zero balances
};
