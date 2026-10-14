import React, { useEffect, useRef, useState } from 'react';
import {
  CheckCircle2,
  MapPin,
  MessageSquare,
  PhoneCall,
  PlusCircle,
  Send,
  ShieldAlert,
  X,
} from 'lucide-react';
import {
  BloodBank,
  EmergencyRequest,
  PageId,
  RESCUE_STAGES,
  RescueStage,
  VolunteerProfile,
} from '../types';
import {
  createGoogleMapsMarker,
  GoogleMapsApi,
  GoogleMapsMap,
  GoogleMapsMarker,
  GoogleMapsPolyline,
  GoogleMapsPosition,
  isGoogleMapsConfigured,
  loadGoogleMaps,
} from '../services/googleMaps';

interface LiveTrackingPageProps {
  emergencies: EmergencyRequest[];
  selectedEmergencyId: string;
  onSelectEmergency: (id: string) => void;
  onAdvanceStage: (id: string, nextStage: RescueStage) => void;
  volunteers: VolunteerProfile[];
  bloodBanks: BloodBank[];
  onNavigate: (page: PageId) => void;
}

const CENTRAL_HOSPITAL_POSITION = { lat: 13.0827, lng: 80.2707 };

function toDemoMapPosition(coords: { x: number; y: number }): GoogleMapsPosition {
  return {
    lat: 13.11 - (coords.y / 100) * 0.13,
    lng: 80.17 + (coords.x / 100) * 0.15,
  };
}

export const LiveTrackingPage: React.FC<LiveTrackingPageProps> = ({
  emergencies,
  selectedEmergencyId,
  onSelectEmergency,
  onAdvanceStage,
  volunteers,
  bloodBanks,
  onNavigate,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [googleMaps, setGoogleMaps] = useState<GoogleMapsApi | null>(null);
  const [googleMap, setGoogleMap] = useState<GoogleMapsMap | null>(null);
  const [mapError, setMapError] = useState<string | null>(null);
  const activeEmergency =
    emergencies.find((e) => e.id === selectedEmergencyId) || emergencies[0];

  const [showHospitals, setShowHospitals] = useState<boolean>(true);
  const [showVolunteers, setShowVolunteers] = useState<boolean>(true);
  const [showBloodBanks, setShowBloodBanks] = useState<boolean>(true);
  const [contactModalOpen, setContactModalOpen] = useState<boolean>(false);
  const [dispatchMessage, setDispatchMessage] = useState<string>('');
  const [commsLogs, setCommsLogs] = useState<Record<string, { id: string; sender: string; text: string; time: string }[]>>({
    'RR-2026-4810': [
      {
        id: 'c1',
        sender: 'Dispatch Coordinator (Demo)',
        text: 'Responder team notified. Keep emergency contact line open.',
        time: '4m ago',
      },
      {
        id: 'c2',
        sender: 'Dr. Kavitha Nair (Volunteer)',
        text: 'En route with trauma first-aid kit along Sector Corridor.',
        time: '2m ago',
      },
    ],
  });

  useEffect(() => {
    if (!isGoogleMapsConfigured) {
      setMapError('Set VITE_GOOGLE_MAPS_API_KEY in .env.local to display the map.');
      return;
    }

    let cancelled = false;
    const handleMapsAuthFailure = () => {
      setMapError('Google Maps rejected the API key. Check its billing, API, and HTTP referrer restrictions.');
    };
    window.gm_authFailure = handleMapsAuthFailure;
    loadGoogleMaps()
      .then((maps) => {
        if (cancelled || !mapContainerRef.current) return;
        setGoogleMaps(maps);
        setGoogleMap(
          new maps.Map(mapContainerRef.current, {
            center: activeEmergency
              ? { lat: activeEmergency.coords.lat, lng: activeEmergency.coords.lng }
              : CENTRAL_HOSPITAL_POSITION,
            zoom: 13,
            mapId: 'DEMO_MAP_ID',
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: true,
          }),
        );
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setMapError(error instanceof Error ? error.message : 'Google Maps could not be loaded.');
        }
      });

    return () => {
      cancelled = true;
      if (window.gm_authFailure === handleMapsAuthFailure) {
        delete window.gm_authFailure;
      }
    };
  }, []);

  useEffect(() => {
    if (!activeEmergency || !googleMaps || !googleMap) return;

    const emergencyPosition = {
      lat: activeEmergency.coords.lat,
      lng: activeEmergency.coords.lng,
    };
    googleMap.setCenter(emergencyPosition);
    googleMap.setZoom(13);

    const markers: GoogleMapsMarker[] = [
      createGoogleMapsMarker(
        googleMaps,
        googleMap,
        emergencyPosition,
        `${activeEmergency.id} — ${activeEmergency.address}`,
        '!',
        '#ea4335',
      ),
    ];
    const routes: GoogleMapsPolyline[] = [
      new googleMaps.Polyline({
        map: googleMap,
        path: [CENTRAL_HOSPITAL_POSITION, emergencyPosition],
        strokeColor: '#06b6d4',
        strokeOpacity: 0.8,
        strokeWeight: 4,
      }),
    ];

    if (showHospitals) {
      markers.push(
        createGoogleMapsMarker(
          googleMaps,
          googleMap,
          CENTRAL_HOSPITAL_POSITION,
          'Central Trauma & Dispatch Hospital (demo)',
          'H',
          '#34a853',
        ),
      );
    }

    if (showBloodBanks) {
      bloodBanks.forEach((bloodBank) => {
        markers.push(
          createGoogleMapsMarker(
            googleMaps,
            googleMap,
            toDemoMapPosition(bloodBank.coords),
            `${bloodBank.name} (demo location)`,
            'B',
            '#f9ab00',
          ),
        );
      });
    }

    if (showVolunteers) {
      volunteers
        .filter((volunteer) => volunteer.availability)
        .forEach((volunteer) => {
          markers.push(
            createGoogleMapsMarker(
              googleMaps,
              googleMap,
              toDemoMapPosition(volunteer.coords),
              `${volunteer.fullName} — ${volunteer.skills.join(', ')} (demo location)`,
              'V',
              '#4285f4',
            ),
          );
        });
    }

    if (activeEmergency.stage !== 'Case Resolved') {
      const currentStageIndex = RESCUE_STAGES.indexOf(activeEmergency.stage);
      const progressRatio = Math.min(1, (currentStageIndex + 1) / RESCUE_STAGES.length);
      markers.push(
        createGoogleMapsMarker(
          googleMaps,
          googleMap,
          {
            lat:
              CENTRAL_HOSPITAL_POSITION.lat +
              (emergencyPosition.lat - CENTRAL_HOSPITAL_POSITION.lat) * progressRatio,
            lng:
              CENTRAL_HOSPITAL_POSITION.lng +
              (emergencyPosition.lng - CENTRAL_HOSPITAL_POSITION.lng) * progressRatio,
          },
          `${activeEmergency.assignedUnitId || 'UNIT-01'} (simulated position)`,
          'A',
          '#00bcd4',
        ),
      );
    }

    return () => {
      markers.forEach((marker) => {
        marker.map = null;
      });
      routes.forEach((route) => route.setMap(null));
    };
  }, [
    activeEmergency,
    bloodBanks,
    googleMap,
    googleMaps,
    showBloodBanks,
    showHospitals,
    showVolunteers,
    volunteers,
  ]);

  if (!activeEmergency) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-4">
        <ShieldAlert className="w-12 h-12 text-cyan-400 mx-auto" />
        <h2 className="text-2xl font-bold text-white">No Active Emergency Requests</h2>
        <p className="text-sm text-slate-400">Submit a new emergency request to track response units and volunteers.</p>
        <button
          type="button"
          onClick={() => onNavigate('need-help')}
          className="px-5 py-2.5 rounded-xl bg-rose-600 text-white text-xs font-bold"
        >
          Create New Help Request
        </button>
      </div>
    );
  }

  const activeChat = commsLogs[activeEmergency.id] || [
    {
      id: 'd1',
      sender: 'Dispatch Coordinator (Demo)',
      text: `Tactical channel open for ${activeEmergency.id}. Responder units standing by.`,
      time: 'Just now',
    },
  ];

  const currentStageIndex = RESCUE_STAGES.indexOf(activeEmergency.stage);

  const handleNextStage = () => {
    if (currentStageIndex < RESCUE_STAGES.length - 1) {
      onAdvanceStage(activeEmergency.id, RESCUE_STAGES[currentStageIndex + 1]);
    }
  };

  const handleSendCoordinatorMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dispatchMessage.trim()) return;
    const newMsg = {
      id: `msg-${Date.now()}`,
      sender: 'You (Live Comms)',
      text: dispatchMessage.trim(),
      time: 'Just now',
    };
    setCommsLogs((prev) => ({
      ...prev,
      [activeEmergency.id]: [...(prev[activeEmergency.id] || activeChat), newMsg],
    }));
    setDispatchMessage('');
  };

  const hasCalculatedRouting =
    typeof activeEmergency.routeDistanceKm === 'number' &&
    activeEmergency.routeDistanceKm > 0 &&
    typeof activeEmergency.estimatedEtaMinutes === 'number';

  return (
    <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Bar: Request Switcher + Create New Help Request CTA */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs text-cyan-400 font-medium">
            <span>LIVE RESCUE TRACKING DASHBOARD</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono">{activeEmergency.id}</span>
            <span aria-hidden="true">·</span>
            <span className="text-amber-300">Demo Routing Telemetry</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">{activeEmergency.title}</h1>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <label htmlFor="select-tracked-request" className="text-xs text-slate-400 whitespace-nowrap">
              Active Request:
            </label>
            <select
              id="select-tracked-request"
              value={activeEmergency.id}
              onChange={(e) => onSelectEmergency(e.target.value)}
              className="rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 text-xs text-white font-mono focus:border-cyan-500 focus:outline-none"
            >
              {emergencies.map((req) => (
                <option key={req.id} value={req.id}>
                  {req.id} — {req.category} ({req.stage})
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={() => onNavigate('need-help')}
            className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            Create New Help Request
          </button>
        </div>
      </div>

      {/* Main Split: Tactical Map (7 cols) + Vertical Rescue Timeline & Status Panel (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left 7 Cols: Interactive Tactical Rescue Map */}
        <div className="lg:col-span-7 bg-slate-900/75 border border-slate-800 rounded-2xl p-5 space-y-4">
          {/* Map Layer Filter Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="text-xs text-slate-300 font-medium">
              Sector: <strong className="text-white">{activeEmergency.sector}</strong> · {activeEmergency.address}
            </div>
            <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-lg border border-slate-800">
              <button
                type="button"
                onClick={() => setShowVolunteers((v) => !v)}
                className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                  showVolunteers ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                Volunteers ({volunteers.filter((v) => v.availability).length})
              </button>
              <button
                type="button"
                onClick={() => setShowHospitals((h) => !h)}
                className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                  showHospitals ? 'bg-emerald-500/20 text-emerald-300' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                Hospitals
              </button>
              <button
                type="button"
                onClick={() => setShowBloodBanks((b) => !b)}
                className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                  showBloodBanks ? 'bg-orange-500/20 text-orange-300' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                Blood Banks ({bloodBanks.length})
              </button>
            </div>
          </div>

          {/* Tactical Map Viewport */}
          <div className="relative w-full h-[430px] rounded-xl overflow-hidden bg-[#070D19] border border-slate-800 select-none">
            <div ref={mapContainerRef} className="w-full h-full" aria-label="Live rescue map" />
            {mapError && (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-950/90 p-6 text-center">
                <div className="max-w-md">
                  <MapPin className="w-8 h-8 text-cyan-400 mx-auto mb-3" />
                  <p className="text-sm text-white font-semibold">Google Map unavailable</p>
                  <p className="text-xs text-slate-400 mt-1">{mapError}</p>
                </div>
              </div>
            )}
            {!googleMap && !mapError && (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-950/70 text-sm text-slate-300">
                Loading Google Map…
              </div>
            )}

            {/* Map Legend Footer */}
            <div className="absolute bottom-3 left-3 right-3 bg-slate-950/85 backdrop-blur-md border border-white/10 rounded-xl px-3.5 py-2 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-300">
              <div className="flex flex-wrap items-center gap-3">
                <span>Red: Emergency Target</span>
                <span>·</span>
                <span className="text-cyan-400">Cyan: Demo Response Route</span>
                <span>·</span>
                <span>Blue: Volunteers · Green: Hospital · Orange: Blood Banks</span>
              </div>
              <span className="font-mono text-slate-400 tabular-nums">
                {activeEmergency.coords.lat}°N, {activeEmergency.coords.lng}°E
              </span>
            </div>
          </div>

          {/* Calculated ETA & Telemetry Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono tabular-nums">
            <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3.5">
              <span className="text-[11px] text-slate-400 block">
                {hasCalculatedRouting ? 'Calculated Demo Route ETA' : 'Simulated Estimate'}
              </span>
              <span className="text-lg font-extrabold text-cyan-400 mt-0.5 block">
                {activeEmergency.stage === 'Case Resolved'
                  ? '0 mins (Resolved)'
                  : activeEmergency.stage === 'Assistance Arrived'
                  ? 'On Scene Now'
                  : hasCalculatedRouting
                  ? `${activeEmergency.estimatedEtaMinutes} mins (${activeEmergency.routeDistanceKm} km)`
                  : '~6 mins (Simulated Estimate)'}
              </span>
            </div>

            <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3.5">
              <span className="text-[11px] text-slate-400 block">Assigned Response Unit</span>
              <span className="text-sm font-bold text-white mt-1 block truncate">
                {activeEmergency.assignedUnitId || 'Community Dispatch Unit'}
              </span>
            </div>

            <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3.5">
              <span className="text-[11px] text-slate-400 block">Volunteers Assigned</span>
              <span className="text-lg font-extrabold text-emerald-400 mt-0.5 block">
                {activeEmergency.volunteersAssigned} / {activeEmergency.volunteersNeeded} Responders
              </span>
            </div>
          </div>
        </div>

        {/* Right 5 Cols: Vertical Rescue Timeline & Volunteer Contact Panel */}
        <div className="lg:col-span-5 space-y-5">
          {/* Vertical Rescue Timeline Card */}
          <div className="bg-slate-900/75 border border-slate-800 rounded-2xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3.5">
              <div>
                <h2 className="text-base font-bold text-white">Vertical Rescue Timeline</h2>
                <p className="text-xs text-slate-400">6-Stage Incident Progression</p>
              </div>
              {currentStageIndex < RESCUE_STAGES.length - 1 && (
                <button
                  type="button"
                  onClick={handleNextStage}
                  className="px-3 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 text-xs font-semibold transition-colors cursor-pointer"
                >
                  Advance Stage →
                </button>
              )}
            </div>

            <div className="space-y-4">
              {RESCUE_STAGES.map((stage, idx) => {
                const isCompleted = idx <= currentStageIndex;
                const isCurrent = idx === currentStageIndex;
                return (
                  <div
                    key={stage}
                    onClick={() => onAdvanceStage(activeEmergency.id, stage)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        onAdvanceStage(activeEmergency.id, stage);
                      }
                    }}
                    className={`flex items-start gap-3.5 p-3 rounded-xl border transition-all cursor-pointer ${
                      isCurrent
                        ? 'bg-cyan-500/10 border-cyan-500/50'
                        : isCompleted
                        ? 'bg-slate-950/60 border-slate-800/80'
                        : 'bg-slate-950/30 border-slate-800/40 opacity-60'
                    }`}
                  >
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-mono shrink-0 mt-0.5 ${
                        isCurrent
                          ? 'bg-cyan-400 text-slate-950 font-bold'
                          : isCompleted
                          ? 'bg-emerald-500/25 text-emerald-300 border border-emerald-500/40'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className={`text-sm font-bold ${isCurrent ? 'text-cyan-300' : 'text-white'}`}>
                          {stage}
                        </span>
                        <span className="text-[11px] font-mono text-slate-400">
                          {isCurrent ? 'Active Stage' : isCompleted ? 'Verified' : 'Pending'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {idx === 0 && 'Emergency coordinates & triage priority logged.'}
                        {idx === 1 && 'Alert broadcasted to nearby verified community responders.'}
                        {idx === 2 && `${activeEmergency.assignedVolunteerNames.join(', ')} accepted dispatch.`}
                        {idx === 3 && `${activeEmergency.assignedUnitId} navigating along primary corridor.`}
                        {idx === 4 && 'Responders on scene providing trauma stabilization & support.'}
                        {idx === 5 && 'Incident stabilized and documented in command log.'}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Assigned Volunteers & Contact Action Card */}
          <div className="bg-slate-900/75 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">Assigned Responder Team</h3>
                <p className="text-xs text-slate-400">Emergency Contact: {activeEmergency.contactPhone}</p>
              </div>
              <button
                type="button"
                onClick={() => setContactModalOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                Contact Team
              </button>
            </div>

            <div className="space-y-2">
              {activeEmergency.assignedVolunteerNames.map((name) => (
                <div
                  key={name}
                  className="bg-slate-950/70 border border-slate-800 rounded-xl px-3.5 py-2.5 flex items-center justify-between text-xs"
                >
                  <div>
                    <p className="font-semibold text-white">{name}</p>
                    <p className="text-slate-400">First Aid & Rapid Transport · Demo Responder</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setContactModalOpen(true)}
                    className="text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1 cursor-pointer"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    Message
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Volunteer & Dispatch Contact Action Modal */}
      {contactModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-xs text-cyan-400 font-mono">{activeEmergency.id} · DEMO COMMS CHANNEL</span>
                <h3 className="text-lg font-bold text-white">Responder & Coordinator Direct Line</h3>
              </div>
              <button
                type="button"
                onClick={() => setContactModalOpen(false)}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2.5 max-h-56 overflow-y-auto p-3 rounded-xl bg-slate-950 border border-slate-800">
              {activeChat.map((msg) => (
                <div key={msg.id} className="text-xs space-y-0.5 border-b border-slate-800/80 last:border-none pb-2 last:pb-0">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="font-semibold text-cyan-300">{msg.sender}</span>
                    <span className="font-mono">{msg.time}</span>
                  </div>
                  <p className="text-slate-200">{msg.text}</p>
                </div>
              ))}
            </div>

            <form onSubmit={handleSendCoordinatorMessage} className="flex items-center gap-2">
              <input
                type="text"
                value={dispatchMessage}
                onChange={(e) => setDispatchMessage(e.target.value)}
                placeholder="Send status update or landmark guidance to team..."
                className="flex-1 rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2.5 text-xs text-white focus:border-cyan-500 focus:outline-none"
              />
              <button
                type="submit"
                className="px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                Send
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
