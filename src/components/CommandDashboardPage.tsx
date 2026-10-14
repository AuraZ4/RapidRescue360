import React, { useState } from 'react';
import {
  Activity,
  BarChart3,
  Filter,
  MapPin,
  Radar,
  ShieldCheck,
} from 'lucide-react';
import {
  ActivityFeedItem,
  BloodUrgentRequest,
  EmergencyCategory,
  EmergencyRequest,
  MissingPersonReport,
  PageId,
  PriorityLevel,
  RESCUE_STAGES,
  RescueStage,
  VolunteerProfile,
} from '../types';

interface CommandDashboardPageProps {
  emergencies: EmergencyRequest[];
  volunteers: VolunteerProfile[];
  bloodRequests: BloodUrgentRequest[];
  missingPersons: MissingPersonReport[];
  activityFeed: ActivityFeedItem[];
  onAdvanceStage: (id: string, nextStage: RescueStage) => void;
  onToggleVolunteerAvailability: (id: string) => void;
  onSelectEmergencyForTracking: (id: string) => void;
  onNavigate: (page: PageId) => void;
}

export const CommandDashboardPage: React.FC<CommandDashboardPageProps> = ({
  emergencies,
  volunteers,
  bloodRequests,
  missingPersons,
  activityFeed,
  onAdvanceStage,
  onToggleVolunteerAvailability,
  onSelectEmergencyForTracking,
  onNavigate,
}) => {
  const [categoryFilter, setCategoryFilter] = useState<EmergencyCategory | 'ALL'>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<PriorityLevel | 'ALL'>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'RESOLVED'>('ALL');
  const [selectedMapPinId, setSelectedMapPinId] = useState<string>(emergencies[0]?.id || '');

  const filteredEmergencies = emergencies.filter((item) => {
    if (categoryFilter !== 'ALL' && item.category !== categoryFilter) return false;
    if (priorityFilter !== 'ALL' && item.priority !== priorityFilter) return false;
    if (statusFilter === 'ACTIVE' && item.stage === 'Case Resolved') return false;
    if (statusFilter === 'RESOLVED' && item.stage !== 'Case Resolved') return false;
    return true;
  });

  const activeCount = emergencies.filter((e) => e.stage !== 'Case Resolved').length;
  const resolvedCount = emergencies.filter((e) => e.stage === 'Case Resolved').length;
  const availableVolunteersCount = volunteers.filter((v) => v.availability).length;

  // Demo Analytics Data for Charts
  const categoryBreakdown: { label: EmergencyCategory; count: number; color: string }[] = [
    {
      label: 'Medical Emergency',
      count: emergencies.filter((e) => e.category === 'Medical Emergency').length + 4,
      color: 'bg-rose-500',
    },
    {
      label: 'Accident / Rescue',
      count: emergencies.filter((e) => e.category === 'Accident / Rescue').length + 3,
      color: 'bg-cyan-400',
    },
    {
      label: 'Blood Donation',
      count: emergencies.filter((e) => e.category === 'Blood Donation').length + 3,
      color: 'bg-orange-400',
    },
    {
      label: 'Disaster Relief',
      count: emergencies.filter((e) => e.category === 'Disaster Relief').length + 2,
      color: 'bg-violet-400',
    },
    {
      label: 'Missing Person',
      count: emergencies.filter((e) => e.category === 'Missing Person').length + 2,
      color: 'bg-amber-400',
    },
  ];

  const sectorResponseTimes = [
    { sector: 'Central District', avgMins: 3.4 },
    { sector: 'Transit Core', avgMins: 3.9 },
    { sector: 'Sector 4 North', avgMins: 4.2 },
    { sector: 'Medical Hub East', avgMins: 2.8 },
    { sector: 'South Basin', avgMins: 5.6 },
  ];

  return (
    <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      {/* Command Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div>
          <p className="text-xs font-medium text-violet-400">
            EMERGENCY OPERATIONS COMMAND CENTRE · COORDINATOR & ADMIN CONSOLE
          </p>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
            City-Wide Multi-Agency Command Dashboard
          </h1>
        </div>

        {/* High-Contrast Summary Metrics Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono tabular-nums">
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl px-3.5 py-2">
            <span className="text-[10px] text-slate-400 block">ACTIVE INCIDENTS</span>
            <span className="text-lg font-extrabold text-rose-400">{activeCount}</span>
          </div>
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl px-3.5 py-2">
            <span className="text-[10px] text-slate-400 block">RESOLVED CASES</span>
            <span className="text-lg font-extrabold text-emerald-400">{resolvedCount}</span>
          </div>
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl px-3.5 py-2">
            <span className="text-[10px] text-slate-400 block">READY VOLUNTEERS</span>
            <span className="text-lg font-extrabold text-cyan-400">
              {availableVolunteersCount}/{volunteers.length}
            </span>
          </div>
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl px-3.5 py-2">
            <span className="text-[10px] text-slate-400 block">BLOOD & MISSING</span>
            <span className="text-lg font-extrabold text-amber-400">
              {bloodRequests.length + missingPersons.length}
            </span>
          </div>
        </div>
      </div>

      {/* Top Row: Interactive City Command Map (7 Cols) + Recent Activity Feed & Legend (5 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Interactive Command Map */}
        <div className="lg:col-span-7 bg-slate-900/75 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Radar className="w-4 h-4 text-cyan-400" />
                Interactive Sector Command Map (Demo Telemetry)
              </h2>
              <p className="text-xs text-slate-400">
                Click any marker to inspect incident status or jump to live route tracking
              </p>
            </div>
            <span className="text-xs font-mono text-slate-400 tabular-nums">
              Showing {filteredEmergencies.length} Incidents
            </span>
          </div>

          <div className="relative w-full h-[340px] rounded-xl overflow-hidden bg-[#070C18] border border-slate-800">
            <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              <defs>
                <pattern id="cmdGrid" width="10" height="10" patternUnits="userSpaceOnUse">
                  <path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(139, 92, 246, 0.08)" strokeWidth="0.4" />
                </pattern>
              </defs>
              <rect width="100" height="100" fill="url(#cmdGrid)" />
              <path d="M 0 38 L 100 44" stroke="rgba(30, 41, 59, 0.9)" strokeWidth="2.2" />
              <path d="M 48 0 L 54 100" stroke="rgba(30, 41, 59, 0.9)" strokeWidth="2.2" />
              <circle
                cx="50"
                cy="50"
                r="28"
                fill="none"
                stroke="rgba(6, 182, 212, 0.14)"
                strokeWidth="0.6"
                strokeDasharray="2 2"
              />
            </svg>

            {/* Emergency Request Markers */}
            {filteredEmergencies.map((em) => {
              const isSelected = em.id === selectedMapPinId;
              const isResolved = em.stage === 'Case Resolved';
              return (
                <button
                  key={em.id}
                  type="button"
                  onClick={() => setSelectedMapPinId(em.id)}
                  style={{ left: `${em.coords.x}%`, top: `${em.coords.y}%` }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 group cursor-pointer"
                >
                  <div className="flex flex-col items-center">
                    <span
                      className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold whitespace-nowrap mb-0.5 transition-all ${
                        isSelected
                          ? 'bg-cyan-400 text-slate-950 scale-105'
                          : isResolved
                          ? 'bg-emerald-950/90 text-emerald-300 border border-emerald-500/40'
                          : 'bg-rose-950/90 text-rose-200 border border-rose-500/50'
                      }`}
                    >
                      {em.id}
                    </span>
                    <MapPin
                      className={`w-5 h-5 ${
                        isResolved
                          ? 'text-emerald-400'
                          : em.priority === 'Critical'
                          ? 'text-rose-500'
                          : 'text-orange-400'
                      }`}
                    />
                  </div>
                </button>
              );
            })}

            {/* Volunteer Markers */}
            {volunteers
              .filter((v) => v.availability)
              .map((vol) => (
                <div
                  key={vol.id}
                  style={{ left: `${vol.coords.x}%`, top: `${vol.coords.y}%` }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                >
                  <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 ring-4 ring-cyan-400/20" />
                </div>
              ))}
          </div>

          {/* Clear Visual Legend & Selected Map Incident Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1 text-xs">
            <div className="flex flex-wrap items-center gap-3 text-slate-400">
              <span className="text-rose-400 font-medium">Red Pin: Critical Incident</span>
              <span>·</span>
              <span className="text-orange-400 font-medium">Orange Pin: High/Moderate</span>
              <span>·</span>
              <span className="text-emerald-400 font-medium">Green Pin: Resolved</span>
              <span>·</span>
              <span className="text-cyan-400 font-medium">Cyan Node: Ready Volunteer</span>
            </div>
            {selectedMapPinId && (
              <button
                type="button"
                onClick={() => {
                  onSelectEmergencyForTracking(selectedMapPinId);
                  onNavigate('live-response');
                }}
                className="text-cyan-400 hover:text-cyan-300 font-semibold cursor-pointer"
              >
                Open {selectedMapPinId} in Live Tracker →
              </button>
            )}
          </div>
        </div>

        {/* Recent Activity Feed & Multi-Module Summary (5 Cols) */}
        <div className="lg:col-span-5 bg-slate-900/75 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-400" />
                Recent Operations Activity Feed
              </h2>
              <span className="text-xs font-mono text-slate-400">LIVE DEMO LOG</span>
            </div>

            <div className="space-y-2.5 max-h-[260px] overflow-y-auto pr-1">
              {activityFeed.map((act) => (
                <div
                  key={act.id}
                  className="bg-slate-950/75 border border-slate-800/90 rounded-xl p-3 space-y-1 text-xs"
                >
                  <div className="flex items-center justify-between text-slate-400 font-mono text-[11px]">
                    <span className="text-cyan-400">{act.sector}</span>
                    <span>{act.timestamp}</span>
                  </div>
                  <p className="text-slate-200 leading-relaxed">{act.message}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Module Links for Blood & Missing Cases */}
          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={() => onNavigate('blood-network')}
              className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-orange-500/50 text-left transition-colors cursor-pointer"
            >
              <span className="text-[11px] text-orange-400 font-semibold block">BLOOD REQUESTS</span>
              <span className="text-sm font-bold text-white font-mono tabular-nums">
                {bloodRequests.length} Active Alert(s)
              </span>
            </button>
            <button
              type="button"
              onClick={() => onNavigate('missing-persons')}
              className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-amber-500/50 text-left transition-colors cursor-pointer"
            >
              <span className="text-[11px] text-amber-400 font-semibold block">MISSING PERSONS</span>
              <span className="text-sm font-bold text-white font-mono tabular-nums">
                {missingPersons.length} Open Case(s)
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Filterable Emergency Request Management Cards */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900/65 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-white">
            <Filter className="w-4 h-4 text-cyan-400" />
            <span>Filter Incident Queue:</span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <select
              aria-label="Filter by emergency category"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value as EmergencyCategory | 'ALL')}
              className="rounded-lg bg-slate-950 border border-slate-800 px-3 py-1.5 text-xs text-white"
            >
              <option value="ALL">All Categories</option>
              <option value="Medical Emergency">Medical Emergency</option>
              <option value="Accident / Rescue">Accident / Rescue</option>
              <option value="Blood Donation">Blood Donation</option>
              <option value="Disaster Relief">Disaster Relief</option>
              <option value="Missing Person">Missing Person</option>
              <option value="Other Emergency">Other Emergency</option>
            </select>

            <select
              aria-label="Filter by severity priority"
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value as PriorityLevel | 'ALL')}
              className="rounded-lg bg-slate-950 border border-slate-800 px-3 py-1.5 text-xs text-white"
            >
              <option value="ALL">All Priorities</option>
              <option value="Critical">Critical Priority</option>
              <option value="High">High Priority</option>
              <option value="Moderate">Moderate Priority</option>
              <option value="Standard">Standard Priority</option>
            </select>

            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
              <button
                type="button"
                onClick={() => setStatusFilter('ALL')}
                className={`px-2.5 py-1 rounded cursor-pointer ${
                  statusFilter === 'ALL' ? 'bg-slate-800 text-white font-semibold' : 'text-slate-400'
                }`}
              >
                All ({emergencies.length})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('ACTIVE')}
                className={`px-2.5 py-1 rounded cursor-pointer ${
                  statusFilter === 'ACTIVE' ? 'bg-rose-500/20 text-rose-300 font-semibold' : 'text-slate-400'
                }`}
              >
                Active ({activeCount})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('RESOLVED')}
                className={`px-2.5 py-1 rounded cursor-pointer ${
                  statusFilter === 'RESOLVED' ? 'bg-emerald-500/20 text-emerald-300 font-semibold' : 'text-slate-400'
                }`}
              >
                Resolved ({resolvedCount})
              </button>
            </div>
          </div>
        </div>

        {/* Emergency Request Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredEmergencies.map((req) => {
            const stageIdx = RESCUE_STAGES.indexOf(req.stage);
            const progressPct = Math.round(((stageIdx + 1) / RESCUE_STAGES.length) * 100);
            return (
              <div
                key={req.id}
                className="bg-slate-900/75 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-cyan-400 font-bold">{req.id}</span>
                    <span
                      className={
                        req.priority === 'Critical'
                          ? 'text-rose-400 font-bold'
                          : req.priority === 'High'
                          ? 'text-orange-400 font-semibold'
                          : 'text-slate-400'
                      }
                    >
                      {req.priority} · {req.category}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white leading-snug">{req.title}</h3>
                  <p className="text-xs text-slate-400 line-clamp-2">{req.description}</p>
                  <p className="text-xs text-slate-300">
                    {req.sector} · Victims: <span className="font-mono">{req.victimsCount}</span> · Volunteers:{' '}
                    <span className="font-mono">
                      {req.volunteersAssigned}/{req.volunteersNeeded}
                    </span>
                  </p>

                  {/* Response Progress Bar */}
                  <div className="pt-1 space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-300 font-medium">Stage: {req.stage}</span>
                      <span className="font-mono text-cyan-400 tabular-nums">{progressPct}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${
                          req.stage === 'Case Resolved' ? 'bg-emerald-400' : 'bg-cyan-400'
                        }`}
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Coordinator Action Controls */}
                <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                  <select
                    aria-label={`Update rescue stage for ${req.id}`}
                    value={req.stage}
                    onChange={(e) => onAdvanceStage(req.id, e.target.value as RescueStage)}
                    className="rounded-lg bg-slate-950 border border-slate-700 px-2.5 py-1.5 text-xs text-white flex-1"
                  >
                    {RESCUE_STAGES.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>

                  <button
                    type="button"
                    onClick={() => {
                      onSelectEmergencyForTracking(req.id);
                      onNavigate('live-response');
                    }}
                    className="px-3 py-1.5 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 text-xs font-semibold whitespace-nowrap cursor-pointer"
                  >
                    Track Route
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Row: Analytical Charts (Demo Response Times & Request Categories) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Request Categories Distribution */}
        <div className="bg-slate-900/75 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-cyan-400" />
                Incidents by Emergency Category (Demo Data)
              </h3>
              <p className="text-xs text-slate-400">Cumulative distribution including active session submissions</p>
            </div>
            <span className="text-xs font-mono text-amber-300">DEMO TELEMETRY</span>
          </div>

          <div className="space-y-3 pt-2">
            {categoryBreakdown.map((item) => {
              const maxVal = Math.max(...categoryBreakdown.map((c) => c.count), 1);
              const widthPct = Math.min(100, Math.round((item.count / maxVal) * 100));
              return (
                <div key={item.label} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-200 font-medium">{item.label}</span>
                    <span className="font-mono text-slate-300 tabular-nums">{item.count} requests</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800/80">
                    <div className={`h-full rounded-full ${item.color}`} style={{ width: `${widthPct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Chart 2: Average Response Time by City Sector */}
        <div className="bg-slate-900/75 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Simulated Response Time by Sector (Demo Data)
              </h3>
              <p className="text-xs text-slate-400">Average minutes from alert dispatch to first responder arrival</p>
            </div>
            <span className="text-xs font-mono text-cyan-400 tabular-nums">Target: &lt; 6.0m</span>
          </div>

          <div className="space-y-3 pt-2">
            {sectorResponseTimes.map((item) => {
              const maxTime = Math.max(...sectorResponseTimes.map((s) => s.avgMins), 6);
              const widthPct = Math.min(100, Math.round((item.avgMins / maxTime) * 100));
              return (
                <div key={item.sector} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-200 font-medium">{item.sector}</span>
                    <span className="font-mono text-cyan-300 tabular-nums">{item.avgMins} mins</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800/80">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-emerald-400"
                      style={{ width: `${widthPct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
