import React from 'react';

interface WriterSectionProps {
  onNavigateToWriter: () => void;
}

const WriterSection: React.FC<WriterSectionProps> = ({ onNavigateToWriter }) => {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center bg-slate-100/30 dark:bg-slate-800/30 backdrop-blur-lg p-8 md:p-12 rounded-2xl shadow-lg border border-slate-300/50 dark:border-slate-700/50">
        <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white sm:text-4xl">
          Find the <span className="gradient-text">Right Words</span> When It Matters Most
        </h2>
        <p className="mt-4 text-xl font-medium text-slate-700 dark:text-slate-300">
          Communicate with Clarity and Confidence
        </p>
        <p className="mt-2 max-w-2xl text-lg text-slate-600 dark:text-slate-300 mx-auto">
          Whether you're reaching out to a parent, friend, or teacher, our tool helps you organize your thoughts into a clear and compassionate message. Reduce the anxiety of tough conversations by finding the perfect words to express your feelings and needs effectively.
        </p>
        <div className="mt-8 flex justify-center">
          <button 
            onClick={onNavigateToWriter}
            className="bg-calm-purple-600 hover:bg-calm-purple-700 text-white dark:bg-calm-purple-500 dark:hover:bg-calm-purple-600 px-8 py-4 rounded-lg text-lg font-bold transition-all duration-300 flex items-center shadow-lg hover:shadow-calm-purple-500/30 transform hover:-translate-y-1"
          >
            <i className="fas fa-pen-nib mr-3"></i> Open Message Writer
          </button>
        </div>
      </div>
    </section>
  );
};

export default WriterSection;