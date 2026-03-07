'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { 
  ShieldAlert, 
  Users, 
  FileCheck, 
  Activity, 
  BarChart3, 
  Settings, 
  LogOut,
  Database,
  Search
} from 'lucide-react';
import Link from 'next/link';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // In production, we'd check for ROLE_ADMIN or similar
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) return <div className="h-screen flex items-center justify-center">Authenticating Admin...</div>;

  const menuItems = [
    { name: 'Overview', icon: BarChart3, href: '/admin/dashboard' },
    { name: 'Users', icon: Users, href: '/admin/users' },
    { name: 'KYC Queue', icon: FileCheck, href: '/admin/kyc' },
    { name: 'AML Alerts', icon: ShieldAlert, href: '/admin/aml' },
    { name: 'Ledger Audit', icon: Database, href: '/admin/ledger' },
    { name: 'System Health', icon: Activity, href: '/admin/health' },
    { name: 'Configuration', icon: Settings, href: '/admin/config' },
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex text-black">
      {/* Admin Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col sticky top-0 h-screen">
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-red-600 rounded flex items-center justify-center">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <span className="font-bold text-lg tracking-tight">WarmHeart OPS</span>
          </div>
          <p className="text-[10px] uppercase tracking-widest text-slate-500 mt-2 font-bold">Internal Access Only</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-1">
          {menuItems.map((item) => (
            <Link 
              key={item.name} 
              href={item.href}
              className="flex items-center px-4 py-3 text-sm font-medium rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
            >
              <item.icon className="w-4 h-4 mr-3" />
              {item.name}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 px-4 py-3 mb-2">
            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold">
              {user.email[0].toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold truncate">{user.email}</p>
              <p className="text-[10px] text-slate-500 uppercase">Superadmin</p>
            </div>
          </div>
          <button 
            onClick={logout}
            className="flex w-full items-center px-4 py-2 text-sm font-medium text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4 mr-3" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Admin Content Area */}
      <main className="flex-1 flex flex-col">
        <header className="h-16 bg-white border-b border-gray-200 px-8 flex items-center justify-between">
           <div className="relative w-96">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <input 
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border-transparent rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-red-500 transition-all" 
                placeholder="Search transactions, users, or tickets..."
              />
           </div>
           <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-bold border border-green-100">
                 <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                 System Live
              </div>
           </div>
        </header>
        <div className="p-8 overflow-y-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
