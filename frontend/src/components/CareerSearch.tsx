import React, { useState } from 'react';
import { CareerPath } from '../types';
import { careerAPI } from '../services/api';
import Spinner from './Spinner';
import { FaSearch, FaCheckCircle, FaRocket, FaLightbulb, FaCopy, FaCheck, FaPrint } from 'react-icons/fa';

const POPULAR_CAREERS = [
  'Full Stack Software Engineer',
  'AI / Machine Learning Engineer',
  'Cloud Solutions Architect',
  'Data Scientist & Analyst',
  'Cybersecurity Specialist',
  'Product Manager',
  'DevOps & Site Reliability Engineer',
  'Mobile App Developer'
];

interface CareerSearchProps {
  initialQuery?: string;
}

const CareerSearch: React.FC<CareerSearchProps> = ({ initialQuery = '' }) => {
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [careerPath, setCareerPath] = useState<CareerPath | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [copied, setCopied] = useState(false);

  const executeSearch = async (query: string) => {
    const trimmed = query.trim();
    if (!trimmed) {
      setError('Please enter a target career role to search.');
      return;
    }

    setLoading(true);
    setError(null);
    setHasSearched(true);
    setSearchQuery(trimmed);

    try {
      const response = await careerAPI.searchCareer(trimmed);
      if (response.data.career_paths && response.data.career_paths.length > 0) {
        setCareerPath(response.data.career_paths[0]);
      } else {
        setCareerPath(null);
        setError('No detailed roadmap could be generated for this role. Try a more common job title.');
      }
    } catch (err: any) {
      setError(
        err.response?.data?.detail ||
        'Error generating career guidance. Please ensure your profile & Gemini API key are active.'
      );
      setCareerPath(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    executeSearch(searchQuery);
  };

  const handleCopy = () => {
    if (!careerPath) return;
    const text = `🎯 Career Path: ${careerPath.career_path}\n\n💡 Why Suitable:\n${careerPath.suitability_reason}\n\n🛠️ Required Skills:\n- ${careerPath.required_skills.join('\n- ')}\n\n🚀 Roadmap:\n${careerPath.roadmap.map(s => `Step ${s.step}: ${s.action}\n${s.details}`).join('\n\n')}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fadeIn" data-testid="career-search">
      <div className="mb-2">
        <h2 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
          Targeted Career Search
        </h2>
        <p className="text-gray-700 dark:text-gray-300 text-sm md:text-base">
          Curious about a specific role? Enter any dream job to get an AI-tailored roadmap built around your background.
        </p>
      </div>

      {/* Search Form */}
      <div className="card p-6 md:p-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-xl space-y-4">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="e.g. AI Engineer, Full Stack Developer, Product Manager..."
              className="input-field pl-11 py-3 text-base"
              data-testid="search-input"
            />
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary py-3 px-8 flex items-center justify-center gap-2 shadow-lg"
            data-testid="search-button"
          >
            <FaSearch />
            <span>Generate Roadmap</span>
          </button>
        </form>

        {/* Quick Popular Suggestions */}
        <div className="pt-2">
          <span className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider block mb-2">
            Popular Roles to Explore:
          </span>
          <div className="flex flex-wrap gap-2">
            {POPULAR_CAREERS.map((role, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => executeSearch(role)}
                className="text-xs px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-purple-100 dark:hover:bg-purple-900/40 text-gray-800 dark:text-gray-200 hover:text-purple-700 dark:hover:text-purple-300 transition-colors border border-gray-200 dark:border-gray-600 hover:border-purple-300"
              >
                {role}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <Spinner message={`Analyzing background fit for "${searchQuery}" with Gemini AI...`} size="lg" />
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="card p-8 text-center" data-testid="search-error">
          <div className="text-red-500 text-5xl mb-3">⚠️</div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Search Guidance Notice</h3>
          <p className="text-gray-700 dark:text-gray-300 max-w-lg mx-auto leading-relaxed">{error}</p>
        </div>
      )}

      {/* Career Path Result */}
      {careerPath && !loading && (
        <div className="card p-6 md:p-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-xl space-y-6 animate-fadeIn" data-testid="search-result">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 dark:border-gray-700 pb-6">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl flex items-center justify-center text-white text-2xl shadow-lg flex-shrink-0">
                🎯
              </div>
              <div>
                <h3 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white mb-1">
                  {careerPath.career_path}
                </h3>
                <span className="text-xs font-semibold px-2.5 py-1 bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300 rounded-full border border-green-200 dark:border-green-800">
                  Custom AI Profile Analysis
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleCopy}
                className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 transition-colors border border-gray-300 dark:border-gray-600"
              >
                {copied ? (
                  <>
                    <FaCheck className="text-green-500" /> Copied!
                  </>
                ) : (
                  <>
                    <FaCopy /> Copy Plan
                  </>
                )}
              </button>
              <button
                onClick={() => window.print()}
                className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <FaPrint /> Print
              </button>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">
              Profile Fit & Bridge Assessment:
            </h4>
            <p className="text-gray-800 dark:text-gray-200 leading-relaxed text-sm md:text-base bg-purple-50 dark:bg-purple-950/40 p-4 rounded-xl border border-purple-200 dark:border-purple-800/60 font-normal">
              <FaLightbulb className="inline mr-2 text-amber-500" />
              {careerPath.suitability_reason}
            </p>
          </div>

          {/* Required Skills */}
          <div>
            <h4 className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-3">
              Essential Skills for This Career:
            </h4>
            <div className="flex flex-wrap gap-2">
              {careerPath.required_skills.map((skill, index) => (
                <span
                  key={index}
                  className="px-3.5 py-1.5 bg-purple-50 dark:bg-purple-950/70 text-purple-800 dark:text-purple-200 border border-purple-200 dark:border-purple-800/80 rounded-lg text-xs md:text-sm font-semibold shadow-xs"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Roadmap */}
          <div className="pt-2">
            <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <FaRocket className="text-purple-600" />
              Tailored Career Roadmap
            </h4>
            <div className="space-y-4">
              {careerPath.roadmap.map((step, index) => (
                <div
                  key={index}
                  className="flex items-start gap-4 p-4 md:p-5 bg-gray-50 dark:bg-gray-900/90 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all duration-200"
                  data-testid={`roadmap-step-${index}`}
                >
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-base shadow-md">
                      {step.step}
                    </div>
                  </div>
                  <div className="flex-1">
                    <h5 className="font-bold text-gray-900 dark:text-white text-base md:text-lg mb-1 flex items-center gap-2">
                      <FaCheckCircle className="text-green-500 text-sm flex-shrink-0" />
                      {step.action}
                    </h5>
                    <p className="text-gray-700 dark:text-gray-200 text-sm leading-relaxed font-normal">
                      {step.details}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Initial State */}
      {!hasSearched && !loading && (
        <div className="card p-10 md:p-12 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-center shadow-xl">
          <div className="text-5xl mb-4">🔍</div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Search Any Role in the Tech or Global Economy
          </h3>
          <p className="text-gray-700 dark:text-gray-300 max-w-xl mx-auto text-sm md:text-base">
            Type any job title or click one of the suggested roles above. Orbit AI evaluates what you have versus what the role requires and builds a personalized growth plan.
          </p>
        </div>
      )}
    </div>
  );
};

export default CareerSearch;
