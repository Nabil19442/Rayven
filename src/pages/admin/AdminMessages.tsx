import React, { useState, useEffect } from 'react';
import { db } from '../../lib/db';
import { ContactMessage } from '../../types';
import { useStore } from '../../contexts/StoreContext';
import { 
  Mail, MessageSquare, Phone, Clock, Trash2, CheckCircle2, 
  ExternalLink, Search, RefreshCw, Send, Sparkles 
} from 'lucide-react';

export const AdminMessages: React.FC = () => {
  const { showToast } = useStore();
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);

  const loadMessages = async () => {
    setIsLoading(true);
    const data = await db.getContactMessages();
    setMessages(data);
    setIsLoading(false);
  };

  useEffect(() => {
    loadMessages();
  }, []);

  const handleToggleRead = async (msg: ContactMessage) => {
    const updatedStatus: ContactMessage['status'] = msg.status === 'read' ? 'new' : 'read';
    const updated = await db.updateContactMessageStatus(msg.id, updatedStatus);
    if (updated) {
      setMessages(messages.map(m => m.id === msg.id ? updated : m));
      if (selectedMessage?.id === msg.id) setSelectedMessage(updated);
      showToast(`Message marked as ${updatedStatus}`, 'info');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this customer inquiry?')) return;
    const ok = await db.deleteContactMessage(id);
    if (ok) {
      setMessages(messages.filter(m => m.id !== id));
      if (selectedMessage?.id === id) setSelectedMessage(null);
      showToast('Message deleted', 'info');
    }
  };

  const filtered = messages.filter(m => {
    const query = searchQuery.toLowerCase();
    return (
      m.name.toLowerCase().includes(query) ||
      m.email.toLowerCase().includes(query) ||
      (m.phone && m.phone.toLowerCase().includes(query)) ||
      m.subject.toLowerCase().includes(query) ||
      m.message.toLowerCase().includes(query)
    );
  });

  return (
    <div className="max-w-6xl mx-auto space-y-8 text-[#1F2024]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono font-bold text-[#6D35C8] uppercase tracking-widest">
            STORE MANAGEMENT & CMS
          </span>
          <h1 className="font-display text-3xl font-black text-[#1F2024] uppercase tracking-tight">
            Customer Inquiries & Messages
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Read and respond to questions submitted through the storefront /contact page.
          </p>
        </div>

        <button
          onClick={loadMessages}
          className="px-4 py-2 bg-white hover:bg-zinc-100 text-zinc-700 rounded-xl text-xs font-bold uppercase border border-[#E5E5E3] shadow-xs flex items-center gap-1.5 self-start sm:self-auto transition cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Grid: Messages List & Detail View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Messages List */}
        <div className="lg:col-span-5 space-y-4">
          <div className="relative">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search sender, email, subject..."
              className="w-full bg-white border border-zinc-200 rounded-2xl pl-9 pr-4 py-2.5 text-xs text-[#1F2024] focus:outline-none focus:border-[#6D35C8] shadow-xs"
            />
          </div>

          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
            {filtered.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-2xl border border-[#E5E5E3]">
                <Mail className="w-8 h-8 text-zinc-300 mx-auto mb-2" />
                <p className="text-xs font-bold text-zinc-600">No inquiries found</p>
              </div>
            ) : (
              filtered.map(msg => {
                const isSelected = selectedMessage?.id === msg.id;
                const isUnread = msg.status === 'unread';

                return (
                  <div
                    key={msg.id}
                    onClick={() => {
                      setSelectedMessage(msg);
                      if (isUnread) handleToggleRead(msg);
                    }}
                    className={`p-4 rounded-2xl border transition cursor-pointer text-left ${
                      isSelected
                        ? 'bg-[#F3EEFC] border-[#6D35C8] shadow-xs'
                        : isUnread
                        ? 'bg-white border-[#6D35C8]/40 shadow-xs font-semibold'
                        : 'bg-white border-[#E5E5E3] hover:bg-[#F7F7F5]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-[#1F2024] truncate">{msg.name}</span>
                      <span className="text-[10px] font-mono text-zinc-400">
                        {new Date(msg.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                      </span>
                    </div>

                    <p className="text-xs font-bold text-[#6D35C8] truncate">{msg.subject}</p>
                    <p className="text-[11px] text-zinc-500 line-clamp-2 mt-1">{msg.message}</p>

                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-zinc-100 text-[10px]">
                      <span className="text-zinc-400 font-mono truncate">{msg.email}</span>
                      {isUnread && (
                        <span className="px-1.5 py-0.5 rounded bg-purple-600 text-white font-extrabold uppercase text-[9px]">
                          NEW
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Message Detail */}
        <div className="lg:col-span-7">
          {selectedMessage ? (
            <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#E5E5E3] shadow-xs space-y-6">
              <div className="flex items-start justify-between border-b border-[#E5E5E3] pb-4">
                <div>
                  <span className="text-[10px] font-mono font-bold text-[#6D35C8] uppercase tracking-wider">
                    INQUIRY DETAILS
                  </span>
                  <h2 className="font-display text-xl font-black text-[#1F2024] mt-0.5">
                    {selectedMessage.subject}
                  </h2>
                  <p className="text-xs text-zinc-400 font-mono mt-1">
                    Received {new Date(selectedMessage.created_at).toLocaleString()}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleRead(selectedMessage)}
                    className="p-2 bg-[#F7F7F5] hover:bg-zinc-200 text-zinc-700 rounded-xl border border-zinc-200 transition cursor-pointer text-xs"
                    title="Toggle Read Status"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(selectedMessage.id)}
                    className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl border border-rose-200 transition cursor-pointer"
                    title="Delete Message"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Sender Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-[#F7F7F5] border border-zinc-200 text-xs">
                <div>
                  <span className="text-[10px] font-bold text-zinc-400 uppercase block">Sender Name</span>
                  <p className="font-bold text-[#1F2024]">{selectedMessage.name}</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-zinc-400 uppercase block">Email Address</span>
                  <a href={`mailto:${selectedMessage.email}`} className="font-mono text-[#6D35C8] hover:underline font-bold">
                    {selectedMessage.email}
                  </a>
                </div>
                {selectedMessage.phone && (
                  <div>
                    <span className="text-[10px] font-bold text-zinc-400 uppercase block">Phone / WhatsApp</span>
                    <a href={`tel:${selectedMessage.phone}`} className="font-mono text-[#1F2024] font-bold">
                      {selectedMessage.phone}
                    </a>
                  </div>
                )}
                <div>
                  <span className="text-[10px] font-bold text-zinc-400 uppercase block">Status</span>
                  <span className="font-bold uppercase text-emerald-600">{selectedMessage.status}</span>
                </div>
              </div>

              {/* Message Body */}
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase text-zinc-500 block">Message Text</span>
                <div className="p-5 rounded-2xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-800 leading-relaxed whitespace-pre-wrap font-sans">
                  {selectedMessage.message}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 pt-4 border-t border-[#E5E5E3]">
                <a
                  href={`mailto:${selectedMessage.email}?subject=Re: ${encodeURIComponent(selectedMessage.subject)} - RAYVEN Support`}
                  className="px-5 py-2.5 bg-[#6D35C8] hover:bg-[#4B218A] text-white text-xs font-bold rounded-xl uppercase tracking-wider flex items-center gap-2 transition cursor-pointer shadow-md shadow-purple-900/20"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Reply via Email</span>
                </a>

                {selectedMessage.phone && (
                  <a
                    href={`https://wa.me/${selectedMessage.phone.replace(/[^0-9]/g, '')}?text=Hello%20${encodeURIComponent(selectedMessage.name)},%20this%20is%20RAYVEN%20Customer%20Support.`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl uppercase tracking-wider flex items-center gap-2 transition cursor-pointer shadow-md shadow-emerald-900/20"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Chat on WhatsApp</span>
                  </a>
                )}
              </div>
            </div>
          ) : (
            <div className="p-16 text-center bg-white rounded-3xl border border-[#E5E5E3] flex flex-col items-center justify-center min-h-[400px]">
              <MessageSquare className="w-12 h-12 text-zinc-200 mb-3" />
              <p className="font-bold text-sm text-zinc-600">Select an inquiry to view</p>
              <p className="text-xs text-zinc-400 mt-1">Choose any customer submission from the list on the left.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
