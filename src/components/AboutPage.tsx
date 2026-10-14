 import React from 'react';
import { ShieldCheck, Layers, Cpu, Lock, ArrowRight } from 'lucide-react';
import { PageId } from '../types';

interface AboutPageProps {
  onNavigate: (page: PageId) => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ onNavigate }) => {
  return (
    <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      <div className="bg-slate-900/75 border border-slate-800 rounded-2xl p-6 sm:p-10 space-y-6">
        <div className="text-xs font-medium text-cyan-400">
          ABOUT RAPID RESCUE 360° · PROTOTYPE ARCHITECTURE & SAFETY ETHICS
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight max-w-3xl">
          Designed to Bridge the Critical Golden-Hour Gap Between Citizens, Volunteers, and Medical Hubs.
        </h1>
        <p className="text-base text-slate-300 leading-relaxed max-w-3xl">
          Rapid Rescue 360° is a connected emergency response prototype built to demonstrate how hyper-local community
          volunteers, verified blood banks, missing-person alerts, and municipal dispatchers can collaborate on a single
          spatial platform.
        </p>

        <div className="flex flex-wrap gap-3 pt-2">
          <button
            type="button"
            onClick={() => onNavigate('need-help')}
            className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-colors flex items-center gap-2 cursor-pointer"
          >
            Launch Emergency Request Demo
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => onNavigate('command')}
            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
          >
            Inspect Coordinator Command Centre
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-3">
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-semibold">
            <Cpu className="w-4 h-4" />
            <span>01. Real-Time Spatial & 3D Visualization</span>
          </div>
          <h3 className="text-lg font-bold text-white">Interactive 3D City & Tactical Routing</h3>
          <p className="text-sm text-slate-300 leading-relaxed">
            Built with Three.js WebGL and interactive vector telemetry maps, giving citizens and coordinators immediate
            spatial awareness of nearby responders, hospitals, and blood banks with full reduced-motion and 2D fallback
            support.
          </p>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-3">
          <div className="flex items-center gap-2 text-orange-400 text-xs font-semibold">
            <ShieldCheck className="w-4 h-4" />
            <span>02. Ethical Medical & Dispatch Transparency</span>
          </div>
          <h3 className="text-lg font-bold text-white">Zero False Promises or Unverified Claims</h3>
          <p className="text-sm text-slate-300 leading-relaxed">
            All sample telemetry, calculated route ETAs, and donor records are transparently labelled as demo data.
            Blood network alerts never promise clinical cross-match compatibility, and volunteer badges clearly state
            their prototype verification scope.
          </p>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-3">
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold">
            <Lock className="w-4 h-4" />
            <span>03. Privacy-Conscious Missing Persons Workflow</span>
          </div>
          <h3 className="text-lg font-bold text-white">Protected Personal Identifiers</h3>
          <p className="text-sm text-slate-300 leading-relaxed">
            Missing-person reports mask private family phone numbers on public views and route community sightings
            through authorized case coordinators to prevent misuse or harassment.
          </p>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-3">
          <div className="flex items-center gap-2 text-violet-400 text-xs font-semibold">
            <Layers className="w-4 h-4" />
            <span>04. Multi-Role Demo Switching</span>
          </div>
          <h3 className="text-lg font-bold text-white">Citizen, Volunteer & Coordinator Views</h3>
          <p className="text-sm text-slate-300 leading-relaxed">
            Switch roles anytime using the top account modal or workspace bar to test submitting an emergency as a
            Citizen, accepting dispatches as a Volunteer, or managing city-wide operations as a Coordinator.
          </p>
        </div>
      </div>
    </div>
  );
};
