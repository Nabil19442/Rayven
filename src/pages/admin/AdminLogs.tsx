import React, { useState, useEffect } from 'react';
import { db } from '../../lib/db';
import { ActivityLog } from '../../types';
import { ShieldCheck, RefreshCw, Clock, UserCheck, Search, Activity } from 'lucide-react';

export const AdminLogs: React.FC = () => {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const loadLogs = async () => {
    setIsLoading(true);
    const data = await db.getLogs();
    setLogs(data);
    setIsLoading(false);
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const filtered = logs.filter(l => 
    l.actor_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (l.target_entity && l.target_entity.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="max-w-6xl mx-auto space-y-8 text-[#1F2024]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono font-bold text-[#6D35C8] uppercase tracking-widest">
            STORE MANAGEMENT & SECURITY
          </span>
          <h1 className="font-display text-3xl font-black text-[#1F2024] uppercase tracking-tight">
            Admin Activity Audit Logs
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Real-time tracking of staff operations, price updates, inventory alterations, and order dispatches.
          </p>
        </div>

        <button
          onClick={loadLogs}
          className="px-4 py-2 bg-white hover:bg-zinc-100 text-zinc-700 rounded-xl text-xs font-bold uppercase border border-[#E5E5E3] shadow-xs flex items-center gap-1.5 self-start sm:self-auto transition cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh Logs</span>
        </button>
      </div>

      {/* Table & Search */}
      <div className="p-6 rounded-3xl bg-white border border-[#E5E5E3] shadow-xs space-y-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search activity, staff, action..."
            className="w-full bg-[#F7F7F5] border border-zinc-200 rounded-xl pl-9 pr-4 py-2 text-xs text-[#1F2024] focus:bg-white focus:outline-none focus:border-[#6D35C8]"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-zinc-200 text-zinc-400 font-mono uppercase text-[10px]">
                <th className="pb-3 font-bold">Timestamp</th>
                <th className="pb-3 font-bold">Actor</th>
                <th className="pb-3 font-bold">Role</th>
                <th className="pb-3 font-bold">Action</th>
                <th className="pb-3 font-bold">Activity Description</th>
                <th className="pb-3 font-bold">Target</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 font-mono text-[11px]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-zinc-400 font-sans">
                    No activity logs recorded.
                  </td>
                </tr>
              ) : (
                filtered.map((log) => (
                  <tr key={log.id} className="hover:bg-zinc-50">
                    <td className="py-3 text-zinc-500 whitespace-nowrap">
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                    <td className="py-3 font-bold text-[#1F2024]">{log.actor_name}</td>
                    <td className="py-3">
                      <span className="px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-700 text-[10px] font-bold uppercase font-sans">
                        {log.actor_role}
                      </span>
                    </td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 rounded bg-[#F3EEFC] text-[#6D35C8] text-[10px] font-bold">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 text-zinc-700 font-sans text-xs max-w-md">{log.details}</td>
                    <td className="py-3 text-zinc-400 uppercase text-[10px]">{log.target_entity || 'system'}</td>
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
