import React from 'react';
import Footer from './Footer';
import { useNavigate } from 'react-router-dom';
import { AnalysisIcon, ProfileIcon, SearchIcon } from './icons';

const FeatureCard: React.FC<{ icon: React.ReactNode; title: string; description: string }> = ({ 
  icon, 
  title, 
  description 
}) => (
  <div className="group bg-white dark:bg-gray-800 p-6 md:p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-200 dark:border-gray-700">
    <div className="flex items-center justify-center w-14 h-14 md:w-16 md:h-16 bg-gradient-to-br from-purple-500 to-blue-600 text-white rounded-2xl mb-4 md:mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
      {icon}
    </div>
    <h3 className="text-xl md:text-2xl font-bold mb-2 md:mb-3 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
      {title}
    </h3>
    <p className="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed font-normal">{description}</p>
  </div>
);

const HomePage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <header className="w-full bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg shadow-md z-10 sticky top-0 border-b border-gray-200 dark:border-gray-700">
        <nav className="container mx-auto px-4 md:px-6 py-4 md:py-5 flex justify-between items-center">
          <h1 className="text-xl md:text-2xl lg:text-3xl font-extrabold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Orbit AI
          </h1>
          <button
            onClick={() => navigate('/login')}
            className="btn-primary text-sm md:text-base px-5 md:px-6 py-2.5 md:py-3 shadow-md"
            data-testid="signin-button"
          >
            Sign In / Sign Up
          </button>
        </nav>
      </header>

      <main className="flex-grow">
        <section className="text-center py-12 md:py-16 lg:py-24 px-4 md:px-6">
          <div className="container mx-auto">
            <h2 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-extrabold mb-4 md:mb-6 bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent animate-gradient">
              Find Your Future, Today.
            </h2>
            <p className="text-base md:text-lg lg:text-xl text-gray-800 dark:text-gray-200 max-w-3xl mx-auto mb-6 md:mb-10 leading-relaxed font-normal">
              Our AI-powered platform analyzes your unique skills, education, and CV to illuminate high-growth career paths. Stop guessing, start planning.
            </p>
            <button
              onClick={() => navigate('/login')}
              className="btn-primary text-base md:text-lg px-8 md:px-10 py-3 md:py-4 shadow-lg"
              data-testid="get-started-button"
            >
              Get Started
            </button>
          </div>
        </section>

        <section className="py-12 md:py-16 lg:py-20 px-4 md:px-6">
          <div className="container mx-auto">
            <h3 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-center mb-10 md:mb-16 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              How It Works
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 lg:gap-10">
              <FeatureCard 
                icon={<ProfileIcon className="w-6 h-6 md:w-8 md:h-8" />}
                title="Build Your Profile"
                description="Upload your CV and provide your qualifications, skills, and Gemini API key to create a comprehensive professional snapshot."
              />
              <FeatureCard 
                icon={<AnalysisIcon className="w-6 h-6 md:w-8 md:h-8" />}
                title="Get AI Analysis"
                description="Our Gemini AI evaluates your profile to generate personalized career recommendations and detailed roadmaps."
              />
              <FeatureCard 
                icon={<SearchIcon className="w-6 h-6 md:w-8 md:h-8" />}
                title="Explore & Succeed"
                description="Search for specific careers or follow our guided paths to acquire new skills and achieve your goals."
              />
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default HomePage;