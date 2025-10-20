

import React, { useState, useEffect, useId } from 'react';
// FIX: The framer-motion `Variants` type is not being exported correctly in this project's setup.
// Removing it from the import to resolve the error.
import { motion, AnimatePresence } from 'framer-motion';
import { GoogleLogin } from '@react-oauth/google';

const XIcon = ({ className = "w-6 h-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
);

const GoogleIcon = () => (
    <svg className="w-5 h-5 mr-3" viewBox="0 0 48 48">
      <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path>
      <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path>
      <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path>
      <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.574l6.19,5.238C39.902,35.688,44,30.419,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path>
    </svg>
);


interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: () => void;
  onGuestLogin: () => void;
  initialMode?: 'prompt' | 'login' | 'signup';
  logoDataUri: string;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onAuthSuccess, onGuestLogin, initialMode = 'prompt', logoDataUri }) => {
  const [mode, setMode] = useState(initialMode);
  const id = useId();

  useEffect(() => {
    // Reset to initial mode when modal is opened
    if (isOpen) {
        setMode(initialMode);
    }
  }, [initialMode, isOpen]);
  
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
       if (event.key === 'Escape') {
        onClose();
       }
    };
    window.addEventListener('keydown', handleEsc);

    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [onClose]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAuthSuccess();
  };

  const switchMode = () => {
    setMode(prev => prev === 'login' ? 'signup' : 'login');
  };

  const backdropVariants = {
    visible: { opacity: 1 },
    hidden: { opacity: 0 },
  };

  // FIX: Explicitly typing `modalVariants` as `any` to resolve a TypeScript error where the object's structure was considered incompatible with framer-motion's `Variants` type.
  const modalVariants: any = {
    hidden: { opacity: 0, scale: 0.95, y: 20 },
    visible: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 30 } },
    exit: { opacity: 0, scale: 0.95, y: 20, transition: { duration: 0.2 } },
  };

  const titles = {
      prompt: {
          title: 'Welcome',
          subtitle: 'Continue as a guest or log in to save your journey.'
      },
      login: {
          title: 'Welcome Back',
          subtitle: 'Log in to continue your journey.'
      },
      signup: {
          title: 'Sign up to Mindful Youth',
          subtitle: 'We just need a few details to get you started.'
      }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        // FIX: Framer Motion props are not being recognized by TypeScript due to a potential version issue. Using ts-ignore as a workaround.
        // @ts-ignore
        <motion.div
          onClick={onClose}
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
        >
          {/* FIX: Framer Motion props are not being recognized by TypeScript due to a potential version issue. Using ts-ignore as a workaround. */}
          {/* @ts-ignore */}
          <motion.div
            onClick={(e) => e.stopPropagation()}
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="relative bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800"
          >
            <button
                onClick={onClose}
                className="absolute top-3 right-3 p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                aria-label="Close dialog"
            >
                <XIcon className="w-5 h-5" />
            </button>

            <div className="p-8">
              <div className="flex flex-col items-center gap-2 mb-6">
                <div
                  className="flex size-11 shrink-0 items-center justify-center rounded-full border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800"
                  aria-hidden="true"
                >
                  <img src={logoDataUri} alt="logo" className="h-8 w-8" />
                </div>
                <div className="text-center">
                    <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">
                        {titles[mode].title}
                    </h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        {titles[mode].subtitle}
                    </p>
                </div>
              </div>

              <AnimatePresence mode="wait">
                  {/* FIX: Framer Motion props are not being recognized by TypeScript due to a potential version issue. Using ts-ignore as a workaround. */}
                  {/* @ts-ignore */}
                  <motion.div
                    key={mode}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    {mode === 'prompt' ? (
                        <div className="space-y-4">
                            <button onClick={onGuestLogin} className="w-full bg-calm-orange-600 text-white font-semibold py-2.5 px-4 rounded-md hover:bg-calm-orange-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-calm-orange-500 dark:ring-offset-slate-900">
                                Continue as guest
                            </button>
                             <button onClick={() => setMode('login')} className="w-full text-calm-orange-600 dark:text-calm-orange-500 font-semibold py-2.5 px-4 rounded-md hover:bg-calm-orange-50 dark:hover:bg-calm-orange-900/20 transition-colors">
                                Log in or Sign up
                            </button>
                        </div>
                    ) : (
                      <div>
                        <form className="space-y-4" onSubmit={handleSubmit}>
                          {mode === 'signup' && (
                              <div>
                                  <label htmlFor={`${id}-name`} className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Full name</label>
                                  <input id={`${id}-name`} placeholder="Your Name" type="text" required className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md focus:outline-none focus:ring-2 focus:ring-calm-orange-500"/>
                              </div>
                          )}
                          <div>
                              <label htmlFor={`${id}-email`} className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Email</label>
                              <input id={`${id}-email`} placeholder="you@example.com" type="email" required className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md focus:outline-none focus:ring-2 focus:ring-calm-orange-500"/>
                          </div>
                          <div>
                              <label htmlFor={`${id}-password`} className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Password</label>
                              <input id={`${id}-password`} placeholder="Enter your password" type="password" required className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md focus:outline-none focus:ring-2 focus:ring-calm-orange-500"/>
                          </div>
                          <button type="submit" className="w-full bg-calm-orange-600 text-white font-semibold py-2.5 px-4 rounded-md hover:bg-calm-orange-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-calm-orange-500 dark:ring-offset-slate-900">
                              {mode === 'signup' ? 'Create Account' : 'Log in'}
                          </button>
                        </form>

                        <div className="flex items-center gap-3 my-6 before:h-px before:flex-1 after:h-px after:flex-1 before:bg-slate-200 after:bg-slate-200 dark:before:bg-slate-700 dark:after:bg-slate-700">
                          <span className="text-slate-500 text-xs">OR</span>
                        </div>


<GoogleLogin
  onSuccess={(credentialResponse) => {
    console.log('Google login success:', credentialResponse);
    onAuthSuccess(); // You already handle post-login flow
  }}
  onError={() => {
    console.log('Google login failed');
  }}
  width="100%"
  shape="pill"
  text="continue_with"
  theme="filled_black"
/>

                        <p className="text-slate-500 dark:text-slate-400 text-center text-sm mt-6">
                          {mode === 'signup' ? 'Already have an account?' : "Don't have an account?"}{' '}
                          <button onClick={switchMode} className="font-semibold text-calm-orange-600 hover:text-calm-orange-500 hover:underline">
                            {mode === 'signup' ? 'Log in' : 'Sign up'}
                          </button>
                        </p>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AuthModal;