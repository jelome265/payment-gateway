'use client';

import { Button } from '@/components/ui';
import { Shield, Zap, Globe, ArrowRight, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="px-6 py-4 flex items-center justify-between border-b border-gray-100 sticky top-0 bg-white/80 backdrop-blur-md z-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Zap className="text-white w-5 h-5" />
          </div>
          <span className="text-xl font-bold text-gray-900 tracking-tight">WarmHeart</span>
        </div>
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
          <Link href="#features" className="hover:text-blue-600 transition-colors">Features</Link>
          <Link href="#compliance" className="hover:text-blue-600 transition-colors">Compliance</Link>
          <Link href="/login" className="hover:text-blue-600 transition-colors">Login</Link>
        </nav>
        <div className="flex items-center gap-3">
          <Link href="/signup">
            <Button size="sm">Get Started</Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 px-6 overflow-hidden bg-gradient-to-b from-blue-50 to-white">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 tracking-tight mb-6">
            Banking for the <span className="text-blue-600">Next Billion</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-10 leading-relaxed">
            The secure, compliant, and lightning-fast payment gateway for Malawi and beyond. 
            Send money, issue virtual cards, and trade FX instantly.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/signup">
              <Button size="lg" className="w-full sm:w-auto h-14 px-8 text-lg">
                Create Free Account <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <div className="flex items-center gap-4 py-2 px-4 rounded-full bg-white border border-gray-200 shadow-sm">
              <Shield className="text-green-600 w-5 h-5" />
              <span className="text-sm font-medium text-gray-700">Regulated by RBM</span>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Signals */}
      <section id="compliance" className="py-24 px-6 bg-white border-y border-gray-100">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="space-y-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
                <Shield className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Enterprise Security</h3>
              <p className="text-gray-600 leading-relaxed">
                Bank-grade encryption, HSM-backed keys, and PCI-DSS compliant infrastructure protect your assets 24/7.
              </p>
            </div>
            <div className="space-y-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-green-600">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Regulatory Ready</h3>
              <p className="text-gray-600 leading-relaxed">
                Built specifically for Malawi's financial ecosystem, adhering to Reserve Bank of Malawi guidelines.
              </p>
            </div>
            <div className="space-y-4">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center text-purple-600">
                <Globe className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Borderless FX</h3>
              <p className="text-gray-600 leading-relaxed">
                Peer-to-peer foreign exchange marketplace with deterministic matching and instant settlement.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-12 px-6 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 border-b border-gray-800 pb-12">
          <div className="col-span-1 md:col-span-1">
             <div className="flex items-center gap-2 mb-6">
                <Zap className="text-blue-400 w-6 h-6" />
                <span className="text-xl font-bold tracking-tight">WarmHeart</span>
             </div>
             <p className="text-gray-400 text-sm leading-relaxed">
               Empowering financial inclusion through modern infrastructure.
             </p>
          </div>
          <div>
            <h4 className="font-bold mb-4">Product</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link href="/login" className="hover:text-white">Dashboard</Link></li>
              <li><Link href="/signup" className="hover:text-white">Virtual Cards</Link></li>
              <li><Link href="/signup" className="hover:text-white">FX Marketplace</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link href="/terms" className="hover:text-white">Terms of Service</Link></li>
              <li><Link href="/privacy" className="hover:text-white">Privacy Policy</Link></li>
              <li><Link href="/kyc-aml" className="hover:text-white">Compliance</Link></li>
            </ul>
          </div>
          <div>
             <h4 className="font-bold mb-4">Contact</h4>
             <p className="text-sm text-gray-400 mb-2">support@warmheart.mw</p>
             <p className="text-sm text-gray-400">Lilongwe, Malawi</p>
          </div>
        </div>
        <div className="max-w-7xl mx-auto pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-gray-500 gap-4">
           <p>© 2026 WarmHeart Payments. All rights reserved.</p>
           <p>WarmHeart is a technology platform, not a bank. Financial services are provided by our regulated partners.</p>
        </div>
      </footer>
    </div>
  );
}
