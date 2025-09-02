
import { useState, useEffect, useRef, useCallback } from 'react';

// FIX: Add type declarations for the Web Speech API and cast window to `any`
// to resolve TypeScript errors, as these types and properties are not standard
// in all TypeScript configurations and may be vendor-prefixed.
interface SpeechRecognitionEvent extends Event {
  readonly resultIndex: number;
  readonly results: SpeechRecognitionResultList;
}
interface SpeechRecognitionResultList {
  readonly length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}
interface SpeechRecognitionResult {
  readonly isFinal: boolean;
  readonly length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}
interface SpeechRecognitionAlternative {
  readonly transcript: string;
  readonly confidence: number;
}
interface SpeechRecognitionErrorEvent extends Event {
  readonly error: string;
  readonly message: string;
}
interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onend: (() => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  start(): void;
  stop(): void;
}

const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

interface UseSpeechRecognitionOptions {
  onResult: (transcript: string) => void;
}

export type PermissionState = 'prompt' | 'granted' | 'denied' | 'unsupported';


export const useSpeechRecognition = ({ onResult }: UseSpeechRecognitionOptions) => {
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const [permissionState, setPermissionState] = useState<PermissionState>('prompt');


  const hasRecognitionSupport = !!SpeechRecognitionAPI;

  useEffect(() => {
    if (!hasRecognitionSupport) {
      setPermissionState('unsupported');
      return;
    }

    if (navigator.permissions) {
        navigator.permissions.query({ name: 'microphone' as PermissionName }).then((permissionStatus) => {
            setPermissionState(permissionStatus.state as 'prompt' | 'granted' | 'denied');
            permissionStatus.onchange = () => {
                setPermissionState(permissionStatus.state as 'prompt' | 'granted' | 'denied');
            };
        }).catch((err) => {
            console.warn('Could not query microphone permission.', err);
            setPermissionState('prompt');
        });
    } else {
        setPermissionState('prompt');
    }
  }, [hasRecognitionSupport]);


  useEffect(() => {
    if (!hasRecognitionSupport) {
      return;
    }

    const recognition: SpeechRecognition = new SpeechRecognitionAPI();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let transcript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      onResult(transcript);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('Speech recognition error', event.error);
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      if(recognitionRef.current) {
          recognitionRef.current.stop();
      }
    };
  }, [hasRecognitionSupport, onResult]);

  const startListening = useCallback(() => {
    if (recognitionRef.current && !isListening && permissionState !== 'denied') {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.error("Error starting speech recognition:", err);
        setIsListening(false);
      }
    }
  }, [isListening, permissionState]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  }, [isListening]);

  return {
    isListening,
    startListening,
    stopListening,
    hasRecognitionSupport,
    permissionState,
  };
};
