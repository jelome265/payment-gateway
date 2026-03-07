'use client';

import { Card, Button, Input } from '@/components/ui';
import { ArrowLeftRight, TrendingUp, History, Filter, Search } from 'lucide-react';

export default function FXMarketPage() {
  const offers = [
    { id: 'o1', user: 'TrustedMerchant', rate: '1745.50', volume: '50,000.00', pair: 'USD/MWK', type: 'Sell' },
    { id: 'o2', user: 'AgroExporter', rate: '1742.00', volume: '120,000.00', pair: 'USD/MWK', type: 'Sell' },
    { id: 'o3', user: 'TechImport', rate: '1750.00', volume: '10,000.00', pair: 'USD/MWK', type: 'Buy' },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 text-black">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">FX Marketplace</h1>
          <p className="text-gray-500 mt-1 text-black">Peer-to-peer foreign exchange with secure escrow settlement.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline"><History className="w-4 h-4 mr-2" /> My Orders</Button>
          <Button><ArrowLeftRight className="w-4 h-4 mr-2" /> Create Offer</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Market Stats Sidebar */}
        <div className="space-y-6">
          <Card title="Market Overview" className="p-4">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">USD/MWK</span>
                <span className="text-sm font-bold text-green-600 flex items-center">
                  <TrendingUp className="w-3 h-3 mr-1" /> 1745.50
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">ZAR/MWK</span>
                <span className="text-sm font-bold text-gray-900">92.40</span>
              </div>
              <div className="pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-400">24h Volume</p>
                <p className="text-lg font-bold text-gray-900">425.8M MWK</p>
              </div>
            </div>
          </Card>
          
          <Card title="Quick Trade" className="p-4 bg-gray-50">
             <div className="space-y-4">
               <Input label="You Sell" placeholder="100.00" />
               <Input label="You Receive" placeholder="174,550.00" readOnly />
               <Button className="w-full">Swap Now</Button>
             </div>
          </Card>
        </div>

        {/* Offers List */}
        <div className="lg:col-span-3 space-y-4">
          <div className="flex gap-4 mb-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <input 
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" 
                placeholder="Search by merchant or volume..."
              />
            </div>
            <Button variant="outline"><Filter className="w-4 h-4 mr-2" /> Filters</Button>
          </div>

          <Card className="p-0 overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 text-black">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Provider</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pair</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rate</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase text-black">Volume</th>
                  <th className="px-6 py-3 text-right"></th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200 text-sm">
                {offers.map((offer) => (
                  <tr key={offer.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                       <div className="font-medium text-gray-900">{offer.user}</div>
                       <div className="text-xs text-green-600 font-bold">100% completion</div>
                    </td>
                    <td className="px-6 py-4 font-bold text-gray-700">{offer.pair}</td>
                    <td className="px-6 py-4">
                       <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                         offer.type === 'Sell' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'
                       }`}>
                         {offer.type}ing
                       </span>
                    </td>
                    <td className="px-6 py-4 font-mono font-bold text-blue-600">{offer.rate}</td>
                    <td className="px-6 py-4 font-mono text-gray-600">{offer.volume}</td>
                    <td className="px-6 py-4 text-right">
                       <Button size="sm">Trade</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </div>
      </div>
    </div>
  );
}
