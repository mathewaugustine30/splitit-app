import React from 'react';
import { User } from '../types';
import { MenuIcon } from './icons';

interface HeaderProps {
  users: User[];
  currentUserId: string;
  onSetCurrentUser: (userId: string) => void;
  onAddExpenseClick: () => void;
  onToggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ users, currentUserId, onSetCurrentUser, onAddExpenseClick, onToggleSidebar }) => {
  const currentUser = users.find(u => u.id === currentUserId);

  return (
    <header className="bg-white shadow-md sticky top-0 z-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <button
                onClick={onToggleSidebar}
                className="md:hidden mr-4 text-gray-500 hover:text-gray-700"
                aria-label="Open sidebar"
            >
                <MenuIcon className="w-6 h-6" />
            </button>
            <div className="flex-shrink-0 flex items-center">
                <span className="text-2xl font-bold text-primary">💸 SplitIt</span>
            </div>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-4">
            <button
              onClick={onAddExpenseClick}
              className="bg-primary hover:bg-green-600 text-white font-bold py-2 px-3 sm:px-4 rounded-lg shadow-md transition-colors duration-300 text-sm sm:text-base"
            >
              Add expense
            </button>
            <div className="relative">
              <select
                value={currentUserId}
                onChange={(e) => onSetCurrentUser(e.target.value)}
                className="appearance-none bg-white border border-gray-300 rounded-md py-2 pl-3 pr-10 text-base focus:outline-none focus:ring-primary focus:border-primary sm:text-sm cursor-pointer"
              >
                {users.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.name}
                  </option>
                ))}
              </select>
              {currentUser && (
                  <img src={currentUser.avatarUrl} alt={currentUser.name} className="w-8 h-8 rounded-full absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;