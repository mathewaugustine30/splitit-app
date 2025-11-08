import React, { useMemo } from 'react';
import { Group, User, Expense, Filters, Balance } from '../types';
import { PlusIcon, EditIcon } from './icons';
import { CATEGORY_ICONS } from '../constants';
import ExpenseFilters from './ExpenseFilters';
import { calculateBalances } from '../services/balanceService';

interface GroupViewProps {
  group: Group;
  users: User[];
  expenses: Expense[];
  onAddMember: (groupId: string) => void;
  onEditExpense: (expense: Expense) => void;
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
  currentUserId: string;
  onSettleUp: (userId: string, amount: number) => void;
}

const GroupView: React.FC<GroupViewProps> = ({ group, users, expenses, onAddMember, onEditExpense, filters, onFiltersChange, currentUserId, onSettleUp }) => {
  const groupMembers = useMemo(() => users.filter(u => group.memberIds.includes(u.id)), [users, group]);

  const groupBalances = useMemo(() => {
    // Note: group-specific balances only consider expenses within the group.
    // Global payments are not factored in here, as they settle the overall debt.
    return calculateBalances(currentUserId, groupMembers, expenses, [], group.id);
  }, [currentUserId, groupMembers, expenses, group.id]);

  const filteredGroupExpenses = useMemo(() => {
    const groupExpenses = expenses.filter(e => e.groupId === group.id);
    return groupExpenses
      .filter(expense => {
        if (filters.categories.length > 0 && !filters.categories.includes(expense.category)) {
          return false;
        }
        if (filters.payers.length > 0 && !filters.payers.includes(expense.paidById)) {
          return false;
        }
        const expenseDate = new Date(expense.date);
        if (filters.startDate && new Date(filters.startDate) > expenseDate) {
          return false;
        }
        if (filters.endDate && new Date(filters.endDate) < expenseDate) {
          return false;
        }
        return true;
      })
      .sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [expenses, filters, group.id]);
  
  const getBalanceForUser = (userId: string): Balance | undefined => {
    return groupBalances.find(b => b.userId === userId);
  }

  return (
    <div className="p-8">
      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <div className="flex justify-between items-start">
            <div>
                <h1 className="text-3xl font-bold text-gray-800">{group.name}</h1>
                <div className="flex -space-x-2 overflow-hidden mt-4">
                {groupMembers.map(member => (
                    <img key={member.id} className="inline-block h-10 w-10 rounded-full ring-2 ring-white" src={member.avatarUrl} alt={member.name} title={member.name} />
                ))}
                </div>
            </div>
            <button 
                onClick={() => onAddMember(group.id)}
                className="flex items-center bg-secondary text-white font-semibold py-2 px-4 rounded-md text-sm hover:bg-blue-600 transition-colors"
            >
                <PlusIcon className="w-4 h-4 mr-2"/>
                Add Member
            </button>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Group Balances</h2>
        <ul className="space-y-3">
          {groupMembers.filter(m => m.id !== currentUserId).map(member => {
            const balance = getBalanceForUser(member.id);
            let balanceText, textColor;

            if (balance) {
                if (balance.amount > 0) {
                    balanceText = `${member.name} owes you ${balance.amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}`;
                    textColor = 'text-success';
                } else {
                    balanceText = `You owe ${member.name} ${Math.abs(balance.amount).toLocaleString('en-US', { style: 'currency', currency: 'USD' })}`;
                    textColor = 'text-danger';
                }
            } else {
                balanceText = 'All settled up';
                textColor = 'text-gray-500';
            }

            return (
              <li key={member.id} className="flex items-center justify-between">
                <div className="flex items-center">
                  <img src={member.avatarUrl} alt={member.name} className="w-8 h-8 rounded-full mr-3" />
                  <p className={`font-medium ${textColor}`}>{balanceText}</p>
                </div>
                {balance && (
                    <button onClick={() => onSettleUp(member.id, balance.amount)} className="bg-secondary text-white font-semibold py-1 px-3 rounded-md text-sm hover:bg-blue-600 transition-colors">
                        Settle Up
                    </button>
                )}
              </li>
            );
          })}
        </ul>
      </div>
      
      <ExpenseFilters filters={filters} onFiltersChange={onFiltersChange} availablePayers={groupMembers} />

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Expense History</h2>
        <ul className="space-y-4">
          {filteredGroupExpenses.map(expense => {
            const payer = users.find(u => u.id === expense.paidById);
            return (
              <li key={expense.id} className="flex items-center justify-between border-b pb-4 last:border-b-0 last:pb-0">
                <div className="flex items-center">
                  <div className="text-center mr-4 w-16">
                    <p className="text-sm text-gray-500">{new Date(expense.date).toLocaleString('default', { month: 'short' })}</p>
                    <p className="text-2xl font-bold text-gray-700">{new Date(expense.date).getDate()}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 flex items-center">
                      <span className="text-xl mr-2" title={expense.category}>{CATEGORY_ICONS[expense.category] || '🧾'}</span>
                      {expense.description}
                    </p>
                    <p className="text-sm text-gray-500">{payer?.name} paid {expense.amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</p>
                    {expense.notes && (
                      <p className="text-sm text-gray-600 italic mt-1 pl-2 border-l-2 border-gray-200">{expense.notes}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center">
                    <div className="text-right">
                        <p className="font-semibold text-gray-800">{expense.amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</p>
                    </div>
                    <button
                        onClick={() => onEditExpense(expense)}
                        className="ml-4 text-gray-400 hover:text-secondary transition-colors duration-200"
                        aria-label={`Edit expense ${expense.description}`}
                    >
                        <EditIcon className="w-5 h-5" />
                    </button>
                </div>
              </li>
            );
          })}
           {filteredGroupExpenses.length === 0 && (
              <p className="text-gray-500 text-center py-4">No expenses match the current filters.</p>
           )}
        </ul>
      </div>
    </div>
  );
};

export default GroupView;