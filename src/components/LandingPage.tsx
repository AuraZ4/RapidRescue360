import React from 'react';
import {
  AlertTriangle,
  ArrowRight,
  Droplets,
  HeartHandshake,
  MapPin,
  Radar,
  Search,
  ShieldCheck,
  Siren,
  Users,
} from 'lucide-react';
import { HeroScene3D } from './HeroScene3D';
import { EmergencyRequest, PageId, VolunteerProfile, BloodDonor } from '../types';

interface LandingPageProps {
  onNavigate: (page: PageId) => void;
  emergencies: EmergencyRequest[];
  volunteers: VolunteerProfile[];
  bloodDonors: BloodDonor[];
  onSelectEmergencyForTracking: (id: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onNavigate,
  emergencies,
  volunteers,
  bloodDonors,
  onSelectEmergencyForTracking,
}) => {
  const activeRequestsCount = emergencies.filter((e) => e.stage !== 'Case Resolved').length;
  const availableVolunteersCount = volunteers.filter((v) => v.availability).length + 142; // Demo baseline
  const registeredDonorsCount = bloodDonors.length + 380; // Demo baseline
  const completedMissionsCount =
    emergencies.filter((e) => e.stage === 'Case Resolved').length +
    volunteers.reduce((acc, v) => acc + v.missionsCompleted, 0);

  return (
    <div className="space-y-16 pb-16">
      {/* HERO SECTION: 2-Column Split with 3D Interactive Scene */}
      <section className="relative pt-6 lg:pt-10">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-stretch">
            {/* Left Column: Typography, Mission Statement & Primary CTAs */}
            <div className="lg:col-span-6 flex flex-col justify-between space-y-6 py-2">
              <div className="space-y-5">
                <div className="flex items-center gap-2 text-xs font-medium text-cyan-400 tracking-wide">
                  <span>RAPID RESCUE 360°</span>
                  <span aria-hidden="true">·</span>
                  <span className="text-slate-400">NEXT-GEN COMMUNITY DISPATCH PROTOTYPE</span>
                </div>

                <h1
                  className="text-4xl sm:text-5xl lg:text-[3.5rem] font-extrabold tracking-tight text-white leading-[1.08]"
                  style={{ textWrap: 'balance' }}
                >
                  Every Second{' '}
                  <span className="bg-gradient-to-r from-cyan-400 via-sky-400 to-orange-400 bg-clip-text text-transparent">
                    Matters.
                  </span>
                </h1>

                <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-xl">
                  One connected platform. Faster help. Stronger communities. Coordinate medical trauma response,
                  verified blood donors, missing-person searches, and trained neighborhood volunteers in one unified 3D
                  command network.
                </p>
              </div>

              {/* Primary & Secondary CTAs */}
              <div className="space-y-4 pt-2">
                <div className="flex flex-wrap items-center gap-4">
                  <button
                    type="button"
                    onClick={() => onNavigate('need-help')}
                    className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-rose-600 to-orange-500 hover:from-rose-500 hover:to-orange-400 text-white font-bold text-sm tracking-wide shadow-lg shadow-rose-600/25 transition-all flex items-center gap-2.5 whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <Siren className="w-5 h-5" />
                    NEED HELP NOW
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => onNavigate('volunteer')}
                    className="px-6 py-3.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-cyan-300 border border-cyan-500/40 font-semibold text-sm transition-all flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <HeartHandshake className="w-5 h-5 text-cyan-400" />
                    BECOME A VOLUNTEER
                  </button>
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400">
                  <span>Instant GPS & Manual Pin Dispatch</span>
                  <span aria-hidden="true">·</span>
                  <span>Live 6-Stage Rescue Timeline</span>
                  <span aria-hidden="true">·</span>
                  <span>Zero Unverified Claims</span>
                </div>
              </div>

              {/* Quick Live Emergency Preview Strip */}
              <div className="bg-slate-900/70 backdrop-blur-md border border-slate-800 rounded-xl p-4 space-y-2.5">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="font-semibold text-slate-200">Active Demo Dispatch Feed</span>
                  <button
                    type="button"
                    onClick={() => onNavigate('live-response')}
                    className="text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1 whitespace-nowrap shrink-0"
                  >
                    Open Live Tracker
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="divide-y divide-slate-800/80">
                  {emergencies.slice(0, 2).map((item) => (
                    <div
                      key={item.id}
                      className="py-2 first:pt-0 last:pb-0 flex items-center justify-between gap-4"
                    >
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-white truncate">{item.title}</p>
                        <p className="text-[11px] text-slate-400 truncate">
                          {item.id} · {item.sector} · Stage: {item.stage}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          onSelectEmergencyForTracking(item.id);
                          onNavigate('live-response');
                        }}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-cyan-300 transition-colors whitespace-nowrap shrink-0"
                      >
                        Track Unit
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: Interactive 3D Rescue City Scene */}
            <div className="lg:col-span-6 flex items-stretch">
              <HeroScene3D
                activeEmergencyCount={activeRequestsCount}
                availableVolunteerCount={availableVolunteersCount}
                onSelectEmergencyAction={() => onNavigate('live-response')}
              />
            </div>
          </div>

          {/* FULL-WIDTH 4-COLUMN DEMO KPI STRIP BELOW HERO */}
          <div className="mt-8 pt-6 border-t border-slate-800/80">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-slate-400">
                Platform Network Telemetry · All sample figures below are clearly labelled as{' '}
                <strong className="text-amber-300 font-medium">Demo Data</strong>
              </span>
              <span className="text-xs font-mono text-slate-500 tabular-nums">SYNC: LOCAL + DEMO STATE</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-slate-900/60 border border-slate-800/90 rounded-xl p-5 flex items-start justify-between">
                <div>
                  <p className="text-xs text-slate-400">Active Help Requests (Demo Data)</p>
                  <p className="text-3xl font-extrabold text-white font-mono tabular-nums mt-1">
                    {activeRequestsCount}
                  </p>
                  <p className="text-xs text-rose-400 mt-1">
                    {emergencies.filter((e) => e.priority === 'Critical' && e.stage !== 'Case Resolved').length}{' '}
                    critical priority · Live routing
                  </p>
                </div>
                <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
              </div>

              <div className="bg-slate-900/60 border border-slate-800/90 rounded-xl p-5 flex items-start justify-between">
                <div>
                  <p className="text-xs text-slate-400">Available Volunteers (Demo Data)</p>
                  <p className="text-3xl font-extrabold text-white font-mono tabular-nums mt-1">
                    {availableVolunteersCount}
                  </p>
                  <p className="text-xs text-cyan-400 mt-1">First Aid, Transport & Search ready</p>
                </div>
                <Users className="w-5 h-5 text-cyan-400 shrink-0" />
              </div>

              <div className="bg-slate-900/60 border border-slate-800/90 rounded-xl p-5 flex items-start justify-between">
                <div>
                  <p className="text-xs text-slate-400">Blood Network Donors (Demo Data)</p>
                  <p className="text-3xl font-extrabold text-white font-mono tabular-nums mt-1">
                    {registeredDonorsCount}
                  </p>
                  <p className="text-xs text-orange-400 mt-1">8 blood groups · 3 demo blood banks</p>
                </div>
                <Droplets className="w-5 h-5 text-orange-400 shrink-0" />
              </div>

              <div className="bg-slate-900/60 border border-slate-800/90 rounded-xl p-5 flex items-start justify-between">
                <div>
                  <p className="text-xs text-slate-400">Rescue Missions Logged (Demo Data)</p>
                  <p className="text-3xl font-extrabold text-white font-mono tabular-nums mt-1">
                    {completedMissionsCount}
                  </p>
                  <p className="text-xs text-emerald-400 mt-1">4.2 min avg simulated response</p>
                </div>
                <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CONNECTED 360° ECOSYSTEM MODULES */}
      <section className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <p className="text-xs font-medium text-cyan-400">UNIFIED EMERGENCY ARCHITECTURE</p>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mt-1">
              Six Specialized Modules. One Synchronized Command Loop.
            </h2>
          </div>
          <p className="text-xs text-slate-400 max-w-md">
            Select any module below to dispatch an alert, monitor active rescue routes, locate compatible blood donors,
            or coordinate field teams.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Module 1: Emergency Dispatch */}
          <div className="bg-slate-900/70 border border-slate-800 hover:border-rose-500/50 rounded-2xl p-6 flex flex-col justify-between transition-all">
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-rose-400">
                <span>01 · EMERGENCY DISPATCH</span>
                <Siren className="w-5 h-5 text-rose-400" />
              </div>
              <h3 className="text-lg font-bold text-white">Need Help Request Portal</h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                Submit medical, accident, flood relief, or rescue incidents with interactive map pin placement, victim
                counts, and priority triage.
              </p>
            </div>
            <div className="pt-5 mt-5 border-t border-slate-800/80 flex items-center justify-between">
              <span className="text-xs text-slate-400">6 Emergency Categories</span>
              <button
                type="button"
                onClick={() => onNavigate('need-help')}
                className="px-3.5 py-2 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 text-xs font-semibold transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
              >
                Request Help
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Module 2: Live Rescue Tracking */}
          <div className="bg-slate-900/70 border border-slate-800 hover:border-cyan-500/50 rounded-2xl p-6 flex flex-col justify-between transition-all">
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-cyan-400">
                <span>02 · LIVE RESPONSE TRACKING</span>
                <Radar className="w-5 h-5 text-cyan-400" />
              </div>
              <h3 className="text-lg font-bold text-white">Real-Time Tactical Radar & Timeline</h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                Follow the 6-stage rescue progression from Request Received to Case Resolved with animated vector route
                lines and calculated demo ETAs.
              </p>
            </div>
            <div className="pt-5 mt-5 border-t border-slate-800/80 flex items-center justify-between">
              <span className="text-xs text-slate-400">Animated Route Telemetry</span>
              <button
                type="button"
                onClick={() => onNavigate('live-response')}
                className="px-3.5 py-2 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 text-xs font-semibold transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
              >
                Track Missions
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Module 3: Blood Donation Network */}
          <div className="bg-slate-900/70 border border-slate-800 hover:border-orange-500/50 rounded-2xl p-6 flex flex-col justify-between transition-all">
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-orange-400">
                <span>03 · BLOOD DONATION NETWORK</span>
                <Droplets className="w-5 h-5 text-orange-400" />
              </div>
              <h3 className="text-lg font-bold text-white">Donor & Blood Bank Finder</h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                Filter all 8 blood groups by distance and availability. View clearly labelled community donors and
                regional blood bank inventory records.
              </p>
            </div>
            <div className="pt-5 mt-5 border-t border-slate-800/80 flex items-center justify-between">
              <span className="text-xs text-slate-400">A+, A-, B+, B-, AB+, AB-, O+, O-</span>
              <button
                type="button"
                onClick={() => onNavigate('blood-network')}
                className="px-3.5 py-2 rounded-lg bg-orange-500/15 hover:bg-orange-500/25 text-orange-300 text-xs font-semibold transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
              >
                Open Blood Hub
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Module 4: Missing Persons Registry */}
          <div className="bg-slate-900/70 border border-slate-800 hover:border-amber-500/50 rounded-2xl p-6 flex flex-col justify-between transition-all">
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-amber-400">
                <span>04 · MISSING PERSONS</span>
                <Search className="w-5 h-5 text-amber-400" />
              </div>
              <h3 className="text-lg font-bold text-white">Privacy-First Search Registry</h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                Report and locate missing individuals with last-seen sector pins, clothing descriptions, and protected
                coordinator-routed sighting reports.
              </p>
            </div>
            <div className="pt-5 mt-5 border-t border-slate-800/80 flex items-center justify-between">
              <span className="text-xs text-slate-400">Protected Identity Workflow</span>
              <button
                type="button"
                onClick={() => onNavigate('missing-persons')}
                className="px-3.5 py-2 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 text-xs font-semibold transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
              >
                View Registry
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Module 5: Volunteer Registration */}
          <div className="bg-slate-900/70 border border-slate-800 hover:border-emerald-500/50 rounded-2xl p-6 flex flex-col justify-between transition-all">
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-emerald-400">
                <span>05 · VOLUNTEER ONBOARDING</span>
                <HeartHandshake className="w-5 h-5 text-emerald-400" />
              </div>
              <h3 className="text-lg font-bold text-white">Responder Credential & Skills Hub</h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                Register emergency skills including First Aid, Transport, Search Support, and Medical Support with an
                instant live responder badge preview.
              </p>
            </div>
            <div className="pt-5 mt-5 border-t border-slate-800/80 flex items-center justify-between">
              <span className="text-xs text-slate-400">Live Badge Preview</span>
              <button
                type="button"
                onClick={() => onNavigate('volunteer')}
                className="px-3.5 py-2 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 text-xs font-semibold transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
              >
                Join Network
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Module 6: Command Dashboard */}
          <div className="bg-slate-900/70 border border-slate-800 hover:border-violet-500/50 rounded-2xl p-6 flex flex-col justify-between transition-all">
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-violet-400">
                <span>06 · COMMAND CENTRE</span>
                <MapPin className="w-5 h-5 text-violet-400" />
              </div>
              <h3 className="text-lg font-bold text-white">Operations Command Dashboard</h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                Coordinator workspace with multi-layer incident map, severity filters, stage progression controls, and
                sector response analytics.
              </p>
            </div>
            <div className="pt-5 mt-5 border-t border-slate-800/80 flex items-center justify-between">
              <span className="text-xs text-slate-400">Coordinator & Admin View</span>
              <button
                type="button"
                onClick={() => onNavigate('command')}
                className="px-3.5 py-2 rounded-lg bg-violet-500/15 hover:bg-violet-500/25 text-violet-300 text-xs font-semibold transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
              >
                Open Command
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
