import React, { useState } from 'react';
import {
  AlertCircle,
  Building2,
  CheckCircle2,
  Droplets,
  Filter,
  MapPin,
  Phone,
  Plus,
  Search,
  ShieldAlert,
  UserCheck,
  X,
} from 'lucide-react';
import {
  BloodBank,
  BloodDonor,
  BloodGroup,
  BloodUrgentRequest,
} from '../types';

interface BloodNetworkPageProps {
  donors: BloodDonor[];
  bloodBanks: BloodBank[];
  urgentRequests: BloodUrgentRequest[];
  onAddUrgentBloodRequest: (req: BloodUrgentRequest) => void;
}

const ALL_BLOOD_GROUPS: BloodGroup[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export const BloodNetworkPage: React.FC<BloodNetworkPageProps> = ({
  donors,
  bloodBanks,
  urgentRequests,
  onAddUrgentBloodRequest,
}) => {
  // Filter states
  const [selectedGroup, setSelectedGroup] = useState<BloodGroup | 'ALL'>('ALL');
  const [maxDistanceKm, setMaxDistanceKm] = useState<number>(10);
  const [availabilityFilter, setAvailabilityFilter] = useState<'ALL' | 'Available Now'>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Quick Request / Broadcast Form States
  const [reqBloodGroup, setReqBloodGroup] = useState<BloodGroup>('O-');
  const [reqLocation, setReqLocation] = useState<string>('Apex Trauma & Multispecialty Hospital, Medical Hub East');
  const [reqUrgency, setReqUrgency] = useState<BloodUrgentRequest['urgency']>('Immediate (Within 1 hr)');
  const [reqUnits, setReqUnits] = useState<number>(2);
  const [reqContact, setReqContact] = useState<string>('+91 98401-77000');
  const [requestBannerSuccess, setRequestBannerSuccess] = useState<string | null>(null);

  // Contact Donor / Blood Bank Modal
  const [selectedContactTarget, setSelectedContactTarget] = useState<{
    name: string;
    bloodGroup: string;
    type: string;
    sector: string;
    phone: string;
  } | null>(null);
  const [contactConfirmed, setContactConfirmed] = useState<boolean>(false);

  const filteredDonors = donors.filter((d) => {
    if (selectedGroup !== 'ALL' && d.bloodGroup !== selectedGroup) return false;
    if (d.distanceKm > maxDistanceKm) return false;
    if (availabilityFilter === 'Available Now' && d.availability !== 'Available Now') return false;
    if (
      searchQuery.trim() &&
      !d.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !d.sector.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  const handleBroadcastBloodRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reqLocation.trim() || !reqContact.trim()) return;

    const lowerLoc = reqLocation.toLowerCase();
    let sector = 'Medical Hub East';
    if (lowerLoc.includes('central') || lowerLoc.includes('anna')) sector = 'Central District';
    else if (lowerLoc.includes('north') || lowerLoc.includes('sector 4')) sector = 'Sector 4 North';
    else if (lowerLoc.includes('south') || lowerLoc.includes('basin')) sector = 'South Basin';
    else if (lowerLoc.includes('transit') || lowerLoc.includes('metro')) sector = 'Transit Core';
    else if (lowerLoc.includes('tech') || lowerLoc.includes('corridor')) sector = 'Tech Corridor';

    const newReq: BloodUrgentRequest = {
      id: `BRQ-${Math.floor(100 + Math.random() * 899)}`,
      patientIdentifier: `Emergency Requisition (${reqBloodGroup})`,
      bloodGroup: reqBloodGroup,
      unitsRequired: reqUnits,
      hospitalName: reqLocation.trim(),
      sector,
      urgency: reqUrgency,
      contactNumber: reqContact.trim(),
      createdAt: 'Just now',
      status: 'Open Alert',
    };

    onAddUrgentBloodRequest(newReq);
    setSelectedGroup(reqBloodGroup);
    setRequestBannerSuccess(
      `Blood Alert ${newReq.id} logged (${reqUnits} units of ${reqBloodGroup}). Filter updated to show ${reqBloodGroup} donors & blood banks below.`
    );
  };

  return (
    <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      {/* Header & Mandatory Medical Safety Disclaimer */}
      <div className="space-y-4 border-b border-slate-800/80 pb-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <p className="text-xs font-medium text-orange-400">
              BLOOD DONATION NETWORK · REGISTERED DONORS & VERIFIED BLOOD BANK DIRECTORY (DEMO)
            </p>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
              Community Blood & Plasma Response Network
            </h1>
          </div>
          <div className="text-xs text-slate-400 font-mono tabular-nums">
            Donors Listed: {donors.length} (Demo) · Blood Banks: {bloodBanks.length} (Demo)
          </div>
        </div>

        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3.5 flex items-start gap-3 text-xs text-amber-200/95">
          <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <p>
            <strong>Clinical Safety Notice:</strong> This module coordinates community donor outreach using demo records
            and never automatically promises blood availability or confirms a medical cross-match. All transfusions
            require formal hospital laboratory screening and cross-matching.
          </p>
        </div>
      </div>

      {/* Interactive Blood Requisition & Quick Selector Panel */}
      <div className="bg-slate-900/75 border border-slate-800 rounded-2xl p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Droplets className="w-4 h-4 text-rose-500" />
              Choose Blood Group, Location, Urgency & Units Required
            </h2>
            <p className="text-xs text-slate-400">
              Select a blood group below to filter matching donors or broadcast an urgent hospital blood alert
            </p>
          </div>
          <button
            type="button"
            onClick={() => setSelectedGroup('ALL')}
            className="text-xs text-cyan-400 hover:text-cyan-300 font-medium self-start sm:self-auto cursor-pointer"
          >
            Show All 8 Blood Groups
          </button>
        </div>

        {/* 8 Blood Group Selector Buttons */}
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-2.5">
          {ALL_BLOOD_GROUPS.map((bg) => {
            const isSelected = selectedGroup === bg;
            return (
              <button
                key={bg}
                type="button"
                onClick={() => {
                  setSelectedGroup(isSelected ? 'ALL' : bg);
                  setReqBloodGroup(bg);
                }}
                className={`py-3 px-2 rounded-xl border font-mono text-base font-extrabold transition-all cursor-pointer flex flex-col items-center justify-center ${
                  isSelected
                    ? 'bg-rose-600 border-rose-400 text-white shadow-lg shadow-rose-600/30'
                    : 'bg-slate-950/80 border-slate-800 text-slate-200 hover:border-rose-500/50'
                }`}
              >
                <span>{bg}</span>
                <span className="text-[10px] font-sans font-normal text-slate-400 mt-0.5">
                  {donors.filter((d) => d.bloodGroup === bg).length} donor(s)
                </span>
              </button>
            );
          })}
        </div>

        {/* Broadcast Urgent Blood Requisition Form */}
        <form
          onSubmit={handleBroadcastBloodRequest}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-2 border-t border-slate-800/80"
        >
          <div>
            <label htmlFor="blood-req-loc" className="block text-[11px] text-slate-400 mb-1">
              Hospital / Location *
            </label>
            <input
              id="blood-req-loc"
              type="text"
              value={reqLocation}
              onChange={(e) => setReqLocation(e.target.value)}
              placeholder="Hospital name and sector"
              className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label htmlFor="blood-req-contact" className="block text-[11px] text-slate-400 mb-1">
              Contact Phone *
            </label>
            <input
              id="blood-req-contact"
              type="tel"
              value={reqContact}
              onChange={(e) => setReqContact(e.target.value)}
              placeholder="+91 98400-XXXXX"
              className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-white font-mono tabular-nums focus:border-cyan-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label htmlFor="blood-req-urgency" className="block text-[11px] text-slate-400 mb-1">
              Urgency Level
            </label>
            <select
              id="blood-req-urgency"
              value={reqUrgency}
              onChange={(e) => setReqUrgency(e.target.value as BloodUrgentRequest['urgency'])}
              className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none"
            >
              <option value="Immediate (Within 1 hr)">Immediate (Within 1 hr)</option>
              <option value="Urgent (Within 4 hrs)">Urgent (Within 4 hrs)</option>
              <option value="Scheduled (24 hrs)">Scheduled (24 hrs)</option>
            </select>
          </div>

          <div>
            <label htmlFor="blood-req-units" className="block text-[11px] text-slate-400 mb-1">
              Units Required ({reqBloodGroup})
            </label>
            <input
              id="blood-req-units"
              type="number"
              min={1}
              max={15}
              value={reqUnits}
              onChange={(e) => setReqUnits(Math.max(1, parseInt(e.target.value || '1', 10)))}
              className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-white font-mono tabular-nums focus:border-cyan-500 focus:outline-none"
            />
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              className="w-full py-2 px-4 rounded-xl bg-gradient-to-r from-rose-600 to-orange-500 hover:from-rose-500 hover:to-orange-400 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer h-[34px]"
            >
              <Plus className="w-4 h-4" />
              Log Blood Request
            </button>
          </div>
        </form>

        {requestBannerSuccess && (
          <div className="rounded-xl bg-emerald-500/15 border border-emerald-500/40 px-4 py-2.5 text-xs text-emerald-300 flex items-center justify-between">
            <span>{requestBannerSuccess}</span>
            <button
              type="button"
              onClick={() => setRequestBannerSuccess(null)}
              className="text-emerald-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Filter Bar for Donor Directory */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900/60 border border-slate-800 rounded-xl p-4">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          <div className="relative min-w-[220px] flex-1 max-w-xs">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search donor name or city sector..."
              className="w-full rounded-lg bg-slate-950 border border-slate-800 pl-9 pr-3 py-1.5 text-xs text-white focus:border-cyan-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-300">
            <Filter className="w-3.5 h-3.5 text-cyan-400" />
            <span>Max Distance:</span>
            <select
              value={maxDistanceKm}
              onChange={(e) => setMaxDistanceKm(Number(e.target.value))}
              className="rounded-lg bg-slate-950 border border-slate-800 px-2.5 py-1.5 text-xs text-white font-mono"
            >
              <option value={2}>Within 2 km</option>
              <option value={4}>Within 4 km</option>
              <option value={6}>Within 6 km</option>
              <option value={10}>Within 10 km (All)</option>
            </select>
          </div>

          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
            <button
              type="button"
              onClick={() => setAvailabilityFilter('ALL')}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
                availabilityFilter === 'ALL' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              All Statuses
            </button>
            <button
              type="button"
              onClick={() => setAvailabilityFilter('Available Now')}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
                availabilityFilter === 'Available Now'
                  ? 'bg-emerald-500/20 text-emerald-300'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Available Now Only
            </button>
          </div>
        </div>

        <div className="text-xs text-slate-400 font-mono tabular-nums">
          Showing {filteredDonors.length} of {donors.length} Demo Donors
        </div>
      </div>

      {/* SECTION A: Registered Community Donors Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">
            Registered Community Blood Donors (Demo Records)
          </h2>
          <span className="text-xs text-slate-400">
            Filter: {selectedGroup === 'ALL' ? 'All Blood Groups' : `Blood Group ${selectedGroup}`}
          </span>
        </div>

        {filteredDonors.length === 0 ? (
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-10 text-center space-y-3">
            <AlertCircle className="w-8 h-8 text-slate-400 mx-auto" />
            <p className="text-sm font-semibold text-white">No donors match your current filter criteria</p>
            <button
              type="button"
              onClick={() => {
                setSelectedGroup('ALL');
                setMaxDistanceKm(10);
                setAvailabilityFilter('ALL');
                setSearchQuery('');
              }}
              className="px-4 py-2 rounded-xl bg-slate-800 text-xs font-semibold text-cyan-300 hover:bg-slate-700 cursor-pointer"
            >
              Reset All Blood Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {filteredDonors.map((donor) => (
              <div
                key={donor.id}
                className="bg-slate-900/75 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 flex flex-col justify-between space-y-4 transition-all"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-[11px] text-cyan-400 font-medium">{donor.recordType}</p>
                      <h3 className="text-base font-bold text-white mt-0.5">{donor.name}</h3>
                    </div>
                    <div className="w-11 h-11 rounded-xl bg-rose-500/15 border border-rose-500/40 flex items-center justify-center font-mono text-base font-extrabold text-rose-400 shrink-0">
                      {donor.bloodGroup}
                    </div>
                  </div>

                  <div className="space-y-1 text-xs text-slate-300">
                    <p className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{donor.sector}</span>
                      <span>·</span>
                      <span className="font-mono text-cyan-300 tabular-nums">~{donor.distanceKm} km</span>
                    </p>
                    <p className="flex items-center gap-1.5">
                      <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                      <span
                        className={
                          donor.availability === 'Available Now' ? 'text-emerald-400 font-medium' : 'text-amber-400'
                        }
                      >
                        {donor.availability}
                      </span>
                      <span>·</span>
                      <span className="text-slate-500">{donor.lastVerified}</span>
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                  <span className="text-[11px] font-mono text-slate-400">{donor.phoneMasked}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedContactTarget({
                        name: donor.name,
                        bloodGroup: donor.bloodGroup,
                        type: donor.recordType,
                        sector: donor.sector,
                        phone: donor.phoneMasked,
                      });
                      setContactConfirmed(false);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-200 text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Request / Contact
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SECTION B: Verified Regional Blood Banks Directory */}
      <div className="space-y-4 pt-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Building2 className="w-5 h-5 text-orange-400" />
              Verified Blood Banks & Storage Centres (Demo Directory)
            </h2>
            <p className="text-xs text-slate-400">
              Clearly distinguished institutional blood bank records with approximate unit inventory by group
            </p>
          </div>
          <span className="text-xs text-amber-300">Hospital Cross-Match Required Prior to Issue</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {bloodBanks.map((bank) => (
            <div
              key={bank.id}
              className="bg-slate-900/75 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="text-[11px] text-orange-400 font-medium">{bank.verifiedSource}</div>
                <h3 className="text-base font-bold text-white">{bank.name}</h3>
                <p className="text-xs text-slate-300">
                  {bank.address} · <span className="font-mono text-cyan-400">~{bank.distanceKm} km away</span>
                </p>
                <p className="text-xs text-slate-400">
                  {bank.hours} · Tel: <span className="font-mono text-slate-200">{bank.phone}</span>
                </p>

                {/* Inventory Matrix */}
                <div className="pt-2">
                  <span className="text-[11px] text-slate-400 block mb-2">
                    Sample Demo Inventory (Units in Stock):
                  </span>
                  <div className="grid grid-cols-4 gap-1.5 font-mono text-xs tabular-nums">
                    {ALL_BLOOD_GROUPS.map((bg) => (
                      <div
                        key={bg}
                        className={`p-1.5 rounded-lg border text-center ${
                          selectedGroup === bg
                            ? 'bg-rose-500/20 border-rose-500 text-white font-bold'
                            : 'bg-slate-950/80 border-slate-800 text-slate-300'
                        }`}
                      >
                        <span className="text-[10px] text-slate-400 block">{bg}</span>
                        <span className="font-bold">{bank.inventory[bg]}u</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                <span className="text-xs text-slate-400">24/7 Emergency Desk</span>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedContactTarget({
                      name: bank.name,
                      bloodGroup: selectedGroup === 'ALL' ? 'All Groups' : selectedGroup,
                      type: bank.verifiedSource,
                      sector: bank.sector,
                      phone: bank.phone,
                    });
                    setContactConfirmed(false);
                  }}
                  className="px-3.5 py-1.5 rounded-lg bg-orange-500/20 hover:bg-orange-500/30 border border-orange-500/40 text-orange-300 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  <Phone className="w-3.5 h-3.5" />
                  Contact Blood Bank
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Active Urgent Blood Requisitions List */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-3">
        <h3 className="text-sm font-bold text-white">Active Hospital Blood Alerts (Demo Feed)</h3>
        <div className="divide-y divide-slate-800">
          {urgentRequests.map((req) => (
            <div key={req.id} className="py-3 first:pt-0 last:pb-0 flex flex-wrap items-center justify-between gap-3">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2 text-xs">
                  <span className="font-mono font-bold text-rose-400">{req.bloodGroup}</span>
                  <span>·</span>
                  <span className="font-semibold text-white">{req.patientIdentifier}</span>
                  <span>·</span>
                  <span className="text-amber-300">{req.urgency}</span>
                </div>
                <p className="text-xs text-slate-400">
                  {req.hospitalName} · {req.unitsRequired} Units Required · Logged {req.createdAt}
                </p>
              </div>
              <span className="text-xs font-mono text-cyan-400">{req.status}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Contact / Requisition Modal */}
      {selectedContactTarget && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <p className="text-xs text-orange-400 font-medium">{selectedContactTarget.type}</p>
                <h3 className="text-lg font-bold text-white">{selectedContactTarget.name}</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedContactTarget(null)}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs text-slate-300 bg-slate-950 p-4 rounded-xl border border-slate-800">
              <p>
                <strong>Target Group:</strong> <span className="font-mono text-rose-400">{selectedContactTarget.bloodGroup}</span>
              </p>
              <p>
                <strong>Location Sector:</strong> {selectedContactTarget.sector}
              </p>
              <p>
                <strong>Contact Line (Demo):</strong> <span className="font-mono">{selectedContactTarget.phone}</span>
              </p>
              <p className="text-amber-300/90 pt-1">
                Note: Sending an alert notifies this donor/blood bank in the demo environment. It does not guarantee
                donor eligibility or clinical cross-match compatibility.
              </p>
            </div>

            {contactConfirmed ? (
              <div className="rounded-xl bg-emerald-500/15 border border-emerald-500/40 p-3.5 text-xs text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Demo Outreach Notification Sent. Coordinator desk copied.</span>
              </div>
            ) : (
              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedContactTarget(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-xs font-semibold text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => setContactConfirmed(true)}
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold cursor-pointer"
                >
                  Send Demo Standby Request
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
