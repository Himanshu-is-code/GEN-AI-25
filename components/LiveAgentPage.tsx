import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality, Blob } from "@google/genai";
import { motion, AnimatePresence } from 'framer-motion';

// --- Icons ---
const HomeIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>);
const MicIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="22"></line></svg>);
const StopIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect></svg>);
const UserIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>);
const AuraIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-calm-green-400"><circle cx="12" cy="12" r="2" /><path d="M12 6V4" /><path d="M12 20v-2" /><path d="M16.95 7.05 18.36 5.64" /><path d="M5.64 18.36 7.05 16.95" /><path d="M18 12h2" /><path d="M4 12H2" /><path d="M16.95 16.95 18.36 18.36" /><path d="M5.64 5.64 7.05 7.05" /></svg>);


interface Transcript {
    sender: 'user' | 'ai';
    text: string;
}

// --- Transcript Bubble Component ---
const TranscriptBubble: React.FC<Transcript> = ({ sender, text }) => {
    if (!text) return null;
    const isUser = sender === 'user';
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex items-start gap-3 w-full ${isUser ? 'justify-end' : 'justify-start'}`}
        >
            {!isUser && (
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-calm-green-500/20 flex items-center justify-center mt-1">
                    <AuraIcon />
                </div>
            )}
            <div className={`p-3 rounded-lg max-w-[85%] shadow text-sm ${
                isUser 
                ? 'bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-white rounded-br-none'
                : 'bg-calm-green-600/80 dark:bg-calm-green-800/80 text-white rounded-bl-none'
            }`}>
                <p className="whitespace-pre-wrap">{text}</p>
            </div>
             {isUser && (
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-500/20 flex items-center justify-center mt-1">
                    <UserIcon />
                </div>
            )}
        </motion.div>
    );
};


interface LiveAgentPageProps {
  theme: 'light' | 'dark';
  onNavigateHome: () => void;
}

const LiveAgentPage: React.FC<LiveAgentPageProps> = ({ theme, onNavigateHome }) => {
    const [sessionPromise, setSessionPromise] = useState<Promise<{
        close: () => void;
        sendRealtimeInput: (input: { media: Blob; }) => void;
    }> | null>(null);
    const [connectionState, setConnectionState] = useState<'idle' | 'connecting' | 'connected' | 'error' | 'ended'>('idle');
    const [transcripts, setTranscripts] = useState<Transcript[]>([]);
    
    // State for immediate UI feedback of transcription
    const [currentInput, setCurrentInput] = useState('');
    const [currentOutput, setCurrentOutput] = useState('');

    const [micPermission, setMicPermission] = useState<'prompt' | 'granted' | 'denied'>('prompt');
    
    // Refs for session-persistent data
    const streamRef = useRef<MediaStream | null>(null);
    const audioContextRef = useRef<{ input: AudioContext; output: AudioContext; outputGain: GainNode; } | null>(null);
    const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
    const outputSourcesRef = useRef(new Set<AudioBufferSourceNode>());
    const nextStartTimeRef = useRef(0);
    const currentInputRef = useRef('');
    const currentOutputRef = useRef('');
    const transcriptContainerRef = useRef<HTMLDivElement | null>(null);

    // Auto-scroll transcript view
    useEffect(() => {
        if (transcriptContainerRef.current) {
            transcriptContainerRef.current.scrollTop = transcriptContainerRef.current.scrollHeight;
        }
    }, [transcripts, currentInput, currentOutput]);

    // Cleanup session on component unmount
    useEffect(() => {
      return () => {
        if (sessionPromise) {
            sessionPromise.then(session => session.close());
        }
        streamRef.current?.getTracks().forEach(track => track.stop());
        if (audioContextRef.current) {
            if (audioContextRef.current.input.state !== 'closed') {
                audioContextRef.current.input.close().catch(console.error);
            }
            if (audioContextRef.current.output.state !== 'closed') {
                audioContextRef.current.output.close().catch(console.error);
            }
        }
      };
    }, [sessionPromise]);

    const startSession = useCallback(async () => {
        // Reset state for new session
        setTranscripts([]);
        setCurrentInput('');
        setCurrentOutput('');
        currentInputRef.current = '';
        currentOutputRef.current = '';
        setConnectionState('connecting');
        
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream;
            setMicPermission('granted');

            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            
            // Setup audio contexts and gain node once per session
            const inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
            const outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
            const outputGain = outputAudioContext.createGain();
            outputGain.connect(outputAudioContext.destination);
            audioContextRef.current = { input: inputAudioContext, output: outputAudioContext, outputGain };

            const newSessionPromise = ai.live.connect({
                model: 'gemini-2.5-flash-native-audio-preview-09-2025',
                config: {
                    responseModalities: [Modality.AUDIO],
                    inputAudioTranscription: {},
                    outputAudioTranscription: {},
                    speechConfig: {
                        voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } },
                    },
                    systemInstruction: `You are Aura, a compassionate and empathetic AI listening companion trained in supportive conversation techniques. Your role is to act as a safe, non-judgmental space for the user to voice their thoughts and feelings. Your primary interaction model is through voice. Listen actively, be patient, and allow for silence. Your responses should be calm and reassuring.
- **Listen Actively:** Pay close attention to the user's words and the emotions behind them.
- **Validate Emotions:** Acknowledge and validate the user's feelings. Use phrases like, "That sounds really difficult," or "It makes sense that you would feel that way."
- **Ask Gentle, Open-Ended Questions:** Encourage reflection without being intrusive. Ask questions like, "How did that make you feel?", "What was that experience like for you?", or "Is there more you'd like to share about that?"
- **Avoid Giving Advice:** Do not provide solutions or direct advice, especially medical or therapeutic advice. Your role is to support the user in exploring their own feelings and thoughts.
- **Maintain a Supportive Tone:** Your voice and language should always be gentle, patient, and encouraging.
- **Safety First:** You are not a replacement for a human therapist. You must not provide diagnoses or treatment plans.
Your goal is to help the user feel heard, understood, and less alone.`,
                },
                callbacks: {
                    onopen: () => {
                        setConnectionState('connected');
                        const source = inputAudioContext.createMediaStreamSource(stream);
                        const scriptProcessor = inputAudioContext.createScriptProcessor(4096, 1, 1);
                        scriptProcessorRef.current = scriptProcessor;

                        scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
                            const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
                            const pcmBlob = createBlob(inputData);
                            newSessionPromise.then((session) => {
                                session.sendRealtimeInput({ media: pcmBlob });
                            });
                        };
                        source.connect(scriptProcessor);
                        scriptProcessor.connect(inputAudioContext.destination);
                    },
                    onmessage: async (message: LiveServerMessage) => {
                        if (message.serverContent?.inputTranscription) {
                            currentInputRef.current += message.serverContent.inputTranscription.text;
                            setCurrentInput(currentInputRef.current);
                        }
                        if (message.serverContent?.outputTranscription) {
                            currentOutputRef.current += message.serverContent.outputTranscription.text;
                            setCurrentOutput(currentOutputRef.current);
                        }
                        if (message.serverContent?.turnComplete) {
                            const newTranscripts: Transcript[] = [];
                            if (currentInputRef.current.trim()) {
                                newTranscripts.push({ sender: 'user', text: currentInputRef.current });
                            }
                            if (currentOutputRef.current.trim()) {
                                newTranscripts.push({ sender: 'ai', text: currentOutputRef.current });
                            }

                            if (newTranscripts.length > 0) {
                                setTranscripts(prev => [...prev, ...newTranscripts]);
                            }
                            
                            currentInputRef.current = '';
                            currentOutputRef.current = '';
                            setCurrentInput('');
                            setCurrentOutput('');
                        }

                        const base64EncodedAudioString = message.serverContent?.modelTurn?.parts[0]?.inlineData.data;
                        if (base64EncodedAudioString && audioContextRef.current?.output && audioContextRef.current.outputGain) {
                            const { output: outputAudioContext, outputGain } = audioContextRef.current;
                            
                            nextStartTimeRef.current = Math.max(
                                nextStartTimeRef.current,
                                outputAudioContext.currentTime,
                            );
                            const audioBuffer = await decodeAudioData(
                                decode(base64EncodedAudioString),
                                outputAudioContext,
                                24000,
                                1,
                            );
                            const source = outputAudioContext.createBufferSource();
                            source.buffer = audioBuffer;
                            source.connect(outputGain); // Connect to the single gain node

                            source.addEventListener('ended', () => {
                                outputSourcesRef.current.delete(source);
                            });

                            source.start(nextStartTimeRef.current);
                            nextStartTimeRef.current = nextStartTimeRef.current + audioBuffer.duration;
                            outputSourcesRef.current.add(source);
                        }
                    },
                    onerror: (e: ErrorEvent) => {
                        console.error('Live session error:', e);
                        setConnectionState('error');
                    },
                    onclose: (e: CloseEvent) => {
                        setConnectionState('ended');
                    },
                }
            });
            setSessionPromise(newSessionPromise);

        } catch (err) {
            console.error("Failed to start session:", err);
            setMicPermission('denied');
            setConnectionState('error');
        }
    }, []);

    const stopSession = useCallback(async () => {
        if (sessionPromise) {
            (await sessionPromise).close();
            setSessionPromise(null);
        }
        streamRef.current?.getTracks().forEach(track => track.stop());
        streamRef.current = null;
        if (scriptProcessorRef.current) {
            scriptProcessorRef.current.disconnect();
            scriptProcessorRef.current = null;
        }
        if (audioContextRef.current) {
            if (audioContextRef.current.input.state !== 'closed') {
                audioContextRef.current.input.close().catch(console.error);
            }
            if (audioContextRef.current.output.state !== 'closed') {
                audioContextRef.current.output.close().catch(console.error);
            }
            audioContextRef.current = null;
        }
        outputSourcesRef.current.forEach(source => source.stop());
        outputSourcesRef.current.clear();
        nextStartTimeRef.current = 0;
        setConnectionState('ended');
    }, [sessionPromise]);

    const isSessionActive = connectionState === 'connected' || connectionState === 'connecting';

    return (
        <div className="flex flex-col h-screen bg-white dark:bg-black text-slate-800 dark:text-slate-200 transition-colors duration-300">
            <header className="flex-shrink-0 p-4 flex justify-between items-center border-b border-slate-200 dark:border-slate-800">
                <button onClick={onNavigateHome} className="flex items-center gap-2 rounded-full bg-black/20 dark:bg-white/10 px-4 py-2 text-sm font-medium text-slate-800 dark:text-slate-300 backdrop-blur-sm transition-all hover:bg-slate-200 dark:hover:bg-white/20 hover:text-black dark:hover:text-white" aria-label="Go back to home page">
                    <HomeIcon /> <span>Home</span>
                </button>
            </header>
            
            <main className="flex-1 flex flex-col items-center justify-between p-4 md:p-8 overflow-hidden">
                <div className="w-full max-w-2xl flex-grow flex flex-col items-center">
                    <AnimatePresence>
                    {!isSessionActive && (
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="text-center"
                        >
                            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white">
                                Talk with <span className="gradient-text">Aura</span>
                            </h1>
                            <p className="mt-3 max-w-2xl text-lg text-slate-600 dark:text-slate-400 mx-auto">
                                Your personal AI companion is ready to listen. Tap the microphone to begin a secure, private conversation.
                            </p>
                        </motion.div>
                    )}
                    </AnimatePresence>

                    {/* Transcripts */}
                    <div ref={transcriptContainerRef} className="w-full flex-grow overflow-y-auto space-y-4 my-4 pr-2">
                        {transcripts.map((t, i) => <TranscriptBubble key={i} {...t} />)}
                        <AnimatePresence>
                             {currentInput && <TranscriptBubble sender="user" text={currentInput} />}
                             {currentOutput && <TranscriptBubble sender="ai" text={currentOutput} />}
                        </AnimatePresence>
                    </div>

                    {/* Visualizer and Status */}
                    <div className="w-full flex flex-col items-center justify-center h-24 my-4">
                         <div className="relative w-20 h-20 flex items-center justify-center">
                            <motion.div 
                                className="absolute inset-0 bg-calm-green-500 rounded-full"
                                animate={{ 
                                    scale: isSessionActive ? [1, 1.3, 1] : 1,
                                    opacity: isSessionActive ? [0.3, 0.5, 0.3] : 0
                                }}
                                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                            />
                             <motion.div 
                                className="absolute inset-0 bg-calm-green-400 rounded-full"
                                animate={{ 
                                    scale: isSessionActive ? [1.2, 1.5, 1.2] : 1.2,
                                    opacity: isSessionActive ? [0.2, 0.4, 0.2] : 0
                                }}
                                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                            />
                            <div className="relative w-16 h-16 bg-white dark:bg-slate-800 rounded-full shadow-lg flex items-center justify-center">
                                <AuraIcon />
                            </div>
                        </div>

                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-4 h-5">
                            {connectionState === 'connecting' && 'Connecting...'}
                            {connectionState === 'connected' && 'Listening...'}
                            {connectionState === 'ended' && 'Session ended. Tap to start again.'}
                            {connectionState === 'error' && 'Connection error. Please try again.'}
                            {micPermission === 'denied' && 'Microphone permission denied.'}
                        </p>
                    </div>
                </div>

                <div className="flex-shrink-0 w-full flex justify-center items-center pt-4">
                    <button
                        onClick={isSessionActive ? stopSession : startSession}
                        disabled={micPermission === 'denied' || connectionState === 'connecting'}
                        className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 text-white shadow-lg focus:outline-none focus:ring-4 focus:ring-offset-2 dark:focus:ring-offset-black ${
                            isSessionActive
                                ? 'bg-red-500 hover:bg-red-600 focus:ring-red-400'
                                : 'bg-calm-green-500 hover:bg-calm-green-600 focus:ring-calm-green-400'
                        } disabled:bg-slate-400 disabled:cursor-not-allowed`}
                    >
                        {isSessionActive ? <StopIcon /> : <MicIcon />}
                    </button>
                </div>
            </main>
        </div>
    );
};

// --- Audio Helper Functions ---
function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

function createBlob(data: Float32Array): Blob {
  const l = data.length;
  const int16 = new Int16Array(l);
  for (let i = 0; i < l; i++) {
    int16[i] = data[i] * 32768;
  }
  return {
    data: encode(new Uint8Array(int16.buffer)),
    mimeType: 'audio/pcm;rate=16000',
  };
}


export default LiveAgentPage;