
import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Wallet, TrendingUp, Calendar } from 'lucide-react';

const Dashboard = ({ expenses }) => {
  const { Category, CATEGORY_COLORS } = window; // Get globals

  const totalAmount = useMemo(() => expenses.reduce((sum, item) => sum + item.amount, 0), [expenses]);
  
  const currentMonthAmount = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    return expenses
      .filter(e => {
        const d = new Date(e.date);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      })
      .reduce((sum, item) => sum + item.amount, 0);
  }, [expenses]);

  const categoryData = useMemo(() => {
    const map = new Map();
    expenses.forEach(e => {
      map.set(e.category, (map.get(e.category) || 0) + e.amount);
    });
    return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
  }, [expenses]);

  return (
    <div className="space-y-6 pb-24">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">財務概覽</h1>
        <p className="text-gray-500 text-sm">歡迎回來，查看您的支出分析</p>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between">
          <div className="flex items-center gap-2 text-emerald-600 mb-2">
            <Wallet size={20} />
            <span className="text-sm font-medium">總支出</span>
          </div>
          <span className="text-2xl font-bold text-gray-900">${totalAmount.toLocaleString()}</span>
        </div>
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between">
          <div className="flex items-center gap-2 text-blue-600 mb-2">
            <Calendar size={20} />
            <span className="text-sm font-medium">本月支出</span>
          </div>
          <span className="text-2xl font-bold text-gray-900">${currentMonthAmount.toLocaleString()}</span>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <TrendingUp size={18} className="text-gray-500" />
          消費分類
        </h3>
        <div className="h-64 w-full">
          {categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[entry.name]} />
                  ))}
                </Pie>
                <Tooltip 
                    formatter={(value) => `$${value.toLocaleString()}`}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-400 text-sm">
              尚無資料
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

window.Dashboard = Dashboard;
