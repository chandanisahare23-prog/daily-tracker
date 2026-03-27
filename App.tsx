/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Trash2, Download, Plus, WifiOff, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Entry {
  id: string;
  date: string;
  category: string;
  amount: number;
  type: 'Income' | 'Expense';
  note: string;
}

export default function App() {
  const [entries, setEntries] = useState<Entry[]>(() => {
    const saved = localStorage.getItem('dailyEntries');
    return saved ? JSON.parse(saved) : [];
  });

  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    category: '',
    amount: '',
    type: 'Expense' as 'Income' | 'Expense',
    note: '',
  });

  useEffect(() => {
    localStorage.setItem('dailyEntries', JSON.stringify(entries));
  }, [entries]);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Starry night background effect
    const starCount = 100;
    const stars: HTMLDivElement[] = [];
    for (let i = 0; i < starCount; i++) {
      const star = document.createElement('div');
      star.className = 'star';
      const size = Math.random() * 3 + 1;
      star.style.width = `${size}px`;
      star.style.height = `${size}px`;
      star.style.left = `${Math.random() * 100}vw`;
      star.style.top = `${Math.random() * 100}vh`;
      star.style.setProperty('--duration', `${Math.random() * 3 + 2}s`);
      star.style.animationDelay = `${Math.random() * 5}s`;
      document.body.appendChild(star);
      stars.push(star);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      stars.forEach(s => s.remove());
    };
  }, []);

  const stats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const currentMonth = today.slice(0, 7);

    let incomeToday = 0;
    let expenseToday = 0;
    let monthIncome = 0;
    let monthExpense = 0;

    entries.forEach((e) => {
      const isToday = e.date === today;
      const isThisMonth = e.date.slice(0, 7) === currentMonth;

      if (isThisMonth) {
        if (e.type === 'Income') monthIncome += e.amount;
        else monthExpense += e.amount;

        if (isToday) {
          if (e.type === 'Income') incomeToday += e.amount;
          else expenseToday += e.amount;
        }
      }
    });

    return {
      incomeToday,
      expenseToday,
      balanceToday: incomeToday - expenseToday,
      monthIncome,
      monthExpense,
      monthBalance: monthIncome - monthExpense,
    };
  }, [entries]);

  const addEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.date || !formData.category || !formData.amount) {
      alert("Please fill all fields!");
      return;
    }

    // Fallback for random ID if crypto.randomUUID is not available
    const generateId = () => {
      if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID();
      }
      return Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
    };

    const newEntry: Entry = {
      id: generateId(),
      date: formData.date,
      category: formData.category,
      amount: parseFloat(formData.amount),
      type: formData.type,
      note: formData.note,
    };

    setEntries([newEntry, ...entries]);
    setFormData({
      ...formData,
      category: '',
      amount: '',
      note: '',
    });
  };

  const deleteEntry = (id: string) => {
    setEntries(entries.filter((e) => e.id !== id));
  };

  const exportCSV = () => {
    if (entries.length === 0) {
      alert("Bhai, pehle kuch entries toh daalo!");
      return;
    }

    const headers = ["Date", "Category", "Type", "Amount", "Note"];
    const rows = entries.map(e => [
      e.date,
      `"${(e.category || '').replace(/"/g, '""')}"`,
      e.type,
      e.amount,
      `"${(e.note || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(r => r.join(","))
    ].join("\n");

    try {
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      
      // Mobile compatibility: some browsers need the link to be in the DOM
      link.href = url;
      link.setAttribute("download", `DailyTracker_3D_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.display = 'none';
      document.body.appendChild(link);
      
      link.click();
      
      // Cleanup
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 100);
      
      alert("Export Successful! Check your downloads.");
    } catch (err) {
      console.error("Export failed:", err);
      alert("Export failed. Please try again or check browser permissions.");
    }
  };

  if (!isOnline) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-center">
        <WifiOff size={64} className="text-white mb-4 animate-pulse" />
        <h2 className="text-2xl font-bold text-white mb-2">📶 Internet Required</h2>
        <p className="text-gray-400">Please turn ON internet to use this app</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-6 px-8 py-3 bg-[#e0e5ec] text-black rounded-xl neo-shadow font-bold"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8 font-sans relative overflow-x-hidden">
      {/* Ad Placeholder */}
      <div className="max-w-4xl mx-auto h-16 bg-white/5 rounded-lg mb-8 flex items-center justify-center text-xs text-gray-500 uppercase tracking-widest">
        Advertisement
      </div>

      <header className="text-center mb-10">
        <h1 className="text-4xl md:text-5xl font-black tracking-tighter mb-2">
          DAILY TRACKER <span className="text-[#e0e5ec]">3D</span>
        </h1>
        <p className="text-gray-400 text-sm uppercase tracking-widest">Smart Neumorphic Finance</p>
      </header>

      <main className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Form Section */}
        <section className="lg:col-span-5">
          <div className="bg-white/10 backdrop-blur-md p-6 rounded-[2.5rem] border border-white/10 sticky top-4">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Plus size={20} /> New Entry
            </h2>
            <form onSubmit={addEntry} className="space-y-4">
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full p-4 rounded-2xl bg-[#e0e5ec] text-black neo-shadow-inset outline-none focus:ring-2 ring-white/20 transition-all"
              />
              <input
                type="text"
                placeholder="Category (Food, Rent, etc.)"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full p-4 rounded-2xl bg-[#e0e5ec] text-black neo-shadow-inset outline-none focus:ring-2 ring-white/20 transition-all"
              />
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="number"
                  placeholder="Amount"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full p-4 rounded-2xl bg-[#e0e5ec] text-black neo-shadow-inset outline-none focus:ring-2 ring-white/20 transition-all"
                />
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as 'Income' | 'Expense' })}
                  className="w-full p-4 rounded-2xl bg-[#e0e5ec] text-black neo-shadow-inset outline-none focus:ring-2 ring-white/20 transition-all appearance-none"
                >
                  <option value="Expense">Expense</option>
                  <option value="Income">Income</option>
                </select>
              </div>
              <input
                type="text"
                placeholder="Note (optional)"
                value={formData.note}
                onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                className="w-full p-4 rounded-2xl bg-[#e0e5ec] text-black neo-shadow-inset outline-none focus:ring-2 ring-white/20 transition-all"
              />
              <button
                type="submit"
                className="w-full p-4 mt-4 rounded-2xl bg-[#e0e5ec] text-black font-bold text-lg neo-shadow active:scale-95 transition-transform"
              >
                Add Entry
              </button>
              <button
                type="button"
                onClick={exportCSV}
                className="w-full p-4 rounded-2xl bg-[#e0e5ec] text-black font-bold text-lg neo-shadow flex items-center justify-center gap-2 active:scale-95 transition-transform"
              >
                <Download size={20} /> Export CSV
              </button>
            </form>
          </div>
        </section>

        {/* Stats & List Section */}
        <section className="lg:col-span-7 space-y-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-[#e0e5ec] p-5 rounded-3xl text-black neo-shadow">
              <p className="text-[10px] uppercase font-bold text-gray-500 tracking-wider mb-1">Today's Balance</p>
              <p className={`text-2xl font-black ${stats.balanceToday >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ₹{stats.balanceToday.toLocaleString()}
              </p>
              <div className="flex justify-between mt-2 text-[10px] font-bold uppercase">
                <span className="text-green-700">In: ₹{stats.incomeToday}</span>
                <span className="text-red-700">Out: ₹{stats.expenseToday}</span>
              </div>
            </div>
            <div className="bg-[#e0e5ec] p-5 rounded-3xl text-black neo-shadow">
              <p className="text-[10px] uppercase font-bold text-gray-500 tracking-wider mb-1">Monthly Balance</p>
              <p className={`text-2xl font-black ${stats.monthBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ₹{stats.monthBalance.toLocaleString()}
              </p>
              <div className="flex justify-between mt-2 text-[10px] font-bold uppercase">
                <span className="text-green-700">In: ₹{stats.monthIncome}</span>
                <span className="text-red-700">Out: ₹{stats.monthExpense}</span>
              </div>
            </div>
          </div>

          {/* Entries List */}
          <div className="bg-[#e0e5ec] rounded-[2.5rem] neo-shadow overflow-hidden">
            <div className="p-6 border-b border-gray-300 flex justify-between items-center">
              <h2 className="text-black font-bold text-lg">Month Entries</h2>
              <span className="bg-black/10 px-3 py-1 rounded-full text-[10px] font-bold text-black uppercase">
                {entries.length} Total
              </span>
            </div>
            
            <div className="max-h-[600px] overflow-y-auto custom-scrollbar">
              {entries.length === 0 ? (
                <div className="p-20 text-center text-gray-400 flex flex-col items-center">
                  <AlertCircle size={48} className="mb-4 opacity-20" />
                  <p className="font-medium">No entries yet</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  <AnimatePresence initial={false}>
                    {entries.map((entry) => (
                      <motion.div
                        key={entry.id}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="p-4 flex items-center justify-between hover:bg-white/20 transition-colors group"
                      >
                        <div className="flex-1 min-w-0 mr-4">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] font-bold text-gray-500">{entry.date}</span>
                            <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${
                              entry.type === 'Income' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                            }`}>
                              {entry.type}
                            </span>
                          </div>
                          <h3 className="text-black font-bold truncate">{entry.category}</h3>
                          {entry.note && <p className="text-gray-500 text-xs truncate">{entry.note}</p>}
                        </div>
                        <div className="text-right flex items-center gap-4">
                          <p className={`font-black text-lg ${
                            entry.type === 'Income' ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {entry.type === 'Income' ? '+' : '-'}₹{entry.amount}
                          </p>
                          <button
                            onClick={() => deleteEntry(entry.id)}
                            className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      {/* Footer Ad Placeholder */}
      <div className="max-w-4xl mx-auto h-16 bg-white/5 rounded-lg mt-12 flex items-center justify-center text-xs text-gray-500 uppercase tracking-widest">
        Advertisement
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(0,0,0,0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(0,0,0,0.2);
        }
      `}</style>
    </div>
  );
}
