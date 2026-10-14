/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import {
  Droplets,
  HeartHandshake,
  Info,
  LayoutDashboard,
  LogIn,
  Menu,
  Radar,
  RotateCcw,
  Search,
  Siren,
  UserCheck,
  X,
} from 'lucide-react';
import {
  ActivityFeedItem,
  BloodBank,
  BloodDonor,
  BloodUrgentRequest,
  EmergencyRequest,
  MissingPersonReport,
  MissingStatus,
  PageId,
  RescueStage,
  UserRole,
  UserSession,
  VolunteerProfile,
} from './types';
import {
  INITIAL_ACTIVITY_FEED,
  INITIAL_BLOOD_BANKS,
  INITIAL_BLOOD_DONORS,
  INITIAL_EMERGENCY_REQUESTS,
  INITIAL_MISSING_PERSONS,
  INITIAL_URGENT_BLOOD_REQUESTS,
  INITIAL_VOLUNTEERS,
} from './data/initialData';
import { LandingPage } from './components/LandingPage';
import { NeedHelpPage } from './components/NeedHelpPage';
import { LiveTrackingPage } from './components/LiveTrackingPage';
import { BloodNetworkPage } from './components/BloodNetworkPage';
import { MissingPersonsPage } from './components/MissingPersonsPage';
import { VolunteerPage } from './components/VolunteerPage';
import { CommandDashboardPage } from './components/CommandDashboardPage';
import { AboutPage } from './components/AboutPage';
import { AuthModal } from './components/AuthModal';

const STORAGE_KEY = 'rapid_rescue_360_state_v1';

export default function App() {
  const [currentPage, setCurrentPage] = useState<PageId>('home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'signup'>('login');

  // Persistent Demo State Storage Helper
  const [session, setSession] = useState<UserSession>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.session) return parsed.session;
      }
    } catch {}
    return {
      name: 'Aarav Krishnan',
      email: 'coordinator@rapidrescue360.org',
      role: 'Coordinator',
      isAuthenticated: false,
    };
  });

  const [emergencies, setEmergencies] = useState<EmergencyRequest[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed.emergencies) && parsed.emergencies.length > 0) {
          return parsed.emergencies;
        }
      }
    } catch {
      // ignore storage errors
    }
    return INITIAL_EMERGENCY_REQUESTS;
  });

  const [selectedEmergencyId, setSelectedEmergencyId] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.selectedEmergencyId) return parsed.selectedEmergencyId;
      }
    } catch {}
    return INITIAL_EMERGENCY_REQUESTS[0].id;
  });

  const [bloodDonors] = useState<BloodDonor[]>(INITIAL_BLOOD_DONORS);
  const [bloodBanks] = useState<BloodBank[]>(INITIAL_BLOOD_BANKS);

  const [urgentBloodRequests, setUrgentBloodRequests] = useState<BloodUrgentRequest[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed.urgentBloodRequests) && parsed.urgentBloodRequests.length > 0) {
          return parsed.urgentBloodRequests;
        }
      }
    } catch {}
    return INITIAL_URGENT_BLOOD_REQUESTS;
  });

  const [missingPersons, setMissingPersons] = useState<MissingPersonReport[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed.missingPersons) && parsed.missingPersons.length > 0) {
          return parsed.missingPersons;
        }
      }
    } catch {}
    return INITIAL_MISSING_PERSONS;
  });

  const [volunteers, setVolunteers] = useState<VolunteerProfile[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed.volunteers) && parsed.volunteers.length > 0) {
          return parsed.volunteers;
        }
      }
    } catch {}
    return INITIAL_VOLUNTEERS;
  });

  const [activityFeed, setActivityFeed] = useState<ActivityFeedItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed.activityFeed) && parsed.activityFeed.length > 0) {
          return parsed.activityFeed;
        }
      }
    } catch {}
    return INITIAL_ACTIVITY_FEED;
  });

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          emergencies,
          urgentBloodRequests,
          missingPersons,
          volunteers,
          activityFeed,
          session,
          selectedEmergencyId,
        })
      );
    } catch {
      // ignore storage quota errors
    }
  }, [emergencies, urgentBloodRequests, missingPersons, volunteers, activityFeed, session, selectedEmergencyId]);

  const handleNavigate = (page: PageId) => {
    setCurrentPage(page);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handlers for cross-module updates
  const handleAddEmergency = (newRequest: EmergencyRequest) => {
    setEmergencies((prev) => [newRequest, ...prev]);
    setSelectedEmergencyId(newRequest.id);
    setActivityFeed((prev) => [
      {
        id: `ACT-${Date.now()}`,
        timestamp: 'Just now',
        type: 'emergency',
        message: `New ${newRequest.priority} ${newRequest.category} submitted (${newRequest.id}): ${newRequest.title}`,
        sector: newRequest.sector,
      },
      ...prev,
    ]);
  };

  const handleAdvanceEmergencyStage = (id: string, nextStage: RescueStage) => {
    let affectedSector = 'Central District';
    setEmergencies((prev) => {
      return prev.map((item) => {
        if (item.id === id) {
          affectedSector = item.sector;
          return { ...item, stage: nextStage };
        }
        return item;
      });
    });

    setActivityFeed((prev) => [
      {
        id: `ACT-${Date.now()}`,
        timestamp: 'Just now',
        type: 'status',
        message: `Request ${id} updated to stage "${nextStage}"`,
        sector: affectedSector,
      },
      ...prev,
    ]);
  };

  const handleAddUrgentBloodRequest = (req: BloodUrgentRequest) => {
    setUrgentBloodRequests((prev) => [req, ...prev]);
    setActivityFeed((prev) => [
      {
        id: `ACT-${Date.now()}`,
        timestamp: 'Just now',
        type: 'blood',
        message: `Urgent Blood Alert (${req.id}): ${req.unitsRequired}u of ${req.bloodGroup} needed at ${req.hospitalName}`,
        sector: req.sector,
      },
      ...prev,
    ]);
  };

  const handleAddMissingPerson = (report: MissingPersonReport) => {
    setMissingPersons((prev) => [report, ...prev]);
    setActivityFeed((prev) => [
      {
        id: `ACT-${Date.now()}`,
        timestamp: 'Just now',
        type: 'missing',
        message: `Missing Person Alert logged (${report.id}): ${report.identifierName}, last seen at ${report.lastSeenLocation}`,
        sector: report.sector,
      },
      ...prev,
    ]);
  };

  const handleUpdateMissingStatus = (id: string, status: MissingStatus) => {
    setMissingPersons((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status } : r))
    );
  };

  const handleIncrementMissingSighting = (id: string, note: string) => {
    setMissingPersons((prev) =>
      prev.map((r) => (r.id === id ? { ...r, sightingsCount: r.sightingsCount + 1 } : r))
    );
    setActivityFeed((prev) => [
      {
        id: `ACT-${Date.now()}`,
        timestamp: 'Just now',
        type: 'missing',
        message: `New community sighting lead submitted for Case ${id}: "${note.slice(0, 60)}"`,
        sector: 'Transit Core',
      },
      ...prev,
    ]);
  };

  const handleRegisterVolunteer = (vol: VolunteerProfile) => {
    setVolunteers((prev) => [vol, ...prev]);
    setActivityFeed((prev) => [
      {
        id: `ACT-${Date.now()}`,
        timestamp: 'Just now',
        type: 'volunteer',
        message: `New Volunteer Responder registered (${vol.id}): ${vol.fullName} — Skills: ${vol.skills.join(', ')}`,
        sector: vol.preferredArea,
      },
      ...prev,
    ]);
  };

  const handleToggleVolunteerAvailability = (id: string) => {
    setVolunteers((prev) =>
      prev.map((v) => (v.id === id ? { ...v, availability: !v.availability } : v))
    );
  };

  const handleResetDemoData = () => {
    localStorage.removeItem(STORAGE_KEY);
    setEmergencies(INITIAL_EMERGENCY_REQUESTS);
    setUrgentBloodRequests(INITIAL_URGENT_BLOOD_REQUESTS);
    setMissingPersons(INITIAL_MISSING_PERSONS);
    setVolunteers(INITIAL_VOLUNTEERS);
    setActivityFeed(INITIAL_ACTIVITY_FEED);
    setSelectedEmergencyId(INITIAL_EMERGENCY_REQUESTS[0].id);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#070B14] text-slate-100">
      {/* TOP BAR CONTRACT: Strictly 3 Zones separated by gap-8 */}
      <header className="sticky top-0 z-40 bg-[#070B14]/90 backdrop-blur-md border-b border-slate-800/80">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
          {/* Zone 1: Single text element wordmark */}
          <button
            type="button"
            onClick={() => handleNavigate('home')}
            className="text-lg font-extrabold tracking-tight text-white whitespace-nowrap shrink-0 cursor-pointer font-display"
          >
            Rapid Rescue 360°
          </button>

          {/* Zone 2: 5 concise single-line text navigation links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
            <button
              type="button"
              onClick={() => handleNavigate('home')}
              className={`hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                currentPage === 'home' ? 'text-cyan-400 underline underline-offset-8' : ''
              }`}
            >
              Home
            </button>
            <button
              type="button"
              onClick={() => handleNavigate('live-response')}
              className={`hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                currentPage === 'live-response' ? 'text-cyan-400 underline underline-offset-8' : ''
              }`}
            >
              Live Response
            </button>
            <button
              type="button"
              onClick={() => handleNavigate('blood-network')}
              className={`hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                currentPage === 'blood-network' ? 'text-cyan-400 underline underline-offset-8' : ''
              }`}
            >
              Blood Network
            </button>
            <button
              type="button"
              onClick={() => handleNavigate('missing-persons')}
              className={`hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                currentPage === 'missing-persons' ? 'text-cyan-400 underline underline-offset-8' : ''
              }`}
            >
              Missing Persons
            </button>
            <button
              type="button"
              onClick={() => handleNavigate('about')}
              className={`hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                currentPage === 'about' ? 'text-cyan-400 underline underline-offset-8' : ''
              }`}
            >
              About
            </button>
          </nav>

          {/* Zone 3: 1 primary action on desktop + mobile menu toggle */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => handleNavigate('need-help')}
              className="px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-rose-600 to-orange-500 hover:from-rose-500 hover:to-orange-400 rounded-lg transition-all whitespace-nowrap shrink-0 cursor-pointer"
            >
              NEED HELP NOW
            </button>

            <button
              type="button"
              onClick={() => setMobileMenuOpen((o) => !o)}
              className="md:hidden p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300"
              aria-label="Toggle mobile navigation"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-slate-950 border-b border-slate-800 px-4 py-4 space-y-2">
            {(
              [
                { id: 'home', label: 'Home (3D Overview)' },
                { id: 'need-help', label: 'Need Help Now' },
                { id: 'live-response', label: 'Live Rescue Tracking' },
                { id: 'blood-network', label: 'Blood Donation Network' },
                { id: 'missing-persons', label: 'Missing Persons Registry' },
                { id: 'volunteer', label: 'Become a Volunteer' },
                { id: 'command', label: 'Command Dashboard' },
                { id: 'about', label: 'About Platform' },
              ] as const
            ).map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNavigate(item.id)}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold ${
                  currentPage === item.id ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-300'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        )}
      </header>

      {/* SECONDARY WORKSPACE MODULE & ROLE SWITCHER TOOLBAR BELOW THE HEADER */}
      <div className="bg-slate-950/90 border-b border-slate-800/80">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex flex-wrap items-center justify-between gap-3">
          {/* Direct 7-Module Quick Switcher */}
          <div className="flex items-center gap-1.5 overflow-x-auto max-w-full py-0.5">
            <button
              type="button"
              onClick={() => handleNavigate('need-help')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                currentPage === 'need-help'
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Siren className="w-3.5 h-3.5 text-rose-400" />
              Request Help
            </button>

            <button
              type="button"
              onClick={() => handleNavigate('live-response')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                currentPage === 'live-response'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Radar className="w-3.5 h-3.5 text-cyan-400" />
              Live Tracking ({emergencies.filter((e) => e.stage !== 'Case Resolved').length})
            </button>

            <button
              type="button"
              onClick={() => handleNavigate('blood-network')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                currentPage === 'blood-network'
                  ? 'bg-orange-500/20 text-orange-300 border border-orange-500/40'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Droplets className="w-3.5 h-3.5 text-orange-400" />
              Blood Network
            </button>

            <button
              type="button"
              onClick={() => handleNavigate('missing-persons')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                currentPage === 'missing-persons'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Search className="w-3.5 h-3.5 text-amber-400" />
              Missing Persons
            </button>

            <button
              type="button"
              onClick={() => handleNavigate('volunteer')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                currentPage === 'volunteer'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <HeartHandshake className="w-3.5 h-3.5 text-emerald-400" />
              Volunteer Registration
            </button>

            <button
              type="button"
              onClick={() => handleNavigate('command')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                currentPage === 'command'
                  ? 'bg-violet-500/20 text-violet-300 border border-violet-500/40'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5 text-violet-400" />
              Command Dashboard
            </button>
          </div>

          {/* Role View Switcher & Login / Sign Up Triggers */}
          <div className="flex items-center gap-2.5 text-xs">
            <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800">
              {(['Citizen', 'Volunteer', 'Coordinator'] as UserRole[]).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setSession((prev) => ({ ...prev, role: r }))}
                  className={`px-2 py-1 rounded text-[11px] font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    session.role === r
                      ? 'bg-cyan-500 text-slate-950 font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {r} View
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => {
                setAuthModalMode('login');
                setAuthModalOpen(true);
              }}
              className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 font-medium flex items-center gap-1 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5 text-cyan-400" />
              {session.isAuthenticated ? session.name.split(' ')[0] : 'Login'}
            </button>

            <button
              type="button"
              onClick={() => {
                setAuthModalMode('signup');
                setAuthModalOpen(true);
              }}
              className="px-2.5 py-1.5 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/40 text-cyan-300 font-semibold flex items-center gap-1 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <UserCheck className="w-3.5 h-3.5" />
              Sign Up
            </button>
          </div>
        </div>
      </div>

      {/* MAIN VIEWPORT CONTENT */}
      <main className="flex-1">
        {currentPage === 'home' && (
          <LandingPage
            onNavigate={handleNavigate}
            emergencies={emergencies}
            volunteers={volunteers}
            bloodDonors={bloodDonors}
            onSelectEmergencyForTracking={(id) => setSelectedEmergencyId(id)}
          />
        )}

        {currentPage === 'need-help' && (
          <NeedHelpPage
            onSubmitEmergency={handleAddEmergency}
            onNavigate={handleNavigate}
            onSelectEmergencyForTracking={(id) => setSelectedEmergencyId(id)}
          />
        )}

        {currentPage === 'live-response' && (
          <LiveTrackingPage
            emergencies={emergencies}
            selectedEmergencyId={selectedEmergencyId}
            onSelectEmergency={(id) => setSelectedEmergencyId(id)}
            onAdvanceStage={handleAdvanceEmergencyStage}
            volunteers={volunteers}
            bloodBanks={bloodBanks}
            onNavigate={handleNavigate}
          />
        )}

        {currentPage === 'blood-network' && (
          <BloodNetworkPage
            donors={bloodDonors}
            bloodBanks={bloodBanks}
            urgentRequests={urgentBloodRequests}
            onAddUrgentBloodRequest={handleAddUrgentBloodRequest}
          />
        )}

        {currentPage === 'missing-persons' && (
          <MissingPersonsPage
            reports={missingPersons}
            onAddReport={handleAddMissingPerson}
            onUpdateStatus={handleUpdateMissingStatus}
            onIncrementSighting={handleIncrementMissingSighting}
            currentRole={session.role}
          />
        )}

        {currentPage === 'volunteer' && (
          <VolunteerPage
            volunteers={volunteers}
            onRegisterVolunteer={handleRegisterVolunteer}
            onToggleVolunteerAvailability={handleToggleVolunteerAvailability}
            onNavigate={handleNavigate}
          />
        )}

        {currentPage === 'command' && (
          <CommandDashboardPage
            emergencies={emergencies}
            volunteers={volunteers}
            bloodRequests={urgentBloodRequests}
            missingPersons={missingPersons}
            activityFeed={activityFeed}
            onAdvanceStage={handleAdvanceEmergencyStage}
            onToggleVolunteerAvailability={handleToggleVolunteerAvailability}
            onSelectEmergencyForTracking={(id) => setSelectedEmergencyId(id)}
            onNavigate={handleNavigate}
          />
        )}

        {currentPage === 'about' && <AboutPage onNavigate={handleNavigate} />}
      </main>

      {/* CLEAN FOOTER */}
      <footer className="border-t border-slate-800/80 bg-[#050810] py-8 mt-12">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-bold text-white">Rapid Rescue 360°</span>
            <span>·</span>
            <span>Interactive 3D Emergency Response Prototype</span>
            <span>·</span>
            <span>All telemetry & records are demo data</span>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <button
              type="button"
              onClick={() => handleNavigate('about')}
              className="hover:text-white transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Info className="w-3.5 h-3.5" />
              Safety & Architecture
            </button>
            <button
              type="button"
              onClick={handleResetDemoData}
              className="hover:text-cyan-400 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Demo Dataset
            </button>
          </div>
        </div>
      </footer>

      {/* Login / Sign Up & Role Switching Modal */}
      <AuthModal
        isOpen={authModalOpen}
        initialMode={authModalMode}
        session={session}
        onClose={() => setAuthModalOpen(false)}
        onAuthenticate={(newSession) => setSession(newSession)}
      />
    </div>
  );
}
