

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { motion, AnimatePresence } from 'framer-motion';
import jsPDF from 'jspdf';
import type { JournalEntry, AIAnalysis } from '../types';
import { useSpeechRecognition, PermissionState } from '../hooks/useSpeechRecognition';

// --- Helper Functions ---
const getWeekId = (d: Date) => {
    const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    date.setUTCDate(date.getUTCDate() + 4 - (date.getUTCDay() || 7));
    const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil((((date.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
    return `${date.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
};
const getLocalStorageKey = (weekId: string) => `mindful-youth-journal-${weekId}`;
const MAX_ENTRIES = 8;

// --- Icons ---
const HomeIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>);
const DownloadIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>);
const PlusIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>);
const TrashIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>);
const EditIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>);
const ArrowLeftIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>);
const MicIcon = ({ className = "w-5 h-5" }: { className?: string }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="22"></line></svg>);


const getEmojiForMood = (positivity: number): string => {
    if (positivity > 4.5) return '😄'; // Very Positive
    if (positivity > 3.5) return '🙂'; // Positive
    if (positivity > 2.5) return '😐'; // Neutral
    if (positivity > 1.5) return '😕'; // Negative
    return '😢'; // Very Negative
};

const MoodCalendar: React.FC<{ entries: JournalEntry[] }> = ({ entries }) => {
    const moodsByDate = useMemo(() => {
        const map = new Map<string, { totalPositivity: number; count: number }>();
        entries.forEach(entry => {
            if (entry.analysis) {
                const dateStr = new Date(entry.date).toISOString().split('T')[0];
                const existing = map.get(dateStr) || { totalPositivity: 0, count: 0 };
                map.set(dateStr, {
                    totalPositivity: existing.totalPositivity + entry.analysis.mood.positivity,
                    count: existing.count + 1,
                });
            }
        });
        return map;
    }, [entries]);

    const days = useMemo(() => {
        return Array.from({ length: 8 }).map((_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - i);
            return d;
        }).reverse();
    }, []);

    const todayStr = new Date().toISOString().split('T')[0];

    return (
        <div className="p-3 bg-slate-100 dark:bg-slate-800/50 rounded-lg mb-3">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 px-1">Your Week at a Glance</h3>
            <div className="grid grid-cols-4 gap-2 text-center">
                {days.map(day => {
                    const dateStr = day.toISOString().split('T')[0];
                    const moodData = moodsByDate.get(dateStr);
                    const avgPositivity = moodData ? moodData.totalPositivity / moodData.count : 0;
                    const emoji = moodData ? getEmojiForMood(avgPositivity) : null;
                    const isToday = dateStr === todayStr;

                    return (
                        <div key={dateStr} className={`p-1 rounded-lg ${isToday ? 'bg-calm-orange-100 dark:bg-calm-orange-900/50' : ''}`}>
                            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                                {day.toLocaleDateString('en-US', { weekday: 'short' })[0]}
                            </p>
                            <p className={`font-semibold mt-0.5 ${isToday ? 'text-calm-orange-600 dark:text-calm-orange-300' : 'text-slate-700 dark:text-slate-300'}`}>
                                {day.getDate()}
                            </p>
                            <div className="h-6 mt-1 flex items-center justify-center text-lg">
                                {emoji || <span className="text-slate-300 dark:text-slate-600">-</span>}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};


// --- Component Props ---
interface JournalPageProps {
  theme: 'light' | 'dark';
  onNavigateHome: () => void;
  initialSelectedEntryId: string | null;
  clearInitialSelectedEntryId: () => void;
}

const JournalPage: React.FC<JournalPageProps> = ({ theme, onNavigateHome, initialSelectedEntryId, clearInitialSelectedEntryId }) => {
    const [entries, setEntries] = useState<JournalEntry[]>([]);
    const [selectedEntryId, setSelectedEntryId] = useState<string | 'new' | null>(null);
    const [currentWeekId, setCurrentWeekId] = useState(getWeekId(new Date()));
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // --- Data Fetching and Persistence ---
    useEffect(() => {
        try {
            const key = getLocalStorageKey(currentWeekId);
            const savedEntries = localStorage.getItem(key);
            if (savedEntries) {
                setEntries(JSON.parse(savedEntries));
            } else {
                setEntries([]);
            }
        } catch (e) {
            console.error("Failed to load journal entries:", e);
            setError("Could not load your journal entries. Please try again later.");
        }
    }, [currentWeekId]);
    
    useEffect(() => {
        if (initialSelectedEntryId) {
            setSelectedEntryId(initialSelectedEntryId);
            clearInitialSelectedEntryId();
        }
    }, [initialSelectedEntryId, clearInitialSelectedEntryId]);


    const saveEntries = useCallback((updatedEntries: JournalEntry[]) => {
        try {
            const key = getLocalStorageKey(currentWeekId);
            localStorage.setItem(key, JSON.stringify(updatedEntries));
            setEntries(updatedEntries);
        } catch (e) {
            console.error("Failed to save journal entries:", e);
            setError("Could not save your journal entry. Your data may not be persisted.");
        }
    }, [currentWeekId]);

    // --- Gemini API ---
    const getAnalysis = useCallback(async (title: string, content: string): Promise<AIAnalysis> => {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const analysisSchema = {
            type: Type.OBJECT,
            properties: {
                summary: { type: Type.STRING, description: "A concise, 1-2 sentence summary of the user's emotional state and main topics." },
                observations: { type: Type.ARRAY, description: "A list of 2-3 gentle, non-judgmental observations about potential patterns or themes.", items: { type: Type.STRING } },
                followUpQuestions: { type: Type.ARRAY, description: "A list of 2-3 open-ended, reflective questions to encourage deeper thought.", items: { type: Type.STRING } },
                mood: {
                    type: Type.OBJECT, properties: {
                        label: { type: Type.STRING, description: "A single descriptive word for the overall mood (e.g., 'Reflective', 'Anxious', 'Hopeful')." },
                        positivity: { type: Type.INTEGER, description: "An integer from 1 (very negative) to 5 (very positive) representing the positivity of the mood." }
                    }
                }
            }
        };

        const prompt = `Analyze the following journal entry from a young person. Be supportive, gentle, and insightful. Do not give medical advice.
        Title: "${title}"
        Entry: "${content}"
        Provide a structured analysis based on the schema.`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: { responseMimeType: "application/json", responseSchema: analysisSchema },
        });

        return JSON.parse(response.text) as AIAnalysis;
    }, []);


    // --- Event Handlers ---
    const handleAddEntry = async (title: string, content: string): Promise<string> => {
        setIsLoading(true);
        setError(null);
        
        const newEntry: JournalEntry = {
            id: Date.now().toString(),
            date: new Date().toISOString(),
            title,
            content,
            isAnalyzing: true
        };

        let updatedEntries = [newEntry, ...entries].slice(0, MAX_ENTRIES);
        saveEntries(updatedEntries);

        // Run analysis in the background
        (async () => {
            try {
                const analysis = await getAnalysis(title, content);
                setEntries(current => {
                    const latestEntries = current.map(e => e.id === newEntry.id ? { ...e, analysis, isAnalyzing: false } : e);
                    saveEntries(latestEntries); // Re-save with analysis data
                    return latestEntries;
                });
            } catch (e) {
                console.error("Gemini API Error:", e);
                setError("Sorry, I couldn't analyze this entry. Please check your connection or try again later.");
                setEntries(current => {
                    const latestEntries = current.map(e => e.id === newEntry.id ? { ...e, isAnalyzing: false } : e);
                    saveEntries(latestEntries);
                    return latestEntries;
                });
            } finally {
                setIsLoading(false);
            }
        })();
        
        return newEntry.id;
    };
    
    const handleUpdateEntry = (id: string, newTitle: string, newContent: string) => {
        const updatedEntries = entries.map(entry => 
            entry.id === id ? { ...entry, title: newTitle, content: newContent } : entry
        );
        saveEntries(updatedEntries);
    };

    const handleDeleteEntry = (id: string) => {
        const newEntries = entries.filter(entry => entry.id !== id);
        saveEntries(newEntries);
        if (selectedEntryId === id) {
            setSelectedEntryId(null);
        }
    };
    
    const handleDownloadPdf = () => {
        const doc = new jsPDF();
        const margin = 15;
        const pageWidth = doc.internal.pageSize.getWidth();
        const usableWidth = pageWidth - 2 * margin;
        let y = margin + 10;

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(20);
        doc.text("Mindful Youth - Weekly Journal Report", pageWidth / 2, y, { align: 'center' });
        y += 8;
        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100);
        doc.text(`Week ID: ${currentWeekId}`, pageWidth / 2, y, { align: 'center' });
        y += 15;

        entries.slice().reverse().forEach((entry, index) => {
            if (y > 260) {
                doc.addPage();
                y = margin;
            }

            doc.setFont('helvetica', 'bold');
            doc.setFontSize(14);
            doc.setTextColor(0);
            const titleLines = doc.splitTextToSize(entry.title, usableWidth);
            doc.text(titleLines, margin, y);
            y += titleLines.length * 6;

            doc.setFont('helvetica', 'italic');
            doc.setFontSize(10);
            doc.setTextColor(150);
            doc.text(new Date(entry.date).toLocaleString(), margin, y);
            y += 8;

            doc.setFont('helvetica', 'normal');
            doc.setFontSize(11);
            doc.setTextColor(50);
            const contentLines = doc.splitTextToSize(entry.content, usableWidth);
            doc.text(contentLines, margin, y);
            y += contentLines.length * 5 + 10;
            
            if (entry.analysis) {
                 doc.setDrawColor(230);
                 doc.line(margin, y - 5, pageWidth - margin, y - 5);

                 doc.setFont('helvetica', 'bold');
                 doc.setFontSize(11);
                 doc.setTextColor(0);
                 doc.text("AI Analysis", margin, y);
                 y += 6;

                 doc.setFont('helvetica', 'normal');
                 doc.text(`- Mood: ${entry.analysis.mood.label} (Positivity: ${entry.analysis.mood.positivity}/5)`, margin + 5, y);
                 y += 5;
                 
                 const summaryLines = doc.splitTextToSize(`- Summary: ${entry.analysis.summary}`, usableWidth - 5);
                 doc.text(summaryLines, margin + 5, y);
                 y += summaryLines.length * 5;

                 const obsLines = doc.splitTextToSize(`- Observations: ${entry.analysis.observations.join(' ')}`, usableWidth - 5);
                 doc.text(obsLines, margin + 5, y);
                 y += obsLines.length * 5;

                 const qLines = doc.splitTextToSize(`- Questions to consider: ${entry.analysis.followUpQuestions.join(' ')}`, usableWidth - 5);
                 doc.text(qLines, margin + 5, y);
                 y += qLines.length * 5 + 10;
            }

            if (index < entries.length - 1) {
                doc.setLineWidth(0.5);
                doc.setDrawColor(200);
                doc.line(margin, y, pageWidth - margin, y);
                y += 10;
            }
        });

        doc.save(`journal-report-${currentWeekId}.pdf`);
    };

    const selectedEntry = entries.find(e => e.id === selectedEntryId);

    return (
        <div className="flex flex-col h-screen bg-white dark:bg-black text-slate-800 dark:text-slate-200 transition-colors duration-300">
            {/* Header */}
            <header className="flex-shrink-0 p-4 flex justify-between items-center border-b border-slate-200 dark:border-slate-800">
                <button onClick={onNavigateHome} className="flex items-center gap-2 rounded-full bg-black/20 dark:bg-white/10 px-4 py-2 text-sm font-medium text-slate-800 dark:text-slate-300 backdrop-blur-sm transition-all hover:bg-slate-200 dark:hover:bg-white/20 hover:text-black dark:hover:text-white" aria-label="Go back to home page">
                    <HomeIcon /> <span>Home</span>
                </button>
                <button onClick={handleDownloadPdf} disabled={entries.length === 0} className="flex items-center gap-2 rounded-full bg-black/20 dark:bg-white/10 px-4 py-2 text-sm font-medium text-slate-800 dark:text-slate-300 backdrop-blur-sm transition-all hover:bg-slate-200 dark:hover:bg-white/20 hover:text-black dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed" aria-label="Download weekly report">
                    <DownloadIcon /> <span>Download Report</span>
                </button>
            </header>

            {/* Main Content */}
            <div className="flex flex-1 overflow-hidden relative">
                {/* Entry List Panel */}
                <aside className={`w-full md:w-1/3 md:flex-shrink-0 h-full transition-transform duration-300 ease-in-out md:translate-x-0 ${selectedEntryId !== null ? 'hidden md:block' : 'block'}`}>
                    <div className="h-full overflow-y-auto border-r border-slate-200 dark:border-slate-800 p-4 space-y-3">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 px-2 mb-4">This Week's Journal</h2>
                        <MoodCalendar entries={entries} />
                        <button onClick={() => setSelectedEntryId('new')} className="w-full flex items-center gap-2 text-left p-3 rounded-lg transition-colors bg-calm-green-500/10 text-calm-green-700 dark:text-calm-green-300 dark:bg-calm-green-500/20 hover:bg-calm-green-500/20">
                            <PlusIcon />
                            <span className="font-semibold">New Entry</span>
                        </button>
                        <AnimatePresence>
                            {entries.map(entry => (
                                // FIX: Framer Motion props are not being recognized by TypeScript due to a potential version issue. Using ts-ignore as a workaround.
                                // @ts-ignore
                                <motion.div key={entry.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -10 }} layout>
                                    <button onClick={() => setSelectedEntryId(entry.id)} className={`w-full text-left p-3 rounded-lg transition-colors ${selectedEntryId === entry.id ? 'bg-calm-orange-100 dark:bg-calm-orange-900/50' : 'hover:bg-slate-100 dark:hover:bg-slate-800/50'}`}>
                                        <h3 className="font-semibold text-slate-800 dark:text-slate-200 truncate">{entry.title}</h3>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{new Date(entry.date).toLocaleDateString()}</p>
                                    </button>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                </aside>

                {/* Detail/Form Panel */}
                <main className={`absolute md:static inset-0 bg-white dark:bg-black transition-transform duration-300 ease-in-out md:translate-x-0 md:flex-1 ${selectedEntryId !== null ? 'translate-x-0' : 'translate-x-full'}`}>
                    <div className="h-full overflow-y-auto p-6">
                         {selectedEntryId !== null && (
                            <div className="md:hidden">
                                <button onClick={() => setSelectedEntryId(null)} className="flex items-center gap-2 mb-6 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-calm-orange-500 transition-colors">
                                    <ArrowLeftIcon />
                                    Back to entries
                                </button>
                            </div>
                        )}
                        <AnimatePresence mode="wait">
                            {selectedEntry ? (
                                // FIX: Framer Motion props are not being recognized by TypeScript due to a potential version issue. Using ts-ignore as a workaround.
                                // @ts-ignore
                                <motion.div key={selectedEntry.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                    <EntryDetail entry={selectedEntry} onDelete={handleDeleteEntry} onSave={handleUpdateEntry} />
                                </motion.div>
                            ) : selectedEntryId === 'new' ? (
                                // FIX: Framer Motion props are not being recognized by TypeScript due to a potential version issue. Using ts-ignore as a workaround.
                                // @ts-ignore
                                <motion.div key="new-entry" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                    <NewEntryForm 
                                        onAddEntry={async (title, content) => {
                                            const newId = await handleAddEntry(title, content);
                                            setSelectedEntryId(newId);
                                        }} 
                                        isLoading={isLoading} 
                                        hasEntries={entries.length > 0} 
                                    />
                                </motion.div>
                            ) : (
                                <div className="hidden md:flex h-full items-center justify-center text-slate-500">
                                    <div className="text-center">
                                        <i className="fas fa-book-open text-4xl mb-4 opacity-50"></i>
                                        <p className="font-semibold text-lg text-slate-600 dark:text-slate-400">Select an entry to read</p>
                                        <p className="text-sm">or create a new one to get started.</p>
                                    </div>
                                </div>
                            )}
                        </AnimatePresence>
                    </div>
                </main>
            </div>
        </div>
    );
};

const NewEntryForm: React.FC<{onAddEntry: (title: string, content: string) => Promise<void>; isLoading: boolean, hasEntries: boolean}> = ({ onAddEntry, isLoading, hasEntries }) => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const contentOnListenStart = useRef("");

    const handleVoiceResult = useCallback((transcript: string) => {
        setContent(contentOnListenStart.current + transcript);
    }, []);

    const { isListening, startListening, stopListening, hasRecognitionSupport, permissionState } = useSpeechRecognition({ onResult: handleVoiceResult });

    const handleMicClick = () => {
        if (isListening) {
            stopListening();
        } else {
            contentOnListenStart.current = content;
            startListening();
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (title.trim() && content.trim() && !isLoading) {
            await onAddEntry(title, content);
            // Form clearing is handled by component unmount/remount
        }
    };
    
    return (
        <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                    {hasEntries ? 'New Journal Entry' : 'Your First Journal Entry'}
                </h2>
                <p className="text-slate-500 dark:text-slate-400 mt-2">
                    {hasEntries ? 'What\'s on your mind today?' : 'Write down your thoughts to begin your wellness journey.'}
                </p>
            </div>
             <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="title" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Title</label>
                    <input type="text" id="title" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g., A challenging day" className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md focus:outline-none focus:ring-2 focus:ring-calm-orange-500" required />
                </div>
                <div>
                    <label htmlFor="content" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Content</label>
                    <div className="relative">
                        <textarea id="content" value={content} onChange={e => setContent(e.target.value)} rows={10} placeholder="Write about your thoughts, feelings, and experiences here..." className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md focus:outline-none focus:ring-2 focus:ring-calm-orange-500" required />
                        <button
                            type="button"
                            onClick={handleMicClick}
                            disabled={!hasRecognitionSupport || permissionState === 'denied'}
                            title={
                                !hasRecognitionSupport ? "Voice input not supported by your browser." :
                                permissionState === 'denied' ? "Microphone permission denied. Please enable it in your browser settings." :
                                isListening ? "Stop listening" : "Use voice to text"
                            }
                            className={`absolute bottom-3 right-3 p-2 rounded-full transition-colors ${isListening ? 'bg-red-500/20 text-red-500 animate-pulse' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600'} disabled:opacity-50 disabled:cursor-not-allowed`}
                            aria-label="Use voice to text"
                        >
                            <MicIcon className="w-5 h-5" />
                        </button>
                    </div>
                </div>
                <div className="flex justify-end">
                    <button type="submit" disabled={isLoading} className="px-6 py-2.5 bg-calm-orange-600 text-white font-semibold rounded-md hover:bg-calm-orange-700 transition-colors disabled:bg-slate-400 disabled:cursor-not-allowed flex items-center gap-2">
                        {isLoading ? 'Analyzing...' : 'Save & Analyze'}
                    </button>
                </div>
            </form>
        </div>
    )
}

const EntryDetail: React.FC<{entry: JournalEntry; onDelete: (id: string) => void; onSave: (id: string, newTitle: string, newContent: string) => void;}> = ({ entry, onDelete, onSave }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editedTitle, setEditedTitle] = useState(entry.title);
    const [editedContent, setEditedContent] = useState(entry.content);
    const editedContentOnListenStart = useRef("");

    const handleVoiceResult = useCallback((transcript: string) => {
        setEditedContent(editedContentOnListenStart.current + transcript);
    }, []);

    const { isListening, startListening, stopListening, hasRecognitionSupport, permissionState } = useSpeechRecognition({ onResult: handleVoiceResult });

    const handleMicClick = () => {
        if (isListening) {
            stopListening();
        } else {
            editedContentOnListenStart.current = editedContent;
            startListening();
        }
    };

    // Reset local state if the entry prop changes (e.g., user selects a different entry)
    useEffect(() => {
        setEditedTitle(entry.title);
        setEditedContent(entry.content);
        setIsEditing(false); // Exit edit mode when switching entries
    }, [entry]);

    const handleSave = () => {
        onSave(entry.id, editedTitle, editedContent);
        setIsEditing(false);
    };

    const handleCancel = () => {
        setEditedTitle(entry.title);
        setEditedContent(entry.content);
        setIsEditing(false);
    };

    if (isEditing) {
        return (
            <div className="max-w-3xl mx-auto space-y-4">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Editing Entry</h2>
                <div>
                    <label htmlFor="edit-title" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Title</label>
                    <input type="text" id="edit-title" value={editedTitle} onChange={e => setEditedTitle(e.target.value)} className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md focus:outline-none focus:ring-2 focus:ring-calm-orange-500" required />
                </div>
                <div>
                    <label htmlFor="edit-content" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Content</label>
                    <div className="relative">
                        <textarea id="edit-content" value={editedContent} onChange={e => setEditedContent(e.target.value)} rows={10} className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md focus:outline-none focus:ring-2 focus:ring-calm-orange-500" required />
                        <button
                            type="button"
                            onClick={handleMicClick}
                            disabled={!hasRecognitionSupport || permissionState === 'denied'}
                            title={
                                !hasRecognitionSupport ? "Voice input not supported by your browser." :
                                permissionState === 'denied' ? "Microphone permission denied. Please enable it in your browser settings." :
                                isListening ? "Stop listening" : "Use voice to text"
                            }
                            className={`absolute bottom-3 right-3 p-2 rounded-full transition-colors ${isListening ? 'bg-red-500/20 text-red-500 animate-pulse' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600'} disabled:opacity-50 disabled:cursor-not-allowed`}
                            aria-label="Use voice to text"
                        >
                            <MicIcon className="w-5 h-5" />
                        </button>
                    </div>
                </div>
                <div className="flex justify-end gap-3">
                    <button onClick={handleCancel} className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold rounded-md hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors">
                        Cancel
                    </button>
                    <button onClick={handleSave} className="px-6 py-2 bg-calm-orange-600 text-white font-semibold rounded-md hover:bg-calm-orange-700 transition-colors">
                        Save Changes
                    </button>
                </div>
            </div>
        );
    }
    
    return (
        <div className="max-w-3xl mx-auto space-y-8">
            <div>
                <div className="flex justify-between items-start gap-4">
                    <div>
                        <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">{entry.title}</h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{new Date(entry.date).toLocaleString()}</p>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                        <button onClick={() => setIsEditing(true)} className="p-2 text-slate-500 hover:text-calm-orange-500 hover:bg-calm-orange-500/10 rounded-full transition-colors" aria-label="Edit entry">
                            <EditIcon />
                        </button>
                        <button onClick={() => onDelete(entry.id)} className="p-2 text-slate-500 hover:text-red-500 hover:bg-red-500/10 rounded-full transition-colors" aria-label="Delete entry">
                            <TrashIcon />
                        </button>
                    </div>
                </div>
                <p className="mt-4 text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">{entry.content}</p>
            </div>
            
            <div className="border-t border-slate-200 dark:border-slate-800 pt-6">
                <AnimatePresence>
                {entry.isAnalyzing ? (
                     // FIX: Framer Motion props are not being recognized by TypeScript due to a potential version issue. Using ts-ignore as a workaround.
                     // @ts-ignore
                     <motion.div key="analyzing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
                        <p className="text-slate-500 dark:text-slate-400">Your AI companion is reflecting on your entry...</p>
                        <div className="mt-4 inline-flex space-x-1.5 items-center p-3 rounded-lg bg-calm-orange-500/20 text-white self-start rounded-bl-none">
                            <div className="w-2 h-2 bg-calm-orange-500 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-calm-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                            <div className="w-2 h-2 bg-calm-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                        </div>
                    </motion.div>
                ) : entry.analysis ? (
                    // FIX: Framer Motion props are not being recognized by TypeScript due to a potential version issue. Using ts-ignore as a workaround.
                    // @ts-ignore
                    <motion.div key="analysis" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                         <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200">AI-Powered Insights</h3>
                         
                         <div className="p-4 bg-slate-100 dark:bg-slate-800/50 rounded-lg">
                            <h4 className="font-semibold mb-2">Mood</h4>
                            <div className="flex items-center gap-3">
                                <span className="text-calm-orange-600 dark:text-calm-orange-400 font-bold">{entry.analysis.mood.label}</span>
                                <div className="w-32 h-2 bg-slate-200 dark:bg-slate-700 rounded-full">
                                    <div className="h-2 bg-calm-orange-500 rounded-full" style={{ width: `${entry.analysis.mood.positivity * 20}%`}}></div>
                                </div>
                                <span className="text-xs text-slate-500">{entry.analysis.mood.positivity}/5</span>
                            </div>
                         </div>

                         <div className="p-4 bg-slate-100 dark:bg-slate-800/50 rounded-lg">
                            <h4 className="font-semibold mb-2">Summary</h4>
                            <p className="text-sm text-slate-600 dark:text-slate-300">{entry.analysis.summary}</p>
                         </div>
                         
                         <div className="p-4 bg-slate-100 dark:bg-slate-800/50 rounded-lg">
                            <h4 className="font-semibold mb-2">Gentle Observations</h4>
                            <ul className="list-disc list-inside text-sm text-slate-600 dark:text-slate-300 space-y-1">
                                {entry.analysis.observations.map((obs, i) => <li key={i}>{obs}</li>)}
                            </ul>
                         </div>
                         
                          <div className="p-4 bg-slate-100 dark:bg-slate-800/50 rounded-lg">
                            <h4 className="font-semibold mb-2">Questions for Reflection</h4>
                            <ul className="list-disc list-inside text-sm text-slate-600 dark:text-slate-300 space-y-1">
                                {entry.analysis.followUpQuestions.map((q, i) => <li key={i}>{q}</li>)}
                            </ul>
                         </div>

                    </motion.div>
                ) : (
                    // FIX: Framer Motion props are not being recognized by TypeScript due to a potential version issue. Using ts-ignore as a workaround.
                    // @ts-ignore
                    <motion.div key="no-analysis" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center p-4 bg-yellow-100/50 dark:bg-yellow-900/20 rounded-lg">
                        <p className="text-sm text-yellow-800 dark:text-yellow-200">The analysis for this entry could not be generated. You can delete it and try again.</p>
                    </motion.div>
                )}
                </AnimatePresence>
            </div>
        </div>
    )
}

export default JournalPage;