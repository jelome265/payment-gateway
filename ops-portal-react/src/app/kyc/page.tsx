'use client';

import { useState } from 'react';
import { Button, Card, Input } from '@/components/ui';
import { Shield, Upload, CheckCircle, ArrowRight } from 'lucide-react';

export default function KYCPage() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const handleNext = () => {
    setLoading(true);
    setTimeout(() => {
      setStep(step + 1);
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="max-w-2xl w-full">
        {/* Progress Stepper */}
        <div className="flex justify-between mb-8 px-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                step >= s ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
              }`}>
                {step > s ? <CheckCircle className="w-6 h-6" /> : s}
              </div>
              {s < 3 && <div className={`h-1 w-24 mx-2 ${step > s ? 'bg-blue-600' : 'bg-gray-200'}`} />}
            </div>
          ))}
        </div>

        <Card title={
          step === 1 ? 'Personal Information' : 
          step === 2 ? 'Identity Verification' : 
          'Review & Submit'
        } description={
          step === 1 ? 'Enter your details as they appear on your legal ID.' : 
          step === 2 ? 'Upload your national ID or passport.' : 
          'Ensure all information is correct before submission.'
        }>
          {step === 1 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input label="First Name" placeholder="John" />
                <Input label="Last Name" placeholder="Doe" />
              </div>
              <Input label="Date of Birth" type="date" />
              <Input label="Nationality" placeholder="Malawian" />
              <Input label="Full Address" placeholder="123 Chilomoni Rd, Blantyre" />
              <Button className="w-full mt-6" onClick={handleNext} isLoading={loading}>
                Continue <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center hover:border-blue-500 transition-colors cursor-pointer group">
                <div className="mx-auto w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4 group-hover:bg-blue-100 transition-colors">
                  <Upload className="w-8 h-8 text-blue-600" />
                </div>
                <h4 className="font-bold text-gray-900">Upload Identity Document</h4>
                <p className="text-sm text-gray-500 mt-2">PDF, PNG, or JPG (max 5MB)</p>
                <input type="file" className="hidden" />
              </div>
              
              <div className="flex items-center p-4 bg-yellow-50 rounded-lg border border-yellow-100">
                <Shield className="w-5 h-5 text-yellow-600 mr-3 shrink-0" />
                <p className="text-xs text-yellow-800 leading-relaxed">
                  Your ID will be processed by our secure identity partner and stored with AES-GCM encryption. 
                  We do not share your raw document with unauthorized third parties.
                </p>
              </div>

              <div className="flex gap-4">
                <Button variant="outline" className="w-full" onClick={() => setStep(1)}>Back</Button>
                <Button className="w-full" onClick={handleNext} isLoading={loading}>Continue</Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 text-center">
              <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">All Set!</h3>
              <p className="text-gray-600 leading-relaxed max-w-sm mx-auto">
                By submitting, you confirm that the provided information is accurate and you consent to our AML verification process.
              </p>
              <div className="flex gap-4 pt-6">
                <Button variant="outline" className="w-full" onClick={() => setStep(2)}>Review</Button>
                <Button className="w-full" onClick={() => window.location.href = '/dashboard'}>Submit for Review</Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
