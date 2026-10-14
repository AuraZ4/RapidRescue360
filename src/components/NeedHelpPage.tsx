import React, { useEffect, useRef, useState } from 'react';
import {
  AlertCircle,
  Ambulance,
  CheckCircle2,
  Compass,
  Droplets,
  Flame,
  HeartPulse,
  ImagePlus,
  LocateFixed,
  MapPin,
  Phone,
  Search,
  Siren,
  Trash2,
  Users,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import {
  Coordinates,
  EmergencyCategory,
  EmergencyRequest,
  PageId,
  PriorityLevel,
} from '../types';
import { triageEmergencyWithGemini, AITriageResult } from '../services/geminiService';
import {
  createGoogleMapsMarker,
  GoogleMapsApi,
  GoogleMapsEventListener,
  GoogleMapsLatLngBounds,
  GoogleMapsMap,
  GoogleMapsMarker,
  GoogleMapsPolyline,
  isGoogleMapsConfigured,
  loadGoogleMaps,
} from '../services/googleMaps';

interface NeedHelpPageProps {
  onSubmitEmergency: (newRequest: EmergencyRequest) => void;
  onNavigate: (page: PageId) => void;
  onSelectEmergencyForTracking: (id: string) => void;
}

interface CategoryConfig {
  id: EmergencyCategory;
  label: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  accentBorder: string;
  accentBg: string;
  accentText: string;
  defaultPriority: PriorityLevel;
}

const EMERGENCY_CATEGORIES: CategoryConfig[] = [
  {
    id: 'Medical Emergency',
    label: 'Medical Emergency',
    subtitle: 'Cardiac, trauma, breathing, or urgent paramedic care',
    icon: HeartPulse,
    accentBorder: 'border-rose-500',
    accentBg: 'bg-rose-500/15',
    accentText: 'text-rose-400',
    defaultPriority: 'Critical',
  },
  {
    id: 'Blood Donation',
    label: 'Blood Donation',
    subtitle: 'Urgent whole blood, platelets, or plasma requirement',
    icon: Droplets,
    accentBorder: 'border-orange-500',
    accentBg: 'bg-orange-500/15',
    accentText: 'text-orange-400',
    defaultPriority: 'High',
  },
  {
    id: 'Missing Person',
    label: 'Missing Person',
    subtitle: 'Lost child, elderly person with dementia, or separated individual',
    icon: Search,
    accentBorder: 'border-amber-500',
    accentBg: 'bg-amber-500/15',
    accentText: 'text-amber-400',
    defaultPriority: 'Critical',
  },
  {
    id: 'Accident / Rescue',
    label: 'Accident / Rescue',
    subtitle: 'Road collision, vehicle entrapment, or structural hazard',
    icon: Ambulance,
    accentBorder: 'border-cyan-500',
    accentBg: 'bg-cyan-500/15',
    accentText: 'text-cyan-400',
    defaultPriority: 'Critical',
  },
  {
    id: 'Disaster Relief',
    label: 'Disaster Relief',
    subtitle: 'Flood evacuation, storm shelter, food & clean water drop',
    icon: Flame,
    accentBorder: 'border-violet-500',
    accentBg: 'bg-violet-500/15',
    accentText: 'text-violet-400',
    defaultPriority: 'High',
  },
  {
    id: 'Other Emergency',
    label: 'Other Emergency',
    subtitle: 'Fallen power lines, road obstruction, or neighborhood safety',
    icon: AlertCircle,
    accentBorder: 'border-sky-500',
    accentBg: 'bg-sky-500/15',
    accentText: 'text-sky-400',
    defaultPriority: 'Moderate',
  },
];

const SECTORS = [
  { name: 'Central District', xRange: [30, 55], yRange: [35, 60] },
  { name: 'Sector 4 North', xRange: [55, 85], yRange: [15, 45] },
  { name: 'Medical Hub East', xRange: [60, 90], yRange: [45, 75] },
  { name: 'South Basin', xRange: [15, 50], yRange: [60, 90] },
  { name: 'Transit Core', xRange: [40, 65], yRange: [10, 35] },
  { name: 'Tech Corridor', xRange: [65, 95], yRange: [10, 35] },
];

function inferSectorFromCoords(x: number, y: number): string {
  for (const s of SECTORS) {
    if (x >= s.xRange[0] && x <= s.xRange[1] && y >= s.yRange[0] && y <= s.yRange[1]) {
      return s.name;
    }
  }
  return 'Central District';
}

export const NeedHelpPage: React.FC<NeedHelpPageProps> = ({
  onSubmitEmergency,
  onNavigate,
  onSelectEmergencyForTracking,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapMarkerRef = useRef<GoogleMapsMarker | null>(null);
  const hospitalMarkerRef = useRef<GoogleMapsMarker | null>(null);
  const routeRef = useRef<GoogleMapsPolyline | null>(null);
  const mapClickListenerRef = useRef<GoogleMapsEventListener | null>(null);
  const [googleMaps, setGoogleMaps] = useState<GoogleMapsApi | null>(null);
  const [googleMap, setGoogleMap] = useState<GoogleMapsMap | null>(null);
  const [mapError, setMapError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<EmergencyCategory>('Medical Emergency');
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [address, setAddress] = useState<string>('Block B-104, Metro Concourse Road, Central District');
  const [coords, setCoords] = useState<Coordinates>({
    x: 48,
    y: 44,
    lat: 13.0827,
    lng: 80.2707,
  });
  const [gpsStatus, setGpsStatus] = useState<string>('Interactive Demo Pin Ready (Click map to move pin)');
  const [victimsCount, setVictimsCount] = useState<number>(1);
  const [volunteersNeeded, setVolunteersNeeded] = useState<number>(3);
  const [priority, setPriority] = useState<PriorityLevel>('Critical');
  const [contactPhone, setContactPhone] = useState<string>('+91 98400-51200');
  const [imagePreview, setImagePreview] = useState<string | undefined>(undefined);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submittedRequest, setSubmittedRequest] = useState<EmergencyRequest | null>(null);

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
            center: { lat: coords.lat, lng: coords.lng },
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
      mapClickListenerRef.current?.remove();
      mapMarkerRef.current = null;
      if (window.gm_authFailure === handleMapsAuthFailure) {
        delete window.gm_authFailure;
      }
    };
  }, []);

  useEffect(() => {
    if (!googleMaps || !googleMap) return;

    const marker = createGoogleMapsMarker(
      googleMaps,
      googleMap,
      { lat: coords.lat, lng: coords.lng },
      'Emergency location pin',
      '!',
      '#ea4335',
    );
    mapMarkerRef.current = marker;
    hospitalMarkerRef.current = createGoogleMapsMarker(
      googleMaps,
      googleMap,
      { lat: 13.0827, lng: 80.2707 },
      'Central Trauma Hub (demo)',
      'H',
      '#34a853',
    );
    routeRef.current = new googleMaps.Polyline({
      map: googleMap,
      path: [
        { lat: 13.0827, lng: 80.2707 },
        { lat: coords.lat, lng: coords.lng },
      ],
      strokeColor: '#06b6d4',
      strokeOpacity: 0.8,
      strokeWeight: 4,
    });
    mapClickListenerRef.current = googleMap.addListener('click', (event) => {
      if (!event.latLng) return;
      const latitude = event.latLng.lat();
      const longitude = event.latLng.lng();
      if (latitude < 12.7 || latitude > 13.5 || longitude < 79 || longitude > 81) return;
      updateMapPin(latitude, longitude);
    });

    return () => {
      mapClickListenerRef.current?.remove();
      mapClickListenerRef.current = null;
      marker.map = null;
      if (hospitalMarkerRef.current) hospitalMarkerRef.current.map = null;
      hospitalMarkerRef.current = null;
      routeRef.current?.setMap(null);
      routeRef.current = null;
      mapMarkerRef.current = null;
    };
  }, [googleMap, googleMaps]);

  useEffect(() => {
    if (!googleMap || !mapMarkerRef.current || !routeRef.current) return;
    const position = { lat: coords.lat, lng: coords.lng };
    mapMarkerRef.current.position = position;
    googleMap.setCenter(position);
    routeRef.current.setPath([{ lat: 13.0827, lng: 80.2707 }, position]);
  }, [coords.lat, coords.lng, googleMap]);

  const handleCategorySelect = (cat: CategoryConfig) => {
    setSelectedCategory(cat.id);
    setPriority(cat.defaultPriority);
  };

  const updateMapPin = (latitude: number, longitude: number) => {
    const lat = Number(latitude.toFixed(4));
    const lng = Number(longitude.toFixed(4));
    const x = Math.max(0, Math.min(100, Math.round(((lng - 80.1) / 0.25) * 100)));
    const y = Math.max(0, Math.min(100, Math.round(100 - ((lat - 12.9) / 0.35) * 100)));
    const sector = inferSectorFromCoords(x, y);

    setCoords({ x, y, lat, lng });
    setAddress(`Map Pin (${lat}° N, ${lng}° E), ${sector}`);
    setGpsStatus(`Map Pin Updated — ${sector}`);
  };

  const handleMapSurfaceClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target instanceof Element && event.target.closest('button, a, [role="button"]')) return;

    const bounds = googleMap?.getBounds();
    const rect = event.currentTarget.getBoundingClientRect();
    if (!rect.width || !rect.height) return;

    const clickX = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
    const clickY = Math.max(0, Math.min(1, (event.clientY - rect.top) / rect.height));
    const { north, south, east, west } = getMapBounds(bounds);
    const northMercator = Math.log(Math.tan(Math.PI / 4 + (north * Math.PI) / 360));
    const southMercator = Math.log(Math.tan(Math.PI / 4 + (south * Math.PI) / 360));
    const latitude =
      Math.atan(Math.sinh(northMercator + (southMercator - northMercator) * clickY)) *
      (180 / Math.PI);
    updateMapPin(latitude, west + (east - west) * clickX);
  };

  const getMapBounds = (
    bounds: GoogleMapsLatLngBounds | undefined,
  ): { north: number; south: number; east: number; west: number } => {
    if (!bounds) return { north: 13.25, south: 12.9, east: 80.35, west: 80.1 };
    const northEast = bounds.getNorthEast();
    const southWest = bounds.getSouthWest();
    const visibleBounds = {
      north: northEast.lat(),
      south: southWest.lat(),
      east: northEast.lng(),
      west: southWest.lng(),
    };
    if (
      !Number.isFinite(visibleBounds.north) ||
      !Number.isFinite(visibleBounds.south) ||
      !Number.isFinite(visibleBounds.east) ||
      !Number.isFinite(visibleBounds.west) ||
      visibleBounds.north - visibleBounds.south > 1 ||
      visibleBounds.east - visibleBounds.west > 1 ||
      visibleBounds.north > 13.5 ||
      visibleBounds.south < 12.7 ||
      visibleBounds.east > 81 ||
      visibleBounds.west < 79
    ) {
      return { north: 13.25, south: 12.9, east: 80.35, west: 80.1 };
    }
    return visibleBounds;
  };

  const [isAnalyzingAi, setIsAnalyzingAi] = useState<boolean>(false);
  const [aiTriageResult, setAiTriageResult] = useState<AITriageResult | null>(null);

  const handleRequestGeolocation = () => {
    setGpsStatus('Requesting device location permission...');
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = Number(pos.coords.latitude.toFixed(4));
          const lng = Number(pos.coords.longitude.toFixed(4));
          // Dynamically map real GPS bounds to relative sector coordinates
          const clampedLat = Math.max(12.90, Math.min(13.25, lat));
          const clampedLng = Math.max(80.10, Math.min(80.35, lng));
          const mapY = Math.max(8, Math.min(92, Math.round(100 - ((clampedLat - 12.90) / 0.35) * 100)));
          const mapX = Math.max(8, Math.min(92, Math.round(((clampedLng - 80.10) / 0.25) * 100)));
          const sector = inferSectorFromCoords(mapX, mapY);

          setCoords({ x: mapX, y: mapY, lat, lng });
          setAddress(`GPS Location (${lat}° N, ${lng}° E), ${sector}`);
          setGpsStatus(`Device GPS Locked: ${lat}° N, ${lng}° E (${sector})`);
        },
        () => {
          // Graceful fallback to simulated GPS lock in sandbox/iframe environments
          const fallbackLat = 13.0854;
          const fallbackLng = 80.2689;
          const sector = inferSectorFromCoords(54, 42);
          setCoords({ x: 54, y: 42, lat: fallbackLat, lng: fallbackLng });
          setAddress(`Simulated GPS Lock (${fallbackLat}° N, ${fallbackLng}° E), ${sector}`);
          setGpsStatus(`Simulated GPS Coordinates Applied (${sector})`);
        },
        { timeout: 4000 }
      );
    } else {
      setGpsStatus('Simulated GPS Coordinates Applied (Geolocation unavailable)');
    }
  };

  const handleRunAiTriage = async () => {
    if (!description.trim() && !title.trim()) return;
    setIsAnalyzingAi(true);
    try {
      const result = await triageEmergencyWithGemini(title, description);
      setAiTriageResult(result);
      setSelectedCategory(result.category);
      setPriority(result.priority);
      setVolunteersNeeded(result.volunteersNeeded);
    } finally {
      setIsAnalyzingAi(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Use offscreen canvas to downscale image to prevent localStorage QuotaExceededError
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const maxDim = 800;
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          setImagePreview(canvas.toDataURL('image/jpeg', 0.75));
        } else {
          setImagePreview(event.target?.result as string);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Calculate Demo Route Distance from Central Hospital (x: 50, y: 50)
  const dx = (coords.x - 50) * 0.12;
  const dy = (coords.y - 50) * 0.12;
  const calculatedDistanceKm = Number(Math.max(0.8, Math.sqrt(dx * dx + dy * dy)).toFixed(1));
  const calculatedEtaMin = Math.max(2, Math.round(calculatedDistanceKm * 1.6));

  const validateAndSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const nextErrors: Record<string, string> = {};

    if (!title.trim() || title.trim().length < 5) {
      nextErrors.title = 'Please enter a descriptive emergency title (at least 5 characters).';
    }
    if (!description.trim() || description.trim().length < 12) {
      nextErrors.description = 'Please describe the situation and immediate assistance needed (at least 12 characters).';
    }
    if (!address.trim()) {
      nextErrors.address = 'Please enter a manual address or click the map to place a location pin.';
    }
    if (!contactPhone.trim() || contactPhone.trim().length < 7) {
      nextErrors.contactPhone = 'Please provide a valid contact phone number for responder coordination.';
    }
    if (victimsCount < 0 || victimsCount > 500) {
      nextErrors.victimsCount = 'Number of victims must be between 0 and 500.';
    }
    if (volunteersNeeded < 1 || volunteersNeeded > 50) {
      nextErrors.volunteersNeeded = 'Volunteers required must be between 1 and 50.';
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const randomCode = Math.floor(5000 + Math.random() * 4900);
    const requestId = `RR-2026-${randomCode}`;
    const sector = inferSectorFromCoords(coords.x, coords.y);

    const newEmergency: EmergencyRequest = {
      id: requestId,
      title: title.trim(),
      description: description.trim(),
      category: selectedCategory,
      priority,
      stage: 'Volunteers Notified',
      address: address.trim(),
      sector,
      coords,
      victimsCount,
      volunteersNeeded,
      volunteersAssigned: Math.min(volunteersNeeded, 2),
      contactPhone: contactPhone.trim(),
      createdAt: 'Just now',
      imageUrl: imagePreview,
      assignedUnitId:
        selectedCategory === 'Medical Emergency' || selectedCategory === 'Accident / Rescue'
          ? 'AMB-09 (Rapid Response Unit)'
          : selectedCategory === 'Blood Donation'
          ? 'BLD-CORRIDOR-04'
          : 'VOL-DISPATCH-TEAM',
      assignedVolunteerNames: ['Dr. Kavitha Nair', 'Arjun Menon'],
      routeDistanceKm: calculatedDistanceKm,
      estimatedEtaMinutes: calculatedEtaMin,
      isDemoData: true,
    };

    onSubmitEmergency(newEmergency);
    setSubmittedRequest(newEmergency);
  };

  if (submittedRequest) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        <div className="bg-slate-900/90 border border-emerald-500/40 rounded-2xl p-6 sm:p-10 space-y-6 shadow-2xl">
          <div className="flex items-center justify-between flex-wrap gap-4 border-b border-slate-800 pb-6">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <div>
                <p className="text-xs font-medium text-emerald-400">EMERGENCY DISPATCH LOGGED (DEMO MODE)</p>
                <h2 className="text-2xl font-extrabold text-white">Help Request Broadcasted</h2>
              </div>
            </div>
            <div className="text-right font-mono tabular-nums">
              <span className="text-xs text-slate-400 block">UNIQUE DEMO REQUEST ID</span>
              <span className="text-xl font-bold text-cyan-400">{submittedRequest.id}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono tabular-nums">
            <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4">
              <span className="text-xs text-slate-400 block">Category & Priority</span>
              <span className="text-sm font-bold text-white mt-1 block">
                {submittedRequest.category} · {submittedRequest.priority}
              </span>
            </div>
            <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4">
              <span className="text-xs text-slate-400 block">Calculated Demo Route ETA</span>
              <span className="text-sm font-bold text-cyan-400 mt-1 block">
                ~{submittedRequest.estimatedEtaMinutes} mins ({submittedRequest.routeDistanceKm} km)
              </span>
            </div>
            <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4">
              <span className="text-xs text-slate-400 block">Assigned Demo Unit</span>
              <span className="text-sm font-bold text-orange-400 mt-1 block">
                {submittedRequest.assignedUnitId}
              </span>
            </div>
          </div>

          <div className="bg-slate-950/60 border border-slate-800/90 rounded-xl p-4 space-y-2 text-sm">
            <p className="font-semibold text-white">{submittedRequest.title}</p>
            <p className="text-slate-300 text-xs leading-relaxed">{submittedRequest.description}</p>
            <p className="text-xs text-slate-400 pt-1">
              Location: {submittedRequest.address} · Victims: {submittedRequest.victimsCount} · Volunteers Requested:{' '}
              {submittedRequest.volunteersNeeded}
            </p>
          </div>

          <div className="text-xs text-amber-300/90 bg-amber-500/10 border border-amber-500/30 rounded-xl p-3.5">
            Prototype Notice: This submission is saved to your local browser state and connected to the Live Rescue
            Tracking & Command Dashboard modules. Real municipal emergency services (112/911) are not contacted.
          </div>

          <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                setSubmittedRequest(null);
                setTitle('');
                setDescription('');
                setImagePreview(undefined);
              }}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-colors cursor-pointer"
            >
              Submit Another Request
            </button>
            <button
              type="button"
              onClick={() => {
                onSelectEmergencyForTracking(submittedRequest.id);
                onNavigate('live-response');
              }}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs flex items-center gap-2 transition-all cursor-pointer"
            >
              Open Live Rescue Tracking
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div>
          <p className="text-xs font-medium text-rose-400">EMERGENCY DISPATCH PORTAL · STEP-BY-STEP TRIAGE</p>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">Request Immediate Emergency Assistance</h1>
        </div>
        <p className="text-xs text-slate-400 max-w-md">
          Select an emergency category, verify your pin on the tactical city grid, and submit to notify nearby
          volunteers and response units.
        </p>
      </div>

      {/* STEP 1: 6 Selectable Emergency Category Cards */}
      <div className="space-y-3">
        <label className="block text-xs font-semibold text-slate-300">
          1. Select Emergency Category (Updates Triage Priority & Responder Unit)
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {EMERGENCY_CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => handleCategorySelect(cat)}
                className={`text-left p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-3.5 ${
                  isSelected
                    ? `${cat.accentBg} ${cat.accentBorder} shadow-lg`
                    : 'bg-slate-900/65 border-slate-800/90 hover:border-slate-700'
                }`}
              >
                <div
                  className={`p-2.5 rounded-lg shrink-0 ${
                    isSelected ? 'bg-slate-950/70' : 'bg-slate-800/80'
                  } ${cat.accentText}`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-bold text-white">{cat.label}</span>
                    {isSelected && <span className="text-[11px] font-semibold text-cyan-300">Selected</span>}
                  </div>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">{cat.subtitle}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* STEP 2: Form Fields + Interactive Map Preview Split */}
      <form onSubmit={validateAndSubmit} noValidate className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left 7 Columns: Structured Form */}
        <div className="lg:col-span-7 bg-slate-900/70 border border-slate-800 rounded-2xl p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-base font-bold text-white">2. Incident Details & Victim Triage</h2>
            <span className="text-xs text-slate-400">Type: {selectedCategory}</span>
          </div>

          {/* Emergency Title & Type */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2 space-y-1.5">
              <label htmlFor="emergency-title" className="block text-xs font-medium text-slate-300">
                Emergency Title *
              </label>
              <input
                id="emergency-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Two-Wheeler Collision Near Flyover Pillar 9"
                className="w-full rounded-xl bg-slate-950/90 border border-slate-800 focus:border-cyan-500 focus:outline-none px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500"
              />
              {errors.title && <p className="text-xs text-rose-400">{errors.title}</p>}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="emergency-type-select" className="block text-xs font-medium text-slate-300">
                Emergency Type
              </label>
              <select
                id="emergency-type-select"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value as EmergencyCategory)}
                className="w-full rounded-xl bg-slate-950/90 border border-slate-800 focus:border-cyan-500 focus:outline-none px-3 py-2.5 text-sm text-white"
              >
                {EMERGENCY_CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <label htmlFor="emergency-desc" className="block text-xs font-medium text-slate-300">
                Incident Description & Specific Needs *
              </label>
              <button
                type="button"
                onClick={handleRunAiTriage}
                disabled={isAnalyzingAi || (!description.trim() && !title.trim())}
                className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 disabled:opacity-40 disabled:hover:text-cyan-400 flex items-center gap-1 cursor-pointer transition-colors"
                title="Use Gemini AI to analyze priority, category and response needs"
              >
                <Sparkles className="w-3.5 h-3.5" />
                {isAnalyzingAi ? 'Analyzing Triage...' : 'Gemini AI Triage'}
              </button>
            </div>
            <textarea
              id="emergency-desc"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe injuries, hazards, landmarks, or medical equipment needed..."
              className="w-full rounded-xl bg-slate-950/90 border border-slate-800 focus:border-cyan-500 focus:outline-none px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500"
            />
            {aiTriageResult && (
              <div className="bg-cyan-950/40 border border-cyan-500/40 rounded-xl p-2.5 text-xs space-y-1">
                <div className="flex items-center justify-between text-cyan-300 font-semibold text-[11px]">
                  <span className="flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-cyan-400" />
                    {aiTriageResult.isAiGenerated ? 'Gemini AI Assessment' : 'Rapid Rescue Triage Assistant'}
                  </span>
                  <span className="font-mono text-cyan-400">{aiTriageResult.priority} Priority · {aiTriageResult.volunteersNeeded} Responders</span>
                </div>
                <p className="text-slate-300 text-[11px] leading-relaxed">{aiTriageResult.firstAidAdvice}</p>
              </div>
            )}
            {errors.description && <p className="text-xs text-rose-400">{errors.description}</p>}
          </div>

          {/* Manual Address Entry + GPS Permission Button */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <label htmlFor="emergency-address" className="block text-xs font-medium text-slate-300">
                Manual Address or Landmark *
              </label>
              <button
                type="button"
                onClick={handleRequestGeolocation}
                className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
              >
                <LocateFixed className="w-3.5 h-3.5" />
                Use My Current Location
              </button>
            </div>
            <input
              id="emergency-address"
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Enter street address, building name, and sector..."
              className="w-full rounded-xl bg-slate-950/90 border border-slate-800 focus:border-cyan-500 focus:outline-none px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500"
            />
            <p className="text-[11px] text-slate-400">{gpsStatus}</p>
            {errors.address && <p className="text-xs text-rose-400">{errors.address}</p>}
          </div>

          {/* Victims, Volunteers Needed, Priority Level */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="victims-count" className="block text-xs font-medium text-slate-300">
                Number of Victims
              </label>
              <div className="relative">
                <Users className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  id="victims-count"
                  type="number"
                  min={0}
                  max={500}
                  value={victimsCount}
                  onChange={(e) => setVictimsCount(Math.max(0, parseInt(e.target.value || '0', 10)))}
                  className="w-full rounded-xl bg-slate-950/90 border border-slate-800 focus:border-cyan-500 focus:outline-none pl-10 pr-3.5 py-2.5 text-sm text-white font-mono tabular-nums"
                />
              </div>
              {errors.victimsCount && <p className="text-xs text-rose-400">{errors.victimsCount}</p>}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="volunteers-needed" className="block text-xs font-medium text-slate-300">
                Volunteers Required
              </label>
              <input
                id="volunteers-needed"
                type="number"
                min={1}
                max={50}
                value={volunteersNeeded}
                onChange={(e) => setVolunteersNeeded(Math.max(1, parseInt(e.target.value || '1', 10)))}
                className="w-full rounded-xl bg-slate-950/90 border border-slate-800 focus:border-cyan-500 focus:outline-none px-3.5 py-2.5 text-sm text-white font-mono tabular-nums"
              />
              {errors.volunteersNeeded && <p className="text-xs text-rose-400">{errors.volunteersNeeded}</p>}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="priority-level" className="block text-xs font-medium text-slate-300">
                Priority Level
              </label>
              <select
                id="priority-level"
                value={priority}
                onChange={(e) => setPriority(e.target.value as PriorityLevel)}
                className="w-full rounded-xl bg-slate-950/90 border border-slate-800 focus:border-cyan-500 focus:outline-none px-3 py-2.5 text-sm text-white"
              >
                <option value="Critical">Critical (Immediate Life Threat)</option>
                <option value="High">High (Urgent Dispatch)</option>
                <option value="Moderate">Moderate (Standard Response)</option>
                <option value="Standard">Standard (Community Support)</option>
              </select>
            </div>
          </div>

          {/* Contact Number & Optional Image Upload */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="contact-phone" className="block text-xs font-medium text-slate-300">
                Emergency Contact Number *
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  id="contact-phone"
                  type="tel"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  placeholder="+91 98400-XXXXX"
                  className="w-full rounded-xl bg-slate-950/90 border border-slate-800 focus:border-cyan-500 focus:outline-none pl-10 pr-3.5 py-2.5 text-sm text-white font-mono tabular-nums"
                />
              </div>
              {errors.contactPhone && <p className="text-xs text-rose-400">{errors.contactPhone}</p>}
            </div>

            <div className="space-y-1.5">
              <span className="block text-xs font-medium text-slate-300">Optional Scene Photo Upload</span>
              <div className="flex items-center gap-2">
                <label className="flex-1 cursor-pointer rounded-xl bg-slate-950/90 border border-dashed border-slate-700 hover:border-cyan-500/60 px-3.5 py-2.5 text-xs text-slate-300 flex items-center justify-center gap-2 transition-colors">
                  <ImagePlus className="w-4 h-4 text-cyan-400" />
                  <span>{imagePreview ? 'Replace Scene Photo' : 'Attach Photo (Optional)'}</span>
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                </label>
                {imagePreview && (
                  <button
                    type="button"
                    onClick={() => setImagePreview(undefined)}
                    className="p-2.5 rounded-xl bg-rose-500/15 text-rose-300 hover:bg-rose-500/25"
                    title="Remove attached photo"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {imagePreview && (
            <div className="rounded-xl overflow-hidden border border-slate-800 bg-slate-950 p-2 flex items-center gap-3">
              <img
                src={imagePreview}
                alt="Uploaded emergency scene preview"
                referrerPolicy="no-referrer"
                className="w-20 h-14 object-cover rounded-lg"
              />
              <div className="text-xs text-slate-300">
                <p className="font-semibold text-white">Scene Photograph Attached</p>
                <p className="text-slate-400">Will be shared with assigned field responders.</p>
              </div>
            </div>
          )}

          {/* Prominent SUBMIT EMERGENCY CTA */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-rose-600 via-red-500 to-orange-500 hover:from-rose-500 hover:to-orange-400 text-white font-extrabold text-sm tracking-wide shadow-xl shadow-rose-600/25 transition-all flex items-center justify-center gap-2.5 cursor-pointer"
            >
              <Siren className="w-5 h-5" />
              SUBMIT EMERGENCY
            </button>
          </div>
        </div>

        {/* Right 5 Columns: Interactive Map Pin Preview */}
        <div className="lg:col-span-5 bg-slate-900/70 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Compass className="w-4 h-4 text-cyan-400" />
                Interactive Location Pin Map
              </h2>
              <p className="text-xs text-slate-400">Click anywhere on the sector map to place the emergency pin</p>
            </div>
            <span className="text-xs font-mono text-cyan-400 tabular-nums">
              {coords.lat}°N, {coords.lng}°E
            </span>
          </div>

          {/* Interactive Tactical Map Surface */}
          <div
            onClickCapture={handleMapSurfaceClick}
            tabIndex={0}
            aria-label="Interactive emergency location picker map"
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                setCoords({ x: 50, y: 50, lat: 13.0827, lng: 80.2707 });
              }
            }}
            className="relative w-full h-[340px] rounded-xl overflow-hidden bg-[#080F1E] border border-slate-800"
          >
            <div ref={mapContainerRef} className="w-full h-full" aria-label="Google Maps location picker" />
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

            <div className="absolute bottom-2.5 left-2.5 right-2.5 bg-slate-950/85 backdrop-blur-md border border-white/10 rounded-lg px-3 py-2 flex items-center justify-between text-xs pointer-events-none">
              <span className="text-slate-300 truncate">{inferSectorFromCoords(coords.x, coords.y)}</span>
              <span className="text-cyan-400 font-mono tabular-nums shrink-0">
                Route: {calculatedDistanceKm} km (~{calculatedEtaMin}m Demo ETA)
              </span>
            </div>
          </div>

          <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3.5 text-xs text-slate-400 space-y-1">
            <div className="flex items-center justify-between text-slate-200 font-medium">
              <span>Calculated Demo Routing Telemetry</span>
              <span className="font-mono text-cyan-400 tabular-nums">~{calculatedEtaMin} mins</span>
            </div>
            <p>
              Distance from Central Trauma Hub is calculated from your placed pin coordinates ({calculatedDistanceKm}{' '}
              km).
            </p>
          </div>
        </div>
      </form>
    </div>
  );
};
