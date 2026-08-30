import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { profileAPI } from '../services/api';
import { fileToBase64, validateFileSize, formatFileSize } from '../utils/fileHelpers';
import Spinner from './Spinner';
import { UserCircleIcon } from './icons';
import { FaUpload, FaFilePdf, FaKey, FaTrash, FaCheck, FaInfoCircle } from 'react-icons/fa';

interface ProfileFormProps {
  onProfileComplete: () => void;
  initialProfile?: UserProfile | null;
}

const ProfileForm: React.FC<ProfileFormProps> = ({ onProfileComplete, initialProfile }) => {
  const [profile, setProfile] = useState({
    name: '',
    degree: '',
    qualifications: '',
    skills: '',
    gemini_api_key: '',
    profile_picture_base64: null as string | null,
    cv_pdf_base64: null as string | null,
    cv_text: null as string | null,
  });
  
  const [cvFileName, setCvFileName] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showCvPreview, setShowCvPreview] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setFetching(true);
    try {
      const response = await profileAPI.getProfile();
      const data = response.data;
      setProfile({
        name: data.name || '',
        degree: data.degree || '',
        qualifications: data.qualifications || '',
        skills: data.skills || '',
        gemini_api_key: data.gemini_api_key || '',
        profile_picture_base64: data.profile_picture_base64,
        cv_pdf_base64: data.cv_pdf_base64,
        cv_text: data.cv_text || null,
      });
      if (data.cv_pdf_base64) {
        setCvFileName('Resume / CV uploaded');
      }
    } catch (err: any) {
      console.error('Error loading profile:', err);
    } finally {
      setFetching(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      if (!validateFileSize(file, 5)) {
        setError('Profile picture must be less than 5MB');
        return;
      }
      
      try {
        const base64 = await fileToBase64(file);
        setProfile(prev => ({ ...prev, profile_picture_base64: base64 }));
        setError(null);
      } catch (err) {
        setError('Error uploading profile picture');
      }
    }
  };

  const removePhoto = () => {
    setProfile(prev => ({ ...prev, profile_picture_base64: null }));
  };

  const handlePDFChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      if (!file.type.includes('pdf') && !file.name.toLowerCase().endsWith('.pdf')) {
        setError('Please upload a valid PDF document.');
        return;
      }
      
      if (!validateFileSize(file, 5)) {
        setError(`CV file must be under 5MB. Your file is ${formatFileSize(file.size)}`);
        return;
      }
      
      try {
        const base64 = await fileToBase64(file);
        setProfile(prev => ({ ...prev, cv_pdf_base64: base64 }));
        setCvFileName(file.name);
        setError(null);
      } catch (err) {
        setError('Error reading CV file.');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await profileAPI.updateProfile(profile);
      setSuccess('Profile updated and saved to MongoDB successfully!');
      setTimeout(() => {
        onProfileComplete();
      }, 1200);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'An error occurred while updating profile.');
    } finally {
      setLoading(false);
    }
  };

  const isFormIncomplete =
    !profile.name?.trim() ||
    !profile.degree?.trim() ||
    !profile.qualifications?.trim() || 
    !profile.skills?.trim() ||
    !profile.gemini_api_key?.trim() ||
    !profile.cv_pdf_base64;

  if (fetching) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner message="Loading your profile details..." size="lg" />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner message="Saving your profile and parsing CV with PyPDF2..." size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn" data-testid="profile-form">
      <div>
        <h2 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
          {profile.name ? 'Your Professional Profile' : 'Setup Your Orbit AI Profile'}
        </h2>
        <p className="text-gray-700 dark:text-gray-300 text-sm md:text-base">
          Fill out your details, upload your CV, and connect your Gemini API key to unlock personalized career paths.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="card p-6 md:p-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-xl space-y-8">
        {/* Profile Picture */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 pb-6 border-b border-gray-200 dark:border-gray-700">
          {profile.profile_picture_base64 ? (
            <img 
              src={profile.profile_picture_base64} 
              alt="Profile" 
              className="w-24 h-24 rounded-2xl object-cover ring-4 ring-purple-500 ring-offset-2 dark:ring-offset-gray-800 shadow-md" 
            />
          ) : (
            <div className="w-24 h-24 rounded-2xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center border border-gray-200 dark:border-gray-600">
              <UserCircleIcon className="w-16 h-16 text-gray-400 dark:text-gray-400" />
            </div>
          )}
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <label 
                htmlFor="dp-upload" 
                className="inline-flex items-center gap-2 cursor-pointer bg-gradient-to-r from-purple-600 to-blue-600 text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:shadow-lg transition-all duration-200 shadow-md"
              >
                <FaUpload />
                {profile.profile_picture_base64 ? 'Change Photo' : 'Upload Photo'}
              </label>
              <input 
                id="dp-upload" 
                type="file" 
                accept="image/*" 
                onChange={handleImageChange} 
                className="hidden" 
              />
              {profile.profile_picture_base64 && (
                <button
                  type="button"
                  onClick={removePhoto}
                  className="px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors flex items-center gap-1 border border-red-200 dark:border-red-800"
                >
                  <FaTrash /> Remove
                </button>
              )}
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">JPG, PNG, GIF up to 5MB (Optional)</p>
          </div>
        </div>

        {/* Name and Degree */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="name" className="block text-sm font-bold text-gray-900 dark:text-gray-100 mb-2">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              id="name"
              value={profile.name}
              onChange={handleChange}
              required
              className="input-field"
              placeholder="e.g. Alex Morgan"
              data-testid="name-input"
            />
          </div>
          <div>
            <label htmlFor="degree" className="block text-sm font-bold text-gray-900 dark:text-gray-100 mb-2">
              Current Degree / Field of Study <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="degree"
              id="degree"
              value={profile.degree}
              onChange={handleChange}
              required
              className="input-field"
              placeholder="e.g. B.Sc. Computer Science"
              data-testid="degree-input"
            />
          </div>
        </div>

        {/* Qualifications */}
        <div>
          <label htmlFor="qualifications" className="block text-sm font-bold text-gray-900 dark:text-gray-100 mb-2">
            Qualifications & Certifications <span className="text-red-500">*</span>
          </label>
          <textarea
            name="qualifications"
            id="qualifications"
            rows={3}
            value={profile.qualifications}
            onChange={handleChange}
            required
            className="input-field"
            placeholder="e.g. AWS Certified Practitioner, Dean's List, Completed Harvard CS50, Hackathon Winner..."
            data-testid="qualifications-input"
          />
        </div>

        {/* Skills */}
        <div>
          <label htmlFor="skills" className="block text-sm font-bold text-gray-900 dark:text-gray-100 mb-2">
            Technical & Soft Skills <span className="text-red-500">*</span>
          </label>
          <textarea
            name="skills"
            id="skills"
            rows={3}
            value={profile.skills}
            onChange={handleChange}
            required
            className="input-field"
            placeholder="e.g. Python, TypeScript, React, Docker, SQL, Machine Learning, Agile Leadership..."
            data-testid="skills-input"
          />
        </div>

        {/* Gemini API Key */}
        <div className="p-5 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/60 space-y-2">
          <label htmlFor="gemini_api_key" className="block text-sm font-bold text-gray-900 dark:text-gray-100">
            <FaKey className="inline mr-2 text-purple-600" />
            Gemini API Key <span className="text-red-500">*</span>
          </label>
          <input
            type="password"
            name="gemini_api_key"
            id="gemini_api_key"
            value={profile.gemini_api_key}
            onChange={handleChange}
            required
            className="input-field font-mono text-sm"
            placeholder="AIzaSy..."
            data-testid="api-key-input"
          />
          <div className="flex items-center gap-2 text-xs text-gray-700 dark:text-gray-300 pt-1">
            <FaInfoCircle className="text-purple-600 flex-shrink-0" />
            <span>
              Get your free key from{' '}
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="text-purple-700 dark:text-purple-300 font-bold underline hover:text-purple-900"
              >
                Google AI Studio
              </a>
              . Your key is stored securely in MongoDB and used exclusively for your analyses.
            </span>
          </div>
        </div>

        {/* CV Upload */}
        <div className="space-y-3">
          <label className="block text-sm font-bold text-gray-900 dark:text-gray-100">
            <FaFilePdf className="inline mr-2 text-red-500 text-base" />
            Upload CV / Resume (PDF) <span className="text-red-500">*</span>
          </label>
          <div className="flex flex-wrap items-center gap-4">
            <label
              htmlFor="cv-upload"
              className="inline-flex items-center gap-2 cursor-pointer bg-gradient-to-r from-pink-500 to-rose-500 text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:shadow-lg transition-all duration-200 shadow-md"
            >
              <FaUpload />
              {cvFileName ? 'Replace CV' : 'Choose PDF File'}
            </label>
            <input
              id="cv-upload"
              type="file"
              accept="application/pdf"
              onChange={handlePDFChange}
              className="hidden"
            />
            {cvFileName && (
              <span className="text-sm text-green-700 dark:text-green-300 font-bold flex items-center gap-2 bg-green-50 dark:bg-green-950/50 px-3.5 py-2 rounded-lg border border-green-200 dark:border-green-800">
                <FaFilePdf className="text-red-500" /> {cvFileName}
              </span>
            )}
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">PDF up to 5MB. Text is automatically parsed by PyPDF2.</p>

          {profile.cv_text && (
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setShowCvPreview(!showCvPreview)}
                className="text-xs font-bold text-purple-700 dark:text-purple-300 hover:underline flex items-center gap-1"
              >
                {showCvPreview ? '▲ Hide parsed CV text preview' : '▼ View parsed CV text preview'}
              </button>
              {showCvPreview && (
                <div className="mt-2 p-4 bg-gray-50 dark:bg-gray-900 rounded-xl text-xs font-mono text-gray-800 dark:text-gray-200 max-h-48 overflow-y-auto border border-gray-200 dark:border-gray-700 whitespace-pre-wrap shadow-inner">
                  {profile.cv_text}
                </div>
              )}
            </div>
          )}
        </div>

        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 rounded-xl animate-fadeIn" data-testid="error-message">
            <p className="text-red-700 dark:text-red-300 text-sm font-semibold">{error}</p>
          </div>
        )}

        {success && (
          <div className="p-4 bg-green-50 dark:bg-green-900/30 border-l-4 border-green-500 rounded-xl animate-fadeIn flex items-center gap-2" data-testid="success-message">
            <FaCheck className="text-green-500" />
            <p className="text-green-700 dark:text-green-300 text-sm font-semibold">{success}</p>
          </div>
        )}

        {/* Submit Button */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-600 dark:text-gray-400 font-semibold">
            {isFormIncomplete ? '⚠️ Please complete all required fields (*)' : '✅ All required fields complete'}
          </p>
          <button
            type="submit"
            disabled={isFormIncomplete || loading}
            className="w-full sm:w-auto btn-primary px-8 py-3 font-semibold disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            data-testid="submit-profile-button"
          >
            {profile.name ? 'Save & Update Profile' : 'Save Profile & Continue'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProfileForm;
