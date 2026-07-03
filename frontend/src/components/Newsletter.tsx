import { useState } from "react";
import emailjs from '@emailjs/browser';

const Newsletter = () => {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setError("");

    try {
      // Log environment variables for debugging
      console.log("=== EmailJS Configuration ===");
      console.log("Service ID:", import.meta.env.VITE_EMAILJS_SERVICE_ID);
      console.log("Template ID:", import.meta.env.VITE_EMAILJS_NEWSLETTER_TEMPLATE_ID);
      console.log("Public Key:", import.meta.env.VITE_EMAILJS_PUBLIC_KEY);
      console.log("Owner Email:", import.meta.env.VITE_OWNER_EMAIL);
      console.log("==============================");

      const templateParams = {
        to_email: import.meta.env.VITE_OWNER_EMAIL || "aviarul2002@gmail.com",
        from_name: "Aazhi Family Website",
        subscriber_email: email,
        subscription_date: new Date().toLocaleString(),
        subject: "New Newsletter Subscriber! 📧",
        reply_to: email,
        message: `New subscriber: ${email} joined on ${new Date().toLocaleString()}`
      };

      console.log("Sending email with params:", templateParams);

      // Send email using EmailJS with all parameters
      const response = await emailjs.send(
        import.meta.env.VITE_EMAILJS_SERVICE_ID,
        import.meta.env.VITE_EMAILJS_NEWSLETTER_TEMPLATE_ID,
        templateParams,
        import.meta.env.VITE_EMAILJS_PUBLIC_KEY
      );

      console.log("Email sent successfully:", response);
      setSubmitted(true);
      setEmail("");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("Subscription error:", error);
      
      if (error.status === 404) {
        setError("Email service configuration error. Please check credentials.");
      } else if (error.status === 422) {
        setError("Invalid email address. Please try again.");
      } else {
        setError("Failed to subscribe. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="bg-gradient-to-r from-purple-600 via-purple-500 to-blue-500 py-16 md:py-20 px-4 text-center relative overflow-hidden">
      {/* Decorative animated blobs */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-white/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 animate-pulse-slow"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 animate-pulse-slow animation-delay-1000"></div>
      
      <div className="max-w-xl mx-auto relative z-10">
        <div className="animate-fadeInUp">
          <span className="inline-block text-[0.68rem] font-bold uppercase tracking-[0.2em] text-white/80 mb-1 animate-pulse-slow">
            Stay in the loop
          </span>
          <h2 className="font-['Cormorant_Garamond',serif] text-3xl md:text-4xl font-light text-white mb-3 drop-shadow-md">
            Join the Aazhi Family
          </h2>
          <p className="text-white/80 text-[0.88rem] mb-7">
            Subscribe for exclusive offers, new arrivals, parenting tips & early access to seasonal collections.
          </p>
          
          {submitted ? (
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl px-6 py-4 text-white font-semibold animate-scaleIn border border-white/30 shadow-lg">
              🎉 Thank you for subscribing! Welcome to the family.
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex max-w-md mx-auto overflow-hidden rounded-full border border-white/40 shadow-lg transition-all duration-300 hover:shadow-white/20 focus-within:shadow-white/30">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="flex-1 bg-white/15 text-white placeholder-white/55 px-5 py-3 text-[0.85rem] outline-none border-none rounded-l-full focus:bg-white/25 transition-all duration-300"
                required
                disabled={loading}
              />
              <button 
                type="submit" 
                className="bg-white text-purple-600 font-bold text-[0.7rem] uppercase tracking-[0.14em] px-6 rounded-r-full hover:bg-purple-50 transition-all duration-300 hover:scale-105 flex-shrink-0 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                    </svg>
                    Subscribing...
                  </span>
                ) : 'Subscribe'}
              </button>
            </form>
          )}
          
          {error && (
            <p className="text-red-200 text-[0.75rem] mt-2">{error}</p>
          )}
          
          <p className="text-white/60 text-[0.65rem] mt-4">
            No spam, unsubscribe anytime.
          </p>
        </div>
      </div>

      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        @keyframes pulse-slow {
          0%, 100% {
            opacity: 0.6;
            transform: scale(1);
          }
          50% {
            opacity: 0.3;
            transform: scale(1.1);
          }
        }
        
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        
        .animate-fadeInUp {
          animation: fadeInUp 0.6s ease-out;
        }
        
        .animate-scaleIn {
          animation: scaleIn 0.4s ease-out;
        }
        
        .animate-pulse-slow {
          animation: pulse-slow 6s ease-in-out infinite;
        }
        
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        
        .animation-delay-1000 {
          animation-delay: 1s;
        }
      `}</style>
    </section>
  );
};

export default Newsletter;