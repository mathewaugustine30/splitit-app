import React, { useMemo, useState } from 'react';
import { Balance, User, Expense, Filters } from '../types';
import ExpenseFilters from './ExpenseFilters';
import { CATEGORY_ICONS } from '../constants';
import { EditIcon, PaperclipIcon } from './icons';
import BarChart from './BarChart';
import PieChart from './PieChart';
import { generateColorFromString } from '../utils/colors';

interface DashboardProps {
  balances: Balance[];
  users: User[];
  expenses: Expense[];
  onSettleUp: (userId: string, amount: number) => void;
  onEditExpense: (expense: Expense) => void;
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
}

const BalanceCard: React.FC<{ title: string; amount: number; colorClass: string }> = ({ title, amount, colorClass }) => (
  <div className="bg-white p-4 rounded-lg shadow">
    <h3 className="text-sm font-medium text-gray-500">{title}</h3>
    <p className={`text-2xl font-semibold ${colorClass}`}>{amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</p>
  </div>
);

const UserBalanceList: React.FC<{ title: string; balances: Balance[]; users: User[]; colorClass: string; borderColorClass: string; onSettleUp: (userId: string, amount: number) => void; type: 'owe' | 'owed' }> = ({ title, balances, users, colorClass, borderColorClass, onSettleUp, type }) => (
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
            <li key={user.id} className={`flex items-center justify-between p-3 rounded-md border-l-4 ${borderColorClass}`}>
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


const Dashboard: React.FC<DashboardProps> = ({ balances, users, expenses, onSettleUp, onEditExpense, filters, onFiltersChange }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());

  const totalOwedToYou = balances.filter(b => b.amount > 0).reduce((sum, b) => sum + b.amount, 0);
  const totalYouOwe = balances.filter(b => b.amount < 0).reduce((sum, b) => sum + b.amount, 0);
  const totalBalance = totalOwedToYou + totalYouOwe;

  const usersWhoOweYou = balances.filter(b => b.amount > 0);
  const usersYouOwe = balances.filter(b => b.amount < 0);

  const filteredExpenses = useMemo(() => {
    return expenses
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
  }, [expenses, filters]);

  // Monthly overview logic
  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(parseInt(e.target.value, 10));
    setSelectedDate(newDate);
  };

  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newDate = new Date(selectedDate);
    newDate.setFullYear(parseInt(e.target.value, 10));
    setSelectedDate(newDate);
  };

  const years = useMemo(() => {
    const expenseYears = [...new Set(expenses.map(e => new Date(e.date).getFullYear()))];
    const currentYear = new Date().getFullYear();
    if (!expenseYears.includes(currentYear)) {
      expenseYears.push(currentYear);
    }
    return expenseYears.sort((a, b) => b - a);
  }, [expenses]);

  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  const monthlyExpenses = useMemo(() => {
    return expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate.getFullYear() === selectedDate.getFullYear() && expenseDate.getMonth() === selectedDate.getMonth();
    });
  }, [expenses, selectedDate]);

  const totalMonthlyExpenses = useMemo(() => {
    return monthlyExpenses.reduce((sum, exp) => sum + exp.amount, 0);
  }, [monthlyExpenses]);

  const categoryTotalsForChart = useMemo(() => {
    const totals: { [key: string]: number } = {};
    for (const expense of monthlyExpenses) {
      totals[expense.category] = (totals[expense.category] || 0) + expense.amount;
    }
    return Object.entries(totals)
      .map(([label, value]) => ({
        label,
        value,
        icon: CATEGORY_ICONS[label] || '🧾'
      }))
      .sort((a, b) => b.value - a.value);
  }, [monthlyExpenses]);

  const overallCategoryTotals = useMemo(() => {
    const totals: { [key: string]: number } = {};
    for (const expense of expenses) {
      totals[expense.category] = (totals[expense.category] || 0) + expense.amount;
    }
    return Object.entries(totals)
      .map(([label, value]) => ({
        label,
        value,
        color: generateColorFromString(label)
      }))
      .sort((a, b) => b.value - a.value);
  }, [expenses]);


  return (
    <div className="p-4 sm:p-8 space-y-8">
      {/* Balance Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <BalanceCard title="Total balance" amount={totalBalance} colorClass={totalBalance >= 0 ? 'text-success' : 'text-danger'} />
        <BalanceCard title="You owe" amount={Math.abs(totalYouOwe)} colorClass="text-danger" />
        <BalanceCard title="You are owed" amount={totalOwedToYou} colorClass="text-success" />
      </div>

      {/* Overall Expense Breakdown */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold text-gray-700 mb-2">Overall Expense Breakdown</h2>
        <PieChart data={overallCategoryTotals} />
      </div>

      {/* Monthly Overview */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-700 mb-2 sm:mb-0">Monthly Overview</h2>
          <div className="flex space-x-2">
            <select
              value={selectedDate.getMonth()}
              onChange={handleMonthChange}
              className="appearance-none bg-white border border-gray-300 rounded-md py-1 px-2 text-sm focus:outline-none focus:ring-primary focus:border-primary"
            >
              {months.map((month, index) => (
                <option key={month} value={index}>{month}</option>
              ))}
            </select>
            <select
              value={selectedDate.getFullYear()}
              onChange={handleYearChange}
              className="appearance-none bg-white border border-gray-300 rounded-md py-1 px-2 text-sm focus:outline-none focus:ring-primary focus:border-primary"
            >
              {years.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <p className="text-gray-500">Total for {selectedDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</p>
          <p className="text-3xl font-bold text-gray-800">{totalMonthlyExpenses.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</p>
        </div>
        <BarChart data={categoryTotalsForChart} />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <UserBalanceList title="YOU OWE" balances={usersYouOwe} users={users} colorClass="text-danger" borderColorClass="border-danger" onSettleUp={onSettleUp} type="owe" />
        <UserBalanceList title="YOU ARE OWED" balances={usersWhoOweYou} users={users} colorClass="text-success" borderColorClass="border-success" onSettleUp={onSettleUp} type="owed" />
      </div>

      {/* All Expenses */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">All Expenses</h2>
        <ExpenseFilters filters={filters} onFiltersChange={onFiltersChange} availablePayers={users} />
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
          <ul className="space-y-4">
            {filteredExpenses.map(expense => {
              const payer = users.find(u => u.id === expense.paidById);
              return (
                <li key={expense.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b pb-4 last:border-b-0 last:pb-0">
                  <div className="flex items-center w-full">
                    <div className="text-center mr-4 w-12 sm:w-16 flex-shrink-0">
                      <p className="text-sm text-gray-500">{new Date(expense.date).toLocaleString('default', { month: 'short' })}</p>
                      <p className="text-2xl font-bold text-gray-700">{new Date(expense.date).getDate()}</p>
                    </div>
                    <div className="flex-grow">
                      <p className="font-semibold text-gray-800 flex items-center">
                        <span className="text-xl mr-2" title={expense.category}>{CATEGORY_ICONS[expense.category] || '🧾'}</span>
                        {expense.description}
                        {expense.receiptUrl && (
                            <a href={expense.receiptUrl} target="_blank" rel="noopener noreferrer" className="ml-2 text-gray-400 hover:text-secondary" title="View receipt">
                                <PaperclipIcon className="w-5 h-5" />
                            </a>
                        )}
                      </p>
                      <p className="text-sm text-gray-500">{payer?.name} paid {expense.amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</p>
                      {expense.notes && (
                        <p className="text-sm text-gray-600 italic mt-1 pl-2 border-l-2 border-gray-200">{expense.notes}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center self-end sm:self-center mt-2 sm:mt-0">
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
            {filteredExpenses.length === 0 && (
                <p className="text-gray-500 text-center py-4">No expenses match the current filters.</p>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;