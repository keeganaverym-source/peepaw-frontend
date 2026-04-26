import { useQuery } from '@tanstack/react-query';
import { TrendingUp, Users, Flame, Globe, DollarSign, Target, Activity, Clock } from 'lucide-react';
import { getDashboardStats } from '../lib/api';
import { LoadingSpinner, LikelihoodBadge, StatusBadge } from '../components/shared/UI';
import { format } from 'date-fns';

export default function DashboardPage() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => getDashboardStats().then((r) => r.data),
    refetchInterval: 30000,
  });

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <LoadingSpinner size={32} />
      </div>
    );
  }

  const s = stats || {};

  const statCards = [
    { label: 'Total Leads', value: s.total_leads || 0, icon: Users, color: 'text-accent', bg: 'bg-accent/10' },
    { label: 'High-Value Leads', value: s.high_value_leads || 0, icon: Target, color: 'text-orange-400', bg: 'bg-orange-500/10' },
    { label: 'Hot Leads', value: s.hot_leads || 0, icon: Flame, color: 'text-red-400', bg: 'bg-red-500/10' },
    { label: 'No Website', value: s.no_website_leads || 0, icon: Globe, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
    { label: 'Deals Closed', value: s.sold || 0, icon: DollarSign, color: 'text-green-400', bg: 'bg-green-500/10' },
    { label: 'Conversion Rate', value: `${s.conversion_rate || 0}%`, icon: TrendingUp, color: 'text-purple-400', bg: 'bg-purple-500/10' },
    { label: 'New This Week', value: s.recent_leads_7d || 0, icon: Activity, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { label: 'Contacted (7d)', value: s.recent_contacted_7d || 0, icon: Clock, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
  ];

  const statusBreakdown = s.status_breakdown || {};
  const totalForBar = Object.values(statusBreakdown).reduce((a: number, b) => a + (b as number), 0) || 1;

  const statusColors: Record<string, string> = {
    Potential: 'bg-blue-500',
    Contacted: 'bg-yellow-500',
    'In Progress': 'bg-purple-500',
    Sold: 'bg-green-500',
    Lost: 'bg-red-500',
  };

  return (
    <div className="h-full overflow-y-auto p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-gray-100">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-0.5">Your lead generation command center</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {statCards.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="stat-card">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-500">{label}</span>
              <div className={`w-7 h-7 rounded-lg ${bg} flex items-center justify-center`}>
                <Icon size={14} className={color} />
              </div>
            </div>
            <div className={`text-2xl font-bold ${color}`}>{value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Pipeline Status */}
        <div className="card p-4">
          <div className="section-title">Pipeline Status</div>
          {/* Stacked Bar */}
          <div className="flex h-3 rounded-full overflow-hidden mb-4 gap-0.5">
            {Object.entries(statusBreakdown).map(([status, count]) => {
              const pct = ((count as number) / (totalForBar as number)) * 100;
              if (pct === 0) return null;
              return (
                <div
                  key={status}
                  className={`${statusColors[status] || 'bg-gray-500'} transition-all`}
                  style={{ width: `${pct}%` }}
                  title={`${status}: ${count}`}
                />
              );
            })}
          </div>
          <div className="space-y-2">
            {Object.entries(statusBreakdown).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-2.5 h-2.5 rounded-full ${statusColors[status] || 'bg-gray-500'}`} />
                  <span className="text-sm text-gray-400">{status}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-200">{count as number}</span>
                  <span className="text-xs text-gray-600">
                    {Math.round(((count as number) / (totalForBar as number)) * 100)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Likelihood Breakdown */}
        <div className="card p-4">
          <div className="section-title">Lead Temperature</div>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1.5">
                <span className="text-orange-400 font-medium flex items-center gap-1.5">
                  🔥 Hot Leads
                </span>
                <span className="text-gray-300 font-mono">{s.hot_leads || 0}</span>
              </div>
              <div className="h-2 bg-dark-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-orange-500 rounded-full transition-all duration-700"
                  style={{ width: `${((s.hot_leads || 0) / (s.total_leads || 1)) * 100}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1.5">
                <span className="text-yellow-400 font-medium">🌡 Warm Leads</span>
                <span className="text-gray-300 font-mono">{s.warm_leads || 0}</span>
              </div>
              <div className="h-2 bg-dark-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-yellow-500 rounded-full transition-all duration-700"
                  style={{ width: `${((s.warm_leads || 0) / (s.total_leads || 1)) * 100}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1.5">
                <span className="text-blue-400 font-medium">❄️ Cold Leads</span>
                <span className="text-gray-300 font-mono">{s.cold_leads || 0}</span>
              </div>
              <div className="h-2 bg-dark-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full transition-all duration-700"
                  style={{ width: `${((s.cold_leads || 0) / (s.total_leads || 1)) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* Conversion Rate */}
          <div className="mt-4 pt-4 border-t border-dark-700">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-400">Conversion Rate</span>
              <span className="text-lg font-bold text-green-400">{s.conversion_rate || 0}%</span>
            </div>
            <div className="h-2 bg-dark-700 rounded-full overflow-hidden mt-2">
              <div
                className="h-full bg-green-500 rounded-full transition-all duration-700"
                style={{ width: `${s.conversion_rate || 0}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      {s.recent_activity?.length > 0 && (
        <div className="card p-4">
          <div className="section-title">Recent Activity</div>
          <div className="space-y-2">
            {s.recent_activity.map((lead: any) => (
              <div key={lead.id} className="flex items-center justify-between py-2 border-b border-dark-700 last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-accent" />
                  <div>
                    <div className="text-sm font-medium text-gray-200">{lead.name}</div>
                    <div className="text-xs text-gray-500">
                      Added {format(new Date(lead.created_at), 'MMM d, yyyy')}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <LikelihoodBadge likelihood={lead.likelihood} />
                  <StatusBadge status={lead.status} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {s.total_leads === 0 && (
        <div className="text-center py-16">
          <div className="text-5xl mb-4">🎯</div>
          <h3 className="text-gray-400 font-medium mb-2">No data yet</h3>
          <p className="text-gray-600 text-sm">Head to the Map tab to start finding leads</p>
        </div>
      )}
    </div>
  );
}
