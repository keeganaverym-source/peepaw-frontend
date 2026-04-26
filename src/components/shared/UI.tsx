import { useState } from 'react';
import { Loader2, Flame, Thermometer, Snowflake, Star } from 'lucide-react';

export function LoadingSpinner({ size = 20, className = '' }: { size?: number; className?: string }) {
  return <Loader2 size={size} className={`animate-spin text-accent ${className}`} />;
}

export function LikelihoodBadge({ likelihood }: { likelihood?: string }) {
  if (!likelihood) return null;
  const config = {
    Hot: { icon: Flame, className: 'bg-orange-500/15 text-orange-400 border-orange-500/30', label: 'Hot' },
    Warm: { icon: Thermometer, className: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30', label: 'Warm' },
    Cold: { icon: Snowflake, className: 'bg-blue-500/15 text-blue-400 border-blue-500/30', label: 'Cold' },
  }[likelihood] || { icon: Thermometer, className: 'bg-gray-500/15 text-gray-400 border-gray-500/30', label: likelihood };

  const Icon = config.icon;
  return (
    <span className={`badge border ${config.className}`}>
      <Icon size={10} />
      {config.label}
    </span>
  );
}

export function ScoreBar({ score, max = 5 }: { score?: number; max?: number }) {
  if (score === undefined || score === null) return null;
  const pct = (score / max) * 100;
  const color = score >= 4 ? '#ff6b35' : score >= 2.5 ? '#ffb800' : '#4a9eff';
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-dark-600 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
      <span className="text-xs font-mono text-gray-400">{score.toFixed(1)}</span>
    </div>
  );
}

export function StarRating({ rating }: { rating?: number }) {
  if (!rating) return <span className="text-gray-500 text-xs">No rating</span>;
  return (
    <div className="flex items-center gap-1">
      <Star size={12} className="text-yellow-400 fill-yellow-400" />
      <span className="text-sm font-medium text-gray-200">{rating.toFixed(1)}</span>
    </div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    Potential: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
    Contacted: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
    'In Progress': 'bg-purple-500/15 text-purple-400 border-purple-500/30',
    Sold: 'bg-green-500/15 text-green-400 border-green-500/30',
    Lost: 'bg-red-500/15 text-red-400 border-red-500/30',
  };
  return (
    <span className={`badge border ${colors[status] || 'bg-gray-500/15 text-gray-400 border-gray-500/30'}`}>
      {status}
    </span>
  );
}

export function CopyButton({ text, label = 'Copy' }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button onClick={copy} className="btn-secondary text-xs px-3 py-1.5">
      {copied ? '✓ Copied!' : label}
    </button>
  );
}
