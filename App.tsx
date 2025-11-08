import React, { useState, useMemo } from 'react';
import { User, Group, View, Expense, Filters, ActivityFilters } from './types';
import useData from './hooks/useData';
import { calculateBalances } from './services/balanceService';

import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import GroupView from './components/GroupView';
import ActivityView from './components/ActivityView';
import AddExpenseModal from './components/AddExpenseModal';
import SettleUpModal from './components/SettleUpModal';
import AddFriendModal from './components/AddFriendModal';
import AddGroupModal from './components/AddGroupModal';
import AddMemberModal from './components/AddMemberModal';
import ProfileModal from './components/ProfileModal';

const App: React.FC = () => {
  const { users, groups, expenses, payments, currentUserId, setCurrentUserId, addExpense, updateExpense, addPayment, addUser, updateUser, addGroup, addMemberToGroup } = useData();
  const [view, setView] = useState<View>({ type: 'dashboard' });
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  
  // Modal states
  const [isAddExpenseModalOpen, setAddExpenseModalOpen] = useState(false);
  const [isAddFriendModalOpen, setAddFriendModalOpen] = useState(false);
  const [isAddGroupModalOpen, setAddGroupModalOpen] = useState(false);
  const [isAddMemberModalOpen, setAddMemberModalOpen] = useState(false);
  const [isProfileModalOpen, setProfileModalOpen] = useState(false);
  
  const [settleUpTarget, setSettleUpTarget] = useState<{ user: User; balance: number } | null>(null);
  const [groupToEdit, setGroupToEdit] = useState<Group | null>(null);
  const [expenseToEdit, setExpenseToEdit] = useState<Expense | null>(null);
  
  const [filters, setFilters] = useState<Filters>({
    categories: [],
    payers: [],
    startDate: '',
    endDate: '',
  });

  const [activityFilters, setActivityFilters] = useState<ActivityFilters>({
    groups: [],
    participants: [],
    startDate: '',
    endDate: '',
  });

  const currentUser = useMemo(() => users.find(u => u.id === currentUserId)!, [users, currentUserId]);

  const balances = useMemo(() => {
    return calculateBalances(currentUserId, users, expenses, payments);
  }, [currentUserId, users, expenses, payments]);
  
  const handleSettleUp = (userId: string, amount: number) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      setSettleUpTarget({ user, balance: amount });
    }
  };

  const handleOpenAddMemberModal = (groupId: string) => {
      const group = groups.find(g => g.id === groupId);
      if (group) {
          setGroupToEdit(group);
          setAddMemberModalOpen(true);
      }
  }

  const handleAddMembers = (groupId: string, userIds: string[]) => {
      userIds.forEach(userId => {
          addMemberToGroup(groupId, userId);
      });
  };

  const handleEditExpense = (expense: Expense) => {
    setExpenseToEdit(expense);
    setAddExpenseModalOpen(true);
  };

  const handleCloseExpenseModal = () => {
    setAddExpenseModalOpen(false);
    setExpenseToEdit(null);
  }
  
  const renderView = () => {
    switch (view.type) {
      case 'dashboard':
        return <Dashboard 
                  balances={balances} 
                  users={users} 
                  onSettleUp={handleSettleUp}
                  expenses={expenses}
                  onEditExpense={handleEditExpense}
                  filters={filters}
                  onFiltersChange={setFilters}
               />;
      case 'activity':
        return <ActivityView
                  expenses={expenses}
                  payments={payments}
                  users={users}
                  groups={groups}
                  filters={activityFilters}
                  onFiltersChange={setActivityFilters}
                  currentUserId={currentUserId}
                />;
      case 'group':
        const group = groups.find(g => g.id === view.groupId);
        if (!group) return <div>Group not found</div>;
        return <GroupView 
                  group={group} 
                  users={users} 
                  expenses={expenses}
                  onAddMember={handleOpenAddMemberModal} 
                  onEditExpense={handleEditExpense} 
                  filters={filters}
                  onFiltersChange={setFilters}
                  currentUserId={currentUserId}
                  onSettleUp={handleSettleUp}
                />;
      default:
        return <Dashboard 
                  balances={balances} 
                  users={users} 
                  onSettleUp={handleSettleUp} 
                  expenses={expenses}
                  onEditExpense={handleEditExpense}
                  filters={filters}
                  onFiltersChange={setFilters}
                />;
    }
  };

  return (
    <div className="min-h-screen bg-light-gray flex flex-col">
      <Header
        users={users}
        currentUserId={currentUserId}
        onSetCurrentUser={setCurrentUserId}
        onAddExpenseClick={() => setAddExpenseModalOpen(true)}
        onToggleSidebar={() => setSidebarOpen(!isSidebarOpen)}
      />
      <div className="flex flex-grow relative">
        {isSidebarOpen && (
            <div 
                className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
                onClick={() => setSidebarOpen(false)}
            ></div>
        )}
        <Sidebar
          groups={groups}
          users={users}
          currentUserId={currentUserId}
          view={view}
          onSetView={setView}
          onAddGroup={() => setAddGroupModalOpen(true)}
          onAddFriend={() => setAddFriendModalOpen(true)}
          onOpenProfile={() => setProfileModalOpen(true)}
          isOpen={isSidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
        <main className="flex-grow bg-medium-gray overflow-y-auto">
          {renderView()}
        </main>
      </div>

      <AddExpenseModal
        isOpen={isAddExpenseModalOpen}
        onClose={handleCloseExpenseModal}
        users={users}
        groups={groups}
        currentUserId={currentUserId}
        onAddExpense={addExpense}
        onUpdateExpense={updateExpense}
        expenseToEdit={expenseToEdit}
      />

      <SettleUpModal
        isOpen={!!settleUpTarget}
        onClose={() => setSettleUpTarget(null)}
        targetUser={settleUpTarget?.user ?? null}
        balanceAmount={settleUpTarget?.balance ?? 0}
        currentUserId={currentUserId}
        onAddPayment={addPayment}
      />

      <AddFriendModal
        isOpen={isAddFriendModalOpen}
        onClose={() => setAddFriendModalOpen(false)}
        onAddFriend={addUser}
      />

      <AddGroupModal
        isOpen={isAddGroupModalOpen}
        onClose={() => setAddGroupModalOpen(false)}
        onAddGroup={addGroup}
        users={users}
        currentUserId={currentUserId}
      />
      
      <AddMemberModal
        isOpen={isAddMemberModalOpen}
        onClose={() => setAddMemberModalOpen(false)}
        onAddMembers={handleAddMembers}
        group={groupToEdit}
        users={users}
      />

      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setProfileModalOpen(false)}
        currentUser={currentUser}
        onUpdateUser={updateUser}
      />
    </div>
  );
};

export default App;