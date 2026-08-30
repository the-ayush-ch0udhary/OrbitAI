import React, { useState, useEffect, useRef, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { authAPI } from '../services/api';
import Spinner from './Spinner';
import { useNavigate, Link } from 'react-router-dom';
import { FaEye, FaEyeSlash, FaArrowLeft, FaSyncAlt, FaUser, FaEnvelope, FaLock, FaShieldAlt, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

const Login: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [captchaInput, setCaptchaInput] = useState('');
  const [captchaCode, setCaptchaCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const authContext = useContext(AuthContext);
  const navigate = useNavigate();

  // Generate random CAPTCHA string
  const generateCaptcha = () => {
    const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
    let code = '';
    for (let i = 0; i < 5; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptchaCode(code);
    setCaptchaInput('');
  };

  // Draw CAPTCHA on canvas
  const drawCaptcha = (code: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Background gradient
    const bgGradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    bgGradient.addColorStop(0, '#f3e8ff');
    bgGradient.addColorStop(1, '#dbeafe');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Add noise lines
    for (let i = 0; i < 6; i++) {
      ctx.strokeStyle = ['#c084fc', '#93c5fd', '#f472b6', '#a78bfa'][i % 4];
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height);
      ctx.bezierCurveTo(
        Math.random() * canvas.width, Math.random() * canvas.height,
        Math.random() * canvas.width, Math.random() * canvas.height,
        Math.random() * canvas.width, Math.random() * canvas.height
      );
      ctx.stroke();
    }

    // Add noise dots
    for (let i = 0; i < 45; i++) {
      ctx.fillStyle = ['#a855f7', '#3b82f6', '#ec4899'][i % 3];
      ctx.beginPath();
      ctx.arc(Math.random() * canvas.width, Math.random() * canvas.height, Math.random() * 2, 0, Math.PI * 2);
      ctx.fill();
    }

    // Draw characters with rotation & distortion
    const colors = ['#6b21a8', '#1e40af', '#9d174d', '#4338ca', '#0f766e'];
    ctx.font = 'bold 26px "Courier New", Courier, monospace';
    ctx.textBaseline = 'middle';

    const startX = 20;
    const charSpacing = (canvas.width - 40) / code.length;

    for (let i = 0; i < code.length; i++) {
      ctx.save();
      const x = startX + i * charSpacing;
      const y = canvas.height / 2 + (Math.random() * 8 - 4);
      const angle = (Math.random() * 30 - 15) * (Math.PI / 180);

      ctx.translate(x, y);
      ctx.rotate(angle);
      ctx.fillStyle = colors[i % colors.length];
      ctx.fillText(code[i], 0, 0);
      ctx.restore();
    }
  };

  useEffect(() => {
    if (!isLogin) {
      generateCaptcha();
    }
  }, [isLogin]);

  useEffect(() => {
    if (captchaCode && !isLogin) {
      drawCaptcha(captchaCode);
    }
  }, [captchaCode, isLogin]);

  // Password strength calculation
  const getPasswordStrength = () => {
    if (!password) return { score: 0, text: '', color: '' };
    let score = 0;
    if (password.length >= 6) score += 1;
    if (password.length >= 10) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;

    if (score <= 2) return { score: 1, text: 'Weak', color: 'bg-red-500' };
    if (score <= 4) return { score: 2, text: 'Medium', color: 'bg-yellow-500' };
    return { score: 3, text: 'Strong', color: 'bg-green-500' };
  };

  const strength = getPasswordStrength();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation for registration
    if (!isLogin) {
      if (!name.trim()) {
        setError('Please enter your full name.');
        return;
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters.');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        return;
      }
      if (captchaInput.trim().toUpperCase() !== captchaCode.toUpperCase()) {
        setError('Incorrect CAPTCHA verification code. Please try again.');
        generateCaptcha();
        return;
      }
    }

    setLoading(true);

    try {
      const response = isLogin
        ? await authAPI.login(email.trim(), password)
        : await authAPI.register(email.trim(), password, name.trim());

      const { access_token, email: userEmail, name: userName } = response.data;
      authContext?.login(userEmail, access_token, userName || (isLogin ? null : name.trim()));
      navigate('/dashboard', { replace: true });
    } catch (err: any) {
      let errorMsg =
        err.response?.data?.detail ||
        err.message ||
        'An error occurred during authentication. Please check your credentials.';

      if (err.message === 'Network Error' || err.code === 'ERR_NETWORK') {
        errorMsg = 'Cannot connect to backend server. If hosted on Render Free Tier, please allow ~30-40 seconds for the server to wake up and try again.';
      }

      setError(errorMsg);
      if (!isLogin) {
        generateCaptcha();
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20">
        <Spinner message={isLogin ? 'Logging into Orbit AI...' : 'Creating your Orbit AI account...'} size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20 px-4 md:px-6 py-8 md:py-12">
      <div className="w-full max-w-lg">
        <div className="mb-4">
          <Link
            to="/"
            className="inline-flex items-center text-sm font-medium text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 transition-colors"
          >
            <FaArrowLeft className="mr-2" /> Back to Home
          </Link>
        </div>

        <div className="text-center mb-6">
          <h1 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent mb-2">
            Orbit AI
          </h1>
          <p className="text-sm md:text-base text-gray-600 dark:text-gray-400">
            {isLogin ? 'Welcome back! Sign in to access your roadmaps' : 'Create an account to jumpstart your career roadmap'}
          </p>
        </div>

        <div className="card p-6 md:p-8 shadow-2xl border border-purple-100/60 dark:border-gray-700">
          {/* Tabs */}
          <div className="flex mb-6 bg-gray-100 dark:bg-gray-700 rounded-xl p-1">
            <button
              type="button"
              onClick={() => {
                setIsLogin(true);
                setError(null);
              }}
              className={`flex-1 py-2.5 px-4 rounded-lg font-semibold text-sm transition-all duration-200 ${
                isLogin
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-md'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
              data-testid="login-tab"
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setIsLogin(false);
                setError(null);
              }}
              className={`flex-1 py-2.5 px-4 rounded-lg font-semibold text-sm transition-all duration-200 ${
                !isLogin
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-md'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
              data-testid="signup-tab"
            >
              Create Account
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name Field (Sign Up only) */}
            {!isLogin && (
              <div className="animate-fadeIn">
                <label htmlFor="name" className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wide">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required={!isLogin}
                    className="input-field pl-10"
                    placeholder="e.g. Alex Morgan"
                    data-testid="name-input"
                  />
                  <FaUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                </div>
              </div>
            )}

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wide">
                Email Address <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="input-field pl-10"
                  placeholder="you@example.com"
                  data-testid="email-input"
                  autoComplete="email"
                />
                <FaEnvelope className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wide">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="input-field pl-10 pr-10"
                  placeholder="At least 6 characters"
                  data-testid="password-input"
                  autoComplete={isLogin ? 'current-password' : 'new-password'}
                />
                <FaLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 focus:outline-none"
                  tabIndex={-1}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>

              {/* Password Strength Indicator (Sign Up only) */}
              {!isLogin && password && (
                <div className="mt-2 space-y-1 animate-fadeIn">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">Strength:</span>
                    <span className="font-semibold text-gray-700 dark:text-gray-300">{strength.text}</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${strength.color}`}
                      style={{ width: `${(strength.score / 3) * 100}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password Field (Sign Up only) */}
            {!isLogin && (
              <div className="animate-fadeIn">
                <label htmlFor="confirmPassword" className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wide">
                  Confirm Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required={!isLogin}
                    minLength={6}
                    className="input-field pl-10 pr-10"
                    placeholder="Re-enter password"
                    data-testid="confirm-password-input"
                    autoComplete="new-password"
                  />
                  <FaLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 focus:outline-none"
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>

                {confirmPassword && (
                  <div className="flex items-center gap-1.5 mt-1.5 text-xs font-medium">
                    {password === confirmPassword ? (
                      <span className="text-green-600 dark:text-green-400 flex items-center gap-1">
                        <FaCheckCircle /> Passwords match
                      </span>
                    ) : (
                      <span className="text-red-500 flex items-center gap-1">
                        <FaTimesCircle /> Passwords do not match
                      </span>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Visual Anti-Bot CAPTCHA (Sign Up only) */}
            {!isLogin && (
              <div className="pt-2 animate-fadeIn space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide flex items-center gap-1.5">
                    <FaShieldAlt className="text-purple-600" />
                    Security Verification <span className="text-red-500">*</span>
                  </label>
                  <span className="text-xs text-gray-500">Case-insensitive</span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="relative border border-purple-200 dark:border-gray-600 rounded-xl overflow-hidden shadow-inner flex-shrink-0 bg-white">
                    <canvas
                      ref={canvasRef}
                      width={160}
                      height={48}
                      className="block cursor-pointer select-none"
                      onClick={generateCaptcha}
                      title="Click to refresh CAPTCHA"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={generateCaptcha}
                    className="p-3 text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-200 hover:bg-purple-50 dark:hover:bg-gray-700 rounded-xl transition-all"
                    title="Refresh CAPTCHA challenge"
                  >
                    <FaSyncAlt className="text-sm" />
                  </button>
                  <input
                    type="text"
                    value={captchaInput}
                    onChange={(e) => setCaptchaInput(e.target.value)}
                    required={!isLogin}
                    maxLength={6}
                    placeholder="Enter code"
                    className="input-field text-center font-mono font-bold tracking-widest text-sm uppercase flex-1"
                    data-testid="captcha-input"
                  />
                </div>
              </div>
            )}

            {/* Error Banner */}
            {error && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 rounded-xl animate-fadeIn" data-testid="error-message">
                <p className="text-red-700 dark:text-red-400 text-sm font-medium">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <div className="pt-3">
              <button
                type="submit"
                className="w-full btn-primary py-3.5 text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                disabled={loading}
                data-testid="submit-button"
              >
                {isLogin ? 'Sign In to Account' : 'Complete Registration'}
              </button>
            </div>
          </form>
        </div>

        <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-6">
          {isLogin ? "Don't have an account yet? " : "Already have an account? "}
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError(null);
            }}
            className="text-purple-600 dark:text-purple-400 font-semibold hover:underline"
          >
            {isLogin ? 'Create one now' : 'Sign In'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default Login;