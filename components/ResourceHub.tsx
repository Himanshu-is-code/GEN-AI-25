import React from 'react';
import type { Resource } from '../types';

const resources: Resource[] = [
  {
    name: 'The Trevor Project',
    description: 'Provides crisis intervention and suicide prevention services to lesbian, gay, bisexual, transgender, queer & questioning (LGBTQ) young people under 25.',
    url: 'https://www.thetrevorproject.org/',
  },
  {
    name: 'Kids Help Phone',
    description: 'A Canadian 24/7, national, bilingual, professional counselling, information and referrals and text-based support for young people.',
    url: 'https://kidshelpphone.ca/',
  },
  {
    name: 'NAMI (National Alliance on Mental Illness)',
    description: 'The largest grassroots mental health organization in the U.S. dedicated to building better lives for millions of Americans affected by mental illness.',
    url: 'https://www.nami.org/',
  },
  {
    name: 'The Jed Foundation (JED)',
    description: 'A nonprofit that protects emotional health and prevents suicide for our nation’s teens and young adults.',
    url: 'https://www.jedfoundation.org/',
  },
];

const ResourceCard: React.FC<{ resource: Resource }> = ({ resource }) => (
    <a href={resource.url} target="_blank" rel="noopener noreferrer" className="block p-5 bg-white dark:bg-slate-900/50 rounded-xl shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
        <h4 className="font-bold text-calm-orange-700 dark:text-calm-orange-300 mb-1">{resource.name}</h4>
        <p className="text-sm text-slate-600 dark:text-slate-400">{resource.description}</p>
    </a>
);


const ResourceHub: React.FC = () => {
  return (
    <section className="bg-slate-100/30 dark:bg-slate-800/30 backdrop-blur-lg p-6 rounded-2xl shadow-lg border border-slate-300/50 dark:border-slate-700/50">
      <h2 className="text-2xl font-bold text-calm-orange-800 dark:text-calm-orange-100 mb-2">Find More Help</h2>
      <p className="text-slate-600 dark:text-slate-400 mb-6">You are not alone. If you need to talk to someone, these organizations are here to help.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {resources.map((resource) => (
          <ResourceCard key={resource.name} resource={resource} />
        ))}
      </div>
    </section>
  );
};

export default ResourceHub;