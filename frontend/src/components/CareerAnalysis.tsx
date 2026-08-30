import React, { useState, useEffect } from 'react';
import { CareerPath } from '../types';
import { careerAPI } from '../services/api';
import Spinner from './Spinner';
import { FaCheckCircle, FaRocket, FaLightbulb, FaCopy, FaCheck, FaPrint, FaRedo, FaSearch } from 'react-icons/fa';

interface CareerAnalysisProps {
  initialResult?: CareerPath[] | null;
  onNavigateToSearch?: (query?: string) => void;
}

const CareerAnalysis: React.FC<CareerAnalysisProps> = ({ initialResult, onNavigateToSearch }) => {
  const [careerPaths, setCareerPaths] = useState<CareerPath[] | null>(initialResult || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedPath, setExpandedPath] = useState<number | null>(0);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const analyzeCareer = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await careerAPI.analyzeCareer();
      setCareerPaths(response.data.career_paths);
      setExpandedPath(0);
    } catch (err: any) {
      setError(
        err.response?.data?.detail ||
        'Error analyzing career paths. Please make sure your Gemini API key and profile details are complete.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!careerPaths) {
      analyzeCareer();
    }
  }, []);

  const handleCopy = (path: CareerPath, index: number) => {
    const text = `🎯 Career Path: ${path.career_path}\n\n💡 Why Suitable:\n${path.suitability_reason}\n\n🛠️ Required Skills:\n- ${path.required_skills.join('\n- ')}\n\n🚀 Action Roadmap:\n${path.roadmap.map(s => `Step ${s.step}: ${s.action}\n${s.details}`).join('\n\n')}`;
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-24">
        <Spinner message="Orbit AI is analyzing your CV & profile to craft customized roadmaps..." size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto" data-testid="analysis-error">
        <div className="card p-8 md:p-10 text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Analysis Notice</h3>
          <p className="text-gray-700 dark:text-gray-200 mb-6 leading-relaxed text-sm md:text-base">{error}</p>
          <div className="flex justify-center gap-4">
            <button onClick={analyzeCareer} className="btn-primary flex items-center gap-2">
              <FaRedo /> Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!careerPaths || careerPaths.length === 0) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="card p-10 text-center">
          <div className="text-gray-400 text-6xl mb-4">📊</div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Ready to Discover Your Path?</h3>
          <p className="text-gray-700 dark:text-gray-300 mb-8">
            Click below to generate personalized career recommendations based on your current education, skills, and CV.
          </p>
          <button onClick={analyzeCareer} className="btn-primary text-lg px-8 py-3">
            Analyze My Career Paths
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fadeIn" data-testid="career-analysis">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
            Recommended Career Paths
          </h2>
          <p className="text-gray-700 dark:text-gray-300 text-sm md:text-base">
            Orbit AI identified the top {careerPaths.length} personalized paths for you with step-by-step milestones.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 transition-colors"
          >
            <FaPrint /> Print / Export
          </button>
          <button
            onClick={analyzeCareer}
            className="btn-primary text-sm flex items-center gap-2 shadow-md"
          >
            <FaRedo /> Re-Analyze
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {careerPaths.map((path, index) => (
          <div
            key={index}
            className="card p-6 md:p-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-xl"
            data-testid={`career-path-${index}`}
          >
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-5">
              <div className="flex items-start gap-4 flex-1">
                <div className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl flex items-center justify-center text-white font-bold text-xl md:text-2xl shadow-lg flex-shrink-0">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white mb-2 tracking-tight">
                    {path.career_path}
                  </h3>
                  <p className="text-gray-800 dark:text-gray-200 leading-relaxed text-sm md:text-base font-normal">
                    <FaLightbulb className="inline mr-2 text-amber-500 flex-shrink-0" />
                    {path.suitability_reason}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 self-end md:self-start">
                <button
                  onClick={() => handleCopy(path, index)}
                  className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 transition-colors border border-gray-300 dark:border-gray-600"
                  title="Copy full roadmap"
                >
                  {copiedIndex === index ? (
                    <>
                      <FaCheck className="text-green-500" /> Copied
                    </>
                  ) : (
                    <>
                      <FaCopy /> Copy Plan
                    </>
                  )}
                </button>
                {onNavigateToSearch && (
                  <button
                    onClick={() => onNavigateToSearch(path.career_path)}
                    className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-purple-50 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/60 transition-colors border border-purple-200 dark:border-purple-700"
                  >
                    <FaSearch /> Deep Dive
                  </button>
                )}
              </div>
            </div>

            {/* Required Skills */}
            <div className="mb-6 pt-2">
              <h4 className="text-xs font-bold text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wider">
                Key Skills & Technologies to Master:
              </h4>
              <div className="flex flex-wrap gap-2">
                {path.required_skills.map((skill, skillIndex) => (
                  <span
                    key={skillIndex}
                    className="px-3.5 py-1.5 bg-purple-50 dark:bg-purple-950/70 text-purple-800 dark:text-purple-200 border border-purple-200 dark:border-purple-800/80 rounded-lg text-xs md:text-sm font-semibold shadow-xs"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Roadmap Toggle */}
            <button
              onClick={() => setExpandedPath(expandedPath === index ? null : index)}
              className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 text-sm md:text-base shadow-md"
              data-testid={`toggle-roadmap-${index}`}
            >
              <FaRocket />
              {expandedPath === index ? 'Hide Detailed Roadmap' : 'Explore Actionable Roadmap'}
            </button>

            {/* Roadmap */}
            {expandedPath === index && (
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 space-y-4 animate-fadeIn" data-testid={`roadmap-${index}`}>
                <h4 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <FaRocket className="text-purple-600" />
                  Your Step-by-Step Success Roadmap
                </h4>
                <div className="space-y-4">
                  {path.roadmap.map((step, stepIndex) => (
                    <div
                      key={stepIndex}
                      className="flex items-start gap-4 p-4 md:p-5 bg-gray-50 dark:bg-gray-900/90 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
                    >
                      <div className="flex-shrink-0">
                        <div className="w-9 h-9 md:w-10 md:h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm md:text-base shadow-md">
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
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CareerAnalysis;
