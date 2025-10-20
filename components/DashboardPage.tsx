import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { GoogleGenAI, Type } from "@google/genai";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import type { JournalEntry, Resource, UserProfile } from '../types';

// --- Helper Functions (copied from JournalPage for encapsulation) ---
const getWeekId = (d: Date) => {
    const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    date.setUTCDate(date.getUTCDate() + 4 - (date.getUTCDay() || 7));
    const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil((((date.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
    return `${date.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
};
const getLocalStorageKey = (weekId: string) => `mindful-youth-journal-${weekId}`;
const getProfileLocalStorageKey = () => `mindful-youth-profile`;

// --- Data (copied from ResourceHub for encapsulation) ---
const resources: Resource[] = [
  { name: 'The Trevor Project', description: 'Crisis intervention and suicide prevention for LGBTQ young people.', url: 'https://www.thetrevorproject.org/' },
  { name: 'Kids Help Phone', description: '24/7 national support service for young people in Canada.', url: 'https://kidshelpphone.ca/' },
  { name: 'NAMI (National Alliance on Mental Illness)', description: 'The largest grassroots mental health organization in the U.S.', url: 'https://www.nami.org/' },
  { name: 'The Jed Foundation (JED)', description: 'Protects emotional health and prevents suicide for teens and young adults.', url: 'https://www.jedfoundation.org/' },
];

const keyLifeAreasOptions = [
  "Work / Career", "Academics / School", "Family & Home Life",
  "Friendships & Social Life", "Romantic Relationships", "Health & Fitness",
  "Personal Growth", "Finances",
];


// --- Icons ---
const HomeIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>);
const JournalIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8 text-calm-orange-500"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v15H6.5A2.5 2.5 0 0 1 4 14.5V4.5A2.5 2.5 0 0 1 6.5 2z"/></svg>);
const ChatIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8 text-calm-green-500"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>);
const WriterIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8 text-calm-purple-500"><path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" /></svg>);

// --- Mood Chart Widget ---
const MoodChartWidget: React.FC<{ entries: JournalEntry[] }> = ({ entries }) => {
    const chartData = useMemo(() => {
        const moodsByDate = new Map<string, { totalPositivity: number; count: number }>();
        entries.forEach(entry => {
            if (entry.analysis) {
                const dateStr = new Date(entry.date).toISOString().split('T')[0];
                const existing = moodsByDate.get(dateStr) || { totalPositivity: 0, count: 0 };
                moodsByDate.set(dateStr, {
                    totalPositivity: existing.totalPositivity + entry.analysis.mood.positivity,
                    count: existing.count + 1,
                });
            }
        });

        return Array.from({ length: 7 }).map((_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - (6 - i)); // Go from 6 days ago to today
            const dateStr = d.toISOString().split('T')[0];
            const moodData = moodsByDate.get(dateStr);
            const avgMood = moodData ? moodData.totalPositivity / moodData.count : null;
            return {
                name: d.toLocaleDateString('en-US', { weekday: 'short' }),
                mood: avgMood,
            };
        });
    }, [entries]);

    const hasData = useMemo(() => chartData.some(d => d.mood !== null), [chartData]);

    if (!hasData) {
        return (
            <div className="p-4 bg-slate-100/50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700/50 h-[300px] flex flex-col justify-center items-center text-center">
                 <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-10 h-10 text-slate-400 dark:text-slate-600 mb-3"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">Mood Tracking</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-xs">
                    Not enough data to display your mood chart. Write journal entries with analysis to see your trends.
                </p>
            </div>
        );
    }

    return (
        <div className="p-4 bg-slate-100/50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700/50 h-[300px] flex flex-col">
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-3">Your Mood This Week</h3>
            <div className="flex-grow">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.2)" />
                        <XAxis dataKey="name" stroke="rgb(100 116 139 / 0.8)" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis domain={[1, 5]} ticks={[1, 2, 3, 4, 5]} stroke="rgb(100 116 139 / 0.8)" fontSize={12} tickLine={false} axisLine={false} />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                backdropFilter: 'blur(4px)',
                                border: '1px solid rgba(0,0,0,0.1)',
                                borderRadius: '0.75rem',
                                color: '#333'
                            }}
                            labelStyle={{ fontWeight: 'bold', color: '#000' }}
                            formatter={(value: number) => [`${value.toFixed(1)} / 5`, 'Mood Score']}
                        />
                        <Legend wrapperStyle={{paddingTop: '15px'}} />
                        <Line 
                            type="monotone" 
                            dataKey="mood" 
                            name="Average Mood"
                            stroke="#f97316" 
                            strokeWidth={3} 
                            dot={{ r: 5, fill: '#f97316' }}
                            activeDot={{ r: 8, stroke: '#fff', strokeWidth: 2 }}
                            connectNulls 
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};


// --- Wellness Summary Widget ---
interface WellnessSummaryWidgetProps {
    summaryData: { summary: string; themes: { theme: string; reflection: string }[] } | null;
    isLoading: boolean;
    error: string | null;
    onNavigateToJournal: () => void;
}

const SummaryIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-calm-blue-500"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/><path d="m15 11 4 4"/><path d="M9 12a3 3 0 0 1-3-3 3 3 0 0 1 3-3 3 3 0 0 1 3 3 3 3 0 0 1-3 3z"/></svg>);

const WellnessSummaryWidget: React.FC<WellnessSummaryWidgetProps> = ({ summaryData, isLoading, error, onNavigateToJournal }) => {
    
    if (isLoading) {
        return (
            <div className="p-4 bg-slate-100/50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700/50 min-h-[200px] flex flex-col">
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-3">Weekly Wellness Summary</h3>
                <div className="flex-grow flex items-center justify-center">
                    <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                        <div className="w-3 h-3 bg-calm-blue-500 rounded-full animate-pulse"></div>
                        <span className="text-sm font-semibold">Reflecting on your week...</span>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
         return (
            <div className="p-4 bg-red-500/10 rounded-xl border border-red-500/20 min-h-[200px] flex flex-col text-center justify-center">
                <h3 className="font-semibold text-red-700 dark:text-red-300">Could not generate summary</h3>
                <p className="text-sm text-red-600 dark:text-red-400 mt-1">{error}</p>
            </div>
        );
    }
    
    if (!summaryData) {
        return (
            <div className="p-4 bg-slate-100/50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700/50 min-h-[200px] flex flex-col text-center justify-center items-center">
                <SummaryIcon />
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mt-2">Weekly Wellness Summary</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 mb-4 max-w-xs">Write a journal entry this week to unlock your personalized summary.</p>
                <button onClick={onNavigateToJournal} className="text-sm font-semibold bg-calm-blue-500 text-white px-4 py-2 rounded-full hover:bg-calm-blue-600 transition-colors">
                    Write New Entry
                </button>
            </div>
        );
    }

    return (
        <div className="p-4 bg-slate-100/50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700/50">
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-3">Weekly Wellness Summary</h3>
            <div className="space-y-4">
                <p className="text-sm text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 p-3 rounded-lg">{summaryData.summary}</p>
                {summaryData.themes.length > 0 && (
                    <div>
                        <h4 className="font-semibold text-slate-600 dark:text-slate-400 text-sm mb-2">Key themes to reflect on:</h4>
                        <ul className="space-y-3">
                            {summaryData.themes.map((item, index) => (
                                <li key={index} className="text-sm text-slate-600 dark:text-slate-300 bg-white/50 dark:bg-slate-800/50 p-3 rounded-lg">
                                    <p className="font-semibold text-slate-700 dark:text-slate-200">{item.theme}</p>
                                    <p className="mt-1 text-slate-500 dark:text-slate-400 italic">"{item.reflection}"</p>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
};

// --- Profile Widget ---
const ProfileWidget: React.FC<{ profile: UserProfile; onSave: (newProfile: UserProfile) => void; }> = ({ profile, onSave }) => {
    const [localProfile, setLocalProfile] = useState<UserProfile>(profile);
    const [isSaved, setIsSaved] = useState(false);

    useEffect(() => {
        setLocalProfile(profile);
    }, [profile]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setLocalProfile(prev => ({ ...prev, [name]: value }));
    };

    const toggleLifeArea = (area: string) => {
        const newAreas = localProfile.keyLifeAreas.includes(area)
            ? localProfile.keyLifeAreas.filter(a => a !== area)
            : [...localProfile.keyLifeAreas, area];
        setLocalProfile(prev => ({ ...prev, keyLifeAreas: newAreas }));
    };

    const handleSave = () => {
        onSave(localProfile);
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 2000);
    };
    
    const hasChanges = JSON.stringify(profile) !== JSON.stringify(localProfile);

    return (
        <div className="p-4 bg-slate-100/50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700/50">
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-3">Your Profile</h3>
            <div className="space-y-4">
                <div>
                    <label htmlFor="name" className="text-sm font-medium text-slate-600 dark:text-slate-400">Nickname</label>
                    <input
                        type="text"
                        name="name"
                        id="name"
                        value={localProfile.name}
                        onChange={handleInputChange}
                        placeholder="What should I call you?"
                        className="mt-1 w-full text-sm px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md focus:outline-none focus:ring-1 focus:ring-calm-orange-500"
                    />
                </div>
                <div>
                    <label htmlFor="profession" className="text-sm font-medium text-slate-600 dark:text-slate-400">Profession / Study</label>
                    <input
                        type="text"
                        name="profession"
                        id="profession"
                        value={localProfile.profession}
                        onChange={handleInputChange}
                        placeholder="e.g., Student, Artist"
                        className="mt-1 w-full text-sm px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md focus:outline-none focus:ring-1 focus:ring-calm-orange-500"
                    />
                </div>
                <div>
                    <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Key Life Areas</label>
                    <div className="mt-2 flex flex-wrap gap-2">
                        {keyLifeAreasOptions.map(area => (
                            <button
                                key={area}
                                onClick={() => toggleLifeArea(area)}
                                className={`text-xs font-semibold px-2.5 py-1 rounded-full border transition-colors ${
                                    localProfile.keyLifeAreas.includes(area)
                                        ? 'bg-calm-blue-500 border-calm-blue-500 text-white'
                                        : 'bg-slate-200 dark:bg-slate-700 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-600'
                                }`}
                            >
                                {area}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="pt-2">
                    <button
                        onClick={handleSave}
                        disabled={!hasChanges || isSaved}
                        className={`w-full text-sm font-semibold py-2 px-4 rounded-md transition-all duration-200 ${
                            isSaved
                                ? 'bg-calm-green-500 text-white'
                                : hasChanges
                                ? 'bg-calm-orange-500 hover:bg-calm-orange-600 text-white'
                                : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400 cursor-not-allowed'
                        }`}
                    >
                        {isSaved ? 'Saved!' : 'Save Details'}
                    </button>
                </div>
            </div>
        </div>
    );
};


// --- Consistency Tracker Widget ---
const ConsistencyTrackerWidget: React.FC<{ entries: JournalEntry[] }> = ({ entries }) => {
    const { days, streak } = useMemo(() => {
        const entryDates = new Set(entries.map(entry => new Date(entry.date).toISOString().split('T')[0]));
        
        const dayData = Array.from({ length: 7 }).map((_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            return {
                date: d,
                dateStr,
                dayName: d.toLocaleDateString('en-US', { weekday: 'short' })[0],
                isActive: entryDates.has(dateStr),
            };
        }).reverse();

        let currentStreak = 0;
        let streakDate = new Date(); // Start checking from today

        // If no entry today, check from yesterday to be forgiving
        if (!entryDates.has(streakDate.toISOString().split('T')[0])) {
            streakDate.setDate(streakDate.getDate() - 1);
        }

        // Now count backwards from streakDate
        for (let i = 0; i < 7; i++) {
            const d = new Date(streakDate);
            d.setDate(streakDate.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            
            if (entryDates.has(dateStr)) {
                currentStreak++;
            } else {
                break; // Streak broken
            }
        }
        
        return { days: dayData, streak: currentStreak };
    }, [entries]);

    return (
        <div className="p-4 bg-slate-100/50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700/50">
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-3">Weekly Activity</h3>
            <div className="flex justify-between items-center bg-white dark:bg-slate-800 p-3 rounded-lg">
                {days.map(({ date, dateStr, dayName, isActive }) => (
                    <div key={dateStr} className="text-center" title={date.toLocaleDateString()}>
                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{dayName}</p>
                        <div className={`mt-2 w-7 h-7 rounded-full transition-colors ${isActive ? 'bg-calm-green-500' : 'bg-slate-200 dark:bg-slate-700'}`}></div>
                    </div>
                ))}
            </div>
             <div className="mt-3 text-center">
                <p className="text-2xl font-bold text-calm-green-600 dark:text-calm-green-400">🔥 {streak} Day Streak</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{streak > 0 ? "Great job, keep it up!" : "Start a new streak today!"}</p>
            </div>
        </div>
    );
};


// --- Page Props ---
interface DashboardPageProps {
  theme: 'light' | 'dark';
  onNavigateHome: () => void;
  onNavigateToChat: () => void;
  onNavigateToJournal: (entryId?: string) => void;
  onNavigateToWriter: () => void;
}

const DashboardPage: React.FC<DashboardPageProps> = ({ theme, onNavigateHome, onNavigateToChat, onNavigateToJournal, onNavigateToWriter }) => {
    const [entries, setEntries] = useState<JournalEntry[]>([]);
    const [currentWeekId] = useState(getWeekId(new Date()));
    const [summaryData, setSummaryData] = useState<{ summary: string; themes: { theme: string; reflection: string }[] } | null>(null);
    const [isSummaryLoading, setIsSummaryLoading] = useState(true);
    const [summaryError, setSummaryError] = useState<string | null>(null);
    const [profile, setProfile] = useState<UserProfile>({ name: '', profession: '', keyLifeAreas: [] });

    useEffect(() => {
        try {
            const key = getLocalStorageKey(currentWeekId);
            const savedEntries = localStorage.getItem(key);
            setEntries(savedEntries ? JSON.parse(savedEntries) : []);
        } catch (e) { console.error("Failed to load journal entries:", e); }
    }, [currentWeekId]);

    useEffect(() => {
        try {
            const key = getProfileLocalStorageKey();
            const savedProfile = localStorage.getItem(key);
            if (savedProfile) {
                setProfile(JSON.parse(savedProfile));
            }
        } catch (e) { console.error("Failed to load profile:", e); }
    }, []);

    const handleProfileSave = (newProfile: UserProfile) => {
        setProfile(newProfile);
        try {
            const key = getProfileLocalStorageKey();
            localStorage.setItem(key, JSON.stringify(newProfile));
        } catch (e) {
            console.error("Failed to save profile:", e);
        }
    };


    useEffect(() => {
        const generateSummary = async () => {
            if (entries.length === 0) {
                setIsSummaryLoading(false);
                setSummaryData(null);
                return;
            }
    
            setIsSummaryLoading(true);
            setSummaryError(null);
    
            try {
                const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
                const summarySchema = {
                    type: Type.OBJECT,
                    properties: {
                        summary: { type: Type.STRING, description: "A 2-3 sentence compassionate summary of the user's weekly emotional state. Address the user directly in the second person (e.g., 'It seems like you...')." },
                        themes: {
                            type: Type.ARRAY,
                            description: "A list of 2-3 key themes or anxieties, each with an actionable reflection point.",
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    theme: { type: Type.STRING, description: "A concise name for the theme or anxiety (e.g., 'School Stress', 'Friendship Worries')." },
                                    reflection: { type: Type.STRING, description: "A simple, gentle question or reflection point related to the theme." }
                                },
                                required: ['theme', 'reflection']
                            }
                        },
                        isSufficient: { type: Type.BOOLEAN, description: "True if there is enough content to create a meaningful summary, otherwise false." }
                    },
                    required: ['summary', 'themes', 'isSufficient']
                };
    
                const allEntriesText = entries.map(e => `Title: ${e.title}\nContent: ${e.content}`).join('\n\n---\n\n');
    
                const prompt = `
                    Analyze the following journal entries from a young person for the week. Your goal is to provide actionable insights in a compassionate and supportive tone.
                    1. Write a compassionate summary (2-3 sentences) of their weekly emotional state. Address the user directly ("you").
                    2. Identify and list 2-3 primary themes or anxieties that are recurring in their entries. These should be concise and clear.
                    3. For each theme/anxiety, provide one simple, actionable reflection point or question to help them think about it further.
                    Your response must be in JSON format. If there isn't enough content to provide a meaningful summary, set isSufficient to false.

                    Journal Entries:
                    "${allEntriesText}"
                `;
                
                const response = await ai.models.generateContent({
                    model: 'gemini-2.5-flash',
                    contents: prompt,
                    config: { responseMimeType: "application/json", responseSchema: summarySchema },
                });
    
                const result = JSON.parse(response.text);
                
                if (result.isSufficient) {
                    setSummaryData({ summary: result.summary, themes: result.themes });
                } else {
                    setSummaryData(null);
                }
    
            } catch (e) {
                console.error("Failed to generate summary:", e);
                setSummaryError("Couldn't generate your weekly summary. Please try again later.");
            } finally {
                setIsSummaryLoading(false);
            }
        };
    
        generateSummary();
    }, [entries]);

    const resourceSpotlight = useMemo(() => resources[Math.floor(Math.random() * resources.length)], []);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 },
    };
    
    const greetingName = profile.name.trim() ? `, ${profile.name}` : '';

    return (
        <div className="flex flex-col h-screen bg-white dark:bg-black text-slate-800 dark:text-slate-200 transition-colors duration-300">
            <header className="flex-shrink-0 p-4 flex justify-between items-center border-b border-slate-200 dark:border-slate-800">
                <button onClick={onNavigateHome} className="flex items-center gap-2 rounded-full bg-black/20 dark:bg-white/10 px-4 py-2 text-sm font-medium text-slate-800 dark:text-slate-300 backdrop-blur-sm transition-all hover:bg-slate-200 dark:hover:bg-white/20 hover:text-black dark:hover:text-white" aria-label="Go back to home page">
                    <HomeIcon /> <span>Home</span>
                </button>
            </header>

            <main className="flex-1 overflow-y-auto p-4 md:p-8">
                <div className="max-w-5xl mx-auto">
                    <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white mb-2">
                        Your <span className="gradient-text">Dashboard</span>
                    </h1>
                    <p className="text-lg text-slate-600 dark:text-slate-400 mb-8">Welcome back{greetingName}. Here's a look at your recent activity.</p>
                    
                    {/* @ts-ignore */}
                    <motion.div
                        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        {/* Left Column */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* @ts-ignore */}
                            <motion.div variants={itemVariants}><MoodChartWidget entries={entries} /></motion.div>
                            {/* @ts-ignore */}
                            <motion.div variants={itemVariants}>
                                <WellnessSummaryWidget
                                    summaryData={summaryData}
                                    isLoading={isSummaryLoading}
                                    error={summaryError}
                                    onNavigateToJournal={() => onNavigateToJournal()}
                                />
                            </motion.div>
                        </div>
                        
                        {/* Right Column */}
                        <div className="space-y-6">
                            {/* @ts-ignore */}
                            <motion.div variants={itemVariants}>
                                <ProfileWidget profile={profile} onSave={handleProfileSave} />
                            </motion.div>
                             {/* @ts-ignore */}
                            <motion.div variants={itemVariants}>
                                <ConsistencyTrackerWidget entries={entries} />
                            </motion.div>
                            {/* @ts-ignore */}
                            <motion.div variants={itemVariants}>
                                <div className="p-4 bg-slate-100/50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700/50">
                                    <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-3">Quick Actions</h3>
                                    <div className="space-y-3">
                                        <button onClick={onNavigateToChat} className="w-full flex items-center gap-4 p-4 rounded-lg bg-calm-green-100/50 dark:bg-calm-green-900/30 hover:bg-calm-green-100 dark:hover:bg-calm-green-900/50 transition-colors"><ChatIcon /> <span className="font-semibold">Start a New Chat</span></button>
                                        <button onClick={() => onNavigateToJournal()} className="w-full flex items-center gap-4 p-4 rounded-lg bg-calm-orange-100/50 dark:bg-calm-orange-900/30 hover:bg-calm-orange-100 dark:hover:bg-calm-orange-900/50 transition-colors"><JournalIcon /> <span className="font-semibold">Write a Journal Entry</span></button>
                                        <button onClick={onNavigateToWriter} className="w-full flex items-center gap-4 p-4 rounded-lg bg-calm-purple-100/50 dark:bg-calm-purple-900/30 hover:bg-calm-purple-100 dark:hover:bg-calm-purple-900/50 transition-colors"><WriterIcon /> <span className="font-semibold">Draft a Message</span></button>
                                    </div>
                                </div>
                            </motion.div>
                            {/* @ts-ignore */}
                            <motion.div variants={itemVariants}>
                                <div className="p-4 bg-slate-100/50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700/50">
                                    <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-3">Resource Spotlight</h3>
                                    <div className="p-3 bg-white dark:bg-slate-800 rounded-lg">
                                        <h4 className="font-bold text-calm-blue-700 dark:text-calm-blue-300">{resourceSpotlight.name}</h4>
                                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 mb-2">{resourceSpotlight.description}</p>
                                        <a href={resourceSpotlight.url} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-calm-blue-600 hover:text-calm-blue-700 dark:text-calm-blue-400 dark:hover:text-calm-blue-300">Learn More &rarr;</a>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </motion.div>
                </div>
            </main>
        </div>
    );
};

export default DashboardPage;