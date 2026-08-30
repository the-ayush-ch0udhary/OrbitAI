import React, { useState, useEffect } from 'react';
import { CareerPath } from '../types';
import { careerAPI } from '../services/api';
import Spinner from './Spinner';
import { FaHistory, FaCalendarAlt, FaRocket, FaCheckCircle, FaLightbulb, FaCopy, FaCheck } from 'react-icons/fa';

interface AnalysisHistoryItem {
  id: string;
  created_at: string;
  result: CareerPath[];
}

const PastAnalyses: React.FC<{ onNewAnalysisClick: () => void }> = ({ onNewAnalysisClick }) => {
  const [history, setHistory] = useState<AnalysisHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);
  const [copiedPath, setCopiedPath] = useState<string | null>(null);

  const fetchHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await careerAPI.getAnalyses();
      const analyses = response.data?.analyses || [];
      setHistory(analyses);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load past career analyses.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleCopyRoadmap = (path: CareerPath) => {
    const text = `🎯 Career Path: ${path.career_path}\n\n💡 Why Suitable:\n${path.suitability_reason}\n\n🛠️ Required Skills:\n- ${path.required_skills.join('\n- ')}\n\n🚀 Step-by-Step Roadmap:\n${path.roadmap.map(s => `Step ${s.step}: ${s.action}\n${s.details}`).join('\n\n')}`;
    navigator.clipboard.writeText(text);
    setCopiedPath(path.career_path);
    setTimeout(() => setCopiedPath(null), 2500);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Spinner message="Loading your analysis history..." size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto card p-8 text-center bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
        <div className="text-red-500 text-5xl mb-4">⚠️</div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">History Unavailable</h3>
        <p className="text-gray-700 dark:text-gray-300 mb-6">{error}</p>
        <button onClick={fetchHistory} className="btn-primary">
          Retry
        </button>
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="max-w-3xl mx-auto card p-10 text-center bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
        <div className="text-gray-400 text-6xl mb-4">📁</div>
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">No Saved Analyses Yet</h3>
        <p className="text-gray-700 dark:text-gray-300 mb-8 max-w-md mx-auto">
          Once you run a career analysis on your profile, your personalized roadmaps and recommendations will be automatically saved here.
        </p>
        <button onClick={onNewAnalysisClick} className="btn-primary">
          Run Your First Career Analysis
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fadeIn">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
            Analysis History
          </h2>
          <p className="text-gray-700 dark:text-gray-300 text-sm md:text-base">
            Review your previously generated career recommendations and roadmaps.
          </p>
        </div>
        <button onClick={onNewAnalysisClick} className="btn-primary self-start md:self-auto text-sm">
          + New AI Analysis
        </button>
      </div>

      <div className="space-y-6">
        {history.map((item, index) => {
          const formattedDate = new Date(item.created_at).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          });

          const isExpanded = expandedIndex === index;
          const careerPaths = Array.isArray(item.result) ? item.result : [];

          return (
            <div key={item.id || index} className="card p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-xl">
              <div
                className="flex items-center justify-between cursor-pointer select-none"
                onClick={() => setExpandedIndex(isExpanded ? null : index)}
              >
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 rounded-xl">
                    <FaHistory className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                      Career Analysis #{history.length - index}
                    </h3>
                    <div className="flex items-center gap-2 text-xs md:text-sm text-gray-600 dark:text-gray-300 mt-1">
                      <FaCalendarAlt className="text-xs" />
                      <span>{formattedDate}</span>
                      <span>•</span>
                      <span>{careerPaths.length} Career Paths</span>
                    </div>
                  </div>
                </div>
                <button className="text-sm font-semibold text-purple-600 dark:text-purple-400 hover:underline">
                  {isExpanded ? 'Collapse ▲' : 'View Roadmaps ▼'}
                </button>
              </div>

              {isExpanded && (
                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 space-y-6">
                  {careerPaths.map((path, pathIdx) => (
                    <div
                      key={pathIdx}
                      className="p-6 rounded-2xl bg-gray-50 dark:bg-gray-900/90 border border-gray-200 dark:border-gray-700 space-y-4 shadow-sm"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <span className="w-8 h-8 rounded-lg bg-purple-600 text-white flex items-center justify-center font-bold text-sm shadow-md">
                            {pathIdx + 1}
                          </span>
                          <h4 className="text-xl font-bold text-gray-900 dark:text-white">
                            {path.career_path}
                          </h4>
                        </div>
                        <button
                          onClick={() => handleCopyRoadmap(path)}
                          className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors self-start shadow-xs"
                        >
                          {copiedPath === path.career_path ? (
                            <>
                              <FaCheck className="text-green-500" /> Copied!
                            </>
                          ) : (
                            <>
                              <FaCopy /> Copy Plan
                            </>
                          )}
                        </button>
                      </div>

                      <p className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed font-normal">
                        <FaLightbulb className="inline mr-2 text-amber-500" />
                        {path.suitability_reason}
                      </p>

                      <div>
                        <span className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider block mb-2">
                          Required Skills:
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {path.required_skills?.map((skill, sIdx) => (
                            <span
                              key={sIdx}
                              className="px-3 py-1 bg-purple-50 dark:bg-purple-950/70 text-purple-800 dark:text-purple-200 text-xs font-semibold rounded-full border border-purple-200 dark:border-purple-800 shadow-xs"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>

                      {path.roadmap && path.roadmap.length > 0 && (
                        <div className="mt-3 space-y-3 pt-2">
                          <span className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider block">
                            Action Steps:
                          </span>
                          {path.roadmap.map((step, stepIdx) => (
                            <div
                              key={stepIdx}
                              className="flex items-start gap-3 p-3.5 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 text-xs sm:text-sm shadow-xs"
                            >
                              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 text-white flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5 shadow-sm">
                                {step.step}
                              </div>
                              <div className="flex-1">
                                <span className="font-bold text-gray-900 dark:text-white block">
                                  {step.action}
                                </span>
                                <span className="text-gray-700 dark:text-gray-200 mt-1 block font-normal leading-relaxed">
                                  {step.details}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PastAnalyses;
