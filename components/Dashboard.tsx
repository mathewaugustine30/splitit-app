
import React from 'react';
import { Balance, User } from '../types';

interface DashboardProps {
  balances: Balance[];
  users: User[];
  onSettleUp: (userId: string, amount: number) => void;
}

const BalanceCard: React.FC<{ title: string; amount: number; colorClass: string }> = ({ title, amount, colorClass }) => (
  <div className="bg-white p-4 rounded-lg shadow">
    <h3 className="text-sm font-medium text-gray-500">{title}</h3>
    <p className={`text-2xl font-semibold ${colorClass}`}>{amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</p>
  </div>
);

const UserBalanceList: React.FC<{ title: string; balances: Balance[]; users: User[]; colorClass: string; onSettleUp: (userId: string, amount: number) => void; type: 'owe' | 'owed' }> = ({ title, balances, users, colorClass, onSettleUp, type }) => (
  <div className="bg-white p-6 rounded-lg shadow">
    <h2 className="text-lg font-semibold text-gray-700 mb-4">{title}</h2>
    {balances.length === 0 ? (
      <p className="text-gray-500">You're all settled up here.</p>
    ) : (
      <ul className="space-y-4">
        {balances.map(balance => {
          const user = users.find(u => u.id === balance.userId);
          if (!user) return null;
          return (
            <li key={user.id} className="flex items-center justify-between">
              <div className="flex items-center">
                <img src={user.avatarUrl} alt={user.name} className="w-10 h-10 rounded-full mr-4" />
                <div>
                  <p className="font-semibold">{user.name}</p>
                  <p className={`text-sm ${colorClass}`}>{type === 'owe' ? 'you owe' : 'owes you'} {Math.abs(balance.amount).toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</p>
                </div>
              </div>
              <button onClick={() => onSettleUp(user.id, balance.amount)} className="bg-secondary text-white font-semibold py-1 px-3 rounded-md text-sm hover:bg-blue-600 transition-colors">
                Settle Up
              </button>
            </li>
          );
        })}
      </ul>
    )}
  </div>
);


const Dashboard: React.FC<DashboardProps> = ({ balances, users, onSettleUp }) => {
  const totalOwedToYou = balances.filter(b => b.amount > 0).reduce((sum, b) => sum + b.amount, 0);
  const totalYouOwe = balances.filter(b => b.amount < 0).reduce((sum, b) => sum + b.amount, 0);
  const totalBalance = totalOwedToYou + totalYouOwe;

  const usersWhoOweYou = balances.filter(b => b.amount > 0);
  const usersYouOwe = balances.filter(b => b.amount < 0);

  return (
    <div className="p-8 space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <BalanceCard title="Total balance" amount={totalBalance} colorClass={totalBalance >= 0 ? 'text-success' : 'text-danger'} />
        <BalanceCard title="You owe" amount={Math.abs(totalYouOwe)} colorClass="text-danger" />
        <BalanceCard title="You are owed" amount={totalOwedToYou} colorClass="text-success" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <UserBalanceList title="YOU OWE" balances={usersYouOwe} users={users} colorClass="text-danger" onSettleUp={onSettleUp} type="owe" />
        <UserBalanceList title="YOU ARE OWED" balances={usersWhoOweYou} users={users} colorClass="text-success" onSettleUp={onSettleUp} type="owed" />
      </div>
    </div>
  );
};

export default Dashboard;
