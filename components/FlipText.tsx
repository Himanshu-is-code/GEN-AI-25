import React from 'react';

const FlipText: React.FC<{ children: string; className?: string }> = ({
  children,
  className,
}) => {
  return (
    <span className={`group inline-flex overflow-hidden ${className}`}>
      {children.split('').map((char, i) => (
        <span
          key={`${char}-${i}`}
          className="relative inline-block transition-transform duration-500 ease-out group-hover:[transform:translateY(-100%)]"
          style={{ transitionDelay: `${i * 35}ms` }}
        >
          <span className="inline-block">
            {char === ' ' ? '\u00A0' : char}
          </span>
          <span className="absolute left-0 top-full inline-block text-calm-orange-500 dark:text-calm-orange-400">
            {char === ' ' ? '\u00A0' : char}
          </span>
        </span>
      ))}
    </span>
  );
};

export default FlipText;
