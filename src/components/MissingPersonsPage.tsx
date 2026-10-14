import React, { useState } from 'react';
import {
  CheckCircle2,
  Clock,
  Eye,
  ImagePlus,
  Lock,
  MapPin,
  PlusCircle,
  Search,
  ShieldCheck,
  User,
  X,
} from 'lucide-react';
import { MissingPersonReport, MissingStatus, UserRole } from '../types';

interface MissingPersonsPageProps {
  reports: MissingPersonReport[];
  onAddReport: (report: MissingPersonReport) => void;
  onUpdateStatus: (id: string, status: MissingStatus) => void;
  onIncrementSighting: (id: string, note: string) => void;
  currentRole: UserRole;
}

const STATUS_OPTIONS: MissingStatus[] = ['Newly Reported', 'Under Review', 'Located', 'Closed'];

export const MissingPersonsPage: React.FC<MissingPersonsPageProps> = ({
  reports,
  onAddReport,
  onUpdateStatus,
  onIncrementSighting,
  currentRole,
}) => {
  const [statusFilter, setStatusFilter] = useState<MissingStatus | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showReportForm, setShowReportForm] = useState<boolean>(false);

  // New Missing Person Report Form State
  const [identifierName, setIdentifierName] = useState<string>('');
  const [age, setAge] = useState<number>(14);
  const [lastSeenLocation, setLastSeenLocation] = useState<string>('');
  const [sector, setSector] = useState<string>('Central District');
  const [lastSeenDateTime, setLastSeenDateTime] = useState<string>('Today, 10:15 AM');
  const [clothingDescription, setClothingDescription] = useState<string>('');
  const [identifyingDetails, setIdentifyingDetails] = useState<string>('');
  const [photoPreview, setPhotoPreview] = useState<string | undefined>(undefined);
  const [pinCoords, setPinCoords] = useState<{ x: number; y: number }>({ x: 46, y: 40 });
  const [formError, setFormError] = useState<string | null>(null);

  // Sighting Modal State
  const [activeSightingReport, setActiveSightingReport] = useState<MissingPersonReport | null>(null);
  const [sightingNote, setSightingNote] = useState<string>('');
  const [sightingSubmitted, setSightingSubmitted] = useState<boolean>(false);

  const filteredReports = reports.filter((r) => {
    if (statusFilter !== 'ALL' && r.status !== statusFilter) return false;
    if (
      searchQuery.trim() &&
      !r.identifierName.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !r.lastSeenLocation.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        setPhotoPreview(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCreateReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifierName.trim() || !lastSeenLocation.trim() || !clothingDescription.trim()) {
      setFormError('Please provide the name/identifier, last-seen location, and clothing description.');
      return;
    }

    const newReport: MissingPersonReport = {
      id: `MP-2026-${Math.floor(200 + Math.random() * 799)}`,
      identifierName: identifierName.trim(),
      age,
      lastSeenLocation: lastSeenLocation.trim(),
      sector,
      lastSeenDateTime: lastSeenDateTime.trim() || 'Recently Reported',
      clothingDescription: clothingDescription.trim(),
      identifyingDetails: identifyingDetails.trim() || 'Coordinated community look-out active.',
      status: 'Newly Reported',
      photoUrl: photoPreview,
      coords: pinCoords,
      sightingsCount: 0,
      isDemoData: true,
    };

    onAddReport(newReport);
    setShowReportForm(false);
    setIdentifierName('');
    setLastSeenLocation('');
    setClothingDescription('');
    setIdentifyingDetails('');
    setPhotoPreview(undefined);
    setFormError(null);
  };

  const handleSubmitSighting = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSightingReport || !sightingNote.trim()) return;
    onIncrementSighting(activeSightingReport.id, sightingNote.trim());
    setSightingSubmitted(true);
    setSightingNote('');
  };

  return (
    <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      {/* Header & Privacy Protection Banner */}
      <div className="space-y-4 border-b border-slate-800/80 pb-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <p className="text-xs font-medium text-amber-400">
              COMPASSIONATE & PRIVACY-CONSCIOUS REGISTRY · COMMUNITY SEARCH SUPPORT
            </p>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
              Missing Persons Alert & Last-Seen Sector Registry
            </h1>
          </div>

          <button
            type="button"
            onClick={() => setShowReportForm((prev) => !prev)}
            className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-2 transition-colors self-start sm:self-auto cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            {showReportForm ? 'Close Report Form' : 'Submit Missing Person Report'}
          </button>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 flex items-start gap-3 text-xs text-slate-300">
          <Lock className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
          <p>
            <strong>Privacy Safeguard:</strong> To protect vulnerable individuals and families, personal home addresses
            and family phone numbers are never exposed publicly. All community sighting leads are routed through
            authorized case coordinators.
          </p>
        </div>
      </div>

      {/* Collapsible New Missing Person Report Form */}
      {showReportForm && (
        <form
          onSubmit={handleCreateReport}
          className="bg-slate-900/85 border border-amber-500/40 rounded-2xl p-6 space-y-5 shadow-2xl"
        >
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-base font-bold text-white">File Privacy-Protected Missing Person Report (Demo)</h2>
            <span className="text-xs text-amber-400">Initial Status: Newly Reported</span>
          </div>

          {formError && <p className="text-xs text-rose-400 bg-rose-500/10 p-3 rounded-lg">{formError}</p>}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label htmlFor="mp-name" className="block text-xs text-slate-300">
                Name or First-Name Identifier *
              </label>
              <input
                id="mp-name"
                type="text"
                value={identifierName}
                onChange={(e) => setIdentifierName(e.target.value)}
                placeholder="e.g., Rohan M. (Case Identifier)"
                className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2 text-xs text-white"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="mp-age" className="block text-xs text-slate-300">
                Approximate Age *
              </label>
              <input
                id="mp-age"
                type="number"
                min={1}
                max={110}
                value={age}
                onChange={(e) => setAge(Math.max(1, parseInt(e.target.value || '1', 10)))}
                className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2 text-xs text-white font-mono tabular-nums"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="mp-datetime" className="block text-xs text-slate-300">
                Last-Seen Date & Time *
              </label>
              <input
                id="mp-datetime"
                type="text"
                value={lastSeenDateTime}
                onChange={(e) => setLastSeenDateTime(e.target.value)}
                placeholder="e.g., Today, 08:30 AM"
                className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2 text-xs text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 space-y-1">
              <label htmlFor="mp-location" className="block text-xs text-slate-300">
                Last-Seen Location / Landmark *
              </label>
              <input
                id="mp-location"
                type="text"
                value={lastSeenLocation}
                onChange={(e) => setLastSeenLocation(e.target.value)}
                placeholder="e.g., Near Central Park West Gate / Transit Concourse"
                className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2 text-xs text-white"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="mp-sector" className="block text-xs text-slate-300">
                City Sector
              </label>
              <select
                id="mp-sector"
                value={sector}
                onChange={(e) => setSector(e.target.value)}
                className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-white"
              >
                <option value="Central District">Central District</option>
                <option value="Transit Core">Transit Core</option>
                <option value="Sector 4 North">Sector 4 North</option>
                <option value="South Basin">South Basin</option>
                <option value="Medical Hub East">Medical Hub East</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label htmlFor="mp-clothing" className="block text-xs text-slate-300">
                Clothing Description *
              </label>
              <input
                id="mp-clothing"
                type="text"
                value={clothingDescription}
                onChange={(e) => setClothingDescription(e.target.value)}
                placeholder="Jacket color, footwear, backpack, eyewear..."
                className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2 text-xs text-white"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="mp-details" className="block text-xs text-slate-300">
                Identifying Details / Medical Needs
              </label>
              <input
                id="mp-details"
                type="text"
                value={identifyingDetails}
                onChange={(e) => setIdentifyingDetails(e.target.value)}
                placeholder="Languages spoken, medical alert wristband, etc."
                className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2 text-xs text-white"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
            <label className="cursor-pointer rounded-xl bg-slate-950 border border-dashed border-slate-700 hover:border-amber-400 px-4 py-2 text-xs text-slate-300 flex items-center gap-2">
              <ImagePlus className="w-4 h-4 text-amber-400" />
              <span>{photoPreview ? 'Photograph Attached (Change)' : 'Upload Optional Photograph'}</span>
              <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
            </label>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowReportForm(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-xs font-semibold text-slate-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs cursor-pointer"
              >
                Publish Missing Person Alert
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Filter Tabs + Search + Last-Seen Map Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left 8 Cols: Filter Bar & Reports Cards */}
        <div className="lg:col-span-8 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/60 border border-slate-800 rounded-xl p-3">
            <div className="flex flex-wrap items-center gap-1">
              <button
                type="button"
                onClick={() => setStatusFilter('ALL')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  statusFilter === 'ALL' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                All ({reports.length})
              </button>
              {STATUS_OPTIONS.map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                    statusFilter === st ? 'bg-amber-500/20 text-amber-300' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>

            <div className="relative min-w-[200px] flex-1 max-w-xs">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search identifier or location..."
                className="w-full rounded-lg bg-slate-950 border border-slate-800 pl-8 pr-3 py-1.5 text-xs text-white focus:border-cyan-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredReports.map((person) => (
              <div
                key={person.id}
                className="bg-slate-900/75 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-start gap-3.5">
                    {person.photoUrl ? (
                      <img
                        src={person.photoUrl}
                        alt={person.identifierName}
                        referrerPolicy="no-referrer"
                        className="w-14 h-14 rounded-xl object-cover border border-slate-700 shrink-0"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-amber-400 shrink-0">
                        <User className="w-7 h-7" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2 text-xs">
                        <span className="font-mono text-slate-400">{person.id}</span>
                        <span
                          className={`font-semibold ${
                            person.status === 'Located'
                              ? 'text-emerald-400'
                              : person.status === 'Newly Reported'
                              ? 'text-rose-400'
                              : 'text-amber-400'
                          }`}
                        >
                          {person.status}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-white truncate mt-0.5">{person.identifierName}</h3>
                      <p className="text-xs text-slate-400 font-mono tabular-nums">
                        Age: {person.age} yrs · Sector: {person.sector}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-300 bg-slate-950/60 border border-slate-800/80 rounded-xl p-3">
                    <p className="flex items-start gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                      <span>
                        <strong>Last Seen:</strong> {person.lastSeenLocation}
                      </span>
                    </p>
                    <p className="flex items-center gap-1.5 text-slate-400">
                      <Clock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span>{person.lastSeenDateTime}</span>
                    </p>
                    <p className="pt-1 text-slate-300">
                      <strong>Attire:</strong> {person.clothingDescription}
                    </p>
                    <p className="text-slate-400">
                      <strong>Notes:</strong> {person.identifyingDetails}
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-mono text-cyan-400 tabular-nums">
                    {person.sightingsCount} Coordinator Lead(s)
                  </span>

                  <div className="flex items-center gap-2">
                    {currentRole === 'Coordinator' && (
                      <select
                        aria-label={`Change status for ${person.identifierName}`}
                        value={person.status}
                        onChange={(e) => onUpdateStatus(person.id, e.target.value as MissingStatus)}
                        className="rounded-lg bg-slate-950 border border-slate-700 px-2 py-1 text-[11px] text-white"
                      >
                        {STATUS_OPTIONS.map((st) => (
                          <option key={st} value={st}>
                            {st}
                          </option>
                        ))}
                      </select>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        setActiveSightingReport(person);
                        setSightingSubmitted(false);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Report Sighting
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right 4 Cols: Map of Last-Seen Locations */}
        <div className="lg:col-span-4 bg-slate-900/75 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div>
            <h2 className="text-base font-bold text-white">Last-Seen Sector Map</h2>
            <p className="text-xs text-slate-400">Spatial cluster of active missing-person alerts</p>
          </div>

          <div
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const x = Math.round(((e.clientX - rect.left) / rect.width) * 100);
              const y = Math.round(((e.clientY - rect.top) / rect.height) * 100);
              setPinCoords({ x, y });
            }}
            className="relative w-full h-[320px] rounded-xl overflow-hidden bg-[#080E1C] border border-slate-800"
          >
            <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              <defs>
                <pattern id="missingMapGrid" width="10" height="10" patternUnits="userSpaceOnUse">
                  <path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(245, 158, 11, 0.08)" strokeWidth="0.4" />
                </pattern>
              </defs>
              <rect width="100" height="100" fill="url(#missingMapGrid)" />
              <path d="M 0 45 L 100 45" stroke="rgba(30, 41, 59, 0.8)" strokeWidth="2" />
              <path d="M 52 0 L 52 100" stroke="rgba(30, 41, 59, 0.8)" strokeWidth="2" />
            </svg>

            {filteredReports.map((rep) => (
              <div
                key={rep.id}
                className="absolute -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${rep.coords.x}%`, top: `${rep.coords.y}%` }}
              >
                <div className="flex flex-col items-center">
                  <span className="px-1.5 py-0.5 rounded bg-slate-950/90 border border-amber-500/60 text-[9px] text-amber-300 font-mono whitespace-nowrap mb-0.5">
                    {rep.identifierName.split(' ')[0]} ({rep.status})
                  </span>
                  <MapPin
                    className={`w-5 h-5 ${
                      rep.status === 'Located' ? 'text-emerald-400' : 'text-amber-400'
                    }`}
                  />
                </div>
              </div>
            ))}

            {/* User Selected Pin for New Report */}
            {showReportForm && (
              <div
                className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none transition-all duration-150 z-10"
                style={{ left: `${pinCoords.x}%`, top: `${pinCoords.y}%` }}
              >
                <div className="flex flex-col items-center">
                  <span className="px-1.5 py-0.5 rounded bg-amber-500 text-slate-950 text-[9px] font-bold font-mono whitespace-nowrap mb-0.5 shadow-md">
                    Selected Pin ({pinCoords.x}%, {pinCoords.y}%)
                  </span>
                  <MapPin className="w-6 h-6 text-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.85)]" />
                </div>
              </div>
            )}
          </div>

          <div className="text-xs text-slate-400 space-y-1 bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
            <div className="flex items-center gap-1.5 text-slate-200 font-semibold">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Authorized Search Protocol</span>
            </div>
            <p>
              Sightings submitted here are verified by Sector Coordinators before dispatching trained Search Support
              volunteers.
            </p>
          </div>
        </div>
      </div>

      {/* Report Sighting Modal */}
      {activeSightingReport && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-xs text-amber-400 font-mono">{activeSightingReport.id} · SIGHTING LEAD</span>
                <h3 className="text-lg font-bold text-white">{activeSightingReport.identifierName}</h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveSightingReport(null)}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {sightingSubmitted ? (
              <div className="rounded-xl bg-emerald-500/15 border border-emerald-500/40 p-4 text-xs text-emerald-300 space-y-2">
                <div className="flex items-center gap-2 font-bold text-sm">
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Sighting Routed to Case Coordinator</span>
                </div>
                <p>
                  Thank you. Your lead has been logged under {activeSightingReport.id} and shared with the Sector Search
                  Support team.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmitSighting} className="space-y-4">
                <p className="text-xs text-slate-300">
                  Last seen near <strong>{activeSightingReport.lastSeenLocation}</strong>. Provide specific location,
                  time, and direction of travel below:
                </p>
                <textarea
                  rows={3}
                  value={sightingNote}
                  onChange={(e) => setSightingNote(e.target.value)}
                  placeholder="Describe where and when you saw this person..."
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 p-3 text-xs text-white focus:border-amber-400 focus:outline-none"
                  required
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveSightingReport(null)}
                    className="px-4 py-2 rounded-xl bg-slate-800 text-xs text-slate-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs cursor-pointer"
                  >
                    Submit Sighting Lead
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
