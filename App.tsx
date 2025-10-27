


import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { gsap } from "gsap";
import { motion } from 'framer-motion';
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
import LiveAgentPage from './components/LiveAgentPage';

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
                className="relative inline-flex h-9 w-[72px] items-center rounded-full bg-slate-200 dark:bg-slate-800 transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--base)] focus-visible:ring-calm-orange-500"
            >
                <span
                    className={`absolute left-1 top-1 flex h-7 w-7 items-center justify-center rounded-full bg-white dark:bg-slate-900 shadow-lg ring-1 ring-black/5 transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${isDark ? 'translate-x-[36px]' : 'translate-x-0'}`}
                >
                    <SunIcon size={16} className={`transition-opacity duration-200 ${isDark ? 'opacity-0' : 'opacity-100 text-slate-800'}`} />
                    <MoonIcon size={16} className={`absolute transition-opacity duration-200 ${isDark ? 'opacity-100 text-slate-200' : 'opacity-0'}`} />
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
  logoBgColor?: string;
  logoAlt?: string;
  items: PillNavItem[];
  activeHref?: string;
  className?: string;
  ease?: string;
  baseColor?: string;
  pillColor?: string;
  hoveredPillTextColor?: string;
  pillTextColor?: string;
  onMobileMenuClick?: () => void;
  initialLoadAnimation?: boolean;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  isLoggedIn: boolean;
  onLoginClick: () => void;
  onLogoutClick: () => void;
}

const PillNav: React.FC<PillNavProps> = ({
  logo,
  logoHref = "#",
  logoBgColor,
  logoAlt = "Logo",
  items,
  activeHref,
  className = "",
  ease = "power3.easeOut",
  baseColor = "#fff",
  pillColor = "#060010",
  hoveredPillTextColor = "#060010",
  pillTextColor,
  onMobileMenuClick,
  initialLoadAnimation = true,
  theme,
  toggleTheme,
  isLoggedIn,
  onLoginClick,
  onLogoutClick,
}) => {
  const resolvedPillTextColor = pillTextColor ?? baseColor;
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const circleRefs = useRef<Array<HTMLSpanElement | null>>([]);
  const tlRefs = useRef<Array<gsap.core.Timeline | null>>([]);
  const activeTweenRefs = useRef<Array<gsap.core.Tween | null>>([]);
  const logoImgRef = useRef<HTMLImageElement | null>(null);
  const logoTweenRef = useRef<gsap.core.Tween | null>(null);
  const hamburgerRef = useRef<HTMLButtonElement | null>(null);
  const mobileMenuRef = useRef<HTMLDivElement | null>(null);
  const navItemsRef = useRef<HTMLDivElement | null>(null);
  const logoRef = useRef<HTMLAnchorElement | HTMLElement | null>(null);

  const scrollToSection = (href: string) => {
    const id = href.startsWith('#') ? href.substring(1) : href;
    const section = document.getElementById(id);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  useEffect(() => {
    const layout = () => {
      circleRefs.current.forEach((circle) => {
        if (!circle?.parentElement) return;

        const pill = circle.parentElement as HTMLElement;
        const rect = pill.getBoundingClientRect();
        const { width: w, height: h } = rect;
        const R = ((w * w) / 4 + h * h) / (2 * h);
        const D = Math.ceil(2 * R) + 2;
        const delta =
          Math.ceil(R - Math.sqrt(Math.max(0, R * R - (w * w) / 4))) + 1;
        const originY = D - delta;

        circle.style.width = `${D}px`;
        circle.style.height = `${D}px`;
        circle.style.bottom = `-${delta}px`;

        gsap.set(circle, {
          xPercent: -50,
          scale: 0,
          transformOrigin: `50% ${originY}px`,
        });

        const label = pill.querySelector<HTMLElement>(".pill-label");
        const white = pill.querySelector<HTMLElement>(".pill-label-hover");

        if (label) gsap.set(label, { y: 0 });
        if (white) gsap.set(white, { y: h + 12, opacity: 0 });

        const index = circleRefs.current.indexOf(circle);
        if (index === -1) return;

        tlRefs.current[index]?.kill();
        const tl = gsap.timeline({ paused: true });

        tl.to(
          circle,
          { scale: 1.2, xPercent: -50, duration: 2, ease, overwrite: "auto" },
          0
        );

        if (label) {
          tl.to(
            label,
            { y: -(h + 8), duration: 2, ease, overwrite: "auto" },
            0
          );
        }

        if (white) {
          gsap.set(white, { y: Math.ceil(h + 100), opacity: 0 });
          tl.to(
            white,
            { y: 0, opacity: 1, duration: 2, ease, overwrite: "auto" },
            0
          );
        }

        tlRefs.current[index] = tl;
      });
    };

    layout();

    const onResize = () => layout();
    window.addEventListener("resize", onResize);

    if (document.fonts?.ready) {
      document.fonts.ready.then(layout).catch(() => {});
    }

    const menu = mobileMenuRef.current;
    if (menu) {
      gsap.set(menu, { visibility: "hidden", opacity: 0, scaleY: 1 });
    }

    if (initialLoadAnimation) {
      const logo = logoRef.current;
      const navItems = navItemsRef.current;

      if (logo) {
        gsap.set(logo, { scale: 0 });
        gsap.to(logo, {
          scale: 1,
          duration: 0.6,
          ease,
        });
      }

      if (navItems) {
        gsap.set(navItems, { width: 0, overflow: "hidden" });
        gsap.to(navItems, {
          width: "auto",
          duration: 0.6,
          ease,
        });
      }
    }

    return () => window.removeEventListener("resize", onResize);
  }, [items, ease, initialLoadAnimation]);

  const handleEnter = (i: number) => {
    const tl = tlRefs.current[i];
    if (!tl) return;
    activeTweenRefs.current[i]?.kill();
    activeTweenRefs.current[i] = tl.tweenTo(tl.duration(), {
      duration: 0.3,
      ease,
      overwrite: "auto",
    });
  };

  const handleLeave = (i: number) => {
    const tl = tlRefs.current[i];
    if (!tl) return;
    activeTweenRefs.current[i]?.kill();
    activeTweenRefs.current[i] = tl.tweenTo(0, {
      duration: 0.2,
      ease,
      overwrite: "auto",
    });
  };

  const handleLogoEnter = () => {
    const img = logoImgRef.current;
    if (!img) return;
    logoTweenRef.current?.kill();
    gsap.set(img, { rotate: 0 });
    logoTweenRef.current = gsap.to(img, {
      rotate: 360,
      duration: 0.2,
      ease,
      overwrite: "auto",
    });
  };

  const toggleMobileMenu = () => {
    const newState = !isMobileMenuOpen;
    setIsMobileMenuOpen(newState);

    const hamburger = hamburgerRef.current;
    const menu = mobileMenuRef.current;

    if (hamburger) {
      const lines = hamburger.querySelectorAll(".hamburger-line");
      if (newState) {
        gsap.to(lines[0], { rotation: 45, y: 3, duration: 0.3, ease });
        gsap.to(lines[1], { rotation: -45, y: -3, duration: 0.3, ease });
      } else {
        gsap.to(lines[0], { rotation: 0, y: 0, duration: 0.3, ease });
        gsap.to(lines[1], { rotation: 0, y: 0, duration: 0.3, ease });
      }
    }

    if (menu) {
      if (newState) {
        gsap.set(menu, { visibility: "visible" });
        gsap.fromTo(
          menu,
          { opacity: 0, y: 10, scaleY: 1 },
          {
            opacity: 1,
            y: 0,
            scaleY: 1,
            duration: 0.3,
            ease,
            transformOrigin: "top center",
          }
        );
      } else {
        gsap.to(menu, {
          opacity: 0,
          y: 10,
          scaleY: 1,
          duration: 0.2,
          ease,
          transformOrigin: "top center",
          onComplete: () => {
            gsap.set(menu, { visibility: "hidden" });
          },
        });
      }
    }

    onMobileMenuClick?.();
  };
  
  const handleLinkClick = (e: React.MouseEvent, item: PillNavItem) => {
      e.preventDefault();
      if (item.onClick) {
          item.onClick();
      } else {
          scrollToSection(item.href);
      }
  };

  const cssVars = {
    ["--base"]: baseColor,
    ["--pill-bg"]: pillColor,
    ["--hover-text"]: hoveredPillTextColor,
    ["--pill-text"]: resolvedPillTextColor,
  } as React.CSSProperties;

  return (
    <div className="pill-nav-container">
      <nav
        className={`pill-nav ${className}`}
        aria-label="Primary"
        style={cssVars}
      >
          <a
            className="pill-logo"
            href={logoHref}
            aria-label="Home"
            onMouseEnter={handleLogoEnter}
            ref={(el) => {
              logoRef.current = el;
            }}
            onClick={(e) => { e.preventDefault(); scrollToSection(logoHref); }}
            style={{ backgroundColor: logoBgColor }}
          >
            <img src={logo} alt={logoAlt} ref={logoImgRef} />
          </a>

        <div className="pill-nav-items desktop-only" ref={navItemsRef}>
          <ul className="pill-list" role="menubar">
            {items.map((item, i) => (
              <li key={item.href} role="none">
                  <a
                    role="menuitem"
                    href={item.href}
                    className={`pill${activeHref === item.href ? " is-active" : ""}`}
                    aria-label={item.ariaLabel || item.label}
                    onMouseEnter={() => handleEnter(i)}
                    onMouseLeave={() => handleLeave(i)}
                    onClick={(e) => handleLinkClick(e, item)}
                  >
                    <span
                      className="hover-circle"
                      aria-hidden="true"
                      ref={(el) => {
                        circleRefs.current[i] = el;
                      }}
                    />
                    <span className="label-stack">
                      <span className="pill-label">{item.label}</span>
                      <span className="pill-label-hover" aria-hidden="true">
                        {item.label}
                      </span>
                    </span>
                  </a>
              </li>
            ))}
             <li role="none" className="flex items-center ml-4">
                <ThemeSwitch theme={theme} toggleTheme={toggleTheme} />
            </li>
            {isLoggedIn ? (
                <li role="none" className="flex items-center ml-2">
                    <button onClick={onLogoutClick} className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-calm-orange-500 dark:hover:text-calm-orange-400 transition-colors duration-200 px-3 py-2 rounded-full">Logout</button>
                </li>
            ) : (
                <li role="none" className="flex items-center ml-2">
                    <button onClick={onLoginClick} className="text-sm font-medium text-white bg-calm-orange-500 hover:bg-calm-orange-600 transition-colors duration-200 px-4 py-2 rounded-full">Login</button>
                </li>
            )}
          </ul>
        </div>

        <button
          className="mobile-menu-button mobile-only"
          onClick={toggleMobileMenu}
          aria-label="Toggle menu"
          ref={hamburgerRef}
        >
          <span className="hamburger-line" />
          <span className="hamburger-line" />
        </button>
      </nav>

      <div
        className="mobile-menu-popover mobile-only"
        ref={mobileMenuRef}
        style={cssVars}
      >
        <ul className="mobile-menu-list">
          {items.map((item) => (
            <li key={item.href}>
                <a
                  href={item.href}
                  className={`mobile-menu-link${activeHref === item.href ? " is-active" : ""}`}
                  onClick={(e) => {
                     handleLinkClick(e, item);
                     toggleMobileMenu();
                  }}
                >
                  {item.label}
                </a>
            </li>
          ))}
            <li className="px-4 py-3 flex items-center justify-between">
                <span className="font-medium" style={{ color: 'var(--pill-text)' }}>Theme</span>
                <ThemeSwitch theme={theme} toggleTheme={toggleTheme} />
            </li>
            <li className="px-2 pt-2 pb-2 border-t border-slate-200 dark:border-slate-700/50">
              {isLoggedIn ? (
                  <button onClick={() => { onLogoutClick(); toggleMobileMenu(); }} className="w-full text-left mobile-menu-link">Logout</button>
              ) : (
                  <button onClick={() => { onLoginClick(); toggleMobileMenu(); }} className="w-full text-center mobile-menu-link" style={{backgroundColor: 'var(--pill-bg)', color: 'var(--hover-text)'}}>Login</button>
              )}
            </li>
        </ul>
      </div>

      <style>{`
        .pill-nav-container {
          position: fixed;
          top: 1em;
          left: 50%;
          transform: translateX(-50%);
          z-index: 99;
        }
        
        @media (max-width: 768px) {
          .pill-nav-container {
            width: 100%;
            left: 0;
            transform: translateX(0);
            box-sizing: border-box;
          }
        }
        
        .pill-nav {
          --nav-h: 42px;
          --logo: 36px;
          --pill-pad-x: 18px;
          --pill-gap: 3px;
          width: max-content;
          display: flex;
          align-items: center;
          box-sizing: border-box;
        }
        
        @media (max-width: 768px) {
          .pill-nav {
            width: 100%;
            justify-content: space-between;
            padding: 0 1rem;
            box-sizing: border-box;
            background: transparent;
          }
        }
        
        .pill-nav-items {
          background-color: var(--base);
          border-radius: calc(var(--nav-h) / 2);
          padding: var(--pill-gap);
          height: var(--nav-h);
          display: flex;
          align-items: center;
          box-sizing: border-box;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }

        .pill-list {
          display: flex;
          align-items: center;
          list-style: none;
          padding: 0;
          margin: 0;
          height: 100%;
        }
        
        .pill {
          height: 100%;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0 var(--pill-pad-x);
          font-size: 0.95rem;
          font-weight: 500;
          border-radius: calc((var(--nav-h) - var(--pill-gap) * 2) / 2);
          color: var(--pill-text);
          text-decoration: none;
          box-sizing: border-box;
          overflow: hidden;
          transition: color 0.3s;
        }
        
        .pill.is-active .hover-circle {
            transform: scale(1.2) translateX(-50%);
        }

        .pill.is-active .pill-label {
            transform: translateY(-200%);
            opacity: 0;
        }
        
        .pill.is-active .pill-label-hover {
            transform: translateY(0);
            opacity: 1;
        }
        
        .hover-circle {
          position: absolute;
          left: 50%;
          border-radius: 50%;
          background-color: var(--pill-bg);
          z-index: 1;
          transform: scale(0) translateX(-50%);
        }
        
        .label-stack {
          position: relative;
          z-index: 2;
          display: block;
          height: 1em;
        }
        
        .pill-label, .pill-label-hover {
          display: block;
          transition: transform 0.8s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1);
        }
        
        .pill-label-hover {
          color: var(--hover-text);
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          transform: translateY(200%);
          opacity: 0;
        }

        .pill-logo {
          width: var(--nav-h);
          height: var(--nav-h);
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          background-color: var(--base);
          margin-right: var(--pill-gap);
          box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        }
        
        .pill-logo img {
          width: var(--logo);
          height: var(--logo);
          padding: 4px;
          box-sizing: border-box;
        }

        .mobile-only {
          display: none;
        }

        @media (max-width: 768px) {
          .desktop-only {
            display: none;
          }
          .mobile-only {
            display: flex;
          }
           .pill-nav-items {
             display: none;
           }
        }

        .mobile-menu-button {
          background: var(--base);
          border: none;
          width: var(--nav-h);
          height: var(--nav-h);
          border-radius: 50%;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          gap: 4px;
          cursor: pointer;
          box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        }

        .hamburger-line {
          width: 18px;
          height: 2px;
          background-color: var(--pill-text);
          transition: transform 0.3s ease, background-color 0.3s ease;
        }

        .mobile-menu-popover {
          position: absolute;
          top: calc(var(--nav-h) + 0.5rem);
          right: 1rem;
          background: var(--base);
          border-radius: 12px;
          box-shadow: 0 5px 15px rgba(0,0,0,0.1);
          padding: 0.5rem;
          visibility: hidden;
          opacity: 0;
          width: 220px;
        }

        .mobile-menu-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .mobile-menu-link {
          display: block;
          padding: 0.75rem 1rem;
          color: var(--pill-text);
          text-decoration: none;
          font-weight: 500;
          border-radius: 8px;
          background: transparent;
          border: none;
          width: 100%;
          text-align: left;
          cursor: pointer;
          transition: background-color 0.2s ease, color 0.2s ease;
        }

        .mobile-menu-link:hover, .mobile-menu-link.is-active {
            background-color: var(--pill-bg);
            color: var(--hover-text);
        }
      `}
      </style>
    </div>
  );
};

const logoSvg = (color: string) => `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5,18 Q12,16 19,18 Q12,22 5,18 Z" fill="${color}" stroke="none" /><path d="M12 4 V 16" /><path d="M8 8 V 16" /><path d="M16 8 V 16" /></svg>`;

const App: React.FC = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [activeSection, setActiveSection] = useState('#home');
  const [page, setPage] = useState<'home' | 'chat' | 'journal' | 'writer' | 'dashboard' | 'live'>('home');
  const [isAppReady, setIsAppReady] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [initialAuthMode, setInitialAuthMode] = useState<'prompt' | 'login' | 'signup'>('prompt');
  const [authRedirect, setAuthRedirect] = useState<'chat' | 'journal' | 'home' | 'writer' | 'dashboard' | 'live'>('home');
  const [initialSelectedEntryId, setInitialSelectedEntryId] = useState<string | null>(null);

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

  const handleAuthSuccess = useCallback((targetPage: 'chat' | 'journal' | 'home' | 'writer' | 'dashboard' | 'live') => {
    setIsLoggedIn(true);
    closeAuthModal();
    setTimeout(() => setPage(targetPage), 300);
  }, [closeAuthModal]);
  
  const handleGuestLogin = useCallback((targetPage: 'chat' | 'journal' | 'home' | 'writer' | 'dashboard' | 'live') => {
    setIsLoggedIn(true);
    closeAuthModal();
    setTimeout(() => setPage(targetPage), 300);
  }, [closeAuthModal]);

  const handleLogout = useCallback(() => {
    setIsLoggedIn(false);
    setPage('home');
  }, []);

  const navigateToDashboard = useCallback(() => {
    if (isLoggedIn) {
      setPage('dashboard');
    } else {
      setAuthRedirect('dashboard');
      openAuthModal('prompt');
    }
  }, [isLoggedIn, openAuthModal]);
  
  const navigateToChat = useCallback(() => {
    if (isLoggedIn) {
      setPage('chat');
    } else {
      setAuthRedirect('chat');
      openAuthModal('prompt');
    }
  }, [isLoggedIn, openAuthModal]);
  
  const navigateToJournal = useCallback((entryId?: string | React.MouseEvent) => {
    if (isLoggedIn) {
      if (typeof entryId === 'string') {
        setInitialSelectedEntryId(entryId);
      } else {
        setInitialSelectedEntryId(null);
      }
      setPage('journal');
    } else {
      setAuthRedirect('journal');
      openAuthModal('prompt');
    }
  }, [isLoggedIn, openAuthModal]);
  
  const navigateToWriter = useCallback(() => {
    if (isLoggedIn) {
      setPage('writer');
    } else {
      setAuthRedirect('writer');
      openAuthModal('prompt');
    }
  }, [isLoggedIn, openAuthModal]);

  const navigateToLive = useCallback(() => {
    if (isLoggedIn) {
      setPage('live');
    } else {
      setAuthRedirect('live');
      openAuthModal('prompt');
    }
  }, [isLoggedIn, openAuthModal]);

  const navigateToHome = useCallback(() => {
    setPage('home');
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
        { label: 'Aura Voice', href: '#live', onClick: navigateToLive },
        { label: 'Journal', href: '#journal', onClick: navigateToJournal },
        { label: 'Writer', href: '#writer', onClick: navigateToWriter },
        { label: 'About', href: '#about' },
    ];
    if (isLoggedIn) {
        return [{ label: 'Dashboard', href: '#dashboard', onClick: navigateToDashboard }, ...baseItems];
    }
    return baseItems;
  }, [isLoggedIn, navigateToJournal, navigateToWriter, navigateToDashboard, navigateToLive]);


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
  
  if (page === 'live') {
    return <LiveAgentPage theme={theme} onNavigateHome={navigateToHome} />;
  }
  
  if (page === 'dashboard') {
    return <DashboardPage 
        theme={theme} 
        onNavigateHome={navigateToHome} 
        onNavigateToChat={navigateToChat}
        onNavigateToJournal={navigateToJournal}
        onNavigateToWriter={navigateToWriter}
    />;
  }

  if (page === 'chat') {
    return <ChatPage theme={theme} onNavigateHome={navigateToHome} onNavigateToJournal={navigateToJournal} />;
  }

  if (page === 'journal') {
    return <JournalPage 
      theme={theme} 
      onNavigateHome={navigateToHome} 
      initialSelectedEntryId={initialSelectedEntryId}
      clearInitialSelectedEntryId={clearInitialSelectedEntryId}
    />;
  }
  
  if (page === 'writer') {
    return <MessageWriterPage theme={theme} onNavigateHome={navigateToHome} />;
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
        baseColor={theme === 'dark' ? '#060010' : '#ffffff'}
        pillColor={'#f97316'}
        hoveredPillTextColor={'#ffffff'}
        pillTextColor={theme === 'dark' ? '#ffffff' : '#060010'}
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
                    onNavigateToLive={navigateToLive}
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
            onNavigateToLive={navigateToLive} 
            onOpenJournal={navigateToJournal} 
            onNavigateToWriter={navigateToWriter} 
            onNavigateToDashboard={navigateToDashboard}
        />
      </main>
      <Footer />
      
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={closeAuthModal}
        onAuthSuccess={() => handleAuthSuccess(authRedirect)}
        onGuestLogin={() => handleGuestLogin(authRedirect)}
        initialMode={initialAuthMode}
        logoDataUri={logoDataUri}
      />
    </motion.div>
  );
};

export default App;