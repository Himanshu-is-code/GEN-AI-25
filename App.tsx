
import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { gsap } from "gsap";
import { motion, AnimatePresence } from 'framer-motion';
import HeroSection from './components/HeroSection';
import FeaturesSection from './components/FeaturesSection';
import Footer from './components/Footer';
import Hyperspeed, { hyperspeedPresets } from './components/Hyperspeed';
import AboutSection from './components/AboutSection';
import FinalCTA from './components/FinalCTA';
import DotGrid from './components/DotGrid';
import ChatPage from './components/Chat';
import LoadingScreen from './components/LoadingScreen';
import AuthModal from './components/AuthModal';
import JournalSection from './components/JournalSection';
import WriterSection from './components/WriterSection';
import JournalPage from './components/JournalPage';
import MessageWriterPage from './components/MessageWriterPage';
import DashboardPage from './components/DashboardPage';
import { parseJwt } from './lib/utils';

// --- Icons ---
const MenuIcon = ({ className = "w-6 h-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <line x1="4" y1="12" x2="20" y2="12"></line>
    <line x1="4" y1="6" x2="20" y2="6"></line>
    <line x1="4" y1="18" x2="20" y2="18"></line>
  </svg>
);

const XIcon = ({ className = "w-6 h-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

// --- ThemeSwitch Component ---
const ThemeSwitch: React.FC<{ theme: 'light' | 'dark', toggleTheme: () => void }> = ({ theme, toggleTheme }) => {
    const id = React.useId();
    const isDark = theme === 'dark';

    const MoonIcon = ({ size = 16, className = "" }) => (
        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
        </svg>
    );

    const SunIcon = ({ size = 16, className = "" }) => (
        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <circle cx="12" cy="12" r="4" /><path d="M12 2v2" /><path d="M12 20v2" /><path d="m4.93 4.93 1.41 1.41" /><path d="m17.66 17.66 1.41 1.41" /><path d="M2 12h2" /><path d="M20 12h2" /><path d="m6.34 17.66-1.41 1.41" /><path d="m19.07 4.93-1.41 1.41" />
        </svg>
    );

    return (
        <div className="flex items-center">
            <label htmlFor={id} className="sr-only">Toggle theme</label>
            <button
                id={id}
                role="switch"
                aria-checked={isDark}
                onClick={toggleTheme}
                className="relative inline-flex h-8 w-14 items-center rounded-full bg-slate-200 dark:bg-slate-800 transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-900 focus-visible:ring-calm-orange-500"
            >
                <span
                    className={`absolute left-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-white dark:bg-slate-900 shadow-md ring-0 transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${isDark ? 'translate-x-[24px]' : 'translate-x-0'}`}
                >
                    <SunIcon size={14} className={`transition-opacity duration-200 ${isDark ? 'opacity-0' : 'opacity-100 text-slate-800'}`} />
                    <MoonIcon size={14} className={`absolute transition-opacity duration-200 ${isDark ? 'opacity-100 text-slate-200' : 'opacity-0'}`} />
                </span>
            </button>
        </div>
    );
}

// --- PillNav Component ---
export type PillNavItem = {
  label: string;
  href: string;
  ariaLabel?: string;
  onClick?: (e?: any) => void;
};

export interface PillNavProps {
  logo: string;
  logoHref?: string;
  items: PillNavItem[];
  activeHref?: string;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  isLoggedIn: boolean;
  onLoginClick: () => void;
  onLogoutClick: () => void;
  // Legacy props kept for compatibility but not used in new design
  logoBgColor?: string;
  logoAlt?: string;
  className?: string;
  ease?: string;
  baseColor?: string;
  pillColor?: string;
  hoveredPillTextColor?: string;
  pillTextColor?: string;
  onMobileMenuClick?: () => void;
  initialLoadAnimation?: boolean;
}

const PillNav: React.FC<PillNavProps> = ({
  logo,
  logoHref = "#",
  items,
  activeHref,
  theme,
  toggleTheme,
  isLoggedIn,
  onLoginClick,
  onLogoutClick,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const scrollToSection = (href: string) => {
    const id = href.startsWith('#') ? href.substring(1) : href;
    const section = document.getElementById(id);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleLinkClick = (e: React.MouseEvent, item: PillNavItem) => {
      e.preventDefault();
      setIsMobileMenuOpen(false);
      if (item.onClick) {
          item.onClick();
      } else {
          scrollToSection(item.href);
      }
  };

  return (
    <div className="fixed top-4 left-0 w-full z-50 flex justify-center px-4">
      {/* Desktop & Tablet Nav */}
      <motion.nav 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative flex items-center justify-between p-1.5 rounded-full bg-white/70 dark:bg-black/60 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-lg ring-1 ring-black/5 dark:ring-white/5 w-full max-w-4xl"
      >
        {/* Logo */}
        <a 
          href={logoHref} 
          onClick={(e) => { e.preventDefault(); scrollToSection(logoHref); }}
          className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-full bg-white dark:bg-black shadow-sm border border-slate-100 dark:border-slate-800 ml-0.5"
        >
          <img src={logo} alt="Logo" className="w-6 h-6" />
        </a>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-1 mx-2">
          {items.map((item) => {
            const isActive = activeHref === item.href;
            return (
              <a
                key={item.href}
                href={item.href}
                onClick={(e) => handleLinkClick(e, item)}
                className={`relative px-4 py-2 text-sm font-medium rounded-full transition-all duration-300 ${
                  isActive 
                    ? 'text-white' 
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/50'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="pill-nav-active"
                    className="absolute inset-0 bg-calm-orange-500 rounded-full shadow-md z-[-1]"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                {item.label}
              </a>
            );
          })}
        </div>

        {/* Right Actions */}
        <div className="hidden md:flex items-center gap-2 mr-1">
          <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-1"></div>
          <ThemeSwitch theme={theme} toggleTheme={toggleTheme} />
          {isLoggedIn ? (
            <button 
              onClick={onLogoutClick} 
              className="px-5 py-2 text-sm font-medium rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              Logout
            </button>
          ) : (
            <button 
              onClick={onLoginClick} 
              className="px-5 py-2 text-sm font-medium rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors shadow-lg shadow-slate-900/20 dark:shadow-white/10"
            >
              Login
            </button>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <div className="flex md:hidden items-center gap-2 mr-1">
           <ThemeSwitch theme={theme} toggleTheme={toggleTheme} />
           <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-full text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
           >
             {isMobileMenuOpen ? <XIcon /> : <MenuIcon />}
           </button>
        </div>
      </motion.nav>

      {/* Mobile Dropdown Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute top-20 left-4 right-4 p-4 rounded-3xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border border-slate-200 dark:border-slate-800 shadow-2xl md:hidden z-40 flex flex-col gap-2"
          >
            {items.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={(e) => handleLinkClick(e, item)}
                className={`p-4 rounded-2xl text-center font-medium transition-colors ${
                  activeHref === item.href
                    ? 'bg-calm-orange-50 dark:bg-calm-orange-900/20 text-calm-orange-600 dark:text-calm-orange-400'
                    : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {item.label}
              </a>
            ))}
            <div className="h-px bg-slate-100 dark:bg-slate-800 my-2" />
            
            {isLoggedIn ? (
              <button 
                onClick={() => { onLogoutClick(); setIsMobileMenuOpen(false); }} 
                className="w-full p-4 rounded-2xl font-medium bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors"
              >
                Logout
              </button>
            ) : (
              <button 
                onClick={() => { onLoginClick(); setIsMobileMenuOpen(false); }} 
                className="w-full p-4 rounded-2xl font-medium bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-lg"
              >
                Login
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const logoSvg = (color: string) => `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5,18 Q12,16 19,18 Q12,22 5,18 Z" fill="${color}" stroke="none" /><path d="M12 4 V 16" /><path d="M8 8 V 16" /><path d="M16 8 V 16" /></svg>`;

type PageType = 'home' | 'chat' | 'journal' | 'writer' | 'dashboard';

const App: React.FC = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [activeSection, setActiveSection] = useState('#home');
  const [pageHistory, setPageHistory] = useState<PageType[]>(['home']);
  const page = pageHistory[pageHistory.length - 1];
  const [isAppReady, setIsAppReady] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [initialAuthMode, setInitialAuthMode] = useState<'prompt' | 'login' | 'signup'>('prompt');
  const [authRedirect, setAuthRedirect] = useState<PageType>('home');
  const [initialSelectedEntryId, setInitialSelectedEntryId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string>('guest');

  const mainRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);
  
  useEffect(() => {
   const timer = setTimeout(() => {
     setIsAppReady(true);
   }, 1200); // Minimum display time for a smooth experience
   return () => clearTimeout(timer);
 }, []);

  const toggleTheme = useCallback(() => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  }, []);

  const openAuthModal = useCallback((mode: 'prompt' | 'login' | 'signup') => {
    setInitialAuthMode(mode);
    setIsAuthModalOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setIsAuthModalOpen(false);
  }, []);

  const pushPage = useCallback((newPage: PageType) => {
    setPageHistory(prev => [...prev, newPage]);
  }, []);

  const handleBack = useCallback(() => {
    setPageHistory(prev => {
        if (prev.length > 1) {
            return prev.slice(0, -1);
        }
        return prev;
    });
  }, []);

  const handleAuthSuccess = useCallback((userData: any) => {
    if (userData?.credential) {
        const decoded = parseJwt(userData.credential);
        setUserId(decoded.sub || 'guest');
    } else if (userData?.email) {
        setUserId(userData.email);
    } else {
        setUserId('guest');
    }
    setIsLoggedIn(true);
    closeAuthModal();
    setTimeout(() => {
        if (authRedirect === 'home') {
             setPageHistory(['home']);
        } else {
             pushPage(authRedirect);
        }
    }, 300);
  }, [authRedirect, closeAuthModal, pushPage]);
  
  const handleGuestLogin = useCallback(() => {
    setUserId('guest');
    setIsLoggedIn(true);
    closeAuthModal();
     setTimeout(() => {
        if (authRedirect === 'home') {
             setPageHistory(['home']);
        } else {
             pushPage(authRedirect);
        }
    }, 300);
  }, [authRedirect, closeAuthModal, pushPage]);

  const handleLogout = useCallback(() => {
    setIsLoggedIn(false);
    setUserId('guest');
    setPageHistory(['home']);
  }, []);

  const navigateToDashboard = useCallback(() => {
    if (isLoggedIn) {
      pushPage('dashboard');
    } else {
      setAuthRedirect('dashboard');
      openAuthModal('prompt');
    }
  }, [isLoggedIn, openAuthModal, pushPage]);
  
  const navigateToChat = useCallback(() => {
    if (isLoggedIn) {
      pushPage('chat');
    } else {
      setAuthRedirect('chat');
      openAuthModal('prompt');
    }
  }, [isLoggedIn, openAuthModal, pushPage]);
  
  const navigateToJournal = useCallback((entryId?: string | React.MouseEvent) => {
    if (isLoggedIn) {
      if (typeof entryId === 'string') {
        setInitialSelectedEntryId(entryId);
      } else {
        setInitialSelectedEntryId(null);
      }
      pushPage('journal');
    } else {
      setAuthRedirect('journal');
      openAuthModal('prompt');
    }
  }, [isLoggedIn, openAuthModal, pushPage]);
  
  const navigateToWriter = useCallback(() => {
    if (isLoggedIn) {
      pushPage('writer');
    } else {
      setAuthRedirect('writer');
      openAuthModal('prompt');
    }
  }, [isLoggedIn, openAuthModal, pushPage]);

  const navigateToHome = useCallback(() => {
    setPageHistory(['home']);
  }, []);

  const handleLoginClick = useCallback(() => {
      setAuthRedirect('home');
      openAuthModal('prompt');
  }, [openAuthModal]);

  const clearInitialSelectedEntryId = useCallback(() => {
      setInitialSelectedEntryId(null);
  }, []);
  
  const navItems: PillNavItem[] = useMemo(() => {
    const baseItems = [
        { label: 'Features', href: '#features' },
        { label: 'Journal', href: '#journal', onClick: navigateToJournal },
        { label: 'Writer', href: '#writer', onClick: navigateToWriter },
        { label: 'About', href: '#about' },
    ];
    if (isLoggedIn) {
        return [{ label: 'Dashboard', href: '#dashboard', onClick: navigateToDashboard }, ...baseItems];
    }
    return baseItems;
  }, [isLoggedIn, navigateToJournal, navigateToWriter, navigateToDashboard]);


  useEffect(() => {
    if (page !== 'home') return;
      
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(`#${entry.target.id}`);
          }
        });
      },
      { root: null, rootMargin: '-40% 0px -60% 0px', threshold: 0 }
    );

    const sections = mainRef.current?.querySelectorAll('section[id]');
    sections?.forEach((section) => observer.observe(section));

    return () => {
      sections?.forEach((section) => observer.unobserve(section));
    };
  }, [page]);
  
  const logoDataUri = useMemo(() => {
    const logoColor = theme === 'dark' ? '#ffffff' : '#060010';
    return `data:image/svg+xml;utf8,${encodeURIComponent(logoSvg(logoColor))}`;
  }, [theme]);
  

  if (!isAppReady) {
    return <LoadingScreen theme={theme} />;
  }
  
  if (page === 'dashboard') {
    return <DashboardPage 
        theme={theme} 
        userId={userId}
        onNavigateHome={navigateToHome} 
        onBack={handleBack}
        onNavigateToChat={navigateToChat}
        onNavigateToJournal={navigateToJournal}
        onNavigateToWriter={navigateToWriter}
    />;
  }

  if (page === 'chat') {
    return <ChatPage theme={theme} userId={userId} onBack={handleBack} onNavigateToJournal={navigateToJournal} />;
  }

  if (page === 'journal') {
    return <JournalPage 
      theme={theme} 
      userId={userId}
      onBack={handleBack}
      onNavigateHome={navigateToHome}
      initialSelectedEntryId={initialSelectedEntryId}
      clearInitialSelectedEntryId={clearInitialSelectedEntryId}
    />;
  }
  
  if (page === 'writer') {
    return <MessageWriterPage theme={theme} onBack={handleBack} />;
  }
    
  return (
    // FIX: Framer Motion props are not being recognized by TypeScript due to a potential version issue. Using ts-ignore as a workaround.
    // @ts-ignore
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }}>
      <div className="fixed top-0 left-0 w-full h-full -z-10 bg-white dark:bg-black">
        {theme === 'dark' && <Hyperspeed effectOptions={hyperspeedPresets.two} />}
        {theme === 'light' && <DotGrid dotSize={2} gap={24} baseColor="#fed7aa" />}
      </div>
      
      <PillNav
        logo={logoDataUri}
        logoHref="#home"
        items={navItems}
        activeHref={activeSection}
        theme={theme}
        toggleTheme={toggleTheme}
        isLoggedIn={isLoggedIn}
        onLoginClick={handleLoginClick}
        onLogoutClick={handleLogout}
      />
      
      <main ref={mainRef} className="relative z-10 text-slate-800 dark:text-slate-200 transition-colors duration-300">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <section id="home" className="min-h-screen flex items-center">
              <div className="w-full">
                <HeroSection onNavigateToChat={navigateToChat} />
              </div>
            </section>
            <section id="features" className="py-20">
                <FeaturesSection 
                    onNavigateToChat={navigateToChat}
                    onNavigateToJournal={navigateToJournal}
                    onNavigateToWriter={navigateToWriter}
                    onNavigateToDashboard={navigateToDashboard}
                />
            </section>
            <section id="journal" className="py-20">
                <JournalSection onNavigateToJournal={navigateToJournal}/>
            </section>
            <section id="writer" className="py-20">
                <WriterSection onNavigateToWriter={navigateToWriter}/>
            </section>
            <section id="about" className="py-20">
                <AboutSection />
            </section>
            
        </div>
        <FinalCTA 
            onOpenJournal={navigateToJournal} 
            onNavigateToWriter={navigateToWriter} 
            onNavigateToDashboard={navigateToDashboard}
            onNavigateToChat={navigateToChat}
        />
      </main>
      <Footer />
      
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={closeAuthModal}
        onAuthSuccess={handleAuthSuccess}
        onGuestLogin={handleGuestLogin}
        initialMode={initialAuthMode}
        logoDataUri={logoDataUri}
      />
    </motion.div>
  );
};

export default App;
