



import React, { useCallback, useEffect, useRef, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { BookText, LoaderCircle, Paperclip, Plus, Send, Mic } from "lucide-react"
import { useSpeechRecognition } from "../hooks/useSpeechRecognition";

import { cn } from "../lib/utils"

interface UseAutoResizeTextareaProps {
  minHeight: number
  maxHeight?: number
}

function useAutoResizeTextarea({
  minHeight,
  maxHeight,
}: UseAutoResizeTextareaProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const adjustHeight = useCallback(
    (reset?: boolean) => {
      const textarea = textareaRef.current
      if (!textarea) return

      if (reset) {
        textarea.style.height = `${minHeight}px`
        return
      }

      textarea.style.height = `${minHeight}px`
      const newHeight = Math.max(
        minHeight,
        Math.min(textarea.scrollHeight, maxHeight ?? Number.POSITIVE_INFINITY)
      )

      textarea.style.height = `${newHeight}px`
    },
    [minHeight, maxHeight]
  )

  useEffect(() => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = `${minHeight}px`
    }
  }, [minHeight])

  useEffect(() => {
    const handleResize = () => adjustHeight()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [adjustHeight])

  return { textareaRef, adjustHeight }
}

const MIN_HEIGHT = 48
const MAX_HEIGHT = 164

interface AiInputProps {
    onSend: (data: { text: string; file: File | null; isJournal: boolean }) => void;
    isLoading: boolean;
}

export function AiInput({ onSend, isLoading }: AiInputProps) {
  const [value, setValue] = useState("")
  const { textareaRef, adjustHeight } = useAutoResizeTextarea({
    minHeight: MIN_HEIGHT,
    maxHeight: MAX_HEIGHT,
  })
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isJournalMode, setIsJournalMode] = useState(false)
  const textOnListenStart = useRef("")

  const handleVoiceResult = useCallback((transcript: string) => {
    setValue(textOnListenStart.current + transcript);
    adjustHeight();
  }, [adjustHeight]);

  const { isListening, startListening, stopListening, hasRecognitionSupport, permissionState } = useSpeechRecognition({ onResult: handleVoiceResult });

  const handleMicClick = () => {
    if (isListening) {
      stopListening();
    } else {
      textOnListenStart.current = value;
      startListening();
    }
  };


  const handleClose = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (fileInputRef.current) {
      fileInputRef.current.value = "" // Reset file input
    }
    setImageFile(null)
    setImagePreview(null)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : null
    if (file) {
      setImageFile(file)
      setImagePreview(URL.createObjectURL(file))
    }
  }

  const handleSubmit = () => {
    if (isLoading) return;
    if (isJournalMode) {
        if (!value.trim()) return;
    } else {
        if (!value.trim() && !imageFile) return;
    }
    
    onSend({ text: value, file: imageFile, isJournal: isJournalMode });
    setValue("")
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
        fileInputRef.current.value = ""
    }
    setIsJournalMode(false); // Reset after sending
    adjustHeight(true)
  }

  const handleJournalToggle = () => {
    const newJournalMode = !isJournalMode;
    if (newJournalMode && imageFile) {
        // Entering journal mode, clear any selected image
        if (fileInputRef.current) fileInputRef.current.value = "";
        setImageFile(null);
        setImagePreview(null);
    }
    setIsJournalMode(newJournalMode);
  };

  useEffect(() => {
    const currentPreview = imagePreview;
    return () => {
      if (currentPreview) {
        URL.revokeObjectURL(currentPreview)
      }
    }
  }, [imagePreview])
  
  const isSendDisabled = isLoading || (isJournalMode ? !value.trim() : !value.trim() && !imageFile);
  const micDisabled = !hasRecognitionSupport || permissionState === 'denied';
  
  return (
    <div className="w-full py-4">
      <div className="relative max-w-xl border rounded-[22px] border-black/5 dark:border-white/5 p-1 w-full mx-auto">
        <div className="relative rounded-2xl border border-black/5 dark:border-white/5 bg-white dark:bg-slate-900 flex flex-col">
          <div
            className="overflow-y-auto"
            style={{ maxHeight: `${MAX_HEIGHT}px` }}
          >
            <div className="relative">
              <textarea
                id="ai-input-04"
                value={value}
                placeholder={isJournalMode ? "Write a journal entry..." : "Type your message..."}
                className="w-full rounded-2xl rounded-b-none px-4 py-3 bg-black/5 dark:bg-white/5 border-none text-slate-800 dark:text-white resize-none focus-visible:ring-0 leading-[1.2]"
                ref={textareaRef}
                style={{ minHeight: `${MIN_HEIGHT}px` }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
                    if (!isSendDisabled) handleSubmit();
                  }
                }}
                onChange={(e) => {
                  setValue(e.target.value)
                  adjustHeight()
                }}
              />
            </div>
          </div>

          <div className="h-12 bg-black/5 dark:bg-white/5 rounded-b-xl">
            <div className="absolute left-3 bottom-3 flex items-center gap-2">
              <label
                className={cn(
                  "cursor-pointer relative rounded-full p-2 transition-all",
                  imagePreview
                    ? "bg-calm-orange-600/15 border border-calm-orange-600 text-calm-orange-600"
                    : "bg-black/5 dark:bg-white/5 text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white",
                  isJournalMode && "cursor-not-allowed opacity-50"
                )}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleChange}
                  className="hidden"
                  accept="image/*"
                  disabled={isJournalMode}
                />
                <Paperclip
                  className={cn(
                    "w-4 h-4 text-black/40 dark:text-white/40 transition-colors",
                    imagePreview && "text-calm-orange-600",
                    !isJournalMode && "group-hover:text-black dark:group-hover:text-white"
                  )}
                />
                {imagePreview && (
                  <div className="absolute w-[100px] h-[100px] -top-[108px] left-0">
                    <img
                      className="object-cover w-full h-full rounded-2xl border-2 border-black/50 dark:border-white/50"
                      src={imagePreview}
                      alt="upload preview"
                    />
                    <button
                      onClick={handleClose}
                      className="bg-white/70 text-slate-900 dark:bg-slate-800/70 dark:text-white/80 backdrop-blur-sm absolute -top-1 -right-1 shadow-2xl rounded-full"
                    >
                      <Plus className="w-4 h-4 rotate-45" />
                    </button>
                  </div>
                )}
              </label>
              <button
                type="button"
                onClick={handleMicClick}
                disabled={micDisabled}
                title={
                    !hasRecognitionSupport ? "Voice input not supported by your browser." :
                    permissionState === 'denied' ? "Microphone permission denied. Please enable it in your browser settings." :
                    isListening ? "Stop listening" : "Use microphone"
                }
                className={cn(
                    "cursor-pointer relative rounded-full p-2 transition-all",
                    isListening
                    ? "bg-red-500/15 text-red-500 animate-pulse"
                    : "bg-black/5 dark:bg-white/5 text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white",
                    micDisabled && "opacity-50 cursor-not-allowed"
                )}
                >
                <Mic className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleJournalToggle}
                className={cn(
                  "rounded-full transition-all flex items-center gap-1.5 px-2 py-1.5 border h-8 text-sm",
                  isJournalMode
                    ? "bg-calm-orange-600/15 border-calm-orange-600 text-calm-orange-600"
                    : "bg-black/5 dark:bg-white/5 border-transparent text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white"
                )}
              >
                <motion.div animate={{ rotate: isJournalMode ? 360 : 0 }} transition={{ duration: 0.5 }}>
                  <BookText className="w-4 h-4" />
                </motion.div>
                <AnimatePresence>
                  {isJournalMode && (
                    <motion.span
                      initial={{ width: 0, opacity: 0 }}
                      animate={{ width: "auto", opacity: 1 }}
                      exit={{ width: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden whitespace-nowrap"
                    >
                      Journal
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
            </div>
            <div className="absolute right-3 bottom-3">
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSendDisabled}
                className={cn(
                  "rounded-full p-2 transition-colors",
                  !isSendDisabled
                    ? "bg-calm-orange-600/15 text-calm-orange-600"
                    : "bg-black/5 dark:bg-white/5 text-black/40 dark:text-white/40",
                   isLoading ? "cursor-not-allowed" : ""
                )}
              >
                {isLoading ? <LoaderCircle className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}