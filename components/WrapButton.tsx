import React from 'react';

const ArrowRightIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12"></line>
      <polyline points="12 5 19 12 12 19"></polyline>
    </svg>
);

interface WrapButtonProps {
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
}

const WrapButton: React.FC<WrapButtonProps> = ({
  className,
  children,
  onClick,
}) => {
  return (
    <button
      onClick={onClick}
      className={`group border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-900 gap-2 h-16 flex items-center p-3 rounded-full transition-shadow duration-300 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-calm-orange-500 ${className}`}
    >
      <div className="bg-calm-orange-600 h-11 rounded-full flex items-center justify-center text-white px-5">
        <span className="font-medium tracking-tight flex items-center gap-2 justify-center text-lg">
            {children}
        </span>
      </div>
      <div className="text-slate-500 dark:text-slate-400 w-8 h-8 flex items-center justify-center rounded-full border-2 border-slate-300 dark:border-slate-700">
        <div className="transition-transform duration-300 ease-in-out group-hover:rotate-45">
            <ArrowRightIcon />
        </div>
      </div>
    </button>
  );
};

export default WrapButton;
