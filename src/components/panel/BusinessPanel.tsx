import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  X, Globe, Phone, MapPin, Star, AlertTriangle, Brain,
  Mail, PhoneCall, UserCheck, BookmarkPlus, Zap, Package
} from 'lucide-react';
import toast from 'react-hot-toast';
import type { Business } from '../../lib/api';
import {
  createLead, markContacted, analyzeBusinessAI,
  generateEmail, generateScript, generatePitchPackage
} from '../../lib/api';
import { LikelihoodBadge, ScoreBar, StarRating, LoadingSpinner, CopyButton } from '../shared/UI';
import NotesPanel from '../crm/NotesPanel';

interface Props {
  business: Business;
  niche: string;
  onClose: () => void;
}

type Tab = 'overview' | 'analysis' | 'outreach' | 'pitch' | 'notes';

export default function BusinessPanel({ business, niche, onClose }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);
  const [emailContent, setEmailContent] = useState('');
  const [scriptContent, setScriptContent] = useState('');
  const [pitchPackage, setPitchPackage] = useState<any>(null);
  const [savedLeadId, setSavedLeadId] = useState<number | null>(null);
  const qc = useQueryClient();

  const saveMutation = useMutation({
    mutationFn: () => createLead({ ...business, niche }),
    onSuccess: (res) => {
      setSavedLeadId(res.data.id);
      toast.success(`${business.name} saved to leads!`);
      qc.invalidateQueries({ queryKey: ['leads'] });
    },
    onError: () => toast.error('Failed to save lead'),
  });

  const contactMutation = useMutation({
    mutationFn: () => markContacted(savedLeadId!),
    onSuccess: () => {
      toast.success('Marked as contacted!');
      qc.invalidateQueries({ queryKey: ['leads'] });
    },
  });

  const analyzeMutation = useMutation({
    mutationFn: () => analyzeBusinessAI({ ...business, niche }),
    onSuccess: (res) => {
      setAiAnalysis(res.data);
      setActiveTab('analysis');
    },
    onError: () => toast.error('AI analysis failed. Check your OpenAI key.'),
  });

  const emailMutation = useMutation({
    mutationFn: () => generateEmail({ ...business, niche }),
    onSuccess: (res) => {
      setEmailContent(res.data.email);
      setActiveTab('outreach');
    },
    onError: () => toast.error('Email generation failed'),
  });

  const scriptMutation = useMutation({
    mutationFn: () => generateScript({ ...business, niche }),
    onSuccess: (res) => {
      setScriptContent(res.data.script);
      setActiveTab('outreach');
    },
    onError: () => toast.error('Script generation failed'),
  });

  const pitchMutation = useMutation({
    mutationFn: () => generatePitchPackage({ ...business, niche }),
    onSuccess: (res) => {
      setPitchPackage(res.data);
      setActiveTab('pitch');
    },
    onError: () => toast.error('Pitch generation failed'),
  });

  const tabs: { id: Tab; label: string; icon: any }[] = [
    { id: 'overview', label: 'Overview', icon: Star },
    { id: 'analysis', label: 'AI Analysis', icon: Brain },
    { id: 'outreach', label: 'Outreach', icon: Mail },
    { id: 'pitch', label: 'Pitch Pack', icon: Package },
    { id: 'notes', label: 'Notes', icon: BookmarkPlus },
  ];

  const isLoading = analyzeMutation.isPending || emailMutation.isPending || scriptMutation.isPending || pitchMutation.isPending;

  return (
    <div className="w-[420px] h-full bg-dark-900 border-l border-dark-700 flex flex-col animate-slide-in-right overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-dark-700 flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h2 className="font-semibold text-gray-100 text-base leading-tight truncate">{business.name}</h2>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <LikelihoodBadge likelihood={business.likelihood} />
            {business.category && (
              <span className="badge bg-dark-700 text-gray-400 border border-dark-500 text-[10px]">
                {business.category.replace(/_/g, ' ')}
              </span>
            )}
          </div>
        </div>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-300 transition-colors mt-0.5">
          <X size={18} />
        </button>
      </div>

      {/* No Website Alert */}
      {business.no_website && (
        <div className="mx-4 mt-3 no-website-alert">
          <AlertTriangle size={20} className="text-orange-400 mx-auto mb-1" />
          <div className="text-orange-300 font-bold text-sm">NO WEBSITE — HIGH OPPORTUNITY</div>
          <div className="text-orange-400/70 text-xs mt-0.5">This business has zero online presence. Easy pitch.</div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-dark-700 px-2 pt-2 gap-1 overflow-x-auto">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-t-lg whitespace-nowrap transition-all ${
              activeTab === id
                ? 'bg-dark-800 text-accent border border-dark-600 border-b-dark-800 -mb-px'
                : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            <Icon size={12} />
            {label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="space-y-4 animate-fade-in">
            {/* Contact Info */}
            <div className="panel-section">
              <div className="section-title">Contact Info</div>
              <div className="space-y-2">
                {business.address && (
                  <div className="flex items-start gap-2 text-sm">
                    <MapPin size={14} className="text-accent mt-0.5 shrink-0" />
                    <span className="text-gray-300">{business.address}</span>
                  </div>
                )}
                {business.phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone size={14} className="text-accent shrink-0" />
                    <a href={`tel:${business.phone}`} className="text-gray-300 hover:text-accent transition-colors">
                      {business.phone}
                    </a>
                  </div>
                )}
                {business.website ? (
                  <div className="flex items-center gap-2 text-sm">
                    <Globe size={14} className="text-accent shrink-0" />
                    <a href={business.website} target="_blank" rel="noopener noreferrer"
                      className="text-accent hover:underline truncate">
                      {business.website.replace(/^https?:\/\//, '')}
                    </a>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-sm">
                    <Globe size={14} className="text-red-400 shrink-0" />
                    <span className="text-red-400 font-medium">No website detected</span>
                  </div>
                )}
              </div>
            </div>

            {/* Scores */}
            <div className="panel-section">
              <div className="section-title">Scores</div>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs text-gray-400 mb-1">
                    <span>Lead Score</span>
                    <span className="font-mono">{business.lead_score?.toFixed(1) || 'N/A'} / 5</span>
                  </div>
                  <ScoreBar score={business.lead_score} />
                </div>
                {business.has_website && (
                  <div>
                    <div className="flex justify-between text-xs text-gray-400 mb-1">
                      <span>Website Quality</span>
                      <span className="font-mono">{business.website_score?.toFixed(1) || 'N/A'} / 5</span>
                    </div>
                    <ScoreBar score={business.website_score} />
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">Rating</span>
                  <StarRating rating={business.rating} />
                </div>
                {business.review_count !== undefined && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">Reviews</span>
                    <span className="text-sm text-gray-300">{business.review_count?.toLocaleString()}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Website Breakdown */}
            {business.website_breakdown && (
              <div className="panel-section">
                <div className="section-title">Website Breakdown</div>
                <div className="space-y-2">
                  {Object.entries(business.website_breakdown).map(([key, val]) => (
                    <div key={key}>
                      <div className="flex justify-between text-xs text-gray-400 mb-1">
                        <span className="capitalize">{key.replace(/_/g, ' ')}</span>
                        <span className="font-mono">{val as number}/5</span>
                      </div>
                      <ScoreBar score={val as number} />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* AI ANALYSIS TAB */}
        {activeTab === 'analysis' && (
          <div className="space-y-4 animate-fade-in">
            {!aiAnalysis ? (
              <div className="text-center py-8">
                <Brain size={32} className="text-accent/40 mx-auto mb-3" />
                <p className="text-gray-400 text-sm mb-4">Run AI analysis to get deep business intelligence</p>
                <button
                  onClick={() => analyzeMutation.mutate()}
                  disabled={analyzeMutation.isPending}
                  className="btn-primary flex items-center gap-2 mx-auto"
                >
                  {analyzeMutation.isPending ? <LoadingSpinner size={14} /> : <Brain size={14} />}
                  {analyzeMutation.isPending ? 'Analyzing...' : 'Analyze with AI'}
                </button>
              </div>
            ) : (
              <>
                {aiAnalysis.one_liner && (
                  <div className="card-glow p-3 text-sm text-accent italic">
                    "{aiAnalysis.one_liner}"
                  </div>
                )}
                {aiAnalysis.business_overview && (
                  <div className="panel-section">
                    <div className="section-title">Business Overview</div>
                    <p className="text-sm text-gray-300 leading-relaxed">{aiAnalysis.business_overview}</p>
                  </div>
                )}
                {aiAnalysis.weaknesses?.length > 0 && (
                  <div className="panel-section">
                    <div className="section-title">Weaknesses</div>
                    <ul className="space-y-1.5">
                      {aiAnalysis.weaknesses.map((w: string, i: number) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                          <span className="text-red-400 mt-0.5 shrink-0">✗</span>
                          {w}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {aiAnalysis.opportunities?.length > 0 && (
                  <div className="panel-section">
                    <div className="section-title">Opportunities</div>
                    <ul className="space-y-1.5">
                      {aiAnalysis.opportunities.map((o: string, i: number) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                          <span className="text-green-400 mt-0.5 shrink-0">✓</span>
                          {o}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {aiAnalysis.services_to_sell?.length > 0 && (
                  <div className="panel-section">
                    <div className="section-title">Services to Sell</div>
                    <ul className="space-y-2">
                      {aiAnalysis.services_to_sell.map((s: string, i: number) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <span className="text-accent mt-0.5 shrink-0">→</span>
                          <span className="text-gray-300">{s}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                <button
                  onClick={() => analyzeMutation.mutate()}
                  className="btn-secondary text-xs w-full"
                >
                  Re-analyze
                </button>
              </>
            )}
          </div>
        )}

        {/* OUTREACH TAB */}
        {activeTab === 'outreach' && (
          <div className="space-y-4 animate-fade-in">
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => emailMutation.mutate()}
                disabled={emailMutation.isPending}
                className="btn-secondary flex items-center justify-center gap-2 text-sm py-2.5"
              >
                {emailMutation.isPending ? <LoadingSpinner size={14} /> : <Mail size={14} />}
                Generate Email
              </button>
              <button
                onClick={() => scriptMutation.mutate()}
                disabled={scriptMutation.isPending}
                className="btn-secondary flex items-center justify-center gap-2 text-sm py-2.5"
              >
                {scriptMutation.isPending ? <LoadingSpinner size={14} /> : <PhoneCall size={14} />}
                Call Script
              </button>
            </div>

            {emailContent && (
              <div className="panel-section">
                <div className="flex items-center justify-between mb-2">
                  <div className="section-title mb-0">Email Pitch</div>
                  <CopyButton text={emailContent} label="Copy Email" />
                </div>
                <pre className="text-xs text-gray-300 whitespace-pre-wrap font-sans leading-relaxed bg-dark-700 rounded-lg p-3 max-h-64 overflow-y-auto">
                  {emailContent}
                </pre>
              </div>
            )}

            {scriptContent && (
              <div className="panel-section">
                <div className="flex items-center justify-between mb-2">
                  <div className="section-title mb-0">Call Script</div>
                  <CopyButton text={scriptContent} label="Copy Script" />
                </div>
                <pre className="text-xs text-gray-300 whitespace-pre-wrap font-sans leading-relaxed bg-dark-700 rounded-lg p-3 max-h-64 overflow-y-auto">
                  {scriptContent}
                </pre>
              </div>
            )}

            {!emailContent && !scriptContent && (
              <div className="text-center py-6 text-gray-500 text-sm">
                Generate an email or call script above
              </div>
            )}
          </div>
        )}

        {/* PITCH PACKAGE TAB */}
        {activeTab === 'pitch' && (
          <div className="space-y-4 animate-fade-in">
            {!pitchPackage ? (
              <div className="text-center py-8">
                <Package size={32} className="text-accent/40 mx-auto mb-3" />
                <p className="text-gray-400 text-sm mb-4">Generate a full pitch package with email, script, and service bundles</p>
                <button
                  onClick={() => pitchMutation.mutate()}
                  disabled={pitchMutation.isPending}
                  className="btn-primary flex items-center gap-2 mx-auto"
                >
                  {pitchMutation.isPending ? <LoadingSpinner size={14} /> : <Zap size={14} />}
                  {pitchMutation.isPending ? 'Generating...' : 'Generate Pitch Package'}
                </button>
              </div>
            ) : (
              <>
                {pitchPackage.service_bundles?.length > 0 && (
                  <div className="panel-section">
                    <div className="section-title">Service Bundles</div>
                    <div className="space-y-3">
                      {pitchPackage.service_bundles.map((bundle: any, i: number) => (
                        <div key={i} className="card p-3">
                          <div className="font-medium text-accent text-sm mb-1">{bundle.name}</div>
                          <div className="text-xs text-gray-400 italic mb-2">"{bundle.value_prop}"</div>
                          <ul className="space-y-0.5">
                            {bundle.services?.map((s: string, j: number) => (
                              <li key={j} className="text-xs text-gray-300 flex items-center gap-1.5">
                                <span className="text-accent">•</span> {s}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {pitchPackage.email && (
                  <div className="panel-section">
                    <div className="flex items-center justify-between mb-2">
                      <div className="section-title mb-0">Email</div>
                      <CopyButton text={pitchPackage.email} label="Copy" />
                    </div>
                    <pre className="text-xs text-gray-300 whitespace-pre-wrap font-sans bg-dark-700 rounded-lg p-3 max-h-48 overflow-y-auto">
                      {pitchPackage.email}
                    </pre>
                  </div>
                )}
                {pitchPackage.call_script && (
                  <div className="panel-section">
                    <div className="flex items-center justify-between mb-2">
                      <div className="section-title mb-0">Call Script</div>
                      <CopyButton text={pitchPackage.call_script} label="Copy" />
                    </div>
                    <pre className="text-xs text-gray-300 whitespace-pre-wrap font-sans bg-dark-700 rounded-lg p-3 max-h-48 overflow-y-auto">
                      {pitchPackage.call_script}
                    </pre>
                  </div>
                )}
                <button onClick={() => pitchMutation.mutate()} className="btn-secondary text-xs w-full">
                  Regenerate
                </button>
              </>
            )}
          </div>
        )}

        {/* NOTES TAB */}
        {activeTab === 'notes' && (
          <div className="animate-fade-in">
            {savedLeadId ? (
              <NotesPanel leadId={savedLeadId} />
            ) : (
              <div className="text-center py-8">
                <BookmarkPlus size={32} className="text-accent/40 mx-auto mb-3" />
                <p className="text-gray-400 text-sm mb-4">Save this lead first to add notes</p>
                <button
                  onClick={() => saveMutation.mutate()}
                  disabled={saveMutation.isPending}
                  className="btn-primary flex items-center gap-2 mx-auto"
                >
                  {saveMutation.isPending ? <LoadingSpinner size={14} /> : <BookmarkPlus size={14} />}
                  Save Lead
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Action Bar */}
      <div className="p-3 border-t border-dark-700 flex gap-2">
        {!savedLeadId ? (
          <button
            onClick={() => saveMutation.mutate()}
            disabled={saveMutation.isPending}
            className="btn-primary flex-1 flex items-center justify-center gap-2 text-sm"
          >
            {saveMutation.isPending ? <LoadingSpinner size={14} /> : <BookmarkPlus size={14} />}
            Save Lead
          </button>
        ) : (
          <button
            onClick={() => contactMutation.mutate()}
            disabled={contactMutation.isPending}
            className="btn-success flex-1 flex items-center justify-center gap-2 text-sm"
          >
            {contactMutation.isPending ? <LoadingSpinner size={14} /> : <UserCheck size={14} />}
            Mark Contacted
          </button>
        )}
        {!aiAnalysis && (
          <button
            onClick={() => analyzeMutation.mutate()}
            disabled={isLoading}
            className="btn-secondary flex items-center gap-2 text-sm"
          >
            {analyzeMutation.isPending ? <LoadingSpinner size={14} /> : <Brain size={14} />}
            Analyze
          </button>
        )}
      </div>
    </div>
  );
}
