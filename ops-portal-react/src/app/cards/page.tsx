'use client';

import { useState } from 'react';
import { Card, Button } from '@/components/ui';
import { Plus, CreditCard, Shield, Lock, Eye, EyeOff, Snowman } from 'lucide-react';

export default function CardsPage() {
  const [showNumbers, setShowNumbers] = useState<string | null>(null);

  const cards = [
    { id: 'c1', last4: '4242', brand: 'Visa', expiry: '12/28', status: 'Active', balance: '1,250.00', color: 'from-blue-600 to-indigo-700' },
    { id: 'c2', last4: '8812', brand: 'Mastercard', expiry: '08/27', status: 'Frozen', balance: '0.00', color: 'from-gray-700 to-gray-900' },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Virtual Cards</h1>
          <p className="text-gray-500 mt-1">Issue and manage your secure online payment cards.</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" /> Issue New Card
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {cards.map((card) => (
          <div key={card.id} className="group perspective">
            <div className={`relative h-56 rounded-2xl p-8 text-white shadow-xl bg-gradient-to-br ${card.color} transition-transform duration-500 transform-gpu group-hover:-translate-y-2`}>
              <div className="flex justify-between items-start mb-12">
                <CreditCard className="w-10 h-10 opacity-80" />
                <span className="text-sm font-bold opacity-60 uppercase">{card.brand}</span>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <span className="text-2xl font-mono tracking-widest">
                    {showNumbers === card.id ? '4242 8812 9901 4242' : `**** **** **** ${card.last4}`}
                  </span>
                  <button 
                    onClick={() => setShowNumbers(showNumbers === card.id ? null : card.id)}
                    className="p-1 hover:bg-white/20 rounded transition-colors"
                  >
                    {showNumbers === card.id ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-[10px] uppercase opacity-60 mb-1">Expiry</p>
                    <p className="font-mono">{card.expiry}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] uppercase opacity-60 mb-1">Status</p>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      card.status === 'Active' ? 'bg-green-500/20 text-green-200' : 'bg-red-500/20 text-red-200'
                    }`}>
                      {card.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-4 flex gap-2">
              <Button variant="outline" size="sm" className="flex-1">
                {card.status === 'Active' ? <Lock className="w-3 h-3 mr-2" /> : <RefreshCcw className="w-3 h-3 mr-2" />}
                {card.status === 'Active' ? 'Freeze' : 'Unfreeze'}
              </Button>
              <Button variant="outline" size="sm" className="flex-1">Settings</Button>
            </div>
          </div>
        ))}
      </div>

      <Card title="Security Best Practices" className="bg-blue-50 border-blue-100">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex gap-4">
            <div className="p-2 bg-blue-100 rounded-lg h-fit">
              <Shield className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h4 className="font-bold text-gray-900 text-sm">Tokenized Payments</h4>
              <p className="text-xs text-gray-600 mt-1">We use network tokens instead of your real card details for merchant transactions.</p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="p-2 bg-blue-100 rounded-lg h-fit">
              <Lock className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h4 className="font-bold text-gray-900 text-sm">Spend Limits</h4>
              <p className="text-xs text-gray-600 mt-1">Set daily or per-transaction limits to prevent unauthorized large purchases.</p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="p-2 bg-blue-100 rounded-lg h-fit">
              <Snowman className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h4 className="font-bold text-gray-900 text-sm">Instant Freeze</h4>
              <p className="text-xs text-gray-600 mt-1">Instantly disable any card if you suspect it has been compromised.</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
