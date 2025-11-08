import React, { useMemo } from 'react';
import { Expense, Payment, User, Group, ActivityFilters } from '../types';
import ActivityFiltersComponent from './ActivityFilters';
import { CATEGORY_ICONS } from '../constants';
import { PaperclipIcon } from './icons';

interface ActivityViewProps {
  expenses: Expense[];
  payments: Payment[];
  users: User[];
  groups: Group[];
  filters: ActivityFilters;
  onFiltersChange: (filters: ActivityFilters) => void;
  currentUserId: string;
}

type ActivityItem = (Expense & { type: 'expense' }) | (Payment & { type: 'payment' });

const ActivityView: React.FC<ActivityViewProps> = ({ expenses, payments, users, groups, filters, onFiltersChange }) => {
  const getUser = (id: string) => users.find(u => u.id === id);
  const getGroup = (id: string | null) => id ? groups.find(g => g.id === id) : null;

  const filteredActivity = useMemo(() => {
    const combined: ActivityItem[] = [
      ...expenses.map(e => ({ ...e, type: 'expense' as const })),
      ...payments.map(p => ({ ...p, type: 'payment' as const })),
    ];
    
    return combined
      .filter(item => {
        // Date filter
        const itemDate = new Date(item.date);
        if (filters.startDate && new Date(filters.startDate) > itemDate) return false;
        if (filters.endDate && new Date(filters.endDate) < itemDate) return false;

        // Group filter
        if (filters.groups.length > 0) {
          if (item.type === 'payment') return false; // Payments are not in groups
          if (!item.groupId || !filters.groups.includes(item.groupId)) return false;
        }

        // Participant filter
        if (filters.participants.length > 0) {
          let involvedUserIds: string[] = [];
          if (item.type === 'expense') {
            involvedUserIds = [item.paidById, ...item.splits.map(s => s.userId)];
          } else {
            involvedUserIds = [item.fromUserId, item.toUserId];
          }
          if (!filters.participants.some(pId => involvedUserIds.includes(pId))) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [expenses, payments, filters]);


  const renderActivityItem = (item: ActivityItem) => {
    if (item.type === 'expense') {
      const payer = getUser(item.paidById);
      const group = getGroup(item.groupId);
      return (
        <div className="flex items-start space-x-4">
            <span className="text-3xl mt-1">{CATEGORY_ICONS[item.category] || '🧾'}</span>
            <div className="flex-grow">
                <p className="font-semibold text-gray-800 flex items-center">
                    {item.description}
                    {item.receiptUrl && (
                        <a href={item.receiptUrl} target="_blank" rel="noopener noreferrer" className="ml-2 text-gray-400 hover:text-secondary" title="View receipt">
                            <PaperclipIcon className="w-5 h-5" />
                        </a>
                    )}
                </p>
                <p className="text-sm text-gray-600">
                    <span className="font-bold">{payer?.name || 'Someone'}</span> paid <span className="font-bold text-gray-800">{item.amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</span>
                </p>
                {group && <p className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full inline-block mt-1">In: {group.name}</p>}
            </div>
        </div>
      );
    }

    if (item.type === 'payment') {
      const from = getUser(item.fromUserId);
      const to = getUser(item.toUserId);
      return (
        <div className="flex items-start space-x-4">
          <span className="text-3xl mt-1 text-green-500">💸</span>
          <div>
            <p className="font-semibold text-gray-800">Payment</p>
            <p className="text-sm text-gray-600">
                <span className="font-bold">{from?.name || 'Someone'}</span> paid <span className="font-bold">{to?.name || 'Someone'}</span>
            </p>
          </div>
        </div>
      );
    }
    return null;
  };
  
  const renderItemAmount = (item: ActivityItem) => {
    if (item.type === 'payment') {
        return (
            <p className="font-semibold text-success">
                {item.amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
            </p>
        );
    }
    // Expense
    return (
        <p className="font-semibold text-gray-800">
            {item.amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
        </p>
    );
  }

  return (
    <div className="p-4 sm:p-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Activity</h1>
      <ActivityFiltersComponent filters={filters} onFiltersChange={onFiltersChange} users={users} groups={groups} />
      <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
        <ul className="space-y-4">
          {filteredActivity.map(item => (
            <li key={`${item.type}-${item.id}`} className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b pb-4 last:border-b-0 last:pb-0">
              <div className="flex items-center w-full">
                <div className="text-center mr-4 w-12 sm:w-16 flex-shrink-0">
                  <p className="text-sm text-gray-500">{new Date(item.date).toLocaleString('default', { month: 'short' })}</p>
                  <p className="text-2xl font-bold text-gray-700">{new Date(item.date).getDate()}</p>
                </div>
                {renderActivityItem(item)}
              </div>
              <div className="text-right self-end sm:self-center mt-2 sm:mt-0">
                {renderItemAmount(item)}
              </div>
            </li>
          ))}
          {filteredActivity.length === 0 && (
            <p className="text-gray-500 text-center py-8">No activities match the current filters.</p>
          )}
        </ul>
      </div>
    </div>
  );
};

export default ActivityView;