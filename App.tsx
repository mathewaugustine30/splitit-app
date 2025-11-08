import React, { useState, useMemo } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import GroupView from './components/GroupView';
import ActivityView from './components/ActivityView';
import AddExpenseModal from './components/AddExpenseModal';
import SettleUpModal from './components/SettleUpModal';
import AddFriendModal from './components/AddFriendModal';
import AddGroupModal from './components/AddGroupModal';
import AddMemberModal from './components/AddMemberModal';
import ProfileModal from './components/ProfileModal';
import LoginPage from './components/LoginPage';
import SignupPage from './components/SignupPage';
import ForgotPasswordPage from './components/ForgotPasswordPage';
import { useData } from './hooks/useData';
import { View, Expense, User, Balance, Filters, ActivityFilters, Group, AuthView } from './types';
import { calculateBalances } from './services/balanceService';

const App: React.FC = () => {
  const {
    users,
    groups,
    expenses,
    payments,
    loggedInUser,
    login,
    logout,
    signup,
    addFriend,
    updateUser,
    addGroup,
    addMembersToGroup,
    addExpense,
    updateExpense,
    addPayment,
  } = useData();

  const [view, setView] = useState<View>({ type: 'dashboard' });
  const [authView, setAuthView] = useState<AuthView>('login');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Modal states
  const [isAddExpenseModalOpen, setIsAddExpenseModalOpen] = useState(false);
  const [expenseToEdit, setExpenseToEdit] = useState<Expense | null>(null);
  const [isSettleUpModalOpen, setIsSettleUpModalOpen] = useState(false);
  const [settleUpTarget, setSettleUpTarget] = useState<{ user: User, balance: Balance } | null>(null);
  const [isAddFriendModalOpen, setIsAddFriendModalOpen] = useState(false);
  const [isAddGroupModalOpen, setIsAddGroupModalOpen] = useState(false);
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
  const [groupToAddMember, setGroupToAddMember] = useState<Group | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Filters state
  const [expenseFilters, setExpenseFilters] = useState<Filters>({ categories: [], payers: [], startDate: '', endDate: '' });
  const [activityFilters, setActivityFilters] = useState<ActivityFilters>({ groups: [], participants: [], startDate: '', endDate: '' });

  // Memoized calculations for logged-in user's scoped data
  const friends = useMemo(() => {
    if (!loggedInUser || !loggedInUser.friendIds) return [];
    return users.filter(u => loggedInUser.friendIds!.includes(u.id));
  }, [loggedInUser, users]);

  const myGroups = useMemo(() => {
      if (!loggedInUser) return [];
      return groups.filter(g => g.memberIds.includes(loggedInUser.id));
  }, [loggedInUser, groups]);

  const myPayments = useMemo(() => {
      if (!loggedInUser) return [];
      return payments.filter(p => p.fromUserId === loggedInUser.id || p.toUserId === loggedInUser.id);
  }, [loggedInUser, payments]);

  const myExpenses = useMemo(() => {
      if (!loggedInUser) return [];
      const myGroupIds = myGroups.map(g => g.id);
      return expenses.filter(e => {
          if (e.groupId && myGroupIds.includes(e.groupId)) {
              return true;
          }
          if (!e.groupId && (e.paidById === loggedInUser.id || e.splits.some(s => s.userId === loggedInUser.id))) {
              return true;
          }
          return false;
      });
  }, [loggedInUser, expenses, myGroups]);

  const globalBalances = useMemo(() => {
    if (!loggedInUser) return [];
    const relevantUsers = [loggedInUser, ...friends];
    return calculateBalances(loggedInUser.id, relevantUsers, expenses, payments);
  }, [loggedInUser, friends, expenses, payments]);


  // Handlers
  const handleOpenAddExpense = () => {
    setExpenseToEdit(null);
    setIsAddExpenseModalOpen(true);
  };
  
  const handleEditExpense = (expense: Expense) => {
    setExpenseToEdit(expense);
    setIsAddExpenseModalOpen(true);
  };

  const handleSettleUp = (userId: string, amount: number) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      setSettleUpTarget({ user, balance: { userId, amount } });
      setIsSettleUpModalOpen(true);
    }
  };

  const handleAddMember = (groupId: string) => {
    const group = groups.find(g => g.id === groupId);
    if (group) {
        setGroupToAddMember(group);
        setIsAddMemberModalOpen(true);
    }
  };

  const getTitle = () => {
    if (view.type === 'dashboard') return 'Dashboard';
    if (view.type === 'activity') return 'Activity';
    if (view.type === 'group') {
      const group = groups.find(g => g.id === view.groupId);
      return group ? group.name : 'Group';
    }
    return 'SplitIt';
  };

  if (!loggedInUser) {
    switch(authView) {
      case 'signup':
        return <SignupPage onSignup={signup} onSwitchToLogin={() => setAuthView('login')} />;
      case 'forgot_password':
        return <ForgotPasswordPage onSwitchToLogin={() => setAuthView('login')} />;
      case 'login':
      default:
        return <LoginPage onLogin={login} onSwitchToSignup={() => setAuthView('signup')} onSwitchToForgotPassword={() => setAuthView('forgot_password')} />;
    }
  }

  const renderContent = () => {
    if (view.type === 'dashboard') {
      return <Dashboard
        balances={globalBalances}
        users={users} // Pass all users for name lookups
        expenses={myExpenses}
        onSettleUp={handleSettleUp}
        onEditExpense={handleEditExpense}
        filters={expenseFilters}
        onFiltersChange={setExpenseFilters}
        currentUser={loggedInUser}
        friends={friends}
      />;
    }
    if (view.type === 'group') {
      const group = myGroups.find(g => g.id === view.groupId);
      if (!group) {
        setView({ type: 'dashboard' });
        return null;
      }
      const groupExpenses = myExpenses.filter(e => e.groupId === group.id);
      return <GroupView
        group={group}
        users={users} // Pass all users for name lookups
        expenses={groupExpenses}
        onAddMember={handleAddMember}
        onEditExpense={handleEditExpense}
        filters={expenseFilters}
        onFiltersChange={setExpenseFilters}
        currentUserId={loggedInUser.id}
        onSettleUp={handleSettleUp}
      />;
    }
    if (view.type === 'activity') {
      return <ActivityView
        expenses={myExpenses}
        payments={myPayments}
        users={users} // Pass all users for name lookups
        groups={myGroups}
        filters={activityFilters}
        onFiltersChange={setActivityFilters}
        currentUserId={loggedInUser.id}
      />
    }
    return null;
  };
  
  return (
    <div className="flex h-screen bg-light-gray font-sans">
       <div
        className={`fixed inset-0 z-30 bg-black bg-opacity-50 transition-opacity md:hidden ${
          isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsSidebarOpen(false)}
      ></div>
      <Sidebar
        groups={myGroups}
        friends={friends}
        view={view}
        onSetView={setView}
        onAddGroup={() => setIsAddGroupModalOpen(true)}
        onAddFriend={() => setIsAddFriendModalOpen(true)}
        onOpenProfile={() => setIsProfileModalOpen(true)}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          onAddExpense={handleOpenAddExpense}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          title={getTitle()}
          loggedInUser={loggedInUser}
          onLogout={logout}
        />
        <main className="flex-1 overflow-x-hidden overflow-y-auto">
          {renderContent()}
        </main>
      </div>

      {isAddExpenseModalOpen && (
        <AddExpenseModal
          isOpen={isAddExpenseModalOpen}
          onClose={() => setIsAddExpenseModalOpen(false)}
          users={users}
          groups={myGroups}
          currentUser={loggedInUser}
          friends={friends}
          onAddExpense={addExpense}
          onUpdateExpense={updateExpense}
          expenseToEdit={expenseToEdit}
        />
      )}

      {isSettleUpModalOpen && settleUpTarget && (
        <SettleUpModal
          isOpen={isSettleUpModalOpen}
          onClose={() => setIsSettleUpModalOpen(false)}
          targetUser={settleUpTarget.user}
          balanceAmount={settleUpTarget.balance.amount}
          currentUserId={loggedInUser.id}
          onAddPayment={addPayment}
        />
      )}
      
      {isAddFriendModalOpen && (
        <AddFriendModal
          isOpen={isAddFriendModalOpen}
          onClose={() => setIsAddFriendModalOpen(false)}
          onAddFriend={addFriend}
        />
      )}

      {isAddGroupModalOpen && (
        <AddGroupModal
          isOpen={isAddGroupModalOpen}
          onClose={() => setIsAddGroupModalOpen(false)}
          onAddGroup={addGroup}
          friends={friends}
          currentUserId={loggedInUser.id}
        />
      )}
      
      {isAddMemberModalOpen && (
        <AddMemberModal
          isOpen={isAddMemberModalOpen}
          onClose={() => setIsAddMemberModalOpen(false)}
          onAddMembers={addMembersToGroup}
          friends={friends}
          group={groupToAddMember}
        />
      )}
      
      {isProfileModalOpen && (
        <ProfileModal
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
          currentUser={loggedInUser}
          onUpdateUser={updateUser}
        />
      )}
    </div>
  );
};

export default App;