'use client';
import React from 'react';
import type { ComponentProps } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Code, MessageCircle, Zap } from 'lucide-react';

interface FooterLink {
  title: string;
  href: string;
  external?: boolean;
}

interface FooterSection {
  label: string;
  links: FooterLink[];
}

const footerLinks: FooterSection[] = [
  {
    label: 'Product',
    links: [
      { title: 'Features', href: '/#features' },
      { title: 'Pricing', href: '/pricing' },
      { title: 'Models', href: '/models' },
      { title: 'Documentation', href: '/docs' },
    ],
  },
  {
    label: 'Resources',
    links: [
      { title: 'Documentation', href: '/docs' },
      { title: 'API Reference', href: '/docs' },
      { title: 'GitHub', href: 'https://github.com/anomalyco/routing.run', external: true },
      { title: 'Discord', href: '#', external: true },
    ],
  },
  {
    label: 'Company',
    links: [
      { title: 'About', href: '#' },
      { title: 'Privacy Policy', href: '#' },
      { title: 'Terms of Service', href: '#' },
      { title: 'Contact', href: 'mailto:support@routing.run' },
    ],
  },
  {
    label: 'Social',
    links: [
      { title: 'GitHub', href: 'https://github.com/anomalyco/routing.run', external: true },
      { title: 'Discord', href: '#', external: true },
    ],
  },
];

type ViewAnimationProps = {
  delay?: number;
  className?: ComponentProps<typeof motion.div>['className'];
  children: React.ReactNode;
};

function AnimatedContainer({ className, delay = 0.1, children }: ViewAnimationProps) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <>{children}</>;
  }

  return (
    <motion.div
      initial={{ filter: 'blur(4px)', translateY: -8, opacity: 0 }}
      whileInView={{ filter: 'blur(0px)', translateY: 0, opacity: 1 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.8 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function GithubIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
    </svg>
  );
}

function TwitterIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
  );
}

function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM18.345 0H1.655C.74 0 0 .774 0 1.709v20.583C0 23.227.74 24 1.655 24h16.689c.916 0 1.655-.773 1.655-1.708V1.709C24 .774 23.26 0 22.345 0h-3.985z"/>
    </svg>
  );
}

function YouTubeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
    </svg>
  );
}

export function Footer() {
  return (
    <footer className="relative w-full bg-black border-t border-white/10">
      <div className="max-w-7xl mx-auto px-6 py-12 lg:py-16">
        <div className="grid w-full gap-8 md:grid-cols-2 lg:grid-cols-5">
          <AnimatedContainer className="space-y-4 lg:col-span-2">
            <a href="/" className="flex items-center gap-2">
              <img src="/transparent_white_logo.PNG" alt="routing.run" className="h-8" />
            </a>
            <p className="text-gray-500 text-sm max-w-xs">
              First-class AI routing service. 100% open source, built for developers who want transparency and control.
            </p>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span>Built by the best engineers, not businessmen</span>
            </div>
          </AnimatedContainer>

          <div className="grid grid-cols-2 gap-8 md:grid-cols-3 lg:col-span-3">
            {footerLinks.map((section, index) => (
              <AnimatedContainer key={section.label} delay={0.1 + index * 0.1}>
                <div>
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">{section.label}</h3>
                  <ul className="space-y-2">
                    {section.links.map((link) => (
                      <li key={link.title}>
                        <a
                          href={link.href}
                          target={link.external ? '_blank' : undefined}
                          rel={link.external ? 'noopener noreferrer' : undefined}
                          className="text-gray-500 hover:text-white transition-colors text-sm inline-flex items-center gap-1"
                        >
                          {link.title}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              </AnimatedContainer>
            ))}
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} routing.run. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <a href="https://github.com/anomalyco/routing.run" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-white transition-colors">
              <GithubIcon className="w-5 h-5" />
            </a>
            <a href="#" className="text-gray-500 hover:text-white transition-colors">
              <TwitterIcon className="w-5 h-5" />
            </a>
            <a href="#" className="text-gray-500 hover:text-white transition-colors">
              <LinkedInIcon className="w-5 h-5" />
            </a>
            <a href="#" className="text-gray-500 hover:text-white transition-colors">
              <YouTubeIcon className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}