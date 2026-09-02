import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useStore } from '../../contexts/StoreContext';
import { RayvenLogo } from '../../components/RayvenLogo';
import { 
  LayoutDashboard, ShoppingBag, PlusCircle, FolderTree, ClipboardList, 
  Boxes, Ticket, Image, Settings, LogOut, ArrowLeft, Shield, ExternalLink,
  Sparkles, FileText, HelpCircle, Mail, Users, Activity
} from 'lucide-react';

interface AdminLayoutProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  onNavigateStore: (path: string) => void;
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ 
  currentTab, 
  onSelectTab, 
  onNavigateStore, 
  children 
}) => {
  const { user, logout } = useAuth();
  const { settings } = useStore();

  const navSections = [
    {
      title: 'Store Operations',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'products', label: 'All Match Kits', icon: ShoppingBag },
        { id: 'add-product', label: 'Add New Kit', icon: PlusCircle },
        { id: 'orders', label: 'Orders & Dispatch', icon: ClipboardList },
        { id: 'inventory', label: 'Stock & Inventory', icon: Boxes },
        { id: 'categories', label: 'Clubs & Leagues', icon: FolderTree },
        { id: 'coupons', label: 'Coupons & Promos', icon: Ticket },
      ]
    },
    {
      title: 'CMS & Content Studio',
      items: [
        { id: 'banners', label: 'Hero Banners', icon: Image },
        { id: 'homepage-cms', label: 'Homepage CMS', icon: Sparkles },
        { id: 'pages-cms', label: 'Pages & Policies', icon: FileText },
        { id: 'faq-cms', label: 'FAQ Manager', icon: HelpCircle },
        { id: 'messages', label: 'Inquiries & Contact', icon: Mail },
        { id: 'subscribers', label: 'Newsletter Squad', icon: Users },
      ]
    },
    {
      title: 'Configuration',
      items: [
        { id: 'settings', label: 'Store Settings', icon: Settings },
        { id: 'logs', label: 'Activity Audit Logs', icon: Activity },
      ]
    }
  ];

  const handleSignOut = async () => {
    await logout();
    onNavigateStore('/');
  };

  return (
    <div className="min-h-screen bg-[#F7F7F5] text-[#1F2024] flex flex-col lg:flex-row font-sans selection:bg-[#6D35C8] selection:text-white">
      {/* Sidebar */}
      <aside className="w-full lg:w-64 bg-white border-r border-[#E5E5E3] flex flex-col justify-between shrink-0 shadow-xs max-h-screen lg:sticky lg:top-0">
        <div className="p-4 sm:p-5 space-y-5 overflow-y-auto">
          {/* Logo & Portal Tag */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <RayvenLogo size="sm" showText={false} />
              <div>
                <span className="font-display text-base font-black tracking-wider text-[#1F2024] uppercase">
                  {settings.store_name || 'RAYVEN'}
                </span>
                <span className="block text-[9px] font-bold text-[#6D35C8] uppercase tracking-widest -mt-1 font-mono">
                  ADMIN MANAGER
                </span>
              </div>
            </div>

            <button
              onClick={() => onNavigateStore('/')}
              className="p-2 text-zinc-400 hover:text-zinc-700 rounded-xl hover:bg-zinc-100 transition cursor-pointer"
              title="Return to Customer Storefront"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          </div>

          {/* Navigation Sections */}
          <nav className="space-y-4">
            {navSections.map((sec, sIdx) => (
              <div key={sIdx} className="space-y-1">
                <span className="px-3 text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400 block mb-1">
                  {sec.title}
                </span>
                {sec.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => onSelectTab(item.id)}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition text-left cursor-pointer ${
                        isActive
                          ? 'bg-[#6D35C8] text-white font-black shadow-md shadow-purple-900/20'
                          : 'text-zinc-600 hover:text-zinc-900 hover:bg-[#F7F7F5]'
                      }`}
                    >
                      <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-white' : 'text-zinc-400'}`} />
                      <span className="truncate">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            ))}
          </nav>
        </div>

        {/* User Info & Actions */}
        <div className="p-4 border-t border-[#E5E5E3] space-y-3 bg-[#F7F7F5]/50">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
              <span className="text-zinc-600 font-mono text-[11px] truncate max-w-[120px]" title={user?.email}>
                {user?.email || 'admin'}
              </span>
            </div>
            <span className="px-1.5 py-0.5 rounded bg-[#F3EEFC] text-[10px] font-extrabold text-[#6D35C8] uppercase">
              {user?.role || 'admin'}
            </span>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => onNavigateStore('/')}
              className="flex-1 py-2 px-3 bg-white hover:bg-zinc-100 text-zinc-700 border border-[#E5E5E3] rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition shadow-xs cursor-pointer"
              title="Open Customer View"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Storefront</span>
            </button>

            <button
              id="admin-logout-btn"
              onClick={handleSignOut}
              className="py-2 px-3 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center transition border border-red-200 cursor-pointer"
              title="Sign Out from Admin"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-[#F7F7F5]">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};
