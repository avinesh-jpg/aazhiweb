/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
import { X, Mail, CheckCircle, AlertCircle, Send } from 'lucide-react';

interface EmailOTPLoginProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (user: any, orders: any[]) => void;
  message?: string;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const EmailOTPLogin = ({ isOpen, onClose, onLogin, message }: EmailOTPLoginProps) => {
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [timer, setTimer] = useState(0);
  const [resendDisabled, setResendDisabled] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer(prev => prev - 1);
      }, 1000);
    } else if (timer === 0 && resendDisabled) {
      setResendDisabled(false);
    }
    return () => clearInterval(interval);
  }, [timer, resendDisabled]);

  // Fixed: Changed from /api/auth/send-otp to /api/email-otp/send-otp
  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }
    
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const response = await fetch(`${API_URL}/email-otp/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      
      const data = await response.json();
      console.log('Send OTP response:', data);
      
      if (data.success) {
        setSuccess('OTP sent to your email!');
        setStep('otp');
        setTimer(60);
        setResendDisabled(true);
      } else {
        setError(data.message || 'Failed to send OTP');
      }
    } catch (error) {
      console.error('Send OTP error:', error);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Fixed: Changed from /api/auth/verify-otp to /api/email-otp/verify-otp
  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) {
      setError('Please enter the 6-digit OTP');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch(`${API_URL}/email-otp/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp })
      });
      
      const data = await response.json();
      console.log('Verify OTP response:', data);
      
      if (data.success) {
        localStorage.setItem('tiinyberry_token', data.token);
        localStorage.setItem('tiinyberry_user', JSON.stringify(data.user));
        localStorage.setItem('tiinyberry_email', email);
        
        if (data.orders && data.orders.length > 0) {
          localStorage.setItem('tiinyberry_orders', JSON.stringify(data.orders));
        }
        
        onLogin(data.user, data.orders || []);
        onClose();
        resetForm();
        window.location.reload();
      } else {
        setError(data.message || 'Invalid OTP');
      }
    } catch (error) {
      console.error('Verify OTP error:', error);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Fixed: Changed from /api/auth/resend-otp to /api/email-otp/resend-otp
  const handleResendOTP = async () => {
    if (resendDisabled) return;
    
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch(`${API_URL}/email-otp/resend-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setSuccess('OTP resent to your email!');
        setTimer(60);
        setResendDisabled(true);
      } else {
        setError(data.message || 'Failed to resend OTP');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setStep('email');
    setEmail('');
    setOtp('');
    setError('');
    setSuccess('');
    setTimer(0);
    setResendDisabled(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-slide-in-right">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 hover:bg-accent rounded-full transition-colors"
        >
          <X size={20} />
        </button>
        
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
            <Mail size={28} className="text-primary" />
          </div>
          <h2 className="text-2xl font-heading font-light">
            {step === 'email' ? 'Login with Email' : 'Enter OTP'}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {step === 'email' 
              ? 'Enter your email address to get OTP' 
              : `OTP sent to ${email}`}
          </p>
        </div>
        
        {message && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-600 text-sm">
            {message}
          </div>
        )}
        
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
        
        {step === 'email' ? (
          <form onSubmit={handleSendOTP}>
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Email Address</label>
              <div className="relative">
                <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="your@email.com"
                  autoFocus
                  required
                />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                We'll send a 6-digit OTP to this email address
              </p>
              <p className="text-xs text-primary mt-1">
                ✓ One account per email address
              </p>
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {loading ? 'Sending OTP...' : 'Send OTP'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOTP}>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Enter 6-Digit OTP</label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-center text-2xl tracking-widest"
                placeholder="000000"
                maxLength={6}
                autoFocus
                required
              />
              <p className="text-xs text-muted-foreground text-center mt-2">
                Check your email inbox (and spam folder)
              </p>
            </div>
            
            <div className="text-center mb-4">
              {timer > 0 ? (
                <p className="text-sm text-muted-foreground">
                  Resend OTP in <span className="font-semibold">{timer}s</span>
                </p>
              ) : (
                <button
                  type="button"
                  onClick={handleResendOTP}
                  disabled={resendDisabled}
                  className="text-sm text-primary hover:underline"
                >
                  Resend OTP
                </button>
              )}
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {loading ? 'Verifying...' : 'Verify & Login'}
            </button>
          </form>
        )}
        
        <div className="mt-4 text-center">
          <p className="text-xs text-muted-foreground">
            By continuing, you agree to our Terms & Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
};

export default EmailOTPLogin;