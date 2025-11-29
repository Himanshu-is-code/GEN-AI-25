import React, { useState, useCallback, useRef } from 'react';
import { GoogleGenAI } from "@google/genai";
import { motion, AnimatePresence } from 'framer-motion';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';


// --- Icons ---
const ArrowLeftIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <line x1="19" y1="12" x2="5" y2="12"></line>
        <polyline points="12 19 5 12 12 5"></polyline>
    </svg>
);
const SparklesIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" /><path d="M5 3v4" /><path d="M19 17v4" /><path d="M3 5h4" /><path d="M17 19h4" /></svg>);
const ClipboardCopyIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><rect width="8" height="4" x="8" y="2" rx="1" ry="1" /><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" /></svg>);
const CheckIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><polyline points="20 6 9 17 4 12" /></svg>);
const RefreshCwIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" /><path d="M21 3v5h-5" /><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" /><path d="M3 21v-5h5" /></svg>);
const MicIcon = ({ className = "w-5 h-5" }: { className?: string }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="22"></line></svg>);
const QuillPenIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-12 h-12 text-slate-400 dark:text-slate-600 mb-4"><path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3 16.828V21h4.172l14.002-14.002Z"/><path d="m15 5 6 6"/></svg>);
const AlertTriangleIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-10 h-10 text-red-500/80 mb-3"><path d="m21.73 18-8-14a2 2 0 0 0-3.46 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>);


const formOptions = {
    recipient: ["Parent", "Friend", "Teacher", "Therapist", "Other"],
    goal: ["Tell them I'm struggling", "Ask for help finding a therapist", "Cancel plans due to my mental health", "Explain my feelings", "Set a boundary", "Apologize for my behavior", "Other"],
    relationship: ["Close", "Complicated", "Formal", "New"],
    tone: ["Gentle & Serious", "Direct but Kind", "Casual & Supportive", "Formal & Respectful"],
};

interface MessageWriterPageProps {
  theme: 'light' | 'dark';
  onBack: () => void;
}

const MessageWriterPage: React.FC<MessageWriterPageProps> = ({ theme, onBack }) => {
    const [formData, setFormData] = useState({
        recipient: 'Parent',
        goal: "Tell them I'm struggling",
        relationship: 'Close',
        tone: 'Gentle & Serious',
        keyPoints: '',
    });
    const [draft, setDraft] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isCopied, setIsCopied] = useState(false);
    const keyPointsOnListenStart = useRef('');

    const handleVoiceResult = useCallback((transcript: string) => {
        setFormData(prev => ({...prev, keyPoints: keyPointsOnListenStart.current + transcript}));
    }, []);
    
    const { isListening, startListening, stopListening, hasRecognitionSupport, permissionState } = useSpeechRecognition({ onResult: handleVoiceResult });
    
    const handleMicClick = () => {
        if (isListening) {
            stopListening();
        } else {
            keyPointsOnListenStart.current = formData.keyPoints;
            startListening();
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleGenerate = useCallback(async (isRegenerate = false) => {
        setIsLoading(true);
        setError(null);
        if (!isRegenerate) {
            setDraft('');
        }

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const { recipient, goal, relationship, tone, keyPoints } = formData;
            const prompt = `
                You are a compassionate communication coach for a young person. Your task is to help them draft a message.
                The message should be clear, empathetic, and effectively communicate their needs. Do not sound like a robot.
                The tone should be natural and appropriate for the context provided.
                
                Here are the details for the message:
                - **Recipient:** ${recipient}
                - **Goal of the message:** ${goal}
                - **Their relationship with the recipient:** ${relationship}
                - **Desired tone:** ${tone}
                - **Key points to include:** "${keyPoints || 'No specific points provided, focus on the main goal.'}"

                Please generate only the text of the message draft. Do not add any extra commentary, titles like "Subject:", or introductions like "Here is a draft:".
                Just provide the raw message content.
            `;

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
            });
            setDraft(response.text.trim());
        } catch (e) {
            console.error("Gemini API Error:", e);
            setError("Sorry, I couldn't generate a draft right now. Please check your connection or try again.");
        } finally {
            setIsLoading(false);
        }
    }, [formData]);

    const handleCopy = () => {
        navigator.clipboard.writeText(draft);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    return (
        <div className="flex flex-col h-screen bg-white dark:bg-black text-slate-800 dark:text-slate-200 transition-colors duration-300">
            <header className="flex-shrink-0 p-4 flex justify-between items-center border-b border-slate-200 dark:border-slate-800">
                <button onClick={onBack} className="flex items-center gap-2 rounded-full bg-black/20 dark:bg-white/10 px-4 py-2 text-sm font-medium text-slate-800 dark:text-slate-300 backdrop-blur-sm transition-all hover:bg-slate-200 dark:hover:bg-white/20 hover:text-black dark:hover:text-white" aria-label="Go back">
                    <ArrowLeftIcon /> <span>Back</span>
                </button>
            </header>

            <main className="flex-1 overflow-y-auto p-4 md:p-8">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white">
                            Find the <span className="gradient-text">Right Words</span>
                        </h1>
                        <p className="mt-3 max-w-2xl text-lg text-slate-600 dark:text-slate-400 mx-auto">
                            Reaching out is hard. Let's draft a message together so you can get the support you need.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-8">
                        {/* Form Panel */}
                        <div className="bg-slate-100/50 dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-200 dark:border-slate-700/50">
                            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-4">1. Tell me the context</h2>
                            <form className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="recipient" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Who is this for?</label>
                                        <select id="recipient" name="recipient" value={formData.recipient} onChange={handleInputChange} className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md focus:outline-none focus:ring-2 focus:ring-calm-orange-500">
                                            {formOptions.recipient.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label htmlFor="goal" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">What's your goal?</label>
                                        <select id="goal" name="goal" value={formData.goal} onChange={handleInputChange} className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md focus:outline-none focus:ring-2 focus:ring-calm-orange-500">
                                            {formOptions.goal.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                        </select>
                                    </div>
                                     <div>
                                        <label htmlFor="relationship" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Relationship?</label>
                                        <select id="relationship" name="relationship" value={formData.relationship} onChange={handleInputChange} className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md focus:outline-none focus:ring-2 focus:ring-calm-orange-500">
                                            {formOptions.relationship.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label htmlFor="tone" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Tone?</label>
                                        <select id="tone" name="tone" value={formData.tone} onChange={handleInputChange} className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md focus:outline-none focus:ring-2 focus:ring-calm-orange-500">
                                            {formOptions.tone.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label htmlFor="keyPoints" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Any key points to include? (Optional)</label>
                                    <div className="relative">
                                        <textarea id="keyPoints" name="keyPoints" value={formData.keyPoints} onChange={handleInputChange} rows={3} placeholder="e.g., Mention I've been missing school..." className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md focus:outline-none focus:ring-2 focus:ring-calm-orange-500" />
                                        <button
                                            type="button"
                                            onClick={handleMicClick}
                                            disabled={!hasRecognitionSupport || permissionState === 'denied'}
                                            title={
                                                !hasRecognitionSupport ? "Voice input not supported by your browser." :
                                                permissionState === 'denied' ? "Microphone permission denied. Please enable it in your browser settings." :
                                                isListening ? "Stop listening" : "Use microphone"
                                            }
                                            className={`absolute bottom-2.5 right-2.5 p-2 rounded-full transition-colors ${isListening ? 'bg-red-500/20 text-red-500 animate-pulse' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'} disabled:opacity-50 disabled:cursor-not-allowed`}
                                            aria-label="Use voice to text for key points"
                                        >
                                            <MicIcon className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                                <div className="pt-2">
                                     <button type="button" onClick={() => handleGenerate(false)} disabled={isLoading} className="w-full px-6 py-3 bg-calm-orange-600 text-white font-semibold rounded-md hover:bg-calm-orange-700 transition-colors disabled:bg-slate-400 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                                        <SparklesIcon />
                                        {isLoading ? 'Generating...' : 'Generate Draft'}
                                    </button>
                                </div>
                            </form>
                        </div>
                        
                        {/* Draft Panel */}
                        <div className="bg-slate-100/50 dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-200 dark:border-slate-700/50 flex flex-col">
                            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-4">2. Review and edit your draft</h2>
                            <div className="flex-grow flex flex-col bg-slate-200/50 dark:bg-slate-900/50 rounded-lg min-h-[40vh]">
                                <AnimatePresence mode="wait">
                                    {isLoading && !draft ? (
                                        // FIX: Framer Motion props are not being recognized by TypeScript due to a potential version issue. Using ts-ignore as a workaround.
                                        // @ts-ignore
                                        <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-grow flex flex-col items-center justify-center p-4">
                                            <div className="flex space-x-2">
                                                <div className="w-3 h-3 bg-calm-orange-500 rounded-full animate-pulse"></div>
                                                <div className="w-3 h-3 bg-calm-orange-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                                                <div className="w-3 h-3 bg-calm-orange-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                                            </div>
                                            <p className="mt-4 text-sm text-slate-500">Drafting your message...</p>
                                        </motion.div>
                                    ) : error ? (
                                        // FIX: Framer Motion props are not being recognized by TypeScript due to a potential version issue. Using ts-ignore as a workaround.
                                        // @ts-ignore
                                        <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-grow flex flex-col items-center justify-center bg-red-500/10 p-4 rounded-lg text-center">
                                            <AlertTriangleIcon />
                                            <p className="font-semibold text-red-700 dark:text-red-300">Generation Failed</p>
                                            <p className="text-sm text-red-600 dark:text-red-400 mt-1 mb-4 max-w-xs">{error}</p>
                                            <button onClick={() => handleGenerate(false)} className="px-4 py-2 bg-red-600 text-white text-sm font-semibold rounded-md hover:bg-red-700 transition-colors">
                                                Try Again
                                            </button>
                                        </motion.div>
                                    ) : draft ? (
                                        // FIX: Framer Motion props are not being recognized by TypeScript due to a potential version issue. Using ts-ignore as a workaround.
                                        // @ts-ignore
                                        <motion.div key="draft" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-grow flex flex-col p-1">
                                            <textarea 
                                                value={draft} 
                                                onChange={(e) => setDraft(e.target.value)}
                                                aria-label="Message draft editor"
                                                className="w-full flex-grow p-4 bg-white dark:bg-slate-900 border-none rounded-md focus:outline-none focus:ring-2 focus:ring-calm-orange-500 text-lg leading-loose resize-none" />
                                            <div className="flex items-center justify-end gap-3 mt-2 px-2 py-1">
                                                <button onClick={() => handleGenerate(true)} disabled={isLoading} className="text-sm font-semibold flex items-center gap-1.5 text-slate-600 dark:text-slate-300 hover:text-calm-orange-500 dark:hover:text-calm-orange-400 transition-colors disabled:opacity-50">
                                                    <RefreshCwIcon /> {isLoading ? 'Regenerating...' : 'Regenerate'}
                                                </button>
                                                <button onClick={handleCopy} className="text-sm font-semibold flex items-center gap-1.5 bg-calm-green-600 text-white px-4 py-2 rounded-md hover:bg-calm-green-700 transition-colors">
                                                    {isCopied ? <CheckIcon /> : <ClipboardCopyIcon />}
                                                    {isCopied ? 'Copied!' : 'Copy'}
                                                </button>
                                            </div>
                                        </motion.div>
                                    ) : (
                                        // FIX: Framer Motion props are not being recognized by TypeScript due to a potential version issue. Using ts-ignore as a workaround.
                                        // @ts-ignore
                                        <motion.div key="placeholder" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-grow flex flex-col items-center justify-center text-center text-slate-500 dark:text-slate-400 p-4">
                                            <QuillPenIcon />
                                            <h3 className="font-semibold text-slate-600 dark:text-slate-400">Your draft will appear here</h3>
                                            <p className="text-sm text-slate-500 dark:text-slate-500 mt-1">Fill out the form to get started.</p>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default MessageWriterPage;