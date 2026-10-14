import React, { useState } from 'react';
import {
  Award,
  CheckCircle2,
  ShieldAlert,
  Users,
} from 'lucide-react';
import { PageId, VolunteerProfile, VolunteerSkill } from '../types';

interface VolunteerPageProps {
  volunteers: VolunteerProfile[];
  onRegisterVolunteer: (vol: VolunteerProfile) => void;
  onToggleVolunteerAvailability: (id: string) => void;
  onNavigate: (page: PageId) => void;
}

const ALL_SKILLS: VolunteerSkill[] = [
  'First Aid',
  'Transport',
  'Blood Donation',
  'Search Support',
  'Food Distribution',
  'Medical Support',
];

export const VolunteerPage: React.FC<VolunteerPageProps> = ({
  volunteers,
  onRegisterVolunteer,
  onToggleVolunteerAvailability,
  onNavigate,
}) => {
  const [fullName, setFullName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [city, setCity] = useState<string>('Chennai Metro');
  const [preferredArea, setPreferredArea] = useState<string>('Central District');
  const [selectedSkills, setSelectedSkills] = useState<VolunteerSkill[]>(['First Aid', 'Transport']);
  const [availability, setAvailability] = useState<boolean>(true);
  const [experienceLevel, setExperienceLevel] =
    useState<VolunteerProfile['experienceLevel']>('Trained Community Volunteer');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [registeredProfile, setRegisteredProfile] = useState<VolunteerProfile | null>(null);

  const toggleSkill = (skill: VolunteerSkill) => {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const nextErrors: Record<string, string> = {};

    if (!fullName.trim() || fullName.trim().length < 3) {
      nextErrors.fullName = 'Please enter your full name (at least 3 characters).';
    }
    if (!phone.trim() || phone.trim().length < 7) {
      nextErrors.phone = 'Please enter a valid contact phone number.';
    }
    if (!email.trim() || !email.includes('@')) {
      nextErrors.email = 'Please enter a valid email address.';
    }
    if (selectedSkills.length === 0) {
      nextErrors.skills = 'Please select at least one emergency support skill.';
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const newVol: VolunteerProfile = {
      id: `VOL-${Math.floor(400 + Math.random() * 599)}`,
      fullName: fullName.trim(),
      phone: phone.trim(),
      email: email.trim(),
      city: city.trim() || 'Chennai Metro',
      preferredArea,
      skills: selectedSkills,
      availability,
      experienceLevel,
      missionsCompleted: 0,
      joinedAt: new Date().toISOString().slice(0, 10),
      coords: {
        x: Math.floor(25 + Math.random() * 55),
        y: Math.floor(25 + Math.random() * 55),
      },
      isDemoData: true,
    };

    onRegisterVolunteer(newVol);
    setRegisteredProfile(newVol);
  };

  const previewName = fullName.trim() || 'Your Responder Name';
  const previewInitials = previewName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  if (registeredProfile) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        <div className="bg-slate-900/90 border border-emerald-500/40 rounded-2xl p-6 sm:p-10 space-y-6 shadow-2xl">
          <div className="flex items-center justify-between flex-wrap gap-4 border-b border-slate-800 pb-5">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <div>
                <p className="text-xs font-semibold text-emerald-400">VOLUNTEER REGISTRATION COMPLETE (DEMO)</p>
                <h2 className="text-2xl font-extrabold text-white">Welcome to Rapid Rescue 360°</h2>
              </div>
            </div>
            <div className="text-right font-mono tabular-nums">
              <span className="text-xs text-slate-400 block">RESPONDER ID</span>
              <span className="text-xl font-bold text-cyan-400">{registeredProfile.id}</span>
            </div>
          </div>

          {/* Minted Volunteer Badge */}
          <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-950/40 border border-cyan-500/40 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between text-xs text-cyan-400 font-mono">
              <span>RAPID RESCUE 360° · COMMUNITY RESPONDER BADGE</span>
              <span>{registeredProfile.availability ? 'AVAILABLE FOR DISPATCH' : 'ON STANDBY'}</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-cyan-500/20 border border-cyan-400/50 flex items-center justify-center text-xl font-extrabold text-cyan-300 font-display">
                {previewInitials}
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">{registeredProfile.fullName}</h3>
                <p className="text-xs text-slate-300">
                  {registeredProfile.experienceLevel} · {registeredProfile.preferredArea}, {registeredProfile.city}
                </p>
                <p className="text-xs text-cyan-300 mt-1">
                  Skills: {registeredProfile.skills.join(' · ')}
                </p>
              </div>
            </div>
            <p className="text-[11px] text-slate-400 border-t border-slate-800 pt-3">
              Transparency Notice: Self-reported demo responder profile. Formal background or clinical credential
              verification is not claimed in prototype mode.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => {
                setRegisteredProfile(null);
                setFullName('');
                setPhone('');
                setEmail('');
              }}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 cursor-pointer"
            >
              Register Another Volunteer
            </button>
            <button
              type="button"
              onClick={() => onNavigate('live-response')}
              className="px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs cursor-pointer"
            >
              View Live Rescue Dispatches
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div>
          <p className="text-xs font-medium text-emerald-400">VOLUNTEER ONBOARDING & CREDENTIAL HUB</p>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
            Become a Community Emergency Responder
          </h1>
        </div>
        <p className="text-xs text-slate-400 max-w-md">
          Register your emergency skills and preferred service sector. Preview your live responder badge in real time.
        </p>
      </div>

      {/* Onboarding Form (7 Cols) + Live Profile & Badge Preview (5 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <form
          onSubmit={handleSubmit}
          noValidate
          className="lg:col-span-7 bg-slate-900/75 border border-slate-800 rounded-2xl p-6 space-y-5"
        >
          <h2 className="text-base font-bold text-white border-b border-slate-800 pb-3">
            Responder Profile & Skill Selection
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="vol-name" className="block text-xs font-medium text-slate-300">
                Full Name *
              </label>
              <input
                id="vol-name"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g., Dr. Ananya Krishnan"
                className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2.5 text-sm text-white focus:border-cyan-500 focus:outline-none"
              />
              {errors.fullName && <p className="text-xs text-rose-400">{errors.fullName}</p>}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="vol-phone" className="block text-xs font-medium text-slate-300">
                Phone Number *
              </label>
              <input
                id="vol-phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98400-XXXXX"
                className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2.5 text-sm text-white font-mono tabular-nums focus:border-cyan-500 focus:outline-none"
              />
              {errors.phone && <p className="text-xs text-rose-400">{errors.phone}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="vol-email" className="block text-xs font-medium text-slate-300">
                Email Address *
              </label>
              <input
                id="vol-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="responder@domain.org"
                className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2.5 text-sm text-white focus:border-cyan-500 focus:outline-none"
              />
              {errors.email && <p className="text-xs text-rose-400">{errors.email}</p>}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="vol-city" className="block text-xs font-medium text-slate-300">
                City / Metro Region
              </label>
              <input
                id="vol-city"
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2.5 text-sm text-white focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="vol-sector" className="block text-xs font-medium text-slate-300">
                Preferred Service Area
              </label>
              <select
                id="vol-sector"
                value={preferredArea}
                onChange={(e) => setPreferredArea(e.target.value)}
                className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2.5 text-sm text-white focus:border-cyan-500 focus:outline-none"
              >
                <option value="Central District">Central District</option>
                <option value="Sector 4 North">Sector 4 North</option>
                <option value="Medical Hub East">Medical Hub East</option>
                <option value="South Basin">South Basin</option>
                <option value="Transit Core">Transit Core</option>
                <option value="Tech Corridor">Tech Corridor</option>
              </select>
            </div>
          </div>

          {/* Selectable Emergency Skills */}
          <div className="space-y-2">
            <span className="block text-xs font-medium text-slate-300">
              Select Emergency Response Skills * (Click to toggle)
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {ALL_SKILLS.map((skill) => {
                const active = selectedSkills.includes(skill);
                return (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => toggleSkill(skill)}
                    className={`px-3.5 py-2.5 rounded-xl border text-xs font-semibold text-left transition-all cursor-pointer flex items-center justify-between ${
                      active
                        ? 'bg-emerald-500/15 border-emerald-500 text-emerald-300'
                        : 'bg-slate-950/80 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <span>{skill}</span>
                    {active && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
                  </button>
                );
              })}
            </div>
            {errors.skills && <p className="text-xs text-rose-400">{errors.skills}</p>}
          </div>

          {/* Experience Level & Availability Toggle */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div className="space-y-1.5">
              <label htmlFor="vol-exp" className="block text-xs font-medium text-slate-300">
                Emergency-Response Experience
              </label>
              <select
                id="vol-exp"
                value={experienceLevel}
                onChange={(e) =>
                  setExperienceLevel(e.target.value as VolunteerProfile['experienceLevel'])
                }
                className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2.5 text-sm text-white focus:border-cyan-500 focus:outline-none"
              >
                <option value="Medical Professional">Medical Professional (Doctor / Nurse / EMT)</option>
                <option value="Certified First Responder">Certified First Responder (CPR / AED)</option>
                <option value="Trained Community Volunteer">Trained Community Volunteer</option>
                <option value="New Volunteer">New Volunteer (Ready for Orientation)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <span className="block text-xs font-medium text-slate-300">Initial Dispatch Availability</span>
              <button
                type="button"
                onClick={() => setAvailability((a) => !a)}
                className={`w-full rounded-xl border px-4 py-2.5 text-xs font-bold flex items-center justify-between transition-colors cursor-pointer ${
                  availability
                    ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-300'
                    : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}
              >
                <span>{availability ? 'Available for Immediate Alerts' : 'On Standby / Offline'}</span>
                <span className="font-mono underline">Toggle</span>
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-extrabold text-sm shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
          >
            COMPLETE VOLUNTEER REGISTRATION
          </button>
        </form>

        {/* Right 5 Cols: Real-Time Volunteer Badge & Profile Preview */}
        <div className="lg:col-span-5 space-y-5">
          <div className="bg-gradient-to-br from-slate-900 via-[#0B1528] to-cyan-950/40 border border-cyan-500/40 rounded-2xl p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400">
                <Award className="w-4 h-4" />
                <span>LIVE VOLUNTEER BADGE PREVIEW</span>
              </div>
              <span className="text-xs font-mono text-slate-400">PROTOTYPE CREDENTIAL</span>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-cyan-500/20 border border-cyan-400/50 flex items-center justify-center text-xl font-extrabold text-cyan-300 shrink-0">
                {previewInitials}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-mono text-emerald-400">
                  {availability ? 'STATUS: AVAILABLE FOR DISPATCH' : 'STATUS: STANDBY'}
                </p>
                <h3 className="text-xl font-bold text-white truncate">{previewName}</h3>
                <p className="text-xs text-slate-300 truncate">{experienceLevel}</p>
              </div>
            </div>

            <div className="bg-slate-950/75 border border-slate-800/90 rounded-xl p-4 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Service Sector:</span>
                <span className="text-white font-semibold">
                  {preferredArea}, {city || 'Chennai Metro'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Contact Phone:</span>
                <span className="text-slate-200 font-mono">{phone || '+91 XXXXX-XXXXX'}</span>
              </div>
              <div className="pt-2 border-t border-slate-800/80">
                <span className="text-slate-400 block mb-1">Selected Responder Skills:</span>
                <p className="text-cyan-300 font-medium">
                  {selectedSkills.length > 0 ? selectedSkills.join(' · ') : 'None selected yet'}
                </p>
              </div>
            </div>

            <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 text-[11px] text-amber-200/90 flex items-start gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>
                Note: This badge represents a self-reported demo volunteer profile. Background verification is not
                claimed in prototype mode.
              </span>
            </div>
          </div>

          {/* Active Volunteer Roster with Instant Availability Toggle */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-cyan-400" />
                Active Community Responder Roster (Demo)
              </h3>
              <span className="text-xs font-mono text-slate-400 tabular-nums">
                {volunteers.filter((v) => v.availability).length}/{volunteers.length} Ready
              </span>
            </div>
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {volunteers.map((v) => (
                <div
                  key={v.id}
                  className="bg-slate-950/75 border border-slate-800 rounded-xl p-3 flex items-center justify-between gap-2 text-xs"
                >
                  <div className="min-w-0">
                    <p className="font-bold text-white truncate">
                      {v.fullName} <span className="text-slate-500 font-mono">({v.id})</span>
                    </p>
                    <p className="text-slate-400 truncate">
                      {v.preferredArea} · {v.skills.join(', ')}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onToggleVolunteerAvailability(v.id)}
                    className={`px-2.5 py-1 rounded-lg font-semibold shrink-0 transition-colors cursor-pointer ${
                      v.availability
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {v.availability ? 'Available' : 'Standby'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
