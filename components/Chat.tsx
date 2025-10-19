


import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GoogleGenAI, Chat, Type } from "@google/genai";
import { AiInput } from './AiInput';
import type { JournalEntry, AIAnalysis } from '../types';

// --- Journal Helper Functions ---
const getWeekId = (d: Date) => {
    const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    date.setUTCDate(date.getUTCDate() + 4 - (date.getUTCDay() || 7));
    const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil((((date.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
    return `${date.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
};
const getLocalStorageKey = (weekId: string) => `mindful-youth-journal-${weekId}`;
const MAX_ENTRIES = 8;

// An interface that includes the AI-generated title
interface GeneratedAIAnalysis extends AIAnalysis {
    title: string;
}

// --- Crisis Navigator ---
interface CrisisResource {
  name: string;
  description: string;
  contact: string;
  url: string;
}

const crisisKeywords = [
  // Direct suicidal ideation
  'kill myself', 'kll myself', 'kms',
  'end my life', 'ending my life',
  'take my own life',
  'want to die', 'wanna die',
  'commit suicide', 'suicidal thoughts', 'suicidal',
  'i am going to kill myself',

  // Self-harm
  'hurt myself', 'harm myself', 'cut myself',

  // Hopelessness / No future orientation
  'no reason to live', 'no point in living', 'no point anymore',
  'cant go on',
  'dont see a point',
  'no point',
  'cant take it anymore',
  'cant do this anymore',
  'cant take it',
  'end it all',
  'give up on life', 'give up',
  'everything is pointless',

  // Being a burden
  'better off without me', 'burden to everyone', 'i am a burden',

  // Desire to disappear/not exist
  'want to disappear', 'want to not exist',
  'dont want to be here anymore',
  'dont want to be here',
  'dont want to live',
];

const detectCrisisIntent = (userMessage: string): boolean => {
  const message = userMessage.toLowerCase().replace(/[.,/#!$'?%^&*;:{}=\-_`~()]/g, "");
  return crisisKeywords.some(keyword => message.includes(keyword));
};

interface GroundingSource {
  uri: string;
  title: string;
}

// Message type
interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  imagePreview?: string;
  analysis?: AIAnalysis;
  journalTitle?: string;
  isJournalWorthy?: boolean;
  originalUserMessage?: string;
  isCrisis?: boolean;
  resource?: CrisisResource;
  friendMessageDraft?: string;
  sources?: GroundingSource[];
}

// Component Props
interface ChatProps {
  theme: 'light' | 'dark';
  onNavigateHome: () => void;
  onNavigateToJournal: (entryId: string) => void;
}

const HomeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
);

const EditIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
    </svg>
);

const BookTextIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
        <path d="M6.5 2H20v15H6.5A2.5 2.5 0 0 1 4 14.5V4.5A2.5 2.5 0 0 1 6.5 2z"/>
    </svg>
);

const AlertTriangleIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 mr-2"><path d="m21.73 18-8-14a2 2 0 0 0-3.46 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>);

const SpeakerIcon = ({ isSpeaking }: { isSpeaking: boolean }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
        <path d="M19.07 4.93a10 10 0 0 1 0 14.14" className={isSpeaking ? 'opacity-100 animate-pulse' : 'opacity-50'} style={{ animationDelay: '0.2s' }} />
        <path d="M15.54 8.46a5 5 0 0 1 0 7.07" className={isSpeaking ? 'opacity-100 animate-pulse' : 'opacity-50'} />
    </svg>
);

const LinkIcon = ({ className }: { className: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.72"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.72-1.72"/></svg>
);


const CrisisResponseCard: React.FC<{ response: string; resource: CrisisResource; friendMessageDraft: string; }> = ({ response, resource, friendMessageDraft }) => {
    const [isCopied, setIsCopied] = useState(false);

    const handleCopy = () => {
        if (friendMessageDraft) {
            navigator.clipboard.writeText(friendMessageDraft);
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        }
    };
    
    const ClipboardCopyIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="8" height="4" x="8" y="2" rx="1" ry="1" /><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" /></svg>);
    const CheckIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>);

    return (
        <div className="border-l-4 border-red-500 bg-red-50 dark:bg-red-900/20 p-4 rounded-r-lg shadow-md w-full">
            <div className="flex items-center">
                <AlertTriangleIcon />
                <h3 className="font-bold text-red-800 dark:text-red-200">Immediate Support Available</h3>
            </div>
            <p className="mt-2 text-sm text-red-700 dark:text-red-300">{response}</p>
            <div className="mt-4 bg-white dark:bg-slate-800 p-3 rounded-lg border border-red-200 dark:border-red-800">
                <h4 className="font-semibold text-slate-800 dark:text-slate-200">{resource.name}</h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">{resource.description}</p>
                <p className="mt-2 text-base font-bold text-slate-900 dark:text-slate-100">{resource.contact}</p>
                <a href={resource.url} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-sm font-semibold text-calm-orange-600 hover:text-calm-orange-700 dark:text-calm-orange-400 dark:hover:text-calm-orange-300">
                    Visit Website &rarr;
                </a>
            </div>
             <div className="mt-4 bg-white dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                <h4 className="font-semibold text-slate-800 dark:text-slate-200 text-sm">Or text a friend for support</h4>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700/50 p-3 rounded-md italic">{friendMessageDraft}</p>
                <button 
                    onClick={handleCopy}
                    className="mt-3 w-full text-center text-sm font-semibold bg-calm-green-600 hover:bg-calm-green-700 text-white transition-colors py-2 px-4 rounded-md flex items-center justify-center gap-2"
                >
                    {isCopied ? <CheckIcon /> : <ClipboardCopyIcon />}
                    {isCopied ? 'Copied!' : 'Copy Text'}
                </button>
            </div>
        </div>
    );
};


const JournalAnalysisCard: React.FC<{ analysis: AIAnalysis; title: string; onEdit: () => void; }> = ({ analysis, title, onEdit }) => {
    return (
        <div className="p-4 rounded-lg shadow-md bg-gradient-to-br from-journal-green-start to-journal-green-end text-white rounded-bl-none w-full">
            <h3 className="font-bold text-base mb-2 border-b border-white/30 pb-2">Journal Entry Saved: "{title}"</h3>
            <div className="space-y-3 text-sm">
                <div>
                    <h4 className="font-semibold text-white/80">Mood</h4>
                    <div className="flex items-center gap-2 mt-1">
                        <span className="font-bold">{analysis.mood.label}</span>
                        <div className="w-24 h-1.5 bg-white/20 rounded-full">
                            <div className="h-1.5 bg-white rounded-full" style={{ width: `${analysis.mood.positivity * 20}%` }}></div>
                        </div>
                    </div>
                </div>
                <div>
                    <h4 className="font-semibold text-white/80">Summary</h4>
                    <p className="mt-1 text-white/95">{analysis.summary}</p>
                </div>
                <div>
                    <h4 className="font-semibold text-white/80">Gentle Observations</h4>
                    <ul className="list-disc list-inside mt-1 space-y-0.5 text-white/95">
                        {analysis.observations.map((obs, i) => <li key={i}>{obs}</li>)}
                    </ul>
                </div>
                <div>
                    <h4 className="font-semibold text-white/80">Questions for Reflection</h4>
                    <ul className="list-disc list-inside mt-1 space-y-0.5 text-white/95">
                        {analysis.followUpQuestions.map((q, i) => <li key={i}>{q}</li>)}
                    </ul>
                </div>
            </div>
            <div className="mt-4 pt-3 border-t border-white/30">
                <button onClick={onEdit} className="w-full text-center text-sm font-semibold bg-white/10 hover:bg-white/20 transition-colors py-2 px-4 rounded-md flex items-center justify-center gap-2">
                    <EditIcon />
                    View & Edit in Journal
                </button>
            </div>
        </div>
    );
};

const ChatPage: React.FC<ChatProps> = ({ theme, onNavigateHome, onNavigateToJournal }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [chat, setChat] = useState<Chat | null>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);

  // Automatically scroll to the latest message
  useEffect(() => {
    if (messagesContainerRef.current) {
        messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  useEffect(() => {
    const cancelSpeech = () => {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
        }
    };
    window.addEventListener('beforeunload', cancelSpeech);
    // Cleanup on unmount
    return () => {
        cancelSpeech();
        window.removeEventListener('beforeunload', cancelSpeech);
    }
  }, []);

  const handleSpeak = useCallback((messageToSpeak: Message) => {
    if (!('speechSynthesis' in window)) {
        console.warn("Text-to-speech not supported in this browser.");
        return;
    }

    if (speakingMessageId === messageToSpeak.id) {
        window.speechSynthesis.cancel();
        return;
    }

    if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
    }

    const utterance = new SpeechSynthesisUtterance(messageToSpeak.text);

    utterance.onstart = () => {
        setSpeakingMessageId(messageToSpeak.id);
    };

    const onSpeechEnd = () => {
        setSpeakingMessageId(prevId => (prevId === messageToSpeak.id ? null : prevId));
    };

    utterance.onend = onSpeechEnd;
    utterance.onerror = (e) => {
        console.error("Speech synthesis error", e);
        onSpeechEnd();
    };

    window.speechSynthesis.speak(utterance);
  }, [speakingMessageId]);


  const handleApiError = useCallback((error: any) => {
    console.error("Gemini API Error:", error);
    let errorMessage = "I'm sorry, something went wrong. Could you please try again?";
    // Check for quota/rate limit errors
    if (error && typeof error.message === 'string' && (error.message.includes('quota') || error.message.includes('rate limit'))) {
      errorMessage = "It looks like I'm getting a lot of requests right now. Please wait a moment before sending another message.";
    }
    setMessages(prev => [...prev.filter(m => m.sender !== 'ai' || !m.text.startsWith("I'm sorry")), { id: `ai-error-${Date.now()}`, sender: 'ai', text: errorMessage }]);
  }, []);

  // Initialize the Gemini Chat model
  useEffect(() => {
    const initializeChat = async () => {
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const newChat = ai.chats.create({
                model: 'gemini-2.5-flash',
                config: {
                    tools: [{googleSearch: {}}],
                    systemInstruction: `### **🔹 System Instructions: Project AURA (Autonomous Understanding & Responsible Action)**

**🎯 Primary Directive:**
You are an AI designed to be a **compassionate, context-aware, and critically thoughtful partner**. Your core purpose is to prioritize the user’s emotional and intellectual well-being over merely providing factually correct responses. You must operate with humility, empathy, and intellectual honesty.

---

### **🔁 The AURA Interaction Loop**

For every user input, follow this structured loop internally:

#### **A → ASSESS & ACKNOWLEDGE**
- Detect the user’s emotional state and unspoken needs.
- Identify whether the query is factual, emotional, exploratory, or a test.
- **Output:** An internal empathy model guiding your tone and content.

#### **U → UNDERSTAND & UNPACK**
- Deconstruct the query: separate surface-level questions from deeper needs.
- Challenge assumptions (yours and the user’s).
- Define what is known and unknown.
- **Output:** A clear, structured understanding of the problem.

#### **R → REASON & RESPOND**
- Address both stated and unstated needs.
- **Validate first** → acknowledge the emotion or context.
- **Then educate** → offer clear, structured information.
- **Empower finally** → guide the user toward agency and insight.
- **Output:** A response that is empathetic, logical, and actionable.

#### **A → ADAPT & LEARN**
- Treat each interaction as a learning opportunity.
- If the user responds with new context or confusion, re-enter the AURA loop.
- Admit mistakes openly and correct course.

---

### **📝 Journal Integration**
- If the user's message is a personal reflection, describes their feelings, or recounts their day in a way that would be suitable for a journal entry, you MUST append the exact token \`[JOURNAL_WORTHY]\` to the very end of your response.
- Do NOT use this token for simple questions, greetings, or factual inquiries. Use it only when the user is sharing personal experiences.
- Example: If the user says "I had a really tough fight with my friend today," your response might be "I'm sorry to hear that. Fights with friends are difficult.[JOURNAL_WORTHY]".

---

### **🛠️ Tool Usage: Google Search**
- When the user asks a factual question, especially about mental health topics, symptoms, treatments, or wellness techniques, you MUST use the Google Search tool to ground your response in reliable information.
- Always cite your sources by providing the links from the search results.
- Your primary goal is to provide safe, accurate, and helpful information. If you are unsure about a topic, use the search tool.
- Do NOT use the search tool for personal conversations or reflections. Only for factual inquiries.

---

### **⚖️ Ethical Guardrails**
- **Prioritize safety:** Triage harmful queries with care and resource provision.
- **Embrace nuance:** Avoid absolute language on subjective topics.
- **Remain humble:** Clearly distinguish fact from opinion.
- **Ask clarifying questions** when intent is unclear.

---

### **🗣️ Communication Protocol**
- **Tone:** Calm, respectful, and patient. Match the user’s style but elevate clarity.
- **Structure:** Use clear markdown (headers, lists, bold) for readability—but lead with empathy.
- **Brevity with depth:** Be concise but comprehensive. Offer to go deeper.

---

### **🧪 Handling Tests & Adversarial Inputs**
- If the user reveals they are testing you, respond with transparency and curiosity.
- Example: *“I appreciate you testing my responses. It helps me improve. Would you like to walk through my reasoning?”*
- Use these moments to demonstrate your process and reinforce trust.

---

### **🌐 Overarching “Mindset”**
- You are an **empathetic listener** first, a knowledge engine second.
- You are a **structured thinker** who brings clarity to complexity.
- You are a **compassionate guide** who helps users find their own answers.
- You are a **transparent agent** that operates within ethical bounds.

---`,
                },
            });
            setChat(newChat);

        } catch (error) {
            handleApiError(error);
        }
    };
    
    initializeChat();
  }, [handleApiError]);
  
  const saveAndAnalyzeJournalEntry = useCallback(async (content: string): Promise<JournalEntry> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const analysisSchema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING, description: "A short, 4-6 word descriptive title for the journal entry, based on its content." },
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
    Entry: "${content}"
    Provide a structured analysis based on the schema, including generating a suitable title.`;
    
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: { responseMimeType: "application/json", responseSchema: analysisSchema },
    });

    const analysisResult = JSON.parse(response.text) as GeneratedAIAnalysis;

    const newEntry: JournalEntry = {
        id: Date.now().toString(),
        date: new Date().toISOString(),
        title: analysisResult.title,
        content: content,
        analysis: {
            summary: analysisResult.summary,
            observations: analysisResult.observations,
            followUpQuestions: analysisResult.followUpQuestions,
            mood: analysisResult.mood,
        },
        isAnalyzing: false
    };

    // Save to local storage
    const weekId = getWeekId(new Date());
    const key = getLocalStorageKey(weekId);
    const savedEntries = localStorage.getItem(key);
    const existingEntries: JournalEntry[] = savedEntries ? JSON.parse(savedEntries) : [];
    const updatedEntries = [newEntry, ...existingEntries].slice(0, MAX_ENTRIES);
    localStorage.setItem(key, JSON.stringify(updatedEntries));

    return newEntry;
}, []);

  const handleAddJournalFromChat = useCallback(async (messageText: string, originalAiMessageIndex: number) => {
    if (isLoading) return;
    setIsLoading(true);

    // Hide the button on the original message to prevent multiple clicks
    setMessages(prev => {
        const newMessages = [...prev];
        if (newMessages[originalAiMessageIndex]) {
            newMessages[originalAiMessageIndex].isJournalWorthy = false;
        }
        return newMessages;
    });

    try {
        const newEntry = await saveAndAnalyzeJournalEntry(messageText);
        const aiMessage: Message = {
            id: newEntry.id,
            sender: 'ai',
            text: '', // Text is empty, we render the analysis component
            analysis: newEntry.analysis,
            journalTitle: newEntry.title
        };
        setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
        handleApiError(error);
    } finally {
        setIsLoading(false);
    }
  }, [isLoading, saveAndAnalyzeJournalEntry, handleApiError]);


  const handleSendMessage = useCallback(async ({ text, file, isJournal }: { text: string; file: File | null; isJournal: boolean }) => {
    if (isLoading || (!chat && !isJournal)) return;

    if (isJournal) {
        if (!text.trim()) return;

        const userMessage: Message = { id: `user-${Date.now()}`, sender: 'user', text };
        setMessages(prevMessages => [...prevMessages, userMessage]);
        setIsLoading(true);

        try {
            const newEntry = await saveAndAnalyzeJournalEntry(text);
            const aiMessage: Message = {
                id: newEntry.id,
                sender: 'ai',
                text: '', // Text is empty, we render the analysis component
                analysis: newEntry.analysis,
                journalTitle: newEntry.title
            };
            setMessages(prev => [...prev, aiMessage]);
        } catch (error) {
            handleApiError(error);
        } finally {
            setIsLoading(false);
        }
    } else {
        const userMessage: Message = { id: `user-${Date.now()}`, sender: 'user', text };
        if (file) {
          userMessage.imagePreview = URL.createObjectURL(file);
        }
        setMessages(prevMessages => [...prevMessages, userMessage]);
        setIsLoading(true);

        // --- CRISIS DETECTION ---
        if (detectCrisisIntent(text)) {
            try {
                const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
                const crisisResponseSchema = {
                    type: Type.OBJECT,
                    properties: {
                        is_crisis: { type: Type.BOOLEAN, description: "Should always be true." },
                        response: { type: Type.STRING, description: "A direct, empathetic 1-2 sentence response addressed to the user." },
                        resource: {
                            type: Type.OBJECT,
                            properties: {
                                name: { type: Type.STRING },
                                description: { type: Type.STRING },
                                contact: { type: Type.STRING },
                                url: { type: Type.STRING },
                            },
                            required: ["name", "description", "contact", "url"]
                        },
                        friend_message_draft: { type: Type.STRING, description: "A short, simple message draft the user can send to a friend. e.g., 'I'm having a really hard time right now and could use someone to talk to. Are you free?'" }
                    },
                    required: ["is_crisis", "response", "resource", "friend_message_draft"]
                };
                const crisisSystemPrompt = `YOU ARE IN CRISIS MODE. A user has sent a message that indicates they may be in crisis. Your ONLY goal is to provide immediate, relevant, and safe resources. Follow this protocol EXACTLY.
                1. DO NOT ask clarifying questions or be conversational. This is a safety intervention, not a chat.
                2. Your response MUST be a JSON object that validates against the provided schema. Do not output any text outside the JSON object.
                3. For the "response" field, generate a direct, empathetic 1-2 sentence response. It should sound like this: "I hear you're in crisis. Based on what you told me, this is the best number to call right now. If you need to text a friend instead, here's a draft you can edit and send." Adapt the wording slightly if needed, but maintain this direct and helpful structure.
                4. For the "friend_message_draft" field, generate a simple, pre-written text message the user can copy and send to a friend for support. Example: "I'm having a really hard time right now and could use someone to talk to. Are you free?". DO NOT wrap this message in quotes.
                5. Choose the SINGLE BEST resource from this list based on the user's message:
                   - Primary/Default for immediate danger in the US: Name: "988 Suicide & Crisis Lifeline", Contact: "Call or text 988", URL: "https://988lifeline.org", Description: "Free, confidential support from trained counselors, 24/7."
                   - For text-based support: Name: "Crisis Text Line", Contact: "Text HOME to 741741", URL: "https://www.crisistextline.org", Description: "Text-based support for any crisis."
                   - For LGBTQ+ Youth: Name: "The Trevor Project", Contact: "Call 1-866-488-7386 or text START to 678-678", URL: "https://www.thetrevorproject.org", Description: "Crisis support for LGBTQ young people."
                User's message: "${text}"
                Generate the JSON response.`;
                
                const response = await ai.models.generateContent({
                    model: 'gemini-2.5-flash',
                    contents: crisisSystemPrompt,
                    config: { responseMimeType: "application/json", responseSchema: crisisResponseSchema },
                });

                const crisisData = JSON.parse(response.text);
                const crisisMessage: Message = {
                    id: `ai-crisis-${Date.now()}`,
                    sender: 'ai',
                    text: crisisData.response,
                    isCrisis: true,
                    resource: crisisData.resource,
                    friendMessageDraft: crisisData.friend_message_draft,
                };
                setMessages(prev => [...prev, crisisMessage]);
            } catch (error) {
                console.error("Crisis generation error:", error);
                // FAILSAFE MECHANISM
                const failsafeMessage: Message = {
                    id: `ai-failsafe-${Date.now()}`,
                    sender: 'ai',
                    text: "I'm deeply concerned about what you're sharing. Please reach out for help immediately.",
                    isCrisis: true,
                    resource: {
                        name: "988 Suicide & Crisis Lifeline",
                        description: "Free, confidential support from trained counselors, 24/7.",
                        contact: "Call or Text 988",
                        url: "https://988lifeline.org"
                    },
                    friendMessageDraft: "I'm having a really hard time right now and could use someone to talk to. Are you free?",
                };
                setMessages(prev => [...prev, failsafeMessage]);
            } finally {
                setIsLoading(false);
            }
            return; // Stop further execution
        }
        // --- End Crisis Detection ---

        try {
            if (!chat) throw new Error("Chat not initialized");

            const parts: any[] = [];
            if (file) {
                const base64Data = await new Promise<string>((resolve, reject) => {
                    const reader = new FileReader();
                    reader.readAsDataURL(file);
                    reader.onload = () => resolve((reader.result as string).split(',')[1]);
                    reader.onerror = error => reject(error);
                });
                parts.push({
                    inlineData: { mimeType: file.type, data: base64Data },
                });
            }
            if (text) {
                parts.push({ text });
            }
            
            const response = await chat.sendMessage({ message: parts });
            const aiResponse = response.text;
            
            let isJournalWorthy = false;
            let finalAiResponse = aiResponse;
            const journalToken = '[JOURNAL_WORTHY]';

            if (aiResponse.endsWith(journalToken)) {
                isJournalWorthy = true;
                finalAiResponse = aiResponse.replace(journalToken, '').trim();
            }

            const groundingMetadata = response.candidates?.[0]?.groundingMetadata;
            const sources: GroundingSource[] = [];
            if (groundingMetadata?.groundingChunks) {
                for (const chunk of groundingMetadata.groundingChunks) {
                    if (chunk.web) {
                        sources.push({ uri: chunk.web.uri, title: chunk.web.title });
                    }
                }
            }

            const aiMessage: Message = { 
              id: `ai-${Date.now()}`, 
              sender: 'ai', 
              text: finalAiResponse,
              sources: sources.length > 0 ? sources : undefined,
            };

            if (isJournalWorthy) {
                aiMessage.isJournalWorthy = true;
                aiMessage.originalUserMessage = text;
            }
            setMessages(prev => [...prev, aiMessage]);

        } catch (error) {
            handleApiError(error);
        } finally {
            setIsLoading(false);
            if (userMessage.imagePreview) {
                URL.revokeObjectURL(userMessage.imagePreview);
            }
        }
    }
}, [isLoading, chat, handleApiError, saveAndAnalyzeJournalEntry]);

  return (
    <div 
        className="flex flex-col h-screen bg-white dark:bg-black text-slate-800 dark:text-slate-200 transition-colors duration-300 relative"
    >
      {/* Home Button */}
      <div className="absolute top-4 left-4 z-20">
        <button
          onClick={onNavigateHome}
          className="flex items-center gap-2 rounded-full bg-black/20 dark:bg-white/10 px-4 py-2 text-sm font-medium text-slate-200 dark:text-slate-300 backdrop-blur-sm transition-all hover:bg-black/30 dark:hover:bg-white/20 hover:text-white"
          aria-label="Go back to home page"
        >
          <HomeIcon />
          <span>Home</span>
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col w-full max-w-4xl mx-auto px-4 overflow-hidden pt-16">
         {/* Scrollable Message Area */}
        <div ref={messagesContainerRef} className="flex-1 w-full overflow-y-auto pb-4 pr-2">
            {messages.length === 0 && !isLoading ? (
                <div className="flex h-full flex-col items-center justify-center text-center">
                    <div className="relative mb-4">
                      <h2 className="text-4xl md:text-5xl font-bold text-slate-800 dark:text-slate-100">
                          How can I help today?
                      </h2>
                      <div className="absolute left-1/2 -translate-x-1/2 bottom-[-10px] h-0.5 w-32 bg-calm-orange-500"></div>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 mt-4">
                        You can start by typing a message below.
                    </p>
                </div>
            ) : (
                <div className="flex flex-col space-y-4">
                    {messages.map((msg, index) => (
                        <div 
                          key={msg.id}
                          className={`flex flex-col items-start w-full ${
                            msg.sender === 'user' ? 'self-end' : 'self-start'
                          }`}
                        >
                            <div className={`flex flex-col max-w-[85%] ${msg.sender === 'user' ? 'self-end' : 'self-start'}`}>
                                {msg.isCrisis && msg.resource ? (
                                  <CrisisResponseCard 
                                      response={msg.text} 
                                      resource={msg.resource} 
                                      friendMessageDraft={msg.friendMessageDraft || "I'm having a really hard time right now and could use someone to talk to. Are you free?"}
                                  />
                                ) : msg.analysis && msg.journalTitle ? (
                                  <JournalAnalysisCard 
                                    analysis={msg.analysis} 
                                    title={msg.journalTitle} 
                                    onEdit={() => onNavigateToJournal(msg.id!)}
                                  />
                                ) : (
                                  <div className={`p-3 rounded-lg shadow ${
                                      msg.sender === 'ai' 
                                      ? 'bg-calm-orange-500/80 dark:bg-calm-orange-800/80 text-white rounded-bl-none' 
                                      : 'bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-white rounded-br-none'
                                  }`}>
                                    {msg.imagePreview && (
                                      <img src={msg.imagePreview} alt="User upload" className="mb-2 rounded-lg max-w-xs" />
                                    )}
                                    <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                                    {msg.sender === 'ai' && msg.text && (
                                        <div className="flex justify-end mt-1 -mr-1">
                                            <button 
                                                onClick={() => handleSpeak(msg)}
                                                className="p-1 rounded-full text-white/70 hover:text-white hover:bg-black/10 transition-colors"
                                                aria-label={speakingMessageId === msg.id ? "Stop reading" : "Read message aloud"}
                                            >
                                                <SpeakerIcon isSpeaking={speakingMessageId === msg.id} />
                                            </button>
                                        </div>
                                    )}
                                    {msg.sources && msg.sources.length > 0 && (
                                        <div className="mt-3 pt-3 border-t border-white/20">
                                            <h4 className="text-xs font-semibold text-white/80 mb-1.5">Sources:</h4>
                                            <ul className="text-xs space-y-1.5">
                                                {msg.sources.map((source, i) => (
                                                    <li key={i}>
                                                        <a href={source.uri} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-white/90 hover:text-white hover:underline">
                                                            <LinkIcon className="w-3 h-3 flex-shrink-0" />
                                                            <span className="truncate">{source.title || new URL(source.uri).hostname}</span>
                                                        </a>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                  </div>
                                )}
                            </div>
                           {msg.sender === 'ai' && msg.isJournalWorthy && msg.originalUserMessage && (
                               <div className="self-start mt-2">
                                   <button 
                                       onClick={() => handleAddJournalFromChat(msg.originalUserMessage!, index)}
                                       className="flex items-center gap-2 text-xs font-semibold text-calm-green-700 dark:text-calm-green-300 bg-calm-green-500/10 hover:bg-calm-green-500/20 px-3 py-1.5 rounded-full transition-colors"
                                   >
                                       <BookTextIcon />
                                       Add to Journal
                                   </button>
                               </div>
                           )}
                        </div>
                    ))}
                    {isLoading && (
                        <div className="p-3 rounded-lg bg-calm-orange-500/80 dark:bg-calm-orange-800/80 text-white self-start rounded-bl-none flex space-x-1.5 items-center">
                            <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                            <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                        </div>
                    )}
                </div>
            )}
        </div>
        
        {/* Input Area */}
        <div className="w-full flex-shrink-0 bg-transparent">
            <AiInput onSend={handleSendMessage} isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
};

export default ChatPage;