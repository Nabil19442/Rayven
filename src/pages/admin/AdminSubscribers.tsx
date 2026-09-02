import React, { useState, useEffect } from 'react';
import { db } from '../../lib/db';
import { NewsletterSubscriber } from '../../types';
import { useStore } from '../../contexts/StoreContext';
import { 
  Users, Download, Search, RefreshCw, Trash2, Mail, CheckCircle2 
} from 'lucide-react';

export const AdminSubscribers: React.FC = () => {
  const { showToast } = useStore();
  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const loadSubscribers = async () => {
    setIsLoading(true);
    const data = await db.getNewsletterSubscribers();
    setSubscribers(data);
    setIsLoading(false);
  };

  useEffect(() => {
    loadSubscribers();
  }, []);

  const handleDelete = async (email: string) => {
    if (!window.confirm(`Remove ${email} from subscriber list?`)) return;
    const ok = await db.deleteNewsletterSubscriber(email);
    if (ok) {
      setSubscribers(subscribers.filter(s => s.email !== email));
      showToast('Subscriber removed.', 'info');
    }
  };

  const handleExportCSV = () => {
    if (subscribers.length === 0) {
      showToast('No subscribers to export', 'error');
      return;
    }

    const headers = ['Email', 'Subscribed At', 'Source'];
    const rows = subscribers.map(s => [
      s.email,
      new Date(s.created_at).toISOString(),
      s.source || 'footer'
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + 
      [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `rayven_squad_subscribers_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Subscribers CSV downloaded!', 'success');
  };

  const filtered = subscribers.filter(s => s.email.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="max-w-6xl mx-auto space-y-8 text-[#1F2024]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono font-bold text-[#6D35C8] uppercase tracking-widest">
            STORE MANAGEMENT & CMS
          </span>
          <h1 className="font-display text-3xl font-black text-[#1F2024] uppercase tracking-tight">
            Newsletter Subscribers Squad
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Total of {subscribers.length} registered football kit collectors and fans subscribed for VIP drops.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCSV}
            className="px-4 py-2.5 bg-[#6D35C8] hover:bg-[#4B218A] text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition shadow-md shadow-purple-900/20 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={loadSubscribers}
            className="p-2.5 bg-white hover:bg-zinc-100 text-zinc-700 rounded-xl border border-[#E5E5E3] transition cursor-pointer"
            title="Refresh List"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Table & Search */}
      <div className="p-6 rounded-3xl bg-white border border-[#E5E5E3] shadow-xs space-y-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search email address..."
            className="w-full bg-[#F7F7F5] border border-zinc-200 rounded-xl pl-9 pr-4 py-2 text-xs text-[#1F2024] focus:bg-white focus:outline-none focus:border-[#6D35C8]"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-zinc-200 text-zinc-400 font-mono uppercase text-[10px]">
                <th className="pb-3 font-bold">#</th>
                <th className="pb-3 font-bold">Subscriber Email</th>
                <th className="pb-3 font-bold">Joined Date</th>
                <th className="pb-3 font-bold">Channel Source</th>
                <th className="pb-3 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-zinc-400">
                    No subscribers found.
                  </td>
                </tr>
              ) : (
                filtered.map((sub, idx) => (
                  <tr key={sub.id || sub.email} className="hover:bg-zinc-50">
                    <td className="py-3 font-mono text-zinc-400">{idx + 1}</td>
                    <td className="py-3 font-bold text-[#1F2024] font-mono">{sub.email}</td>
                    <td className="py-3 text-zinc-500 font-mono text-[11px]">
                      {new Date(sub.created_at).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 rounded-md bg-[#F3EEFC] text-[#6D35C8] font-mono text-[10px] font-bold uppercase">
                        {sub.source || 'footer'}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <button
                        onClick={() => handleDelete(sub.email)}
                        className="p-1.5 text-zinc-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition cursor-pointer"
                        title="Remove Subscriber"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
