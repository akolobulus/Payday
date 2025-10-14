import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export interface JobMatchResult {
  score: number;
  reasoning: string;
  skillsMatch: string[];
  suggestions: string;
}

export interface GigRecommendation {
  title: string;
  description: string;
  budget: number;
  category: string;
  urgency: 'low' | 'medium' | 'high';
  estimatedDuration: string;
  skillsRequired: string[];
}

export async function matchUserToGig(
  userSkills: string[],
  userExperience: string,
  userPreferences: string[],
  gigTitle: string,
  gigDescription: string,
  gigSkillsRequired: string[]
): Promise<JobMatchResult> {
  try {
    const prompt = `Analyze job matching compatibility for a Nigerian gig worker:

USER PROFILE:
- Skills: ${userSkills.join(', ')}
- Experience: ${userExperience}
- Preferences: ${userPreferences.join(', ')}

GIG DETAILS:
- Title: ${gigTitle}
- Description: ${gigDescription}
- Skills Required: ${gigSkillsRequired.join(', ')}

Provide a match analysis with:
1. Compatibility score (0-100)
2. Clear reasoning for the score
3. Specific skills that match
4. Suggestions for improvement

Context: This is for Nigerian youth seeking same-day paying jobs. Focus on practical skills and immediate earning potential.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      config: {
        systemInstruction: "You are an AI job matching specialist for Nigerian gig economy. Provide practical, encouraging advice that helps young people find work opportunities.",
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            score: { type: "number" },
            reasoning: { type: "string" },
            skillsMatch: { type: "array", items: { type: "string" } },
            suggestions: { type: "string" }
          },
          required: ["score", "reasoning", "skillsMatch", "suggestions"]
        }
      },
      contents: prompt
    });

    const rawJson = response.text;
    if (rawJson) {
      return JSON.parse(rawJson);
    } else {
      throw new Error("Empty response from Gemini");
    }
  } catch (error) {
    console.error("Gemini matching error:", error);
    return {
      score: 50,
      reasoning: "Unable to analyze match at this time",
      skillsMatch: [],
      suggestions: "Please try again later"
    };
  }
}

export async function generateGigRecommendations(
  userSkills: string[],
  userLocation: string,
  userPreferences: string[]
): Promise<GigRecommendation[]> {
  try {
    const prompt = `Generate 3 realistic gig recommendations for a Nigerian youth:

USER PROFILE:
- Skills: ${userSkills.join(', ')}
- Location: ${userLocation}
- Preferences: ${userPreferences.join(', ')}

Generate gigs that:
1. Pay same-day (crucial for Nigerian youth)
2. Match their skills realistically
3. Are common in Nigerian cities
4. Have reasonable budgets in Naira

Focus on real opportunities like: delivery, tutoring, cleaning, data entry, social media management, photography, event assistance, etc.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      config: {
        systemInstruction: "Generate realistic gig opportunities for Nigerian youth. Focus on same-day paying jobs that are commonly available.",
        responseMimeType: "application/json",
        responseSchema: {
          type: "array",
          items: {
            type: "object",
            properties: {
              title: { type: "string" },
              description: { type: "string" },
              budget: { type: "number" },
              category: { type: "string" },
              urgency: { type: "string", enum: ["low", "medium", "high"] },
              estimatedDuration: { type: "string" },
              skillsRequired: { type: "array", items: { type: "string" } }
            },
            required: ["title", "description", "budget", "category", "urgency", "estimatedDuration", "skillsRequired"]
          }
        }
      },
      contents: prompt
    });

    const rawJson = response.text;
    if (rawJson) {
      return JSON.parse(rawJson);
    } else {
      throw new Error("Empty response from Gemini");
    }
  } catch (error) {
    console.error("Gemini recommendations error:", error);
    return [];
  }
}

export async function analyzeGigDescription(description: string): Promise<{
  category: string;
  skillsRequired: string[];
  estimatedDuration: string;
  urgency: 'low' | 'medium' | 'high';
}> {
  try {
    const prompt = `Analyze this gig description and extract key information:

DESCRIPTION: ${description}

Extract:
1. Most appropriate category
2. Skills required
3. Estimated duration
4. Urgency level

Categories: Delivery, Tutoring, Cleaning, Data Entry, Social Media, Photography, Event Assistance, Handyman, Content Creation, Customer Service`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            category: { type: "string" },
            skillsRequired: { type: "array", items: { type: "string" } },
            estimatedDuration: { type: "string" },
            urgency: { type: "string", enum: ["low", "medium", "high"] }
          },
          required: ["category", "skillsRequired", "estimatedDuration", "urgency"]
        }
      },
      contents: prompt
    });

    const rawJson = response.text;
    if (rawJson) {
      return JSON.parse(rawJson);
    } else {
      throw new Error("Empty response from Gemini");
    }
  } catch (error) {
    console.error("Gemini analysis error:", error);
    return {
      category: "General",
      skillsRequired: [],
      estimatedDuration: "Unknown",
      urgency: "medium"
    };
  }
}

export async function extractSkillsFromCV(cvText: string): Promise<{
  skills: string[];
  bio: string;
}> {
  try {
    const prompt = `Analyze this CV/resume text and extract:

CV TEXT: ${cvText}

Extract:
1. A comprehensive list of skills (technical, soft skills, tools, languages, etc.)
2. A brief professional bio/summary (2-3 sentences) that captures the person's expertise and experience

Focus on practical skills relevant to the Nigerian gig economy: delivery, tutoring, cleaning, data entry, social media, photography, event assistance, handyman work, content creation, customer service, etc.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      config: {
        systemInstruction: "You are an expert CV analyzer. Extract skills and create professional summaries that help people get matched with gig opportunities.",
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            skills: { type: "array", items: { type: "string" } },
            bio: { type: "string" }
          },
          required: ["skills", "bio"]
        }
      },
      contents: prompt
    });

    const rawJson = response.text;
    if (rawJson) {
      return JSON.parse(rawJson);
    } else {
      throw new Error("Empty response from Gemini");
    }
  } catch (error) {
    console.error("Gemini CV extraction error:", error);
    return {
      skills: [],
      bio: "Unable to extract bio from CV at this time."
    };
  }
}