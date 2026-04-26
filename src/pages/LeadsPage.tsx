import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Users, Trash2, Download, Filter, Globe, Phone, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';
import { getLeads, deleteLead, updateLead, exportLeadsCSV } from '../lib/api';
import type { Lead } from '../lib/api';
import { LikelihoodBadge, StatusBadge, StarRating, LoadingSpinner } from '../components/shared/UI';

const STATUSES = ['All', 'Potential', 'Contacted', 'In Progress', 'Sold', 'Lost'];

export default function LeadsPage() {
  const [statusFilter, setStatusFilter] = useState('All');
  const qc = useQueryClient();

  const { data: leads = [], isLoading } = useQuery({
    queryKey: ['leads', statusFilter],
    queryFn: () =>
      getLeads(statusFilter !== 'All' ? { status: statusFilter } : undefined).then((r) => r.data),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteLead(id),
    onSuccess: () => {
      toast.success('Lead deleted');
      qc.invalidateQueries({ queryKey: ['leads'] });
    },
    onError: () => toast.error('Failed to delete lead'),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) => updateLead(id, { status }),
    onSuccess: () => {
      toast.success('Status updated');
      qc.invalidateQueries({ queryKey: ['leads'] });
    },
    onError: () => toast.error('Failed to update status'),
  });

  const exportMutation = useMutation({
    mutationFn: exportLeadsCSV,
    onSuccess: (res) => {
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = 'leads.csv';
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success('CSV exported!');
    },
    onError: () => toast.error('Export failed'),
  });

  return (
    <div className="h-full flex flex-col bg-dark-950 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-dark-700 flex items-center justify-between gap-4 flex-shrink-0">
        <div className="flex items-center gap-3">
          <Users size={20} className="text-accent" />
          <h1 className="text-lg font-semibold text-gray-100">Leads</h1>
          <span className="badge bg-accent/10 text-accent border border-accent/20 text-xs">
            {leads.length}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => exportMutation.mutate()}
            disabled={exportMutation.isPending}
            className="btn-secondary flex items-center gap-2 text-sm"
          >
            {exportMutation.isPending ? <LoadingSpinner size={14} /> : <Download size={14} />}
            Export CSV
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="px-4 py-2 border-b border-dark-700 flex items-center gap-2 flex-shrink-0 overflow-x-auto">
        <Filter size={14} className="text-gray-500 shrink-0" />
        {STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
              statusFilter === s
                ? 'bg-accent/15 text-accent border border-accent/30'
                : 'text-gray-500 hover:text-gray-300 border border-transparent'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Leads List */}
      <div className="flex-1 overflow-y-auto p-4">
        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <LoadingSpinner size={32} />
          </div>
        ) : leads.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-center">
            <Users size={40} className="text-gray-700 mb-3" />
            <p className="text-gray-500 text-sm">No leads found.</p>
            <p className="text-gray-600 text-xs mt-1">Save businesses from the Map to see them here.</p>
          </div>
        ) : (
          <div className="grid gap-3">
            {(leads as Lead[]).map((lead) => (
              <div key={lead.id} className="card p-4 hover:border-dark-500 transition-colors">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className="font-semibold text-gray-100 text-sm truncate">{lead.name}</h3>
                      <LikelihoodBadge likelihood={lead.likelihood} />
                    </div>
                    <div className="space-y-1 mt-2">
                      {lead.address && (
                        <div className="flex items-center gap-1.5 text-xs text-gray-400">
                          <MapPin size={11} className="text-accent shrink-0" />
                          <span className="truncate">{lead.address}</span>
                        </div>
                      )}
                      {lead.phone && (
                        <div className="flex items-center gap-1.5 text-xs text-gray-400">
                          <Phone size={11} className="text-accent shrink-0" />
                          <a href={`tel:${lead.phone}`} className="hover:text-accent transition-colors">
                            {lead.phone}
                          </a>
                        </div>
                      )}
                      {lead.website ? (
                        <div className="flex items-center gap-1.5 text-xs">
                          <Globe size={11} className="text-accent shrink-0" />
                          <a
                            href={lead.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-accent hover:underline truncate"
                          >
                            {lead.website.replace(/^https?:\/\//, '')}
                          </a>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-xs">
                          <Globe size={11} className="text-red-400 shrink-0" />
                          <span className="text-red-400 font-medium">No website</span>
                        </div>
                      )}
                    </div>
                    {lead.rating && (
                      <div className="mt-2">
                        <StarRating rating={lead.rating} />
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <StatusBadge status={lead.status} />
                    <select
                      value={lead.status}
                      onChange={(e) => updateStatusMutation.mutate({ id: lead.id, status: e.target.value })}
                      className="select text-xs py-1 px-2 w-32"
                    >
                      {STATUSES.filter((s) => s !== 'All').map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                    <button
                      onClick={() => {
                        if (confirm(`Delete ${lead.name}?`)) deleteMutation.mutate(lead.id);
                      }}
                      className="text-gray-600 hover:text-red-400 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                {lead.niche && (
                  <div className="mt-2 pt-2 border-t border-dark-700">
                    <span className="badge bg-dark-700 text-gray-400 border border-dark-500 text-[10px]">
                      {lead.niche.replace(/_/g, ' ')}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
