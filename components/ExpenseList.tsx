import React from 'react';
import { Expense, Category, CATEGORY_COLORS } from '../types';
import { Trash2, Coffee, Bus, ShoppingBag, Film, Home, Activity, GraduationCap, MoreHorizontal, Store } from 'lucide-react';

interface ExpenseListProps {
  expenses: Expense[];
  onDelete: (id: string) => void;
}

const CategoryIcon: React.FC<{ category: Category }> = ({ category }) => {
  const color = CATEGORY_COLORS[category];
  const style = { color: color, backgroundColor: `${color}20` }; // 20 hex = ~12% opacity
  const className = "p-2 rounded-full";

  switch (category) {
    case Category.FOOD: return <div style={style} className={className}><Coffee size={18} /></div>;
    case Category.TRANSPORT: return <div style={style} className={className}><Bus size={18} /></div>;
    case Category.SHOPPING: return <div style={style} className={className}><ShoppingBag size={18} /></div>;
    case Category.ENTERTAINMENT: return <div style={style} className={className}><Film size={18} /></div>;
    case Category.HOUSING: return <div style={style} className={className}><Home size={18} /></div>;
    case Category.MEDICAL: return <div style={style} className={className}><Activity size={18} /></div>;
    case Category.EDUCATION: return <div style={style} className={className}><GraduationCap size={18} /></div>;
    default: return <div style={style} className={className}><MoreHorizontal size={18} /></div>;
  }
};

export const ExpenseList: React.FC<ExpenseListProps> = ({ expenses, onDelete }) => {
  // Group by date
  const groupedExpenses = expenses.reduce((groups, expense) => {
    const date = expense.date;
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(expense);
    return groups;
  }, {} as Record<string, Expense[]>);

  // Sort dates descending
  const sortedDates = Object.keys(groupedExpenses).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  return (
    <div className="pb-24 space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-gray-800">帳務明細</h1>
      </header>

      {expenses.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mb-4">
             <Store size={32} className="text-gray-400" />
          </div>
          <p>尚未有任何紀錄</p>
          <p className="text-xs mt-1">點擊下方 + 按鈕開始記帳</p>
        </div>
      ) : (
        sortedDates.map(date => {
          const dayExpenses = groupedExpenses[date];
          const dayTotal = dayExpenses.reduce((sum, e) => sum + e.amount, 0);
          const dateObj = new Date(date);
          const dateStr = `${dateObj.getMonth() + 1}月${dateObj.getDate()}日`;
          const dayOfWeek = dateObj.toLocaleDateString('zh-TW', { weekday: 'short' });

          return (
            <div key={date} className="animate-in fade-in slide-in-from-bottom-2 duration-500">
              <div className="flex justify-between items-end mb-2 px-1">
                <h3 className="text-gray-500 font-medium text-sm flex items-center gap-2">
                   <span className="text-lg text-gray-800 font-bold">{dateStr}</span> 
                   <span className="bg-gray-200 text-gray-600 text-[10px] px-1.5 py-0.5 rounded">{dayOfWeek}</span>
                </h3>
                <span className="text-xs font-semibold text-gray-400">NT$ {dayTotal.toLocaleString()}</span>
              </div>
              
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {dayExpenses.map((expense, idx) => (
                  <div 
                    key={expense.id} 
                    className={`flex items-center p-4 hover:bg-gray-50 transition-colors group ${idx !== dayExpenses.length - 1 ? 'border-b border-gray-50' : ''}`}
                  >
                    <div className="mr-4 shrink-0">
                      <CategoryIcon category={expense.category} />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline mb-0.5">
                        <p className="font-semibold text-gray-800 truncate">{expense.description}</p>
                        <span className="font-bold text-gray-900 whitespace-nowrap ml-2">
                          ${expense.amount.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-xs text-gray-500">
                        <div className="flex items-center gap-2">
                            <span>{expense.category}</span>
                            {expense.merchant && (
                                <>
                                    <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                                    <span className="truncate max-w-[100px]">{expense.merchant}</span>
                                </>
                            )}
                        </div>
                        <button 
                          onClick={() => onDelete(expense.id)}
                          className="opacity-0 group-hover:opacity-100 p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-all"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};