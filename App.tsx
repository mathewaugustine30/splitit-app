
import React, { useState, useMemo } from 'react';
import { User, View } from './types';
import useData from './hooks/useData';
import { calculateBalances } from './services/balanceService';

import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import GroupView from './components/GroupView';
import AddExpenseModal from './components/AddExpenseModal';
import SettleUpModal from './components/SettleUpModal';

const App: React.FC = () => {
  const { users, groups, expenses, payments, currentUserId, setCurrentUserId, addExpense, addPayment } = useData();
  const [view, setView] = useState<View>({ type: 'dashboard' });
  const [isAddExpenseModalOpen, setAddExpenseModalOpen] = useState(false);
  const [settleUpTarget, setSettleUpTarget] = useState<{ user: User; balance: number } | null>(null);

  const balances = useMemo(() => {
    return calculateBalances(currentUserId, users, expenses, payments);
  }, [currentUserId, users, expenses, payments]);
  
  const handleSettleUp = (userId: string, amount: number) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      setSettleUpTarget({ user, balance: amount });
    }
  };
  
  const renderView = () => {
    switch (view.type) {
      case 'dashboard':
        return <Dashboard balances={balances} users={users} onSettleUp={handleSettleUp} />;
      case 'group':
        const group = groups.find(g => g.id === view.groupId);
        if (!group) return <div>Group not found</div>;
        return <GroupView group={group} users={users} expenses={expenses} />;
      default:
        return <Dashboard balances={balances} users={users} onSettleUp={handleSettleUp} />;
    }
  };

  return (
    <div className="min-h-screen bg-light-gray flex flex-col">
      <Header
        users={users}
        currentUserId={currentUserId}
        onSetCurrentUser={setCurrentUserId}
        onAddExpenseClick={() => setAddExpenseModalOpen(true)}
      />
      <div className="flex flex-grow">
        <Sidebar
          groups={groups}
          users={users}
          currentUserId={currentUserId}
          view={view}
          onSetView={setView}
        />
        <main className="flex-grow bg-medium-gray overflow-y-auto">
          {renderView()}
        </main>
      </div>

      <AddExpenseModal
        isOpen={isAddExpenseModalOpen}
        onClose={() => setAddExpenseModalOpen(false)}
        users={users}
        groups={groups}
        currentUserId={currentUserId}
        onAddExpense={addExpense}
      />

      <SettleUpModal
        isOpen={!!settleUpTarget}
        onClose={() => setSettleUpTarget(null)}
        targetUser={settleUpTarget?.user ?? null}
        balanceAmount={settleUpTarget?.balance ?? 0}
        currentUserId={currentUserId}
        onAddPayment={addPayment}
      />
    </div>
  );
};

export default App;
