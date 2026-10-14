import { GoogleGenAI } from '@google/genai';
import { EmergencyCategory, PriorityLevel } from '../types';

export interface AITriageResult {
  category: EmergencyCategory;
  priority: PriorityLevel;
  volunteersNeeded: number;
  firstAidAdvice: string;
  triageReasoning: string;
  isAiGenerated: boolean;
}

const CATEGORIES: EmergencyCategory[] = [
  'Medical Emergency',
  'Blood Donation',
  'Missing Person',
  'Accident / Rescue',
  'Disaster Relief',
  'Other Emergency',
];

const PRIORITIES: PriorityLevel[] = ['Critical', 'High', 'Moderate', 'Standard'];

/**
 * Heuristic fallback when Gemini API key is unavailable or network is offline
 */
function heuristicFallbackTriage(title: string, description: string): AITriageResult {
  const text = `${title} ${description}`.toLowerCase();

  let category: EmergencyCategory = 'Medical Emergency';
  let priority: PriorityLevel = 'High';
  let volunteersNeeded = 3;
  let firstAidAdvice = 'Keep the victim calm, monitor vital signs, and ensure clear access for responders.';

  if (text.includes('blood') || text.includes('plasma') || text.includes('platelet') || text.includes('donor')) {
    category = 'Blood Donation';
    priority = text.includes('urgent') || text.includes('immediate') || text.includes('surgery') ? 'Critical' : 'High';
    volunteersNeeded = 2;
    firstAidAdvice = 'Verify hospital desk contact and keep potential matched donors on telephone standby.';
  } else if (text.includes('missing') || text.includes('lost') || text.includes('disappeared') || text.includes('child') || text.includes('separated')) {
    category = 'Missing Person';
    priority = text.includes('child') || text.includes('dementia') || text.includes('elderly') ? 'Critical' : 'High';
    volunteersNeeded = 5;
    firstAidAdvice = 'Secure the last-seen perimeter, document exact attire, and mobilize local sector search teams.';
  } else if (text.includes('accident') || text.includes('collision') || text.includes('trapped') || text.includes('crash') || text.includes('vehicle')) {
    category = 'Accident / Rescue';
    priority = 'Critical';
    volunteersNeeded = 4;
    firstAidAdvice = 'Do not move entrapped victims unless there is immediate fire/hazard risk. Cordon off traffic.';
  } else if (text.includes('flood') || text.includes('water') || text.includes('storm') || text.includes('fire') || text.includes('evacuat') || text.includes('disaster')) {
    category = 'Disaster Relief';
    priority = 'High';
    volunteersNeeded = 6;
    firstAidAdvice = 'Guide survivors to elevated/reinforced shelter and prepare emergency dry ration packets.';
  } else if (text.includes('cardiac') || text.includes('chest pain') || text.includes('unconscious') || text.includes('breath') || text.includes('bleed') || text.includes('stroke')) {
    category = 'Medical Emergency';
    priority = 'Critical';
    volunteersNeeded = 3;
    firstAidAdvice = 'Check breathing and pulse. If cardiac arrest, start CPR and call for nearest AED responder immediately.';
  } else if (text.includes('wire') || text.includes('tree') || text.includes('pole') || text.includes('obstruction') || text.includes('hazard')) {
    category = 'Other Emergency';
    priority = 'Moderate';
    volunteersNeeded = 2;
    firstAidAdvice = 'Establish a 10-meter safety cordon to keep pedestrians away from hazard.';
  }

  return {
    category,
    priority,
    volunteersNeeded,
    firstAidAdvice,
    triageReasoning: `Heuristic rule-based triage based on keywords in incident report: "${title}".`,
    isAiGenerated: false,
  };
}

/**
 * Analyzes emergency title and description using Gemini AI, with automatic heuristic fallback
 */
export async function triageEmergencyWithGemini(
  title: string,
  description: string
): Promise<AITriageResult> {
  if (!title.trim() && !description.trim()) {
    return heuristicFallbackTriage('General', 'Emergency assistance requested.');
  }

  // Retrieve API key from standard environment locations
  const apiKey =
    (typeof process !== 'undefined' && process.env?.GEMINI_API_KEY) ||
    (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_GEMINI_API_KEY) ||
    (typeof import.meta !== 'undefined' && (import.meta as any).env?.GEMINI_API_KEY) ||
    '';

  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return heuristicFallbackTriage(title, description);
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const prompt = `You are an expert emergency medical and disaster triage coordinator for Rapid Rescue 360°.
Analyze this incident report and provide an immediate assessment.

Incident Title: "${title}"
Incident Description: "${description}"

Allowed Categories:
- Medical Emergency
- Blood Donation
- Missing Person
- Accident / Rescue
- Disaster Relief
- Other Emergency

Allowed Priorities:
- Critical (Immediate life threat)
- High (Urgent care needed within 15-30m)
- Moderate (Standard urgent response)
- Standard (Non-life threatening community support)

Respond strictly with valid JSON with the following schema:
{
  "category": string (must be one of the Allowed Categories),
  "priority": string (must be one of the Allowed Priorities),
  "volunteersNeeded": number (integer between 1 and 10),
  "firstAidAdvice": string (1-2 sentences of immediate life-safety action),
  "triageReasoning": string (1 concise sentence explaining the priority classification)
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const responseText = response.text || '';
    if (!responseText) {
      return heuristicFallbackTriage(title, description);
    }

    const parsed = JSON.parse(responseText);

    const category: EmergencyCategory = CATEGORIES.includes(parsed.category)
      ? parsed.category
      : 'Medical Emergency';

    const priority: PriorityLevel = PRIORITIES.includes(parsed.priority)
      ? parsed.priority
      : 'High';

    const volunteersNeeded =
      typeof parsed.volunteersNeeded === 'number' && parsed.volunteersNeeded >= 1 && parsed.volunteersNeeded <= 15
        ? Math.round(parsed.volunteersNeeded)
        : 3;

    return {
      category,
      priority,
      volunteersNeeded,
      firstAidAdvice: parsed.firstAidAdvice || 'Keep the victim stable and clear the route for arriving units.',
      triageReasoning: parsed.triageReasoning || 'Assessed by Gemini AI triage model.',
      isAiGenerated: true,
    };
  } catch (err) {
    console.warn('Gemini triage fallback triggered:', err);
    return heuristicFallbackTriage(title, description);
  }
}
