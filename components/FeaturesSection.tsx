

import React, { useState } from 'react';

// Icons for the features
const ShieldIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8 text-red-600 dark:text-red-300">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
    </svg>
);

const JournalIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8 text-calm-orange-600 dark:text-calm-orange-300">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
        <path d="M6.5 2H20v15H6.5A2.5 2.5 0 0 1 4 14.5V4.5A2.5 2.5 0 0 1 6.5 2z"/>
    </svg>
);

const ResourceIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8 text-calm-green-600 dark:text-calm-green-300">
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>
);

const WriterIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8 text-calm-purple-600 dark:text-calm-purple-300">
        <path d="M12 20h9" />
        <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
    </svg>
);


interface Feature {
    frontIcon: React.ReactNode;
    frontTitle: string;
    frontDescription: string;
    backTitle: string;
    backItems: string[];
    color: 'orange' | 'green' | 'purple' | 'red';
}

const featuresData: Feature[] = [
    {
        frontIcon: <ShieldIcon />,
        frontTitle: 'Crisis Navigator',
        frontDescription: 'Detects crisis language and provides immediate, confidential access to safety resources.',
        backTitle: 'Prioritizing Your Safety',
        backItems: ["Automatic crisis detection", "Immediate access to lifelines", "Confidential & secure", "Always-on safety net"],
        color: 'red'
    },
    {
        frontIcon: <JournalIcon />,
        frontTitle: 'AI-Powered Journal',
        frontDescription: 'Reflect on your thoughts and get gentle, AI-driven insights.',
        backTitle: 'Your Private Space',
        backItems: ["Track your mood weekly", "Understand emotional patterns", "Confidential & secure", "Downloadable weekly reports"],
        color: 'orange'
    },
    {
        frontIcon: <WriterIcon />,
        frontTitle: 'Message Writer',
        frontDescription: 'Find the right words to express yourself in tough conversations.',
        backTitle: 'Communicate with Confidence',
        backItems: ["Draft messages for parents, friends, or teachers", "Choose your tone and goal", "AI helps you communicate clearly", "Reduces anxiety of what to say"],
        color: 'purple'
    },
    {
        frontIcon: <ResourceIcon />,
        frontTitle: 'Resource Hub',
        frontDescription: 'Find curated links for when you need more support.',
        backTitle: 'Help is Available',
        backItems: ["Vetted professional organizations", "24/7 support hotlines", "Confidential help for teens", "Specialized LGBTQ+ support"],
        color: 'green'
    },
];

interface FeatureCardProps {
    feature: Feature;
    onExplore: () => void;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ feature, onExplore }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const { frontIcon, frontTitle, frontDescription, backTitle, backItems, color } = feature;
  
  const colorClasses = {
      orange: {
          front: 'bg-calm-orange-100/20 dark:bg-calm-orange-900/20 border-calm-orange-200/50 dark:border-calm-orange-700/50',
          back: 'bg-calm-orange-200/80 dark:bg-calm-orange-800/80 border-calm-orange-300/50 dark:border-calm-orange-600/50',
          iconBg: 'bg-calm-orange-500/20',
          title: 'text-calm-orange-800 dark:text-calm-orange-200',
          checkIcon: 'text-calm-orange-600 dark:text-calm-orange-300',
          button: 'bg-calm-orange-100/50 text-calm-orange-800 dark:bg-calm-orange-900/30 dark:text-calm-orange-200 hover:bg-calm-orange-200/50 dark:hover:bg-calm-orange-900/50 focus:ring-calm-orange-500'
      },
      green: {
          front: 'bg-calm-green-100/20 dark:bg-calm-green-900/20 border-calm-green-200/50 dark:border-calm-green-700/50',
          back: 'bg-calm-green-200/80 dark:bg-calm-green-800/80 border-calm-green-300/50 dark:border-calm-green-600/50',
          iconBg: 'bg-calm-green-500/20',
          title: 'text-calm-green-800 dark:text-calm-green-200',
          checkIcon: 'text-calm-green-600 dark:text-calm-green-300',
          button: 'bg-calm-green-100/50 text-calm-green-800 dark:bg-calm-green-900/30 dark:text-calm-green-200 hover:bg-calm-green-200/50 dark:hover:bg-calm-green-900/50 focus:ring-calm-green-500'
      },
      purple: {
          front: 'bg-calm-purple-100/20 dark:bg-calm-purple-900/20 border-calm-purple-200/50 dark:border-calm-purple-700/50',
          back: 'bg-calm-purple-200/80 dark:bg-calm-purple-800/80 border-calm-purple-300/50 dark:border-calm-purple-600/50',
          iconBg: 'bg-calm-purple-500/20',
          title: 'text-calm-purple-800 dark:text-calm-purple-200',
          checkIcon: 'text-calm-purple-600 dark:text-calm-purple-300',
          button: 'bg-calm-purple-100/50 text-calm-purple-800 dark:bg-calm-purple-900/30 dark:text-calm-purple-200 hover:bg-calm-purple-200/50 dark:hover:bg-calm-purple-900/50 focus:ring-calm-purple-500'
      },
      red: {
          front: 'bg-red-100/20 dark:bg-red-900/20 border-red-200/50 dark:border-red-700/50',
          back: 'bg-red-200/80 dark:bg-red-800/80 border-red-300/50 dark:border-red-600/50',
          iconBg: 'bg-red-500/20',
          title: 'text-red-800 dark:text-red-200',
          checkIcon: 'text-red-600 dark:text-red-300',
          button: 'bg-red-100/50 text-red-800 dark:bg-red-900/30 dark:text-red-200 hover:bg-red-200/50 dark:hover:bg-red-900/50 focus:ring-red-500'
      }
  }
  const classes = colorClasses[color];

  return (
    <div 
        className="h-80" 
        onMouseEnter={() => setIsFlipped(true)}
        onMouseLeave={() => setIsFlipped(false)}
        style={{ perspective: '1000px' }}
    >
      <div className={`flip-card-inner ${isFlipped ? 'rotate-y-180' : ''}`}>
        
        <div className={`flip-card-front p-6 shadow-lg flex flex-col items-center justify-center text-center backdrop-blur-lg backface-hidden border ${classes.front}`}>
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${classes.iconBg}`}>
                {frontIcon}
            </div>
            <h3 className={`text-xl font-bold mb-2 ${classes.title}`}>{frontTitle}</h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm">{frontDescription}</p>
        </div>
        
        <div className={`flip-card-back p-6 shadow-lg flex flex-col items-center text-center backdrop-blur-lg backface-hidden border ${classes.back}`}>
            <div className="flex-grow">
                <h3 className={`text-xl font-bold mb-4 ${classes.title}`}>{backTitle}</h3>
                <ul className="text-slate-700 dark:text-slate-200 text-sm space-y-2 text-left">
                    {backItems.map((item, index) => (
                        <li key={index} className="flex items-start">
                            <svg className={`w-4 h-4 mr-2 mt-1 flex-shrink-0 ${classes.checkIcon}`} fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                            </svg>
                            <span>{item}</span>
                        </li>
                    ))}
                </ul>
            </div>
            <button 
                onClick={(e) => {
                    e.stopPropagation();
                    onExplore();
                }}
                className={`mt-4 px-4 py-1.5 text-xs font-semibold rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:ring-offset-slate-900 ${classes.button}`}
            >
                Explore
            </button>
        </div>
      </div>
    </div>
  );
};

interface FeaturesSectionProps {
  onNavigateToChat: () => void;
  onNavigateToJournal: () => void;
  onNavigateToWriter: () => void;
  onScrollToResources: () => void;
}

const FeaturesSection: React.FC<FeaturesSectionProps> = ({
  onNavigateToChat,
  onNavigateToJournal,
  onNavigateToWriter,
  onScrollToResources
}) => {
    return (
        <div className="py-10 md:py-16">
            <div className="text-center mb-12">
                <h2 className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 sm:text-4xl">
                    Your Personal Wellness Toolkit
                </h2>
                <p className="mt-4 max-w-2xl text-lg text-slate-600 dark:text-slate-400 mx-auto">
                    Simple, effective tools designed to support your mental well-being journey.
                </p>
            </div>

            <div className="grid gap-8 grid-cols-1 md:grid-cols-2 max-w-5xl mx-auto">
                {featuresData.map((feature, index) => {
                    let exploreAction = () => {};
                    switch (feature.frontTitle) {
                        case 'Crisis Navigator':
                            exploreAction = onNavigateToChat;
                            break;
                        case 'AI-Powered Journal':
                            exploreAction = onNavigateToJournal;
                            break;
                        case 'Message Writer':
                            exploreAction = onNavigateToWriter;
                            break;
                        case 'Resource Hub':
                            exploreAction = onScrollToResources;
                            break;
                    }
                    return <FeatureCard key={index} feature={feature} onExplore={exploreAction} />;
                })}
            </div>
        </div>
    );
};

export default FeaturesSection;