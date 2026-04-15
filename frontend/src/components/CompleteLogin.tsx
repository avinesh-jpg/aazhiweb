import { useState } from 'react';
import { X, Mail, Lock, Phone, User, AlertCircle, CheckCircle } from 'lucide-react';

interface CompleteLoginProps {
  isOpen: boolean;
  onClose: () => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onLogin: (user: any, orders: any[]) => void;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const CompleteLogin = ({ isOpen, onClose, onLogin }: CompleteLoginProps) => {
  const [mode, setMode] = useState<'login' | 'signup' | 'guest'>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Login state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  // Signup state
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');
  const [signupMobile, setSignupMobile] = useState('');
  
  // Guest state
  const [guestMobile, setGuestMobile] = useState('');
  const [guestOtp, setGuestOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: loginEmail, 
          password: loginPassword 
        })
      });
      
      const data = await response.json();
      console.log('Login response:', data);
      
      if (data.success) {
        localStorage.setItem('tiinyberry_token', data.token);
        localStorage.setItem('tiinyberry_user', JSON.stringify(data.user));
        onLogin(data.user, []);
        onClose();
        resetForm();
        window.location.reload();
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    if (signupPassword !== signupConfirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }
    
    if (signupPassword.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }
    
    try {
      const response = await fetch(`${API_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: signupName,
          email: signupEmail,
          password: signupPassword,
          mobileNumber: signupMobile
        })
      });
      
      const data = await response.json();
      console.log('Signup response:', data);
      
      if (data.success) {
        localStorage.setItem('tiinyberry_token', data.token);
        localStorage.setItem('tiinyberry_user', JSON.stringify(data.user));
        onLogin(data.user, []);
        onClose();
        resetForm();
        window.location.reload();
      } else {
        setError(data.message || 'Signup failed');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendGuestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    if (!guestMobile || guestMobile.length < 10) {
      setError('Please enter a valid 10-digit mobile number');
      setLoading(false);
      return;
    }
    
    try {
      const response = await fetch(`${API_URL}/auth/guest-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobileNumber: guestMobile })
      });
      
      const data = await response.json();
      console.log('Guest OTP response:', data);
      
      if (data.success) {
        setOtpSent(true);
        setSuccess('OTP sent! Check console for OTP (dev mode)');
      } else {
        setError(data.message || 'Failed to send OTP');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyGuestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch(`${API_URL}/auth/verify-guest-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobileNumber: guestMobile, otp: guestOtp })
      });
      
      const data = await response.json();
      console.log('Verify guest response:', data);
      
      if (data.success) {
        localStorage.setItem('tiinyberry_token', data.token);
        localStorage.setItem('tiinyberry_user', JSON.stringify(data.user));
        localStorage.setItem('tiinyberry_mobile', guestMobile);
        onLogin(data.user, data.orders || []);
        onClose();
        resetForm();
        window.location.reload();
      } else {
        setError(data.message || 'Invalid OTP');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setLoginEmail('');
    setLoginPassword('');
    setSignupName('');
    setSignupEmail('');
    setSignupPassword('');
    setSignupConfirmPassword('');
    setSignupMobile('');
    setGuestMobile('');
    setGuestOtp('');
    setOtpSent(false);
    setError('');
    setSuccess('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 hover:bg-accent rounded-full transition-colors"
        >
          <X size={20} />
        </button>
        
        <div className="text-center mb-6">
          <h2 className="text-2xl font-heading font-light">
            {mode === 'login' ? 'Welcome Back' : mode === 'signup' ? 'Create Account' : 'Guest Login'}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {mode === 'login' ? 'Sign in to your account' : 
             mode === 'signup' ? 'Join the Tiiny Berry family' : 
             'Login with mobile number'}
          </p>
        </div>
        
        {/* Mode Selection Buttons */}
        <div className="flex gap-2 mb-6">
          <button
            type="button"
            onClick={() => { setMode('login'); resetForm(); }}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${mode === 'login' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => { setMode('signup'); resetForm(); }}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${mode === 'signup' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            Sign Up
          </button>
          <button
            type="button"
            onClick={() => { setMode('guest'); resetForm(); }}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${mode === 'guest' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            Guest
          </button>
        </div>
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-600 text-sm">
            <AlertCircle size={16} />
            {error}
          </div>
        )}
        
        {success && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-green-600 text-sm">
            <CheckCircle size={16} />
            {success}
          </div>
        )}
        
        {/* LOGIN FORM */}
        {mode === 'login' && (
          <form onSubmit={handleLogin}>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Email</label>
              <div className="relative">
                <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="your@email.com"
                  required
                />
              </div>
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Password</label>
              <div className="relative">
                <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 disabled:opacity-50"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
        )}
        
        {/* SIGNUP FORM */}
        {mode === 'signup' && (
          <form onSubmit={handleSignup}>
            <div className="mb-3">
              <label className="block text-sm font-medium mb-2">Full Name</label>
              <div className="relative">
                <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  value={signupName}
                  onChange={(e) => setSignupName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="John Doe"
                  required
                />
              </div>
            </div>
            
            <div className="mb-3">
              <label className="block text-sm font-medium mb-2">Email</label>
              <div className="relative">
                <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="email"
                  value={signupEmail}
                  onChange={(e) => setSignupEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="your@email.com"
                  required
                />
              </div>
            </div>
            
            <div className="mb-3">
              <label className="block text-sm font-medium mb-2">Mobile Number</label>
              <div className="relative">
                <Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="tel"
                  value={signupMobile}
                  onChange={(e) => setSignupMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="9876543210"
                />
              </div>
            </div>
            
            <div className="mb-3">
              <label className="block text-sm font-medium mb-2">Password</label>
              <div className="relative">
                <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="password"
                  value={signupPassword}
                  onChange={(e) => setSignupPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Create a password"
                  required
                />
              </div>
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Confirm Password</label>
              <div className="relative">
                <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="password"
                  value={signupConfirmPassword}
                  onChange={(e) => setSignupConfirmPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Confirm your password"
                  required
                />
              </div>
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 disabled:opacity-50"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>
        )}
        
        {/* GUEST LOGIN FORM */}
        {mode === 'guest' && (
          <form onSubmit={otpSent ? handleVerifyGuestOtp : handleSendGuestOtp}>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Mobile Number</label>
              <div className="flex">
                <span className="inline-flex items-center px-3 border border-r-0 border-border rounded-l-lg bg-gray-50">+91</span>
                <input
                  type="tel"
                  value={guestMobile}
                  onChange={(e) => setGuestMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  className="flex-1 px-4 py-2 border border-border rounded-r-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="9876543210"
                  disabled={otpSent}
                  required
                />
              </div>
            </div>
            
            {otpSent && (
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Enter OTP</label>
                <input
                  type="text"
                  value={guestOtp}
                  onChange={(e) => setGuestOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="w-full px-4 py-2 border border-border rounded-lg text-center text-2xl tracking-widest"
                  placeholder="000000"
                  maxLength={6}
                  required
                />
              </div>
            )}
            
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 disabled:opacity-50"
            >
              {loading ? 'Processing...' : otpSent ? 'Verify & Login' : 'Send OTP'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default CompleteLogin;