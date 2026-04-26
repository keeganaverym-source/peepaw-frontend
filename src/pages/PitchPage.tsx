import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Zap, Mail, PhoneCall, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';
import { generateEmail, generateScript, generatePitchPackage, analyzeBusinessAI } from '../lib/api';
import { LoadingSpinner, CopyButton } from '../components/shared/UI';

const NICHES = [
  { value: 'custom', label: 'General Business' },
  { value: 'restaurants', label: 'Restaurant' },
  { value: 'contractors', label: 'Contractor' },
  { value: 'med_spas', label: 'Med Spa' },
  { value: 'real_estate', label: 'Real Estate' },
  { value: 'retail', label: 'Retail' },
];

export default function PitchPage() {
  const [form, setForm] = useState({
    name: '',
    address: '',
    phone: '',
    website: '',
    category: '',
    rating: '',
    niche: 'custom',
    has_website: false,
  });
  const [result, setResult] = useState<any>(null);
  const [activeOutput, setActiveOutput] = useState<'analysis' | 'email' | 'script' | 'package'>('package');

  const buildPayload = () => ({
    ...form,
    rating: form.rating ? parseFloat(form.rating) : undefined,
    has_website: !!form.website,
  });

  const analysisMutation = useMutation({
    mutationFn: () => analyzeBusinessAI(buildPayload() as any),
    onSuccess: (res) => { setResult({ analysis: res.data }); setActiveOutput('analysis'); },
    onError: () => toast.error('Analysis failed'),
  });

  const emailMutation = useMutation({
    mutationFn: () => generateEmail(buildPayload() as any),
    onSuccess: (res) => { setResult((p: any) => ({ ...p, email: res.data.email })); setActiveOutput('email'); },
    onError: () => toast.error('Email generation failed'),
  });

  const scriptMutation = useMutation({
    mutationFn: () => generateScript(buildPayload() as any),
    onSuccess: (res) => { setResult((p: any) => ({ ...p, script: res.data.script })); setActiveOutput('script'); },
    onError: () => toast.error('Script generation failed'),
  });

  const packageMutation = useMutation({
    mutationFn: () => generatePitchPackage(buildPayload() as any),
    onSuccess: (res) => { setResult((p: any) => ({ ...p, package: res.data })); setActiveOutput('package'); },
    onError: () => toast.error('Package generation failed'),
  });

  const isLoading = analysisMutation.isPending || emailMutation.isPending || scriptMutation.isPending || packageMutation.isPending;

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-xl font-semibold text-gray-100">Pitch Generator</h1>
          <p className="text-sm text-gray-500 mt-0.5">Generate cold emails, call scripts, and full pitch packages for any business</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Form */}
          <div className="card p-5 space-y-4">
            <div className="section-title">Business Details</div>

            <div>
              <label className="text-xs text-gray-400 mb-1 block">Business Name *</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Mike's Plumbing Co."
                className="input text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Niche</label>
                <div className="relative">
                  <select
                    value={form.niche}
                    onChange={(e) => setForm({ ...form, niche: e.target.value })}
                    className="select text-sm pr-7"
                  >
                    {NICHES.map((n) => <option key={n.value} value={n.value}>{n.label}</option>)}
                  </select>
                  <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Rating (1-5)</label>
                <input
                  type="number"
                  value={form.rating}
                  onChange={(e) => setForm({ ...form, rating: e.target.value })}
                  placeholder="e.g. 4.2"
                  min="1" max="5" step="0.1"
                  className="input text-sm"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-gray-400 mb-1 block">Website URL (leave blank if none)</label>
              <input
                type="url"
                value={form.website}
                onChange={(e) => setForm({ ...form, website: e.target.value })}
                placeholder="https://example.com"
                className="input text-sm"
              />
            </div>

            <div>
              <label className="text-xs text-gray-400 mb-1 block">Address</label>
              <input
                type="text"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                placeholder="123 Main St, City, State"
                className="input text-sm"
              />
            </div>

            <div>
              <label className="text-xs text-gray-400 mb-1 block">Phone</label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="(555) 000-0000"
                className="input text-sm"
              />
            </div>

            <div>
              <label className="text-xs text-gray-400 mb-1 block">Category / Type</label>
              <input
                type="text"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                placeholder="e.g. plumber, dentist, gym"
                className="input text-sm"
              />
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={() => analysisMutation.mutate()}
                disabled={!form.name || isLoading}
                className="btn-secondary flex items-center justify-center gap-2 text-sm py-2.5"
              >
                {analysisMutation.isPending ? <LoadingSpinner size={14} /> : '🧠'}
                Analyze
              </button>
              <button
                onClick={() => emailMutation.mutate()}
                disabled={!form.name || isLoading}
                className="btn-secondary flex items-center justify-center gap-2 text-sm py-2.5"
              >
                {emailMutation.isPending ? <LoadingSpinner size={14} /> : <Mail size={14} />}
                Email
              </button>
              <button
                onClick={() => scriptMutation.mutate()}
                disabled={!form.name || isLoading}
                className="btn-secondary flex items-center justify-center gap-2 text-sm py-2.5"
              >
                {scriptMutation.isPending ? <LoadingSpinner size={14} /> : <PhoneCall size={14} />}
                Call Script
              </button>
              <button
                onClick={() => packageMutation.mutate()}
                disabled={!form.name || isLoading}
                className="btn-primary flex items-center justify-center gap-2 text-sm py-2.5"
              >
                {packageMutation.isPending ? <LoadingSpinner size={14} /> : <Zap size={14} />}
                Full Package
              </button>
            </div>
          </div>

          {/* Output Panel */}
          <div className="card p-5">
            {!result ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12">
                <Zap size={40} className="text-accent/30 mb-4" />
                <h3 className="text-gray-400 font-medium mb-2">Ready to generate</h3>
                <p className="text-gray-600 text-sm">Fill in the business details and click any generate button</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Output Tabs */}
                <div className="flex gap-1 flex-wrap">
                  {result.analysis && (
                    <button onClick={() => setActiveOutput('analysis')}
                      className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${activeOutput === 'analysis' ? 'bg-accent/15 text-accent border-accent/30' : 'text-gray-500 border-dark-500 hover:text-gray-300'}`}>
                      Analysis
                    </button>
                  )}
                  {result.email && (
                    <button onClick={() => setActiveOutput('email')}
                      className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${activeOutput === 'email' ? 'bg-accent/15 text-accent border-accent/30' : 'text-gray-500 border-dark-500 hover:text-gray-300'}`}>
                      Email
                    </button>
                  )}
                  {result.script && (
                    <button onClick={() => setActiveOutput('script')}
                      className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${activeOutput === 'script' ? 'bg-accent/15 text-accent border-accent/30' : 'text-gray-500 border-dark-500 hover:text-gray-300'}`}>
                      Script
                    </button>
                  )}
                  {result.package && (
                    <button onClick={() => setActiveOutput('package')}
                      className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${activeOutput === 'package' ? 'bg-accent/15 text-accent border-accent/30' : 'text-gray-500 border-dark-500 hover:text-gray-300'}`}>
                      Package
                    </button>
                  )}
                </div>

                {/* Analysis Output */}
                {activeOutput === 'analysis' && result.analysis && (
                  <div className="space-y-3 animate-fade-in">
                    {result.analysis.one_liner && (
                      <div className="card-glow p-3 text-sm text-accent italic">"{result.analysis.one_liner}"</div>
                    )}
                    {result.analysis.business_overview && (
                      <div>
                        <div className="section-title">Overview</div>
                        <p className="text-sm text-gray-300">{result.analysis.business_overview}</p>
                      </div>
                    )}
                    {result.analysis.weaknesses?.length > 0 && (
                      <div>
                        <div className="section-title">Weaknesses</div>
                        <ul className="space-y-1">
                          {result.analysis.weaknesses.map((w: string, i: number) => (
                            <li key={i} className="text-sm text-gray-300 flex gap-2"><span className="text-red-400">✗</span>{w}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {result.analysis.services_to_sell?.length > 0 && (
                      <div>
                        <div className="section-title">Services to Sell</div>
                        <ul className="space-y-1">
                          {result.analysis.services_to_sell.map((s: string, i: number) => (
                            <li key={i} className="text-sm text-gray-300 flex gap-2"><span className="text-accent">→</span>{s}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {/* Email Output */}
                {activeOutput === 'email' && result.email && (
                  <div className="animate-fade-in">
                    <div className="flex justify-between items-center mb-2">
                      <div className="section-title mb-0">Email Pitch</div>
                      <CopyButton text={result.email} label="Copy Email" />
                    </div>
                    <pre className="text-xs text-gray-300 whitespace-pre-wrap font-sans leading-relaxed bg-dark-700 rounded-lg p-3 max-h-96 overflow-y-auto">
                      {result.email}
                    </pre>
                  </div>
                )}

                {/* Script Output */}
                {activeOutput === 'script' && result.script && (
                  <div className="animate-fade-in">
                    <div className="flex justify-between items-center mb-2">
                      <div className="section-title mb-0">Call Script</div>
                      <CopyButton text={result.script} label="Copy Script" />
                    </div>
                    <pre className="text-xs text-gray-300 whitespace-pre-wrap font-sans leading-relaxed bg-dark-700 rounded-lg p-3 max-h-96 overflow-y-auto">
                      {result.script}
                    </pre>
                  </div>
                )}

                {/* Package Output */}
                {activeOutput === 'package' && result.package && (
                  <div className="space-y-4 animate-fade-in">
                    {result.package.service_bundles?.map((bundle: any, i: number) => (
                      <div key={i} className="card p-3">
                        <div className="font-medium text-accent text-sm mb-1">{bundle.name}</div>
                        <div className="text-xs text-gray-400 italic mb-2">"{bundle.value_prop}"</div>
                        <ul className="space-y-0.5">
                          {bundle.services?.map((s: string, j: number) => (
                            <li key={j} className="text-xs text-gray-300 flex gap-1.5"><span className="text-accent">•</span>{s}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                    {result.package.email && (
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <div className="section-title mb-0">Email</div>
                          <CopyButton text={result.package.email} label="Copy" />
                        </div>
                        <pre className="text-xs text-gray-300 whitespace-pre-wrap font-sans bg-dark-700 rounded-lg p-3 max-h-48 overflow-y-auto">
                          {result.package.email}
                        </pre>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
