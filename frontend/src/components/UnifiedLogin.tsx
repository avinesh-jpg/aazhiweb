import { useState, useEffect } from 'react';
import { X, Phone, Mail, CheckCircle, AlertCircle } from 'lucide-react';

interface UnifiedLoginProps {
  isOpen: boolean;
  onClose: () => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onLogin: (user: any, orders: any[]) => void;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const UnifiedLogin = ({ isOpen, onClose, onLogin }: UnifiedLoginProps) => {
  const [step, setStep] = useState<'credentials' | 'otp'>('credentials');
  const [email, setEmail] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
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

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mobileNumber || mobileNumber.length < 10) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }
    
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const response = await fetch(`${API_URL}/otp/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobileNumber })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setSuccess('OTP sent successfully! Check console for OTP (dev mode)');
        setStep('otp');
        setTimer(60);
        setResendDisabled(true);
      } else {
        setError(data.message || 'Failed to send OTP');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) {
      setError('Please enter the 6-digit OTP');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch(`${API_URL}/otp/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobileNumber, otp })
      });
      
      const data = await response.json();
      
      if (data.success) {
        localStorage.setItem('tiinyberry_token', data.token);
        localStorage.setItem('tiinyberry_user', JSON.stringify(data.user));
        localStorage.setItem('tiinyberry_mobile', mobileNumber);
        
        if (data.orders && data.orders.length > 0) {
          localStorage.setItem('tiinyberry_orders', JSON.stringify(data.orders));
        }
        
        onLogin(data.user, data.orders || []);
        onClose();
        
        setMobileNumber('');
        setOtp('');
        setStep('credentials');
      } else {
        setError(data.message || 'Invalid OTP. Please try again.');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (resendDisabled) return;
    
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch(`${API_URL}/otp/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobileNumber })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setSuccess('OTP resent successfully!');
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 hover:bg-accent rounded-full transition-colors"
        >
          <X size={20} />
        </button>
        
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
            <Phone size={28} className="text-primary" />
          </div>
          <h2 className="text-2xl font-heading font-light">
            {step === 'credentials' ? 'Login with Mobile' : 'Enter OTP'}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {step === 'credentials' 
              ? 'Enter your mobile number to get OTP' 
              : `OTP sent to +91 ${mobileNumber}`}
          </p>
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
        
        {step === 'credentials' ? (
          <form onSubmit={handleSendOTP}>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Mobile Number</label>
              <div className="flex">
                <span className="inline-flex items-center px-3 border border-r-0 border-border rounded-l-lg bg-gray-50 text-muted-foreground">
                  +91
                </span>
                <input
                  type="tel"
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  className="flex-1 px-4 py-2 border border-border rounded-r-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="9876543210"
                  maxLength={10}
                  autoFocus
                  required
                />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                We'll send an OTP to verify your mobile number
              </p>
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {loading ? 'Sending OTP...' : 'Send OTP'}
            </button>
            
            <p className="text-xs text-muted-foreground text-center mt-4">
              By continuing, you agree to our Terms & Privacy Policy
            </p>
          </form>
        ) : (
          <form onSubmit={handleVerifyOTP}>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Enter OTP</label>
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
      </div>
    </div>
  );
};

export default UnifiedLogin;