

export interface Resource {
  name: string;
  description: string;
  url: string;
}

export interface Mood {
    label: string;
    positivity: number;
}

export interface AIAnalysis {
    summary: string;
    observations: string[];
    followUpQuestions: string[];
    mood: Mood;
}

export interface JournalEntry {
    id: string;
    date: string;
    title: string;
    content: string;
    analysis?: AIAnalysis;
    isAnalyzing?: boolean;
}

export interface UserProfile {
  name: string;
  profession: string;
  keyLifeAreas: string[];
}