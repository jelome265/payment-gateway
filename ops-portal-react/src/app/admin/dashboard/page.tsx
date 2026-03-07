'use call';

import { Card } from '@/components/ui';
import { 
  Users, 
  ArrowUpRight, 
  AlertTriangle, 
  CheckCircle2, 
  Activity,
  TrendingUp,
  Clock
} from 'lucide-react';

export default function AdminDashboard() {
  const stats = [
    { name: 'Total Volume (24h)', value: '1.2B MWK', icon: TrendingUp, color: 'text-blue-600', trend: '+12.5%' },
    { name: 'Pending KYC', value: '142', icon: Clock, color: 'text-yellow-600', trend: 'High' },
    { name: 'AML Alerts', value: '18', icon: AlertTriangle, color: 'text-red-600', trend: 'Action Req' },
    { name: 'Active Users', value: '12,450', icon: Users, color: 'text-purple-600', trend: '+452' },
  ];

  return (
    <div className="space-y-8 text-black">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Operations Overview</h1>
          <p className="text-gray-500 mt-1">Real-time system performance and compliance monitoring.</p>
        </div>
        <div className="text-right text-xs text-gray-400 font-medium">
          Last updated: Mar 07, 2026 14:42:01
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.name} className="relative">
             <div className="flex justify-between items-start">
                <div className={`p-2 rounded-lg bg-gray-50 ${stat.color}`}>
                  <stat.icon className="w-5 h-5" />
                </div>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                  stat.trend.startsWith('+') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                }`}>
                  {stat.trend}
                </span>
             </div>
             <div className="mt-4">
                <p className="text-sm font-medium text-gray-500">{stat.name}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
             </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card title="Connector Health" description="Status of mobile money and bank rail adapters.">
           <div className="space-y-4 mt-4">
              {[
                { name: 'Airtel Money MW', status: 'Operational', latency: '42ms' },
                { name: 'TNM Mpamba', status: 'Operational', latency: '89ms' },
                { name: 'Standard Bank API', status: 'Degraded', latency: '1.2s' },
                { name: 'Marqeta BIN Sponsor', status: 'Operational', latency: '156ms' },
              ].map((c) => (
                <div key={c.name} className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors">
                   <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${c.status === 'Operational' ? 'bg-green-500' : 'bg-yellow-500'}`} />
                      <span className="text-sm font-bold text-gray-700">{c.name}</span>
                   </div>
                   <div className="text-right">
                      <p className="text-xs font-bold text-gray-900">{c.status}</p>
                      <p className="text-[10px] text-gray-400">{c.latency}</p>
                   </div>
                </div>
              ))}
           </div>
        </Card>

        <Card title="Critical Alerts" description="Active compliance and reconciliation issues.">
           <div className="space-y-4 mt-4">
              <div className="flex gap-4 p-4 rounded-lg bg-red-50 border border-red-100">
                 <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
                 <div>
                    <h5 className="text-sm font-bold text-red-900">Reconciliation Drift: Airtel MW</h5>
                    <p className="text-xs text-red-700 mt-1">Found 4 unmatched credits totaling 250,000 MWK from last settlement file.</p>
                 </div>
              </div>
              <div className="flex gap-4 p-4 rounded-lg bg-yellow-50 border border-yellow-100">
                 <ShieldAlert className="w-5 h-5 text-yellow-600 shrink-0" />
                 <div>
                    <h5 className="text-sm font-bold text-yellow-900">Large Transaction Flagged</h5>
                    <p className="text-xs text-yellow-700 mt-1">User john@example.com attempted 15M MWK P2P send. Escalated to AML Review.</p>
                 </div>
              </div>
           </div>
        </Card>
      </div>
    </div>
  );
}
