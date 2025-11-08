
import React from 'react';
import { Group, User, View } from '../types';
import { DashboardIcon, UsersIcon } from './icons';

interface SidebarProps {
  groups: Group[];
  users: User[];
  currentUserId: string;
  view: View;
  onSetView: (view: View) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ groups, users, currentUserId, view, onSetView }) => {
  const otherUsers = users.filter(u => u.id !== currentUserId);

  const getNavItemClasses = (isActive: boolean) =>
    `flex items-center px-4 py-2 text-gray-700 rounded-md cursor-pointer transition-colors duration-200 ${
      isActive ? 'bg-primary text-white font-semibold' : 'hover:bg-medium-gray'
    }`;
  
  return (
    <aside className="w-64 bg-white p-4 space-y-6 border-r border-gray-200">
      <div>
        <button
          onClick={() => onSetView({ type: 'dashboard' })}
          className={getNavItemClasses(view.type === 'dashboard')}
        >
          <DashboardIcon className="w-5 h-5 mr-3" />
          Dashboard
        </button>
      </div>

      <div>
        <h3 className="px-4 text-sm font-semibold text-gray-500 uppercase tracking-wider">Groups</h3>
        <nav className="mt-2 space-y-1">
          {groups.map(group => (
            <button
              key={group.id}
              onClick={() => onSetView({ type: 'group', groupId: group.id })}
              className={getNavItemClasses(view.type === 'group' && view.groupId === group.id)}
            >
              <span className="mr-3 text-lg">{"🏠"}</span>
              {group.name}
            </button>
          ))}
        </nav>
      </div>

      <div>
        <h3 className="px-4 text-sm font-semibold text-gray-500 uppercase tracking-wider">Friends</h3>
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
