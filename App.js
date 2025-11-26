
import React, { useState, useEffect } from 'react';
import { LayoutGrid, Plus, List, Settings as SettingsIcon, Loader2 } from 'lucide-react';

const App = () => {
  // Get globals
  const { Dashboard, AddExpense, ExpenseList, Settings, appendToSheet, getScriptConfig } = window;

  const [view, setView] = useState('dashboard');
  const [expenses, setExpenses] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // Load from LocalStorage
  useEffect(() => {
    const saved = localStorage.getItem('smart-ledger-expenses');
    if (saved) {
      try {
        setExpenses(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load expenses", e);
      }
    }
  }, []);

  // Save to LocalStorage
  useEffect(() => {
    localStorage.setItem('smart-ledger-expenses', JSON.stringify(expenses));
  }, [expenses]);

  const handleSaveExpense = async (drafts) => {
    const newExpenses = drafts.map(d => ({
      id: crypto.randomUUID(),
      date: d.date,
      amount: parseFloat(d.amount),
      category: d.category,
      description: d.description,
      merchant: d.merchant
    }));

    // Update local state immediately for UI responsiveness
    setExpenses(prev => [...prev, ...newExpenses]);
    
    // Try to sync to Google Sheets (App Script)
    const scriptConfig = getScriptConfig();
    if (scriptConfig && scriptConfig.scriptUrl) {
        setIsSyncing(true);
        try {
            await appendToSheet(newExpenses);
            // Optionally show a success toast here
        } catch (error) {
            alert("已儲存至本機，但同步至雲端失敗: " + error.message);
        } finally {
            setIsSyncing(false);
        }
    }
    
    setShowAddModal(false);
  };

  const handleDeleteExpense = (id) => {
    if (confirm('確定要刪除這筆紀錄嗎？(注意：此操作僅會刪除本機資料，若已同步至雲端需手動刪除)')) {
      setExpenses(prev => prev.filter(e => e.id !== id));
    }
  };

  return (
    <div className="max-w-md mx-auto h-screen flex flex-col bg-[#F9FAFB] relative overflow-hidden">
      
      {/* Top Decoration */}
      <div className="absolute top-0 left-0 w-full h-48 bg-gradient-to-b from-emerald-50 to-transparent -z-10" />

      {/* Header */}
      <div className="px-6 pt-6 flex justify-between items-center z-10">
         <div className="flex items-center gap-2">
            <span className="text-xl font-bold tracking-tight text-emerald-950">Smart Ledger AI</span>
         </div>
         <button 
            onClick={() => {
                setView('settings');
                setShowAddModal(false);
            }} 
            className="p-2 bg-white/50 backdrop-blur rounded-full text-gray-500 hover:bg-white hover:shadow-sm transition-all"
         >
            <SettingsIcon size={20} />
         </button>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-5 scrollbar-hide">
        {view === 'dashboard' && <Dashboard expenses={expenses} />}
        {view === 'list' && <ExpenseList expenses={expenses} onDelete={handleDeleteExpense} />}
        {view === 'settings' && <div className="h-full"></div>} {/* Placeholder handled by overlay or conditional rendering below */}
      </main>

      {/* Overlay for Settings (Full Screen-ish) */}
      {view === 'settings' && (
         <div className="absolute inset-0 z-50 bg-gray-50">
             <div className="h-full overflow-y-auto">
                 <div className="p-4 pt-10 pb-20">
                    <Settings onBack={() => setView('dashboard')} />
                 </div>
             </div>
         </div>
      )}

      {/* Add Expense Modal/Overlay */}
      {showAddModal && (
        <div className="absolute inset-0 z-50 bg-black/50 flex items-end justify-center backdrop-blur-sm transition-all" onClick={(e) => {
            if (e.target === e.currentTarget && !isSyncing) setShowAddModal(false);
        }}>
          <div className="w-full max-w-md relative">
            {isSyncing && (
                <div className="absolute inset-0 z-10 bg-white/80 flex flex-col items-center justify-center rounded-t-3xl">
                    <Loader2 size={40} className="animate-spin text-emerald-600 mb-2" />
                    <p className="font-medium text-emerald-800">正在同步至雲端...</p>
                </div>
            )}
            <AddExpense onSave={handleSaveExpense} onCancel={() => setShowAddModal(false)} />
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      {view !== 'settings' && (
          <nav className="bg-white border-t border-gray-100 pb-safe pt-2 px-6 shadow-[0_-4px_20px_-5px_rgba(0,0,0,0.05)] z-40">
            <div className="flex justify-between items-center h-16">
              <button 
                onClick={() => setView('dashboard')}
                className={`flex flex-col items-center gap-1 transition-colors ${view === 'dashboard' ? 'text-emerald-600' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <LayoutGrid size={24} strokeWidth={view === 'dashboard' ? 2.5 : 2} />
                <span className="text-[10px] font-medium">總覽</span>
              </button>

              <div className="relative -top-6">
                <button
                  onClick={() => setShowAddModal(true)}
                  className="bg-gray-900 text-white p-4 rounded-full shadow-lg shadow-emerald-200 hover:scale-105 active:scale-95 transition-all border-4 border-[#F9FAFB]"
                >
                  <Plus size={28} strokeWidth={2.5} />
                </button>
              </div>

              <button 
                onClick={() => setView('list')}
                className={`flex flex-col items-center gap-1 transition-colors ${view === 'list' ? 'text-emerald-600' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <List size={24} strokeWidth={view === 'list' ? 2.5 : 2} />
                <span className="text-[10px] font-medium">明細</span>
              </button>
            </div>
          </nav>
      )}
    </div>
  );
};

window.App = App;
