import React, { useState, useMemo, useEffect } from 'react';
import { User, Group, Expense, Split } from '../types';
import { CloseIcon } from './icons';
import { EXPENSE_CATEGORIES } from '../constants';

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  users: User[];
  groups: Group[];
  currentUser: User;
  friends: User[];
  onAddExpense: (expense: Omit<Expense, 'id'>) => void;
  onUpdateExpense: (expense: Expense) => void;
  expenseToEdit: Expense | null;
}

const AddExpenseModal: React.FC<AddExpenseModalProps> = ({
  isOpen,
  onClose,
  users,
  groups,
  currentUser,
  friends,
  onAddExpense,
  onUpdateExpense,
  expenseToEdit,
}) => {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState<number | ''>('');
  const [paidById, setPaidById] = useState(currentUser.id);
  const [groupId, setGroupId] = useState<string | null>(null);
  const [category, setCategory] = useState<string>(EXPENSE_CATEGORIES[0]);
  const [notes, setNotes] = useState('');
  const [receiptUrl, setReceiptUrl] = useState<string | null>(null);
  const [splitMethod, setSplitMethod] = useState<'equally' | 'unequally'>('equally');
  const [customSplits, setCustomSplits] = useState<{ [key: string]: string }>({});
  
  const isEditMode = useMemo(() => !!expenseToEdit, [expenseToEdit]);

  const availableUsersForSplitting = useMemo(() => {
    if (groupId) {
        const group = groups.find(g => g.id === groupId);
        return group ? users.filter(u => group.memberIds.includes(u.id)) : [currentUser, ...friends];
    }
    return [currentUser, ...friends]; // For non-group expenses, it's me and my friends
  }, [groupId, groups, users, currentUser, friends]);


  const [splitWithUserIds, setSplitWithUserIds] = useState<string[]>([]);
  
  // Memoized calculations for unequal split
  const totalCustomSplit = useMemo(() => {
    return Object.values(customSplits).reduce((sum, val) => sum + (parseFloat(val) || 0), 0);
  }, [customSplits]);

  const isBalanced = useMemo(() => {
    const totalAmount = parseFloat(String(amount)) || 0;
    if (totalAmount === 0) return false;
    return Math.abs(totalAmount - totalCustomSplit) < 0.01;
  }, [amount, totalCustomSplit]);


  useEffect(() => {
     if (isOpen) {
        if (isEditMode && expenseToEdit) {
            setDescription(expenseToEdit.description);
            setAmount(expenseToEdit.amount);
            setPaidById(expenseToEdit.paidById);
            setGroupId(expenseToEdit.groupId);
            setCategory(expenseToEdit.category);
            setNotes(expenseToEdit.notes || '');
            setReceiptUrl(expenseToEdit.receiptUrl || null);
            setSplitWithUserIds(expenseToEdit.splits.map(s => s.userId));

            const firstSplitAmount = expenseToEdit.splits[0]?.amount;
            const isUnequal = expenseToEdit.splits.some(s => Math.abs(s.amount - firstSplitAmount) > 0.01);
            
            if (isUnequal) {
              setSplitMethod('unequally');
              const custom = expenseToEdit.splits.reduce((acc, split) => {
                acc[split.userId] = String(split.amount);
                return acc;
              }, {} as {[key:string]: string});
              setCustomSplits(custom);
            } else {
              setSplitMethod('equally');
              setCustomSplits({});
            }

        } else {
            // Reset form for 'Add' mode
            setDescription('');
            setAmount('');
            setPaidById(currentUser.id);
            setGroupId(groups.length > 0 ? groups[0].id : null);
            setCategory(EXPENSE_CATEGORIES[0]);
            setNotes('');
            setReceiptUrl(null);
            setSplitMethod('equally');
            setCustomSplits({});
            setSplitWithUserIds(availableUsersForSplitting.map(u => u.id));
        }
    }
  }, [isOpen, isEditMode, expenseToEdit, currentUser.id, groups, users]);

  useEffect(() => {
    if (isOpen && !isEditMode) {
      setSplitWithUserIds(availableUsersForSplitting.map(u => u.id));
    }
  }, [availableUsersForSplitting, isOpen, isEditMode]);

  useEffect(() => {
    const isPayerAvailable = availableUsersForSplitting.some(u => u.id === paidById);
    if (!isPayerAvailable && availableUsersForSplitting.length > 0) {
        const currentUserIsAvailable = availableUsersForSplitting.some(u => u.id === currentUser.id);
        setPaidById(currentUserIsAvailable ? currentUser.id : availableUsersForSplitting[0].id);
    }
  }, [availableUsersForSplitting, paidById, currentUser.id]);

  const handleSplitCheckboxChange = (userId: string) => {
    const newSplitIds = splitWithUserIds.includes(userId)
      ? splitWithUserIds.filter(id => id !== userId)
      : [...splitWithUserIds, userId];
    setSplitWithUserIds(newSplitIds);
  };
  
  const handleCustomSplitChange = (userId: string, value: string) => {
    setCustomSplits(prev => ({
      ...prev,
      [userId]: value,
    }));
  };

  const handleAddReceipt = () => {
    // In a real app, this would open a file picker.
    // For this demo, we'll just use a random placeholder image.
    setReceiptUrl(`https://picsum.photos/seed/receipt${Date.now()}/400/600`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !amount || splitWithUserIds.length === 0) {
      alert('Please fill all fields and select at least one person to split with.');
      return;
    }

    const totalAmount = parseFloat(amount.toString());
    let splits: Split[] = [];

    if (splitMethod === 'equally') {
      const splitAmount = totalAmount / splitWithUserIds.length;
      splits = splitWithUserIds.map(userId => ({
        userId,
        amount: parseFloat(splitAmount.toFixed(2)),
      }));

      // Adjust for rounding errors
      const totalSplit = splits.reduce((sum, s) => sum + s.amount, 0);
      const roundingDiff = totalAmount - totalSplit;
      if (Math.abs(roundingDiff) > 0.001 && splits.length > 0) {
          splits[0].amount += roundingDiff;
      }
    } else { // Unequally
      if (!isBalanced) {
        alert('The total of the splits must match the total expense amount.');
        return;
      }
      splits = Object.entries(customSplits)
        .filter(([, value]) => parseFloat(value) > 0)
        .map(([userId, value]) => ({
          userId,
          amount: parseFloat(value),
        }));
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
        notes: notes || undefined,
        receiptUrl: receiptUrl || undefined,
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
        notes: notes || undefined,
        receiptUrl: receiptUrl || undefined,
      };
      onAddExpense(newExpense);
    }
    
    onClose();
  };

  if (!isOpen) return null;
  
  const remainingAmount = (parseFloat(String(amount)) || 0) - totalCustomSplit;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-2xl p-6 sm:p-8 w-full max-w-lg relative max-h-full overflow-y-auto">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800">
          <CloseIcon className="w-6 h-6" />
        </button>
        <h2 className="text-2xl font-bold mb-6 text-gray-800">{isEditMode ? 'Edit expense' : 'Add an expense'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
            <input type="text" id="description" value={description} onChange={(e) => setDescription(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary" required />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700">Notes (optional)</label>
            <textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary" placeholder="Add any extra details..."></textarea>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Receipt (optional)</label>
            {!receiptUrl ? (
                <button type="button" onClick={handleAddReceipt} className="mt-1 w-full flex justify-center py-2 px-4 border border-dashed border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
                    Attach Receipt
                </button>
            ) : (
                <div className="mt-2 flex items-center justify-between p-2 border rounded-md">
                    <div className="flex items-center">
                        <img src={receiptUrl} alt="Receipt thumbnail" className="h-12 w-12 object-cover rounded-md" />
                        <a href={receiptUrl} target="_blank" rel="noopener noreferrer" className="ml-3 text-sm font-medium text-secondary hover:underline">View Full Image</a>
                    </div>
                    <button type="button" onClick={() => setReceiptUrl(null)} className="text-sm font-medium text-danger hover:underline">
                        Remove
                    </button>
                </div>
            )}
          </div>

          {/* Split Method */}
          <div>
            <p className="block text-sm font-medium text-gray-700 mb-2">Split method</p>
            <div className="flex space-x-4">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input type="radio" name="splitMethod" value="equally" checked={splitMethod === 'equally'} onChange={() => setSplitMethod('equally')} className="h-4 w-4 text-primary focus:ring-primary border-gray-300" />
                <span>Equally</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input type="radio" name="splitMethod" value="unequally" checked={splitMethod === 'unequally'} onChange={() => setSplitMethod('unequally')} className="h-4 w-4 text-primary focus:ring-primary border-gray-300" />
                <span>Unequally</span>
              </label>
            </div>
          </div>

          {/* Participants */}
          <div>
            <p className="block text-sm font-medium text-gray-700 mb-2">Split with</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-40 overflow-y-auto p-2 border rounded-md">
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

          {/* Unequal Split Inputs */}
          {splitMethod === 'unequally' && (
            <div>
              <p className="block text-sm font-medium text-gray-700 mb-2">Enter shares</p>
              <div className="space-y-2 max-h-48 overflow-y-auto p-2 border rounded-md">
                {availableUsersForSplitting.filter(u => splitWithUserIds.includes(u.id)).map(user => (
                  <div key={user.id} className="flex items-center justify-between">
                    <label htmlFor={`split-${user.id}`} className="text-gray-600">{user.name}</label>
                    <input
                      id={`split-${user.id}`}
                      type="number"
                      value={customSplits[user.id] || ''}
                      onChange={e => handleCustomSplitChange(user.id, e.target.value)}
                      placeholder="0.00"
                      className="w-28 text-right border border-gray-300 rounded-md shadow-sm py-1 px-2 focus:outline-none focus:ring-primary focus:border-primary"
                      step="0.01"
                      min="0"
                    />
                  </div>
                ))}
              </div>
              <div className={`mt-2 p-2 rounded-md text-sm flex justify-between ${isBalanced ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                <span>{isBalanced ? 'Total matches' : 'Remaining:'}</span>
                <span className="font-semibold">{isBalanced ? totalCustomSplit.toLocaleString('en-US', { style: 'currency', currency: 'USD'}) : remainingAmount.toLocaleString('en-US', { style: 'currency', currency: 'USD'})}</span>
              </div>
            </div>
          )}

          <div className="flex justify-end pt-4">
            <button type="button" onClick={onClose} className="bg-gray-200 text-gray-700 font-bold py-2 px-4 rounded-lg mr-2 hover:bg-gray-300 transition-colors">Cancel</button>
            <button 
              type="submit" 
              className="bg-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-green-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              disabled={splitMethod === 'unequally' && !isBalanced}
            >
              {isEditMode ? 'Update' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddExpenseModal;