import React from 'react';
import { PlusIcon, MenuIcon } from './icons';
import { User } from '../types';

interface HeaderProps {
  onAddExpense: () => void;
  onToggleSidebar: () => void;
  title: string;
  loggedInUser: User;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ onAddExpense, onToggleSidebar, title, loggedInUser, onLogout }) => {
  return (
    <header className="bg-white shadow-sm sticky top-0 z-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <button
              onClick={onToggleSidebar}
              className="md:hidden mr-4 text-gray-500 hover:text-gray-700"
              aria-label="Open sidebar"
            >
              <MenuIcon className="h-6 w-6" />
            </button>
            <h1 className="text-xl font-bold text-gray-800">{title}</h1>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={onAddExpense}
              className="hidden sm:flex items-center bg-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-green-600 transition-colors"
            >
              <PlusIcon className="w-5 h-5 mr-2 -ml-1" />
              Add expense
            </button>
            <div className="flex items-center">
              <span className="hidden sm:inline text-sm font-medium text-gray-700 mr-3">{loggedInUser.name}</span>
              <img src={loggedInUser.avatarUrl} alt={loggedInUser.name} className="w-8 h-8 rounded-full" />
            </div>
            <button
              onClick={onLogout}
              className="text-sm font-medium text-gray-500 hover:text-gray-800"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;