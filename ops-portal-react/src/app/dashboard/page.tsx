'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { 
  Wallet, 
  ArrowUpRight, 
  ArrowDownLeft, 
  CreditCard, 
  ShieldCheck, 
  LogOut,
  LayoutDashboard,
  History,
  Settings
} from 'lucide-react';

export default function Dashboard() {
  const { user, logout, isLoading } = useAuth();
  const router = useRouter();
  const [balance, setBalance] = useState('0.00');

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  const stats = [
    { name: 'Available Balance', value: '$12,450.00', icon: Wallet, color: 'text-blue-600' },
    { name: 'Monthly Deposits', value: '$4,320.00', icon: ArrowDownLeft, color: 'text-green-600' },
    { name: 'Monthly Spend', value: '$2,105.00', icon: ArrowUpRight, color: 'text-red-600' },
  ];

  const transactions = [
    { id: 1, type: 'Deposit', amount: '+$500.00', status: 'Completed', date: 'Mar 07, 2024' },
    { id: 2, type: 'Card Payment', amount: '-$12.50', status: 'Pending', date: 'Mar 06, 2024' },
    { id: 3, type: 'FX Transfer', amount: '-$1,200.00', status: 'Completed', date: 'Mar 05, 2024' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-blue-600">WarmHeart</h1>
        </div>
        <nav className="flex-1 px-4 space-y-1">
          <a href="#" className="flex items-center px-3 py-2 text-sm font-medium rounded-md bg-blue-50 text-blue-700">
            <LayoutDashboard className="mr-3 h-5 w-5" /> Dashboard
          </a>
          <a href="#" className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-50">
            <History className="mr-3 h-5 w-5" /> Transactions
          </a>
          <a href="#" className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-50">
            <CreditCard className="mr-3 h-5 w-5" /> Cards
          </a>
          <a href="#" className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-50">
            <ShieldCheck className="mr-3 h-5 w-5" /> KYC Status
          </a>
          <a href="#" className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-50">
            <Settings className="mr-3 h-5 w-5" /> Settings
          </a>
        </nav>
        <div className="p-4 border-t border-gray-200">
          <button 
            onClick={logout}
            className="flex w-full items-center px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-md"
          >
            <LogOut className="mr-3 h-5 w-5" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <header className="bg-white border-b border-gray-200 p-6 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">Welcome, {user.email}</h2>
            <p className="text-sm text-gray-500">KYC Level: <span className="font-medium text-blue-600">{user.kyc_level}</span></p>
          </div>
          <div className="flex items-center space-x-4">
             <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
               Add Funds
             </button>
          </div>
        </header>

        <div className="p-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {stats.map((stat) => (
              <div key={stat.name} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">{stat.name}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-lg bg-gray-50 ${stat.color}`}>
                    <stat.icon className="h-6 w-6" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Recent Transactions */}
          <div className="mt-8">
            <div className="flex items-center justify-between mb-4">
               <h3 className="text-lg font-semibold text-gray-800">Recent Transactions</h3>
               <button className="text-sm text-blue-600 hover:underline">View All</button>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {transactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{tx.type}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{tx.date}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          tx.status === 'Completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {tx.status}
                        </span>
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm text-right font-bold ${
                        tx.amount.startsWith('+') ? 'text-green-600' : 'text-gray-900'
                      }`}>
                        {tx.amount}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
