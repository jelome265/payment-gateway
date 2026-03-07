'use client';

import { Card, Button } from '@/components/ui';
import { FileText, CheckCircle, XCircle, Eye, Shield, Clock } from 'lucide-react';

export default function KYCQueuePage() {
  const queue = [
    { id: 'k1', user: 'Lazarus Chakwera', email: 'lazarus@gov.mw', doc: 'National ID', date: '10 mins ago', risk: 'Low' },
    { id: 'k2', user: 'Saulos Chilima', email: 'saulos@vice.mw', doc: 'Passport', date: '25 mins ago', risk: 'Medium' },
    { id: 'k3', user: 'Unknown Merchant', email: 'anon@dark.net', doc: 'Utility Bill', date: '2 hours ago', risk: 'High' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">KYC Review Queue</h1>
        <p className="text-gray-500 mt-1">Manual verification for flagged or high-volume onboarding requests.</p>
      </div>

      <div className="flex gap-4 mb-6">
        <Button variant="outline" size="sm" className="bg-white">All Requests (142)</Button>
        <Button variant="secondary" size="sm">Pending (18)</Button>
        <Button variant="secondary" size="sm">High Risk (5)</Button>
      </div>

      <Card className="p-0 overflow-hidden">
         <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Applicant</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Document</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase text-black">Risk Score</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase text-black">Submitted</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200 text-sm">
              {queue.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                     <div className="font-bold text-gray-900">{item.user}</div>
                     <div className="text-xs text-gray-500">{item.email}</div>
                  </td>
                  <td className="px-6 py-4">
                     <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-blue-500" />
                        <span className="font-medium text-gray-700">{item.doc}</span>
                     </div>
                  </td>
                  <td className="px-6 py-4">
                     <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                       item.risk === 'Low' ? 'bg-green-100 text-green-700' : 
                       item.risk === 'Medium' ? 'bg-yellow-100 text-yellow-700' : 
                       'bg-red-100 text-red-700'
                     }`}>
                       {item.risk} Risk
                     </span>
                  </td>
                  <td className="px-6 py-4 text-gray-500 flex items-center">
                     <Clock className="w-3 h-3 mr-1" /> {item.date}
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                     <Button variant="ghost" size="sm"><Eye className="w-4 h-4" /></Button>
                     <Button variant="outline" size="sm" className="text-green-600 hover:bg-green-50"><CheckCircle className="w-4 h-4" /></Button>
                     <Button variant="outline" size="sm" className="text-red-600 hover:bg-red-50"><XCircle className="w-4 h-4" /></Button>
                  </td>
                </tr>
              ))}
            </tbody>
         </table>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-12">
         <Card title="Review Guidelines" className="bg-slate-50 border-slate-200">
            <ul className="space-y-3 text-xs text-slate-600 leading-relaxed">
               <li className="flex gap-2">
                  <Shield className="w-4 h-4 text-slate-400 shrink-0" />
                  Ensure document name exactly matches profile name.
               </li>
               <li className="flex gap-2">
                  <Shield className="w-4 h-4 text-slate-400 shrink-0" />
                  Check for visual signs of ID tampering or deepfakes.
               </li>
               <li className="flex gap-2 text-red-600 font-bold">
                  <Shield className="w-4 h-4 text-red-400 shrink-0" />
                  Flag any applicants appearing on RBM or PEP sanction lists.
               </li>
            </ul>
         </Card>
      </div>
    </div>
  );
}
