'use client';

import { useAuth } from '@/context/AuthContext';
import { Card, Button } from '@/components/ui';
import { Plus, ArrowRight, Wallet as WalletIcon, RefreshCcw } from 'lucide-react';

export default function WalletsPage() {
  const wallets = [
    { id: 'w1', currency: 'MWK', balance: '250,000.00', status: 'Active', color: 'bg-green-600' },
    { id: 'w2', currency: 'USD', balance: '42.50', status: 'Active', color: 'bg-blue-600' },
    { id: 'w3', currency: 'ZAR', balance: '1,200.00', status: 'Active', color: 'bg-yellow-600' },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Your Wallets</h1>
          <p className="text-gray-500 mt-1">Manage your multi-currency balances and reserves.</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" /> Add New Wallet
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {wallets.map((w) => (
          <Card key={w.id} className="relative overflow-hidden group">
            <div className={`absolute top-0 right-0 w-32 h-32 ${w.color} opacity-5 -mr-8 -mt-8 rounded-full transition-transform group-hover:scale-110`} />
            <div className="flex items-center justify-between mb-6">
              <div className={`p-3 rounded-lg ${w.color} text-white`}>
                <WalletIcon className="w-6 h-6" />
              </div>
              <span className="text-sm font-bold text-gray-400">{w.currency}</span>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Available Balance</p>
              <h2 className="text-3xl font-bold text-gray-900">{w.balance} <span className="text-sm font-normal text-gray-500">{w.currency}</span></h2>
            </div>
            <div className="mt-8 flex gap-3">
              <Button size="sm" variant="outline" className="flex-1">Deposit</Button>
              <Button size="sm" variant="outline" className="flex-1">Withdraw</Button>
            </div>
          </Card>
        ))}
      </div>

      <div className="mt-12">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Recent Wallet Activity</h3>
        <Card className="p-0 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transaction ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Wallet</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200 text-sm">
              {[1, 2, 3].map((i) => (
                <tr key={i} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-mono text-gray-500">TX-9283-491{i}</td>
                  <td className="px-6 py-4 font-medium text-gray-900">MWK Wallet</td>
                  <td className="px-6 py-4">Deposit (Airtel)</td>
                  <td className="px-6 py-4">
                    <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-bold">Settled</span>
                  </td>
                  <td className="px-6 py-4 text-right font-bold text-green-600">+50,000.00 MWK</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>
    </div>
  );
}
