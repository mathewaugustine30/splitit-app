
import React, { useState, useEffect } from 'react';
import { User, Payment } from '../types';
import { CloseIcon } from './icons';

interface SettleUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetUser: User | null;
  balanceAmount: number; // positive if they owe you, negative if you owe them
  currentUserId: string;
  onAddPayment: (payment: Omit<Payment, 'id'>) => void;
}

const SettleUpModal: React.FC<SettleUpModalProps> = ({
  isOpen,
  onClose,
  targetUser,
  balanceAmount,
  currentUserId,
  onAddPayment,
}) => {
  const [amount, setAmount] = useState<number | ''>('');

  useEffect(() => {
    if (targetUser) {
      setAmount(Math.abs(balanceAmount));
    }
  }, [targetUser, balanceAmount]);

  if (!isOpen || !targetUser) return null;

  const isPaying = balanceAmount < 0; // You owe them, so you are paying
  const fromUserId = isPaying ? currentUserId : targetUser.id;
  const toUserId = isPaying ? targetUser.id : currentUserId;
  const fromUser = isPaying ? { name: 'You' } : targetUser;
  const toUser = isPaying ? targetUser : { name: 'You' };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || amount <= 0) {
      alert('Please enter a valid amount.');
      return;
    }

    onAddPayment({
      fromUserId,
      toUserId,
      amount: parseFloat(amount.toString()),
      date: new Date().toISOString(),
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center">
      <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-md relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800">
          <CloseIcon className="w-6 h-6" />
        </button>
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Settle up</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center justify-between bg-gray-100 p-4 rounded-lg">
            <span className="font-semibold">{fromUser.name}</span>
            <span className="text-gray-500 font-bold text-xl">→</span>
            <span className="font-semibold">{toUser.name}</span>
          </div>
          <div>
            <label htmlFor="paymentAmount" className="block text-sm font-medium text-gray-700">Amount</label>
            <input
              type="number"
              id="paymentAmount"
              value={amount}
              onChange={(e) => setAmount(e.target.value === '' ? '' : parseFloat(e.target.value))}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary"
              step="0.01"
              min="0.01"
              required
            />
          </div>
          <div className="flex justify-end pt-4">
            <button type="button" onClick={onClose} className="bg-gray-200 text-gray-700 font-bold py-2 px-4 rounded-lg mr-2 hover:bg-gray-300 transition-colors">Cancel</button>
            <button type="submit" className="bg-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-green-600 transition-colors">Record payment</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SettleUpModal;
