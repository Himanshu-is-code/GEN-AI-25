import React from 'react';

const FooterLink: React.FC<{ href: string; children: React.ReactNode; isHiring?: boolean }> = ({ href, children, isHiring }) => (
  <li>
    <a href={href} className="text-slate-700 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors text-sm flex items-center group">
      <span className="text-calm-orange-500 mr-2 transition-transform duration-300 group-hover:translate-x-1">&gt;</span>
      <span className="group-hover:underline">{children}</span>
      {isHiring && <span className="ml-2 text-xs text-orange-500 bg-orange-100 dark:text-orange-300 dark:bg-orange-900/50 rounded-full px-2 py-0.5 font-medium">We're hiring!</span>}
    </a>
  </li>
);

const Footer: React.FC = () => {
  return (
    <footer className="bg-white dark:bg-black text-slate-800 dark:text-slate-200 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-y-8 gap-x-4">
          {/* Column 1 */}
          <ul className="space-y-3">
            <FooterLink href="#">How it Works</FooterLink>
            <FooterLink href="#features">What's Included</FooterLink>
            <FooterLink href="#">Gift Mindful Youth</FooterLink>
          </ul>
          
          {/* Column 2 */}
          <ul className="space-y-3">
            <FooterLink href="#">Member Login</FooterLink>
            <FooterLink href="#">Manifesto</FooterLink>
            <FooterLink href="#" isHiring>Join the Team</FooterLink>
            <FooterLink href="#">Mindful Youth Labs</FooterLink>
          </ul>

          {/* Column 3 */}
          <ul className="space-y-3">
            <FooterLink href="#">For Creators</FooterLink>
            <FooterLink href="#">For Partners</FooterLink>
            <FooterLink href="#">For Teams</FooterLink>
          </ul>

          {/* Column 4 */}
          <ul className="space-y-3">
            <FooterLink href="#">X / Twitter</FooterLink>
            <FooterLink href="#">Instagram</FooterLink>
            <FooterLink href="#">LinkedIn</FooterLink>
          </ul>

          {/* Column 5 */}
          <ul className="space-y-3">
            <FooterLink href="#">Terms</FooterLink>
            <FooterLink href="#">Privacy Policy</FooterLink>
            <FooterLink href="#">FAQ</FooterLink>
            <FooterLink href="#">Contact us</FooterLink>
          </ul>
        </div>

        <div className="mt-16 text-left">
            <p className="text-xs text-slate-500 dark:text-slate-500 font-mono tracking-wider">
                © {new Date().getFullYear()} MINDFUL YOUTH, INC. ALL RIGHTS RESERVED.
            </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
