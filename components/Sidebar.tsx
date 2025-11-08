import React from 'react';
import { Group, User, View } from '../types';
import { DashboardIcon, UsersIcon, PlusIcon, ActivityIcon, CloseIcon } from './icons';

interface SidebarProps {
  groups: Group[];
  users: User[];
  currentUserId: string;
  view: View;
  onSetView: (view: View) => void;
  onAddGroup: () => void;
  onAddFriend: () => void;
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ groups, users, currentUserId, view, onSetView, onAddGroup, onAddFriend, isOpen, onClose }) => {
  const otherUsers = users.filter(u => u.id !== currentUserId);

  const getNavItemClasses = (isActive: boolean) =>
    `flex items-center px-4 py-2 text-gray-700 rounded-md cursor-pointer transition-colors duration-200 w-full text-left ${
      isActive ? 'bg-primary text-white font-semibold' : 'hover:bg-medium-gray'
    }`;
  
  const handleViewChange = (newView: View) => {
    onSetView(newView);
    onClose(); // Close sidebar on navigation
  };

  return (
    <aside className={`fixed inset-y-0 left-0 z-30 w-64 bg-white p-4 space-y-6 border-r border-gray-200 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      <div className="flex justify-between items-center md:hidden">
        <h2 className="text-xl font-bold text-primary">Menu</h2>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
            <CloseIcon className="w-6 h-6"/>
        </button>
      </div>

      <div>
        <button
          onClick={() => handleViewChange({ type: 'dashboard' })}
          className={getNavItemClasses(view.type === 'dashboard')}
        >
          <DashboardIcon className="w-5 h-5 mr-3" />
          Dashboard
        </button>
        <button
          onClick={() => handleViewChange({ type: 'activity' })}
          className={getNavItemClasses(view.type === 'activity')}
        >
          <ActivityIcon className="w-5 h-5 mr-3" />
          Activity
        </button>
      </div>

      <div>
        <div className="flex justify-between items-center px-4">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Groups</h3>
            <button onClick={onAddGroup} className="text-gray-500 hover:text-primary transition-colors" aria-label="Add new group">
                <PlusIcon className="w-5 h-5"/>
            </button>
        </div>
        <nav className="mt-2 space-y-1">
          {groups.map(group => (
            <button
              key={group.id}
              onClick={() => handleViewChange({ type: 'group', groupId: group.id })}
              className={getNavItemClasses(view.type === 'group' && view.groupId === group.id)}
            >
              <span className="mr-3 text-lg">{"🏠"}</span>
              {group.name}
            </button>
          ))}
        </nav>
      </div>

      <div>
        <div className="flex justify-between items-center px-4">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Friends</h3>
            <button onClick={onAddFriend} className="text-gray-500 hover:text-primary transition-colors" aria-label="Add new friend">
                <PlusIcon className="w-5 h-5"/>
            </button>
        </div>
        <nav className="mt-2 space-y-1">
          {otherUsers.map(user => (
            <div key={user.id} className="flex items-center px-4 py-2 text-gray-700 rounded-md">
              <img src={user.avatarUrl} alt={user.name} className="w-6 h-6 rounded-full mr-3" />
              {user.name}
            </div>
          ))}
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;