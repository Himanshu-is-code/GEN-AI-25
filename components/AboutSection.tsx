import React from 'react';

const AboutSection: React.FC = () => {
  return (
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-12 lg:gap-8 lg:items-center">
          <div className="lg:col-span-5">
            <div className="relative">
              <div className="relative rounded-xl overflow-hidden shadow-2xl h-96">
                <img 
                  src="https://images.unsplash.com/photo-1506126613408-eca07ce80073?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80" 
                  alt="A person in a calm, meditative pose, representing mental well-being." 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-calm-orange-900 opacity-20"></div>
              </div>
              <div className="absolute -bottom-6 -right-6 w-48 h-48 bg-calm-orange-700 rounded-full opacity-20" aria-hidden="true"></div>
            </div>
          </div>
          <div className="mt-10 lg:mt-0 lg:col-span-7">
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white sm:text-4xl">
              <span className="gradient-text">Our Mission</span>
            </h2>
            <p className="mt-4 text-lg text-slate-600 dark:text-gray-300">
              Mindful Youth was born from a simple but powerful idea: every young person deserves accessible, stigma-free mental health support.
            </p>
            <div className="mt-8">
              <div className="flex items-start">
                <div className="flex-shrink-0 bg-calm-orange-200 dark:bg-calm-orange-900 rounded-md p-2">
                  <svg className="w-6 h-6 text-calm-orange-600 dark:text-calm-orange-300" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd"></path>
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-slate-800 dark:text-white">Breaking Down Barriers</h3>
                  <p className="mt-1 text-slate-600 dark:text-gray-300">
                    We're tackling the stigma around mental health by providing a safe, anonymous space where youth can seek help without fear of judgment.
                  </p>
                </div>
              </div>
              <div className="mt-6 flex items-start">
                <div className="flex-shrink-0 bg-calm-orange-200 dark:bg-calm-orange-900 rounded-md p-2">
                  <svg className="w-6 h-6 text-calm-orange-600 dark:text-calm-orange-300" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <path d="M3 4a2 2 0 012-2h10a2 2 0 012 2v10a2 2 0 01-2-2H5a2 2 0 01-2-2V4zm2 1v1h10V5H5zm0 2v1h10V7H5zm0 2v1h10V9H5zm0 2v1h5v-1H5zm7 0v1h3v-1h-3z" clipRule="evenodd"></path>
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-slate-800 dark:text-white">AI with a Human Touch</h3>
                  <p className="mt-1 text-slate-600 dark:text-gray-300">
                    Our advanced AI combines cutting-edge technology with carefully designed empathy algorithms to provide meaningful support.
                  </p>
                </div>
              </div>
              <div className="mt-6 flex items-start">
                <div className="flex-shrink-0 bg-calm-orange-200 dark:bg-calm-orange-900 rounded-md p-2">
                  <svg className="w-6 h-6 text-calm-orange-600 dark:text-calm-orange-300" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-slate-800 dark:text-white">Safety First</h3>
                  <p className="mt-1 text-slate-600 dark:text-gray-300">
                    While we're not a replacement for professional care, we provide immediate support and can connect users with appropriate resources when needed.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;