import React, { useState, useMemo, useEffect } from 'react';
import { User, Group, Expense, Split } from '../types';
import { CloseIcon } from './icons';
import { EXPENSE_CATEGORIES } from '../constants';

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  users: User[];
  groups: Group[];
  currentUserId: string;
  onAddExpense: (expense: Omit<Expense, 'id'>) => void;
  onUpdateExpense: (expense: Expense) => void;
  expenseToEdit: Expense | null;
}

const AddExpenseModal: React.FC<AddExpenseModalProps> = ({
  isOpen,
  onClose,
  users,
  groups,
  currentUserId,
  onAddExpense,
  onUpdateExpense,
  expenseToEdit,
}) => {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState<number | ''>('');
  const [paidById, setPaidById] = useState(currentUserId);
  const [groupId, setGroupId] = useState<string | null>(groups.length > 0 ? groups[0].id : null);
  const [category, setCategory] = useState<string>(EXPENSE_CATEGORIES[0]);
  
  const isEditMode = useMemo(() => !!expenseToEdit, [expenseToEdit]);

  const availableUsersForSplitting = useMemo(() => {
    if (!groupId) return users;
    const group = groups.find(g => g.id === groupId);
    return group ? users.filter(u => group.memberIds.includes(u.id)) : users;
  }, [groupId, groups, users]);

  const [splitWithUserIds, setSplitWithUserIds] = useState<string[]>(() => availableUsersForSplitting.map(u => u.id));

  useEffect(() => {
     if (isOpen) {
        if (isEditMode && expenseToEdit) {
            setDescription(expenseToEdit.description);
            setAmount(expenseToEdit.amount);
            setPaidById(expenseToEdit.paidById);
            setGroupId(expenseToEdit.groupId);
            setCategory(expenseToEdit.category);
            setSplitWithUserIds(expenseToEdit.splits.map(s => s.userId));
        } else {
            // Reset form for 'Add' mode
            setDescription('');
            setAmount('');
            setPaidById(currentUserId);
            setGroupId(groups.length > 0 ? groups[0].id : null);
            setCategory(EXPENSE_CATEGORIES[0]);
        }
    }
  }, [isOpen, isEditMode, expenseToEdit, currentUserId, groups]);

  React.useEffect(() => {
    // When the group (and thus available users) changes, reset the split checkboxes
    // only if we are in 'add' mode. In 'edit' mode, we preserve the original split.
    if (!isEditMode) {
      setSplitWithUserIds(availableUsersForSplitting.map(u => u.id));
    }
  }, [availableUsersForSplitting, isEditMode]);

  useEffect(() => {
    // If the currently selected payer is not in the list of available users for the selected group,
    // reset the payer to a valid user to avoid an invalid state.
    const isPayerAvailable = availableUsersForSplitting.some(u => u.id === paidById);
    if (!isPayerAvailable && availableUsersForSplitting.length > 0) {
        // Default to the current user if they are in the group, otherwise default to the first user in the group.
        const currentUserIsAvailable = availableUsersForSplitting.some(u => u.id === currentUserId);
        if (currentUserIsAvailable) {
            setPaidById(currentUserId);
        } else {
            setPaidById(availableUsersForSplitting[0].id);
        }
    }
  }, [availableUsersForSplitting, paidById, currentUserId]);

  const handleSplitCheckboxChange = (userId: string) => {
    setSplitWithUserIds(prev =>
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !amount || splitWithUserIds.length === 0) {
      alert('Please fill all fields and select at least one person to split with.');
      return;
    }

    const totalAmount = parseFloat(amount.toString());
    const splitAmount = totalAmount / splitWithUserIds.length;

    const splits: Split[] = splitWithUserIds.map(userId => ({
      userId,
      amount: parseFloat(splitAmount.toFixed(2)),
    }));

    // Adjust for rounding errors
    const totalSplit = splits.reduce((sum, s) => sum + s.amount, 0);
    const roundingDiff = totalAmount - totalSplit;
    if (Math.abs(roundingDiff) > 0.001) {
        splits[0].amount += roundingDiff;
    }

    if (isEditMode && expenseToEdit) {
      const updatedExpense: Expense = {
        ...expenseToEdit,
        description,
        amount: totalAmount,
        paidById,
        groupId,
        splits,
        category,
      };
      onUpdateExpense(updatedExpense);
    } else {
      const newExpense: Omit<Expense, 'id'> = {
        description,
        amount: totalAmount,
        paidById,
        groupId,
        date: new Date().toISOString(),
        splits,
        category,
      };
      onAddExpense(newExpense);
    }
    
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center">
      <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-lg relative max-h-screen overflow-y-auto">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800">
          <CloseIcon className="w-6 h-6" />
        </button>
        <h2 className="text-2xl font-bold mb-6 text-gray-800">{isEditMode ? 'Edit expense' : 'Add an expense'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
            <input type="text" id="description" value={description} onChange={(e) => setDescription(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700">Amount</label>
              <input type="number" id="amount" value={amount} onChange={(e) => setAmount(e.target.value === '' ? '' : parseFloat(e.target.value))} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary" step="0.01" min="0.01" required />
            </div>
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700">Category</label>
              <select id="category" value={category} onChange={e => setCategory(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary">
                {EXPENSE_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="paidBy" className="block text-sm font-medium text-gray-700">Paid by</label>
              <select id="paidBy" value={paidById} onChange={e => setPaidById(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary">
                {availableUsersForSplitting.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
            </div>
             <div>
              <label htmlFor="group" className="block text-sm font-medium text-gray-700">Group</label>
              <select id="group" value={groupId ?? ''} onChange={e => setGroupId(e.target.value || null)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary">
                <option value="">None</option>
                {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
              </select>
            </div>
          </div>
          <div>
            <p className="block text-sm font-medium text-gray-700 mb-2">Split with (equally)</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-40 overflow-y-auto p-2 border rounded-md">
              {availableUsersForSplitting.map(user => (
                <label key={user.id} className="flex items-center space-x-2 cursor-pointer p-1 rounded-md hover:bg-gray-100">
                  <input
                    type="checkbox"
                    checked={splitWithUserIds.includes(user.id)}
                    onChange={() => handleSplitCheckboxChange(user.id)}
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                  />
                  <span>{user.name}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="flex justify-end pt-4">
            <button type="button" onClick={onClose} className="bg-gray-200 text-gray-700 font-bold py-2 px-4 rounded-lg mr-2 hover:bg-gray-300 transition-colors">Cancel</button>
            <button type="submit" className="bg-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-green-600 transition-colors">{isEditMode ? 'Update' : 'Save'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddExpenseModal;