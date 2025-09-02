import React, { useState } from 'react';

const BrainIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8 text-calm-orange-400">
      <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v1a2.5 2.5 0 0 1-2.5 2.5h-1A2.5 2.5 0 0 1 6 5.5v-1A2.5 2.5 0 0 1 8.5 2h1Z" />
      <path d="M14.5 2A2.5 2.5 0 0 1 17 4.5v1a2.5 2.5 0 0 1-2.5 2.5h-1A2.5 2.5 0 0 1 11 5.5v-1A2.5 2.5 0 0 1 13.5 2h1Z" />
      <path d="M18 11a2.5 2.5 0 0 1 2.5-2.5h1A2.5 2.5 0 0 1 24 11v1a2.5 2.5 0 0 1-2.5 2.5h-1a2.5 2.5 0 0 1-2.5-2.5v-1Z" transform="rotate(90 18 11)"/>
      <path d="M6 11a2.5 2.5 0 0 1 2.5-2.5h1A2.5 2.5 0 0 1 12 11v1a2.5 2.5 0 0 1-2.5 2.5h-1A2.5 2.5 0 0 1 6 11v-1Z" />
      <path d="M9.5 15A2.5 2.5 0 0 1 12 17.5v1a2.5 2.5 0 0 1-2.5 2.5h-1A2.5 2.5 0 0 1 6 18.5v-1a2.5 2.5 0 0 1 2.5-2.5h1Z" />
      <path d="M14.5 15A2.5 2.5 0 0 1 17 17.5v1a2.5 2.5 0 0 1-2.5 2.5h-1a2.5 2.5 0 0 1-2.5-2.5v-1a2.5 2.5 0 0 1 2.5-2.5h1Z" />
    </svg>
);


const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const scrollToSection = (sectionId: string) => {
    const scroller = document.querySelector('.scroll-stack-scroller');
    const section = document.getElementById(sectionId);
    if (scroller && section) {
      const header = document.querySelector('header');
      const headerHeight = header ? header.offsetHeight : 0;
      const top = section.offsetTop - headerHeight - 20; // 20px for visual padding

      scroller.scrollTo({
        top: top,
        behavior: 'smooth'
      });
    }
    setIsMenuOpen(false); // Close menu on navigation
  };

  const navLinks = [
    { name: 'Home', id: 'home' },
    { name: 'Features', id: 'features' },
    { name: 'About', id: 'about' },
    { name: 'Activities', id: 'activities' },
    { name: 'Resources', id: 'resources' },
  ];

  return (
    <header className="bg-slate-900/50 backdrop-blur-md shadow-lg sticky top-0 z-10">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3">
            <BrainIcon />
            <h1 className="text-2xl font-bold text-calm-orange-300 tracking-tight">Mindful Youth</h1>
          </div>

          <nav className="hidden md:flex space-x-2">
            {navLinks.map(link => (
              <a
                key={link.id}
                href={`#${link.id}`}
                onClick={(e) => { e.preventDefault(); scrollToSection(link.id); }}
                className="text-slate-300 hover:text-calm-orange-200 transition-colors duration-300 px-3 py-2 rounded-md text-sm font-medium"
                aria-label={`Scroll to ${link.name} section`}
              >
                {link.name}
              </a>
            ))}
          </nav>

          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-slate-400 hover:text-white hover:bg-slate-700/50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              aria-controls="mobile-menu"
              aria-expanded={isMenuOpen}
            >
              <span className="sr-only">Open main menu</span>
              {!isMenuOpen ? (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
      
      {isMenuOpen && (
        <div className="md:hidden" id="mobile-menu">
          <nav className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-slate-700/50">
            {navLinks.map(link => (
              <a
                key={link.id}
                href={`#${link.id}`}
                onClick={(e) => { e.preventDefault(); scrollToSection(link.id); }}
                className="text-slate-300 hover:text-white hover:bg-slate-700/50 block px-3 py-2 rounded-md text-base font-medium"
                 aria-label={`Scroll to ${link.name} section`}
              >
                {link.name}
              </a>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;