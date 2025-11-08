import React, { useState } from 'react';
import { User } from '../types';
import { CloseIcon } from './icons';

interface AddGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddGroup: (group: { name: string; memberIds: string[] }) => void;
  users: User[];
  currentUserId: string;
}

const AddGroupModal: React.FC<AddGroupModalProps> = ({ isOpen, onClose, onAddGroup, users, currentUserId }) => {
  const [name, setName] = useState('');
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  
  const friends = users.filter(u => u.id !== currentUserId);

  const handleCheckboxChange = (userId: string) => {
    setSelectedUserIds(prev =>
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    
    onAddGroup({
      name: name.trim(),
      memberIds: [currentUserId, ...selectedUserIds],
    });

    setName('');
    setSelectedUserIds([]);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center">
      <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-lg relative max-h-screen overflow-y-auto">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800">
          <CloseIcon className="w-6 h-6" />
        </button>
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Create a New Group</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="groupName" className="block text-sm font-medium text-gray-700">Group Name</label>
            <input
              type="text"
              id="groupName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary"
              required
              autoFocus
            />
          </div>
          <div>
            <p className="block text-sm font-medium text-gray-700 mb-2">Select Members</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-40 overflow-y-auto p-2 border rounded-md">
              {friends.map(user => (
                <label key={user.id} className="flex items-center space-x-2 cursor-pointer p-1 rounded-md hover:bg-gray-100">
                  <input
                    type="checkbox"
                    checked={selectedUserIds.includes(user.id)}
                    onChange={() => handleCheckboxChange(user.id)}
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                  />
                  <span>{user.name}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="flex justify-end pt-4">
            <button type="button" onClick={onClose} className="bg-gray-200 text-gray-700 font-bold py-2 px-4 rounded-lg mr-2 hover:bg-gray-300 transition-colors">Cancel</button>
            <button type="submit" className="bg-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-green-600 transition-colors disabled:bg-gray-400" disabled={!name.trim()}>Create Group</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddGroupModal;
