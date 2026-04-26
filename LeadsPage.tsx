import { useState, useCallback } from 'react';
import { APIProvider, Map, AdvancedMarker, Pin } from '@vis.gl/react-google-maps';
import { Search, Zap, Globe, Filter, ChevronDown } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import type { Business } from '../lib/api';
import { searchBusinesses, findEasyWins, findNoWebsite, getBusinessDetails } from '../lib/api';
import BusinessPanel from '../components/panel/BusinessPanel';
import { LoadingSpinner } from '../components/shared/UI';

const GOOGLE_MAPS_KEY = import.meta.env.VITE_GOOGLE_MAPS_KEY || '';

const NICHES = [
  { value: 'custom', label: 'All Businesses' },
  { value: 'restaurants', label: 'Restaurants' },
  { value: 'contractors', label: 'Contractors' },
  { value: 'med_spas', label: 'Med Spas' },
  { value: 'real_estate', label: 'Real Estate' },
  { value: 'retail', label: 'Retail' },
];

export default function MapPage() {
  const [center, setCenter] = useState({ lat: 40.7128, lng: -74.006 });
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
  const [niche, setNiche] = useState('custom');
  const [keyword, setKeyword] = useState('');
  const [radius, setRadius] = useState(1500);
  const [filterMode, setFilterMode] = useState<'all' | 'easy_wins' | 'no_website'>('all');
  const [easyWinIds, setEasyWinIds] = useState<Set<string>>(new Set());
  const [panelOpen, setPanelOpen] = useState(false);

  const searchMutation = useMutation({
    mutationFn: () => {
      if (filterMode === 'easy_wins') return findEasyWins({ lat: center.lat, lng: center.lng, radius, niche });
      if (filterMode === 'no_website') return findNoWebsite({ lat: center.lat, lng: center.lng, radius, niche });
      return searchBusinesses({ lat: center.lat, lng: center.lng, radius, niche, keyword });
    },
    onSuccess: (res) => {
      const biz = res.data.businesses || [];
      setBusinesses(biz);
      if (filterMode === 'easy_wins') {
        setEasyWinIds(new Set(biz.map((b: Business) => b.place_id)));
      } else {
        setEasyWinIds(new Set());
      }
      toast.success(`Found ${biz.length} businesses`);
    },
    onError: () => toast.error('Search failed. Check your API keys.'),
  });

  const detailsMutation = useMutation({
    mutationFn: (placeId: string) => getBusinessDetails(placeId, niche),
    onSuccess: (res) => {
      setSelectedBusiness(res.data);
      setPanelOpen(true);
    },
    onError: () => toast.error('Failed to load business details'),
  });

  const handleMarkerClick = useCallback((biz: Business) => {
    detailsMutation.mutate(biz.place_id);
  }, [niche]);

  const getMarkerColor = (biz: Business) => {
    if (easyWinIds.has(biz.place_id)) return '#ff6b35';
    if (!biz.has_website) return '#ff4444';
    const score = biz.lead_score || 0;
    if (score >= 4) return '#ff6b35';
    if (score >= 2.5) return '#ffb800';
    return '#4a9eff';
  };

  return (
    <div className="flex h-full">
      {/* Map Area */}
      <div className="flex-1 relative">
        {/* Top Controls Bar */}
        <div className="absolute top-4 left-4 right-4 z-10 flex gap-2 flex-wrap">
          {/* Niche Selector */}
          <div className="relative">
            <select
              value={niche}
              onChange={(e) => setNiche(e.target.value)}
              className="select pl-3 pr-8 py-2 text-sm min-w-[140px] appearance-none"
            >
              {NICHES.map((n) => (
                <option key={n.value} value={n.value}>{n.label}</option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>

          {/* Keyword Search */}
          <div className="relative flex-1 min-w-[160px] max-w-xs">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Search keyword..."
              className="input pl-8 py-2 text-sm"
              onKeyDown={(e) => e.key === 'Enter' && searchMutation.mutate()}
            />
          </div>

          {/* Radius */}
          <select
            value={radius}
            onChange={(e) => setRadius(Number(e.target.value))}
            className="select py-2 text-sm w-28"
          >
            <option value={500}>500m</option>
            <option value={1000}>1 km</option>
            <option value={1500}>1.5 km</option>
            <option value={3000}>3 km</option>
            <option value={5000}>5 km</option>
          </select>

          {/* Search Button */}
          <button
            onClick={() => searchMutation.mutate()}
            disabled={searchMutation.isPending}
            className="btn-primary flex items-center gap-2 py-2"
          >
            {searchMutation.isPending ? <LoadingSpinner size={14} /> : <Search size={14} />}
            Search
          </button>

          {/* Easy Wins */}
          <button
            onClick={() => { setFilterMode('easy_wins'); searchMutation.mutate(); }}
            disabled={searchMutation.isPending}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-all border ${
              filterMode === 'easy_wins'
                ? 'bg-orange-500/20 text-orange-400 border-orange-500/50'
                : 'bg-dark-700 text-gray-300 border-dark-500 hover:border-orange-500/40 hover:text-orange-400'
            }`}
          >
            <Zap size={14} />
            Easy Wins
          </button>

          {/* No Website */}
          <button
            onClick={() => { setFilterMode('no_website'); searchMutation.mutate(); }}
            disabled={searchMutation.isPending}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-all border ${
              filterMode === 'no_website'
                ? 'bg-red-500/20 text-red-400 border-red-500/50'
                : 'bg-dark-700 text-gray-300 border-dark-500 hover:border-red-500/40 hover:text-red-400'
            }`}
          >
            <Globe size={14} />
            No Website
          </button>

          {filterMode !== 'all' && (
            <button
              onClick={() => { setFilterMode('all'); setEasyWinIds(new Set()); }}
              className="btn-secondary py-2 text-xs"
            >
              <Filter size={12} className="inline mr-1" />
              Clear Filter
            </button>
          )}
        </div>

        {/* Results Count */}
        {businesses.length > 0 && (
          <div className="absolute bottom-4 left-4 z-10">
            <div className="card px-3 py-2 text-xs text-gray-400 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              {businesses.length} businesses found
              {filterMode === 'easy_wins' && <span className="text-orange-400 font-medium">— Easy Wins only</span>}
              {filterMode === 'no_website' && <span className="text-red-400 font-medium">— No website</span>}
            </div>
          </div>
        )}

        {/* Legend */}
        <div className="absolute bottom-4 right-4 z-10 card px-3 py-2">
          <div className="text-xs text-gray-500 mb-1.5 font-medium">Legend</div>
          <div className="flex flex-col gap-1 text-xs">
            <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-orange-500" /><span className="text-gray-400">Hot / Easy Win</span></div>
            <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-yellow-500" /><span className="text-gray-400">Warm</span></div>
            <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-blue-500" /><span className="text-gray-400">Cold</span></div>
            <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-red-500" /><span className="text-gray-400">No Website</span></div>
          </div>
        </div>

        {/* Google Map */}
        <APIProvider apiKey={GOOGLE_MAPS_KEY}>
          <Map
            defaultCenter={center}
            defaultZoom={14}
            mapId="peepaw-map"
            onCenterChanged={(e) => setCenter(e.detail.center)}
            style={{ width: '100%', height: '100%' }}
            colorScheme="DARK"
          >
            {businesses.map((biz) => (
              <AdvancedMarker
                key={biz.place_id}
                position={{ lat: biz.lat || 0, lng: biz.lng || 0 }}
                onClick={() => handleMarkerClick(biz)}
                title={biz.name}
              >
                <Pin
                  background={getMarkerColor(biz)}
                  borderColor={easyWinIds.has(biz.place_id) ? '#ffffff' : 'transparent'}
                  glyphColor="#ffffff"
                  scale={easyWinIds.has(biz.place_id) ? 1.3 : 1.0}
                />
              </AdvancedMarker>
            ))}
          </Map>
        </APIProvider>

        {/* Loading overlay */}
        {detailsMutation.isPending && (
          <div className="absolute inset-0 bg-dark-950/50 flex items-center justify-center z-20">
            <div className="card px-6 py-4 flex items-center gap-3">
              <LoadingSpinner size={20} />
              <span className="text-sm text-gray-300">Analyzing business...</span>
            </div>
          </div>
        )}
      </div>

      {/* Business Analysis Panel */}
      {panelOpen && selectedBusiness && (
        <BusinessPanel
          business={selectedBusiness}
          niche={niche}
          onClose={() => { setPanelOpen(false); setSelectedBusiness(null); }}
        />
      )}
    </div>
  );
}
