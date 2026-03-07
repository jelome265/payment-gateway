'use client';

import { useAuth } from '@/context/AuthContext';
import { Card, Button, Input } from '@/components/ui';
import { ShieldCheck, User, Settings, Bell, Lock, Smartphone, LogOut } from 'lucide-react';

export default function ProfilePage() {
  const { user } = useAuth();

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Account Settings</h1>
        <p className="text-gray-500 mt-1">Manage your identity, security, and notification preferences.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Navigation Sidebar */}
        <div className="space-y-1">
          <button className="flex w-full items-center px-4 py-2.5 text-sm font-medium rounded-lg bg-blue-50 text-blue-700">
            <User className="w-4 h-4 mr-3" /> Profile
          </button>
          <button className="flex w-full items-center px-4 py-2.5 text-sm font-medium rounded-lg text-gray-600 hover:bg-gray-50">
            <ShieldCheck className="w-4 h-4 mr-3" /> Security
          </button>
          <button className="flex w-full items-center px-4 py-2.5 text-sm font-medium rounded-lg text-gray-600 hover:bg-gray-50">
            <Bell className="w-4 h-4 mr-3" /> Notifications
          </button>
          <button className="flex w-full items-center px-4 py-2.5 text-sm font-medium rounded-lg text-gray-600 hover:bg-gray-50">
            <Smartphone className="w-4 h-4 mr-3" /> Connected Devices
          </button>
        </div>

        {/* Content Area */}
        <div className="md:col-span-2 space-y-6">
          <Card title="Personal Information">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input label="Full Name" value="John Doe" readOnly />
                <Input label="KYC Level" value={user?.kyc_level} readOnly className="text-blue-600 font-bold" />
              </div>
              <Input label="Email Address" value={user?.email} readOnly />
              <Input label="Phone Number" value="+265 888 123 456" />
              <div className="pt-4 border-t border-gray-100 flex justify-end">
                <Button>Update Profile</Button>
              </div>
            </div>
          </Card>

          <Card title="Security & Login" description="Manage your password and two-factor authentication.">
            <div className="space-y-4">
               <div className="flex justify-between items-center py-2">
                 <div>
                   <h5 className="text-sm font-bold text-gray-900">Two-Factor Authentication</h5>
                   <p className="text-xs text-gray-500 mt-1">Protect your account with an extra layer of security.</p>
                 </div>
                 <Button variant="outline" size="sm">Enable</Button>
               </div>
               <div className="flex justify-between items-center py-2 border-t border-gray-100">
                 <div>
                   <h5 className="text-sm font-bold text-gray-900">Password</h5>
                   <p className="text-xs text-gray-500 mt-1">Last changed 3 months ago.</p>
                 </div>
                 <Button variant="outline" size="sm">Change</Button>
               </div>
            </div>
          </Card>

          <Card className="border-red-100 bg-red-50">
             <div className="flex justify-between items-center">
                <div>
                   <h5 className="text-sm font-bold text-red-900">Danger Zone</h5>
                   <p className="text-xs text-red-700 mt-1">Irreversibly delete your account and all associated data.</p>
                </div>
                <Button variant="danger" size="sm">Deactivate</Button>
             </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
