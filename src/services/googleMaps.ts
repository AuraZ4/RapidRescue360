export interface GoogleMapsPosition {
  lat: number;
  lng: number;
}

export interface GoogleMapsLatLng {
  lat: () => number;
  lng: () => number;
}

export interface GoogleMapsLatLngBounds {
  getNorthEast: () => GoogleMapsLatLng;
  getSouthWest: () => GoogleMapsLatLng;
}

export interface GoogleMapsMap {
  setCenter: (position: GoogleMapsPosition) => void;
  setZoom: (zoom: number) => void;
  getBounds: () => GoogleMapsLatLngBounds | undefined;
  addListener: (
    eventName: 'click',
    handler: (event: { latLng?: GoogleMapsLatLng | null }) => void,
  ) => GoogleMapsEventListener;
}

export interface GoogleMapsEventListener {
  remove: () => void;
}

export interface GoogleMapsMarker {
  map: GoogleMapsMap | null;
  position: GoogleMapsPosition | null;
}

export interface GoogleMapsPolyline {
  setMap: (map: GoogleMapsMap | null) => void;
  setPath: (path: GoogleMapsPosition[]) => void;
}

export interface GoogleMapsMarkerLibrary {
  AdvancedMarkerElement: new (options: {
    map: GoogleMapsMap;
    position: GoogleMapsPosition;
    title: string;
    content: HTMLElement;
  }) => GoogleMapsMarker;
  PinElement: new (options: {
    background: string;
    borderColor: string;
    glyphColor: string;
    glyphText: string;
  }) => HTMLElement;
}

export interface GoogleMapsNamespace {
  Map: new (
    element: HTMLElement,
    options: {
      center: GoogleMapsPosition;
      zoom: number;
      mapId: string;
      mapTypeControl: boolean;
      streetViewControl: boolean;
      fullscreenControl: boolean;
    },
  ) => GoogleMapsMap;
  Polyline: new (options: {
    map: GoogleMapsMap;
    path: GoogleMapsPosition[];
    strokeColor: string;
    strokeOpacity: number;
    strokeWeight: number;
  }) => GoogleMapsPolyline;
  marker?: GoogleMapsMarkerLibrary;
}

export interface GoogleMapsApi extends GoogleMapsNamespace {
  marker: GoogleMapsMarkerLibrary;
}

declare global {
  interface Window {
    google?: { maps: GoogleMapsNamespace };
    initGoogleMaps?: () => void;
    gm_authFailure?: () => void;
  }
}

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
let googleMapsLoadPromise: Promise<GoogleMapsApi> | null = null;

export const isGoogleMapsConfigured = Boolean(GOOGLE_MAPS_API_KEY);

export function loadGoogleMaps(): Promise<GoogleMapsApi> {
  if (!isGoogleMapsConfigured) {
    return Promise.reject(new Error('Set VITE_GOOGLE_MAPS_API_KEY in .env.local to display the map.'));
  }

  const existingMaps = window.google?.maps;
  if (existingMaps?.marker) return Promise.resolve({ ...existingMaps, marker: existingMaps.marker });
  if (googleMapsLoadPromise) return googleMapsLoadPromise;

  googleMapsLoadPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    window.initGoogleMaps = () => {
      const maps = window.google?.maps;
      delete window.initGoogleMaps;
      if (maps?.marker) {
        resolve({ ...maps, marker: maps.marker });
      } else {
        googleMapsLoadPromise = null;
        reject(new Error('Google Maps loaded without exposing its marker library.'));
      }
    };
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(GOOGLE_MAPS_API_KEY)}&v=weekly&loading=async&libraries=marker&callback=initGoogleMaps`;
    script.async = true;
    script.defer = true;
    script.onerror = () => {
      delete window.initGoogleMaps;
      googleMapsLoadPromise = null;
      reject(new Error('Google Maps could not be loaded. Check the API key and network connection.'));
    };
    document.head.appendChild(script);
  });

  return googleMapsLoadPromise;
}

export function createGoogleMapsMarker(
  maps: GoogleMapsApi,
  map: GoogleMapsMap,
  position: GoogleMapsPosition,
  title: string,
  glyph: string,
  color: string,
): GoogleMapsMarker {
  const pin = new maps.marker.PinElement({
    background: color,
    borderColor: color,
    glyphColor: '#ffffff',
    glyphText: glyph,
  });
  return new maps.marker.AdvancedMarkerElement({
    map,
    position,
    title,
    content: pin,
  });
}
