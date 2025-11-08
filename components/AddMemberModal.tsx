import React, { useState, useMemo, useEffect } from 'react';
import { User, Group } from '../types';
import { CloseIcon } from './icons';

interface AddMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddMembers: (groupId: string, userIds: string[]) => void;
  friends: User[];
  group: Group | null;
}

const AddMemberModal: React.FC<AddMemberModalProps> = ({ isOpen, onClose, onAddMembers, friends, group }) => {
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  
  const availableFriends = useMemo(() => {
    if (!group) return [];
    return friends.filter(u => !group.memberIds.includes(u.id));
  }, [group, friends]);

  const handleCheckboxChange = (userId: string) => {
    setSelectedUserIds(prev =>
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!group || selectedUserIds.length === 0) return;
    
    onAddMembers(group.id, selectedUserIds);

    setSelectedUserIds([]);
    onClose();
  };

  useEffect(() => {
    if (isOpen) {
      setSelectedUserIds([]);
    }
  }, [isOpen]);

  if (!isOpen || !group) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center">
      <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-lg relative max-h-screen overflow-y-auto">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800">
          <CloseIcon className="w-6 h-6" />
        </button>
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Add Members to <span className="text-primary">{group.name}</span></h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <p className="block text-sm font-medium text-gray-700 mb-2">Select friends to add</p>
            {availableFriends.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-40 overflow-y-auto p-2 border rounded-md">
                {availableFriends.map(user => (
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
            ) : (
               <p className="text-gray-500 text-center py-4">All your friends are already in this group.</p>
            )}
          </div>
          <div className="flex justify-end pt-4">
            <button type="button" onClick={onClose} className="bg-gray-200 text-gray-700 font-bold py-2 px-4 rounded-lg mr-2 hover:bg-gray-300 transition-colors">Cancel</button>
            <button type="submit" className="bg-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-green-600 transition-colors disabled:bg-gray-400" disabled={selectedUserIds.length === 0}>Add Members</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddMemberModal;