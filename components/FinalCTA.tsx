
import React from 'react';
import { motion } from 'framer-motion';

interface FinalCTAProps {
    onOpenJournal: () => void;
    onNavigateToWriter: () => void;
    onNavigateToDashboard: () => void;
    onNavigateToChat: () => void;
}

const ArrowRightIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12"></line>
      <polyline points="12 5 19 12 12 19"></polyline>
    </svg>
);

const FinalCTA: React.FC<FinalCTAProps> = ({ onOpenJournal, onNavigateToWriter, onNavigateToDashboard, onNavigateToChat }) => {
    return (
        // FIX: Framer Motion props are not being recognized by TypeScript due to a potential version issue. Using ts-ignore as a workaround.
        // @ts-ignore
        <motion.section
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="py-16 px-4 sm:px-6 lg:px-8"
        >
            <div className="relative max-w-6xl mx-auto overflow-hidden rounded-[40px] bg-calm-orange-500 p-6 sm:p-10 md:p-16">
                <div className="absolute inset-0 hidden h-full w-full overflow-hidden md:block">
                    <div className="absolute top-1/2 right-[-45%] aspect-square h-[800px] w-[800px] -translate-y-1/2">
                        <div className="absolute inset-0 rounded-full bg-calm-orange-400 opacity-30"></div>
                        <div className="absolute inset-0 scale-[0.8] rounded-full bg-calm-orange-300 opacity-30"></div>
                        <div className="absolute inset-0 scale-[0.6] rounded-full bg-calm-orange-200 opacity-30"></div>
                        <div className="absolute inset-0 scale-[0.4] rounded-full bg-calm-orange-100 opacity-30"></div>
                        <div className="absolute inset-0 scale-[0.2] rounded-full bg-calm-orange-50 opacity-30"></div>
                        <div className="absolute inset-0 scale-[0.1] rounded-full bg-white/50 opacity-30"></div>
                    </div>
                </div>

                <div className="relative z-10 text-center">
                    <h1 className="mb-3 text-3xl font-bold text-white sm:text-4xl md:mb-4 md:text-5xl">
                        Ready to take the next step?
                    </h1>
                    <p className="mb-6 max-w-2xl mx-auto text-base text-white sm:text-lg md:mb-8">
                        A safe space is just a click away. Start a confidential conversation, reflect in your journal, or find the right words for a tough talk.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl mx-auto">
                        <button 
                            onClick={onNavigateToChat}
                            className="group flex w-full items-center justify-between rounded-full bg-black px-5 py-3 text-white transition-transform duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-calm-orange-500 focus:ring-white">
                            <span className="font-medium">Talk to AI Companion</span>
                            <span className="h-6 w-6 flex-shrink-0 rounded-full bg-white text-black flex items-center justify-center transition-transform duration-300 group-hover:rotate-45">
                                <ArrowRightIcon />
                            </span>
                        </button>
                        <button 
                            onClick={onNavigateToDashboard}
                            className="group flex w-full items-center justify-between rounded-full bg-black px-5 py-3 text-white transition-transform duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-calm-orange-500 focus:ring-white">
                            <span className="font-medium">View Dashboard</span>
                            <span className="h-6 w-6 flex-shrink-0 rounded-full bg-white text-black flex items-center justify-center transition-transform duration-300 group-hover:rotate-45">
                                <ArrowRightIcon />
                            </span>
                        </button>
                        <button 
                            onClick={onOpenJournal}
                            className="group flex w-full items-center justify-between rounded-full bg-black px-5 py-3 text-white transition-transform duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-calm-orange-500 focus:ring-white">
                            <span className="font-medium">Open Your Journal</span>
                            <span className="h-6 w-6 flex-shrink-0 rounded-full bg-white text-black flex items-center justify-center transition-transform duration-300 group-hover:rotate-45">
                                <ArrowRightIcon />
                            </span>
                        </button>
                        <button 
                            onClick={onNavigateToWriter}
                            className="group flex w-full items-center justify-between rounded-full bg-black px-5 py-3 text-white transition-transform duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-calm-orange-500 focus:ring-white">
                            <span className="font-medium">Message Writer</span>
                            <span className="h-6 w-6 flex-shrink-0 rounded-full bg-white text-black flex items-center justify-center transition-transform duration-300 group-hover:rotate-45">
                                <ArrowRightIcon />
                            </span>
                        </button>
                    </div>
                </div>
            </div>
        </motion.section>
    );
}

export default FinalCTA;
