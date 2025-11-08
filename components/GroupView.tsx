
import React from 'react';
import { Group, User, Expense } from '../types';

interface GroupViewProps {
  group: Group;
  users: User[];
  expenses: Expense[];
}

const GroupView: React.FC<GroupViewProps> = ({ group, users, expenses }) => {
  const groupExpenses = expenses.filter(e => e.groupId === group.id).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const groupMembers = users.filter(u => group.memberIds.includes(u.id));

  return (
    <div className="p-8">
      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <h1 className="text-3xl font-bold text-gray-800">{group.name}</h1>
        <div className="flex -space-x-2 overflow-hidden mt-4">
          {groupMembers.map(member => (
            <img key={member.id} className="inline-block h-10 w-10 rounded-full ring-2 ring-white" src={member.avatarUrl} alt={member.name} title={member.name} />
          ))}
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Expense History</h2>
        <ul className="space-y-4">
          {groupExpenses.map(expense => {
            const payer = users.find(u => u.id === expense.paidById);
            return (
              <li key={expense.id} className="flex items-center justify-between border-b pb-4 last:border-b-0 last:pb-0">
                <div className="flex items-center">
                  <div className="text-center mr-4 w-16">
                    <p className="text-sm text-gray-500">{new Date(expense.date).toLocaleString('default', { month: 'short' })}</p>
                    <p className="text-2xl font-bold text-gray-700">{new Date(expense.date).getDate()}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">{expense.description}</p>
                    <p className="text-sm text-gray-500">{payer?.name} paid {expense.amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</p>
                  </div>
                </div>
                <div className="text-right">
                    <p className="font-semibold text-gray-800">{expense.amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</p>
                </div>
              </li>
            );
          })}
           {groupExpenses.length === 0 && (
              <p className="text-gray-500 text-center py-4">No expenses recorded in this group yet.</p>
           )}
        </ul>
      </div>
    </div>
  );
};

export default GroupView;
