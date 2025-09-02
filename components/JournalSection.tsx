import React from 'react';

interface JournalSectionProps {
  onNavigateToJournal: () => void;
}

const JournalSection: React.FC<JournalSectionProps> = ({ onNavigateToJournal }) => {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center bg-slate-100/30 dark:bg-slate-800/30 backdrop-blur-lg p-8 md:p-12 rounded-2xl shadow-lg border border-slate-300/50 dark:border-slate-700/50">
        <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white sm:text-4xl">
          Your Private Journal, <span className="gradient-text">Powered by AI</span>
        </h2>
        <p className="mt-4 max-w-2xl text-lg text-slate-600 dark:text-slate-300 mx-auto">
          Reflect on your week, understand your feelings better, and track your mental wellness journey with insightful, AI-powered feedback.
        </p>
        <div className="mt-8 flex justify-center">
          <button 
            onClick={onNavigateToJournal}
            className="bg-calm-green-600 hover:bg-calm-green-700 text-white dark:bg-calm-green-500 dark:hover:bg-calm-green-600 px-8 py-4 rounded-lg text-lg font-bold transition-all duration-300 flex items-center shadow-lg hover:shadow-calm-green-500/30 transform hover:-translate-y-1"
          >
            <i className="fas fa-book-open mr-3"></i> Open Your Journal
          </button>
        </div>
      </div>
    </section>
  );
};

export default JournalSection;
