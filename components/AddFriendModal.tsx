import React, { useState } from 'react';
import { CloseIcon } from './icons';

interface AddFriendModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddFriend: (name: string) => void;
}

const AddFriendModal: React.FC<AddFriendModalProps> = ({ isOpen, onClose, onAddFriend }) => {
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onAddFriend(name.trim());
    setName('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center">
      <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-md relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800">
          <CloseIcon className="w-6 h-6" />
        </button>
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Add a Friend</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="friendName" className="block text-sm font-medium text-gray-700">Friend's Name</label>
            <input
              type="text"
              id="friendName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary"
              required
              autoFocus
            />
          </div>
          <div className="flex justify-end pt-4">
            <button type="button" onClick={onClose} className="bg-gray-200 text-gray-700 font-bold py-2 px-4 rounded-lg mr-2 hover:bg-gray-300 transition-colors">Cancel</button>
            <button type="submit" className="bg-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-green-600 transition-colors disabled:bg-gray-400" disabled={!name.trim()}>Add Friend</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddFriendModal;
