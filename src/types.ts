export type PageId =
  | 'home'
  | 'need-help'
  | 'live-response'
  | 'blood-network'
  | 'missing-persons'
  | 'volunteer'
  | 'command'
  | 'about';

export type UserRole = 'Citizen' | 'Volunteer' | 'Coordinator';

export type EmergencyCategory =
  | 'Medical Emergency'
  | 'Blood Donation'
  | 'Missing Person'
  | 'Accident / Rescue'
  | 'Disaster Relief'
  | 'Other Emergency';

export type PriorityLevel = 'Critical' | 'High' | 'Moderate' | 'Standard';

export type RescueStage =
  | 'Request Received'
  | 'Volunteers Notified'
  | 'Help Accepted'
  | 'Team En Route'
  | 'Assistance Arrived'
  | 'Case Resolved';

export const RESCUE_STAGES: RescueStage[] = [
  'Request Received',
  'Volunteers Notified',
  'Help Accepted',
  'Team En Route',
  'Assistance Arrived',
  'Case Resolved',
];

export interface Coordinates {
  x: number; // 0 to 100 percentage on city grid map
  y: number; // 0 to 100 percentage on city grid map
  lat: number;
  lng: number;
}

export interface EmergencyRequest {
  id: string;
  title: string;
  description: string;
  category: EmergencyCategory;
  priority: PriorityLevel;
  stage: RescueStage;
  address: string;
  sector: string;
  coords: Coordinates;
  victimsCount: number;
  volunteersNeeded: number;
  volunteersAssigned: number;
  contactPhone: string;
  createdAt: string;
  imageUrl?: string;
  assignedUnitId?: string;
  assignedVolunteerNames: string[];
  routeDistanceKm?: number;
  estimatedEtaMinutes?: number;
  isDemoData: boolean;
}

export type BloodGroup = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';

export interface BloodDonor {
  id: string;
  name: string;
  bloodGroup: BloodGroup;
  sector: string;
  distanceKm: number;
  availability: 'Available Now' | 'On Standby' | 'Recently Donated';
  lastVerified: string;
  recordType: 'Registered Donor (Demo)' | 'Community Responder (Demo)';
  phoneMasked: string;
}

export interface BloodBank {
  id: string;
  name: string;
  address: string;
  sector: string;
  distanceKm: number;
  phone: string;
  hours: string;
  verifiedSource: string;
  inventory: Record<BloodGroup, number>;
  coords: { x: number; y: number };
}

export interface BloodUrgentRequest {
  id: string;
  patientIdentifier: string;
  bloodGroup: BloodGroup;
  unitsRequired: number;
  hospitalName: string;
  sector: string;
  urgency: 'Immediate (Within 1 hr)' | 'Urgent (Within 4 hrs)' | 'Scheduled (24 hrs)';
  contactNumber: string;
  createdAt: string;
  status: 'Open Alert' | 'Donors Responding' | 'Fulfilled';
}

export type MissingStatus = 'Newly Reported' | 'Under Review' | 'Located' | 'Closed';

export interface MissingPersonReport {
  id: string;
  identifierName: string;
  age: number;
  lastSeenLocation: string;
  sector: string;
  lastSeenDateTime: string;
  clothingDescription: string;
  identifyingDetails: string;
  status: MissingStatus;
  photoUrl?: string;
  coords: { x: number; y: number };
  sightingsCount: number;
  isDemoData: boolean;
}

export type VolunteerSkill =
  | 'First Aid'
  | 'Transport'
  | 'Blood Donation'
  | 'Search Support'
  | 'Food Distribution'
  | 'Medical Support';

export interface VolunteerProfile {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  city: string;
  preferredArea: string;
  skills: VolunteerSkill[];
  availability: boolean;
  experienceLevel: 'Certified First Responder' | 'Trained Community Volunteer' | 'Medical Professional' | 'New Volunteer';
  missionsCompleted: number;
  joinedAt: string;
  coords: { x: number; y: number };
  isDemoData: boolean;
}

export interface ActivityFeedItem {
  id: string;
  timestamp: string;
  type: 'emergency' | 'blood' | 'missing' | 'volunteer' | 'status';
  message: string;
  sector: string;
}

export interface UserSession {
  name: string;
  email: string;
  role: UserRole;
  isAuthenticated: boolean;
}
