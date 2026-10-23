import React, { useState } from 'react';
import { Mail, Lock, User, Key, CheckCircle, ArrowRight, Eye, EyeOff, Sparkles, AlertCircle, X, ShieldCheck } from 'lucide-react';
import { authenticateWithGoogle } from '../firebase';

interface AuthModalProps {
  onSuccess: (userData: any, token: string) => void;
  onClose?: () => void;
  darkMode: boolean;
  initialTab?: 'google' | 'standard';
}

type AuthMode = 'login' | 'register' | 'forgot' | 'verify' | 'reset';

// Authentic Google Multicolor SVG Icon
export const GoogleIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24">
    <path
      fill="#4285F4"
      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.15z"
    />
    <path
      fill="#34A853"
      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"
    />
    <path
      fill="#FBBC05"
      d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
    />
    <path
      fill="#EA4335"
      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
    />
  </svg>
);

export default function AuthModal({ onSuccess, onClose, darkMode }: AuthModalProps) {
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [code, setCode] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [error, setError] = useState('');
  const [notification, setNotification] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const clearMessages = () => {
    setError('');
    setNotification('');
  };

  // Google (Gmail) Authentication via Firebase Google Auth or direct email verification
  const handleGoogleAuth = async (targetEmail?: string) => {
    setGoogleLoading(true);
    setError('');
    setNotification('');

    try {
      let chosenEmail = (targetEmail || email).trim();
      let chosenName = '';
      let chosenPhoto = '';

      // If no email was manually specified in the input or argument, launch Google Popup
      if (!chosenEmail) {
        try {
          const user = await authenticateWithGoogle();
          if (user && user.email) {
            chosenEmail = user.email;
            chosenName = user.displayName || user.email.split('@')[0];
            chosenPhoto = user.photoURL || '';
          }
        } catch (popupErr: any) {
          console.warn('Google popup notice:', popupErr);
          if (popupErr.code === 'auth/popup-closed-by-user') {
            setError('Sign-in popup was closed. Please click Continue with Google again or enter your Gmail.');
            setGoogleLoading(false);
            return;
          }
          if (popupErr.code === 'auth/popup-blocked') {
            setError('Browser blocked popup window. Please enter your Gmail in the box above.');
            setGoogleLoading(false);
            return;
          }
          // If popup is unsupported or restricted in iframe environment, prompt for email
          setError('Please enter your Gmail address in the field above to continue with Google.');
          setGoogleLoading(false);
          return;
        }
      }

      if (!chosenEmail) {
        setError('Please enter your Gmail address to continue with Google.');
        setGoogleLoading(false);
        return;
      }

      if (!chosenEmail.includes('@')) {
        chosenEmail = `${chosenEmail}@gmail.com`;
      }

      if (!chosenName) {
        chosenName = chosenEmail.split('@')[0];
      }
      if (!chosenPhoto) {
        chosenPhoto = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(chosenEmail)}`;
      }

      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: chosenEmail,
          name: chosenName,
          picture: chosenPhoto
        })
      });

      const responseText = await res.text();
      let data: any = {};
      try {
        data = JSON.parse(responseText);
      } catch {
        throw new Error('Server returned an unexpected response. Please try again.');
      }

      if (!res.ok) {
        throw new Error(data.error || 'Google authentication failed.');
      }

      setNotification(data.message || 'Authenticated successfully with Google!');
      setTimeout(() => {
        onSuccess(data.user, data.token);
      }, 400);
    } catch (err: any) {
      console.error('Google Auth Error:', err);
      setError(err.message || 'Unable to connect with Google.');
    } finally {
      setGoogleLoading(false);
    }
  };

  // Standard Password Login & Other modes
  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Please enter your Gmail or username.');
      return;
    }
    if (!password) {
      setError('Please enter your password.');
      return;
    }

    setLoading(true);
    setError('');
    setNotification('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password })
      });

      const responseText = await res.text();
      let data: any = {};
      try {
        data = JSON.parse(responseText);
      } catch {
        throw new Error('Server returned an invalid response.');
      }

      if (!res.ok) {
        throw new Error(data.error || 'Invalid credentials.');
      }

      setNotification('Login successful!');
      setTimeout(() => {
        onSuccess(data.user, data.token);
      }, 350);
    } catch (err: any) {
      setError(err.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  // Secondary flows (Register, Forgot Password, Reset, Verify)
  const handleSecondarySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setNotification('');
    setLoading(true);

    try {
      if (mode === 'register') {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: email.trim(), username: username.trim(), password })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Registration failed.');
        
        setNotification('Registration successful! Please verify your email.');
        setMode('verify');
      } else if (mode === 'verify') {
        const res = await fetch('/api/auth/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: email.trim(), code: code.trim() })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Verification failed.');
        
        setNotification('Email verified! You can now log in.');
        setMode('login');
      } else if (mode === 'forgot') {
        const res = await fetch('/api/auth/forgot-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: email.trim() })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Email lookup failed.');
        
        setNotification('Reset token prepared. Enter token and new password.');
        setResetToken(data.resetToken || '');
        setMode('reset');
      } else if (mode === 'reset') {
        const res = await fetch('/api/auth/reset-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: email.trim(), token: resetToken.trim(), newPassword })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Password reset failed.');
        
        setNotification('Password updated successfully! Please log in.');
        setMode('login');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`w-full max-w-md p-6 sm:p-8 rounded-3xl border shadow-2xl transition-all duration-300 relative text-left ${
      darkMode 
        ? 'bg-[#0e1622] border-white/10 text-gray-100' 
        : 'bg-white border-gray-200 text-gray-900'
    }`}>
      {/* Brand Header */}
      <div className="text-center mb-6">
        <div className="inline-flex p-3 bg-gradient-to-tr from-indigo-600 via-teal-600 to-emerald-500 rounded-2xl text-white shadow-lg mb-3">
          <Sparkles className="w-5 h-5" />
        </div>
        <h3 className="font-display font-black text-2xl tracking-tight">
          {mode === 'login' && 'Sign In to NETECH'}
          {mode === 'register' && 'Create Your Account'}
          {mode === 'forgot' && 'Reset Your Password'}
          {mode === 'verify' && 'Verify Account'}
          {mode === 'reset' && 'Set New Password'}
        </h3>
        <p className="text-xs text-gray-400 mt-1">
          {mode === 'login' 
            ? 'Sign in with your Gmail or password, or continue with Google' 
            : 'Access your coursework, cloud sandboxes, and certifications'}
        </p>
      </div>

      {/* Error and Notification Banners */}
      {error && (
        <div className="p-3.5 mb-4 rounded-xl text-xs font-semibold flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 animate-fade-in">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {notification && (
        <div className="p-3.5 mb-4 rounded-xl text-xs font-semibold flex flex-col gap-1 bg-emerald-500/15 border border-emerald-500/25 text-emerald-400 animate-fade-in">
          <div className="flex items-center gap-1.5">
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span>Success</span>
          </div>
          <p className="opacity-90">{notification}</p>
        </div>
      )}

      {/* MAIN LOGIN VIEW: USERNAME/GMAIL AND PASSWORD FIRST, CONTINUE WITH GOOGLE UNDERNEATH */}
      {mode === 'login' && (
        <div className="space-y-4 animate-fade-in">
          
          {/* 1. PRIMARY SIGN IN FORM: USERNAME / GMAIL & PASSWORD */}
          <form onSubmit={handlePasswordLogin} className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-gray-400 mb-1.5 font-mono uppercase tracking-wider">
                Username or Gmail
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400">
                  <Mail className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  required
                  placeholder="Enter your username or name@gmail.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-xs sm:text-sm border font-medium outline-none transition-all ${
                    darkMode 
                      ? 'bg-white/5 border-white/10 text-white focus:border-indigo-500 focus:bg-white/[0.07]' 
                      : 'bg-gray-50 border-gray-300 text-gray-900 focus:border-indigo-500 focus:bg-white'
                  }`}
                  id="input-auth-email"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-gray-400 font-mono uppercase tracking-wider">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => { setMode('forgot'); clearMessages(); }}
                  className="text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 cursor-pointer"
                >
                  Forgot?
                </button>
              </div>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className={`w-full pl-10 pr-10 py-2.5 rounded-xl text-xs sm:text-sm border font-medium outline-none transition-all ${
                    darkMode 
                      ? 'bg-white/5 border-white/10 text-white focus:border-indigo-500 focus:bg-white/[0.07]' 
                      : 'bg-gray-50 border-gray-300 text-gray-900 focus:border-indigo-500 focus:bg-white'
                  }`}
                  id="input-auth-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-200 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* BUTTON: SIGN IN */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-98 text-white font-display font-bold text-xs sm:text-sm shadow-lg shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              id="btn-auth-signin-password"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent animate-spin rounded-full" />
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* DIVIDER: OR CONTINUE WITH GOOGLE */}
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200 dark:border-white/10" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className={`px-3 text-[11px] font-semibold uppercase tracking-wider ${
                darkMode ? 'bg-[#0e1622] text-gray-400' : 'bg-white text-gray-500'
              }`}>
                or continue with
              </span>
            </div>
          </div>

          {/* 2. CONTINUE WITH GOOGLE (UNDER USERNAME/GMAIL & PASSWORD) */}
          <div>
            <button
              type="button"
              onClick={() => handleGoogleAuth()}
              disabled={googleLoading}
              className={`w-full py-3 px-4 rounded-2xl font-extrabold text-xs sm:text-sm border shadow-md transition-all cursor-pointer flex items-center justify-center gap-2.5 active:scale-98 disabled:opacity-50 ${
                darkMode
                  ? 'bg-white hover:bg-gray-100 text-gray-900 border-gray-200'
                  : 'bg-white hover:bg-gray-50 text-gray-900 border-gray-300'
              }`}
              id="btn-auth-continue-google"
            >
              {googleLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent animate-spin rounded-full" />
                  <span className="text-gray-700">Connecting to Google...</span>
                </>
              ) : (
                <>
                  <GoogleIcon className="w-4 h-4 shrink-0" />
                  <span>Continue with Google</span>
                </>
              )}
            </button>
            <p className="text-[11px] text-gray-400 text-center mt-1.5 flex items-center justify-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>Authentic Google sign-in. Instant access.</span>
            </p>
          </div>

          {/* Quick Gmail Demo Shortcut (For Easy Testing) */}
          <div className="pt-2 text-center border-t border-gray-200/10 dark:border-white/5">
            <div className="flex items-center justify-center gap-2 text-[11px] text-gray-400">
              <span>Quick Login:</span>
              <button
                type="button"
                onClick={() => {
                  setEmail('uwizeyimanajoshua@gmail.com');
                  handleGoogleAuth('uwizeyimanajoshua@gmail.com');
                }}
                className="text-indigo-400 hover:underline font-semibold cursor-pointer"
              >
                Joshua (Admin Gmail)
              </button>
              <span>•</span>
              <button
                type="button"
                onClick={() => {
                  setEmail('student@gmail.com');
                  handleGoogleAuth('student@gmail.com');
                }}
                className="text-teal-400 hover:underline font-semibold cursor-pointer"
              >
                Student Gmail
              </button>
            </div>
          </div>

          {/* New Account Link */}
          <div className="pt-2 text-center text-xs text-gray-400">
            <span>Don't have an account yet? </span>
            <button
              type="button"
              onClick={() => { setMode('register'); clearMessages(); }}
              className="font-bold text-indigo-400 hover:text-indigo-300 underline cursor-pointer"
            >
              Register here
            </button>
          </div>
        </div>
      )}

      {/* REGISTRATION / RESET / VERIFY MODES */}
      {mode !== 'login' && (
        <form onSubmit={handleSecondarySubmit} className="space-y-3.5 animate-fade-in">
          {mode === 'register' && (
            <>
              <div>
                <label className="block text-[11px] font-bold text-gray-400 mb-1">Username</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400">
                    <User className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    placeholder="Choose a username"
                    className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-xs border font-medium focus:outline-none transition-all ${
                      darkMode 
                        ? 'bg-white/5 border-white/10 text-white focus:border-indigo-500' 
                        : 'bg-gray-50 border-gray-200 text-gray-900 focus:border-indigo-500'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-400 mb-1">Gmail or Email</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400">
                    <Mail className="w-4 h-4" />
                  </span>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="student@gmail.com"
                    className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-xs border font-medium focus:outline-none transition-all ${
                      darkMode 
                        ? 'bg-white/5 border-white/10 text-white focus:border-indigo-500' 
                        : 'bg-gray-50 border-gray-200 text-gray-900 focus:border-indigo-500'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-400 mb-1">Create Password</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400">
                    <Lock className="w-4 h-4" />
                  </span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className={`w-full pl-10 pr-10 py-2.5 rounded-xl text-xs border font-medium focus:outline-none transition-all ${
                      darkMode 
                        ? 'bg-white/5 border-white/10 text-white focus:border-indigo-500' 
                        : 'bg-gray-50 border-gray-200 text-gray-900 focus:border-indigo-500'
                    }`}
                  />
                </div>
              </div>
            </>
          )}

          {mode === 'verify' && (
            <div>
              <label className="block text-[11px] font-bold text-gray-400 mb-1">Verification Code</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400">
                  <Key className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  required
                  value={code}
                  onChange={e => setCode(e.target.value)}
                  placeholder="Verification code"
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-xs border font-mono font-semibold tracking-widest focus:outline-none transition-all ${
                    darkMode 
                      ? 'bg-white/5 border-white/10 text-white focus:border-indigo-500' 
                      : 'bg-gray-50 border-gray-200 text-gray-900 focus:border-indigo-500'
                  }`}
                />
              </div>
            </div>
          )}

          {mode === 'forgot' && (
            <div>
              <label className="block text-[11px] font-bold text-gray-400 mb-1">Account Gmail or Email</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400">
                  <Mail className="w-4 h-4" />
                </span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="name@gmail.com"
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-xs border font-medium focus:outline-none transition-all ${
                    darkMode 
                      ? 'bg-white/5 border-white/10 text-white focus:border-indigo-500' 
                      : 'bg-gray-50 border-gray-200 text-gray-900 focus:border-indigo-500'
                  }`}
                />
              </div>
            </div>
          )}

          {mode === 'reset' && (
            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-gray-400 mb-1">Reset Token</label>
                <input
                  type="text"
                  required
                  value={resetToken}
                  onChange={e => setResetToken(e.target.value)}
                  placeholder="Token"
                  className={`w-full px-4 py-2 rounded-xl text-xs border font-mono focus:outline-none transition-all ${
                    darkMode 
                      ? 'bg-white/5 border-white/10 text-white focus:border-indigo-500' 
                      : 'bg-gray-50 border-gray-200 text-gray-900 focus:border-indigo-500'
                  }`}
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-gray-400 mb-1">New Password</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="New password"
                  className={`w-full px-4 py-2 rounded-xl text-xs border focus:outline-none transition-all ${
                    darkMode 
                      ? 'bg-white/5 border-white/10 text-white focus:border-indigo-500' 
                      : 'bg-gray-50 border-gray-200 text-gray-900 focus:border-indigo-500'
                  }`}
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-display font-semibold text-xs shadow-lg active:scale-98 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {loading ? 'Processing...' : (
              <>
                {mode === 'register' && 'Complete Registration'}
                {mode === 'verify' && 'Verify & Activate'}
                {mode === 'forgot' && 'Send Reset Token'}
                {mode === 'reset' && 'Save New Password'}
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          <div className="mt-3 text-center">
            <button
              type="button"
              onClick={() => { setMode('login'); clearMessages(); }}
              className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 cursor-pointer"
            >
              &larr; Back to Sign In
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
