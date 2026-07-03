// src/pages/ContactUs.tsx
import React from 'react';
import { Helmet } from 'react-helmet-async';
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const ContactUs: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>Contact Us | Aazhi – We're Here to Help</title>
        <meta name="description" content="Have questions about our Tiruppur cotton clothing collections, your order, or want to partner with us? Reach out to the Aazhi team today." />
        <meta name="keywords" content="Aazhi contact number, Tiruppur clothing store customer care, buy Tiruppur clothes online contact, wholesale kids wear Tiruppur" />
      </Helmet>

      <Navbar />

      <div className="min-h-screen bg-gradient-to-b from-[#0f0e1a] via-[#1a1a2e] to-[#16213e] pt-24 pb-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-400/5 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-[900px] mx-auto relative z-10">

          {/* Header Section */}
          <div className="text-center mb-12 animate-fadeIn">
            <div className="inline-block mb-4">
              <div className="h-1 w-20 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full mx-auto"></div>
            </div>
            <h1 className="text-4xl sm:text-5xl font-['Cormorant_Garamond',serif] font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent mb-4">
              Get in Touch with Aazhi
            </h1>
            <div className="max-w-3xl mx-auto space-y-3">
              <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
                Whether you are a parent looking for the perfect size for your child, have a question about a recent order,
                or you are a local Tiruppur manufacturer looking to take your brand digital across India—we would love to hear from you!
              </p>
              <p className="text-purple-300/80 text-sm italic">
                "At Aazhi, we pride ourselves on being accessible, transparent, and direct. Drop us a message, and our team will get back to you as quickly as possible."
              </p>
            </div>
          </div>

          {/* How Can We Help You Today? - Dark Theme */}
          <div className="mb-12 animate-fadeIn">
            <h2 className="text-3xl font-['Cormorant_Garamond',serif] font-bold text-white text-center mb-8">
              How Can We Help You Today?
            </h2>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Customer Support - Dark */}
              <div className="group bg-gradient-to-br from-purple-900/30 to-purple-700/10 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/20 hover:border-purple-500/50 transition-all duration-500 hover:shadow-2xl hover:shadow-purple-500/10 hover:-translate-y-1">
                <div className="flex items-start gap-4">
                  <div className="text-4xl group-hover:scale-110 transition-transform duration-300">🛍️</div>
                  <div>
                    <h3 className="text-purple-300 font-semibold text-lg mb-2">Customer Support & Order Inquiries</h3>
                    <p className="text-gray-400 text-sm leading-relaxed">
                      Need help tracking your order, processing a return, or choosing the right cotton fabric?
                    </p>
                    <div className="mt-4 space-y-2 text-sm bg-black/20 rounded-xl p-4 border border-white/5">
                      <p className="text-gray-300 flex items-center gap-2">
                        <span>📧</span> 
                        <span className="text-white font-medium">support@theaazhi.com</span>
                      </p>
                      <p className="text-gray-300 flex items-center gap-2">
                        <span>📞</span> 
                        <span className="text-white font-medium">+91 79048 41486</span>
                        <span className="text-xs text-purple-400 ml-2">(Recommended)</span>
                      </p>
                      <p className="text-gray-400 text-xs flex items-center gap-2">
                        <span>🕐</span> 
                        <span>Mon-Sat, 9:00 AM – 6:00 PM (IST)</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* For Brands & Manufacturers - Dark */}
              <div className="group bg-gradient-to-br from-blue-900/30 to-blue-700/10 backdrop-blur-sm rounded-2xl p-6 border border-blue-500/20 hover:border-blue-500/50 transition-all duration-500 hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-1">
                <div className="flex items-start gap-4">
                  <div className="text-4xl group-hover:scale-110 transition-transform duration-300">👕</div>
                  <div>
                    <h3 className="text-blue-300 font-semibold text-lg mb-2">For Tiruppur Brands & Manufacturers</h3>
                    <p className="text-gray-400 text-sm leading-relaxed">
                      Are you an offline brand or garment manufacturer in Tiruppur making incredible, value-for-money products?
                    </p>
                    <div className="mt-4 bg-black/20 rounded-xl p-4 border border-white/5">
                      <p className="text-gray-300 text-sm flex items-center gap-2">
                        <span>📧</span> 
                        <span className="text-white font-medium">partners@theaazhi.com</span>
                      </p>
                      <p className="text-xs text-blue-400 mt-1">Let's partner up and bring your premium garments to millions!</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Cards - Light Colored (Center Four) */}
          <div className="grid sm:grid-cols-2 gap-4 animate-fadeIn">
            <div className="group bg-gradient-to-br from-purple-100 to-purple-50 rounded-2xl p-6 border border-purple-200 hover:border-purple-400 transition-all duration-500 hover:shadow-2xl hover:shadow-purple-500/20 hover:-translate-y-1">
              <div className="flex items-start gap-3">
                <div className="text-3xl group-hover:scale-110 transition-transform duration-300">📧</div>
                <div>
                  <h3 className="text-purple-700 font-semibold text-sm uppercase tracking-wider">Email</h3>
                  <p className="text-purple-900 font-medium mt-1">support@theaazhi.com</p>
                </div>
              </div>
            </div>

            <div className="group bg-gradient-to-br from-blue-100 to-blue-50 rounded-2xl p-6 border border-blue-200 hover:border-blue-400 transition-all duration-500 hover:shadow-2xl hover:shadow-blue-500/20 hover:-translate-y-1">
              <div className="flex items-start gap-3">
                <div className="text-3xl group-hover:scale-110 transition-transform duration-300">📞</div>
                <div>
                  <h3 className="text-blue-700 font-semibold text-sm uppercase tracking-wider">Phone</h3>
                  <p className="text-blue-900 font-medium mt-1">+91 79048 41486</p>
                  <p className="text-blue-600 text-xs mt-1">Mon-Sat, 10 AM - 7 PM</p>
                </div>
              </div>
            </div>

            <div className="group bg-gradient-to-br from-green-100 to-green-50 rounded-2xl p-6 border border-green-200 hover:border-green-400 transition-all duration-500 hover:shadow-2xl hover:shadow-green-500/20 hover:-translate-y-1">
              <div className="flex items-start gap-3">
                <div className="text-3xl group-hover:scale-110 transition-transform duration-300">💬</div>
                <div>
                  <h3 className="text-green-700 font-semibold text-sm uppercase tracking-wider">WhatsApp</h3>
                  <p className="text-green-900 font-medium mt-1">+91 79048 41486</p>
                  <p className="text-green-600 text-xs mt-1">✓ Available on WhatsApp</p>
                </div>
              </div>
            </div>

            <div className="group bg-gradient-to-br from-amber-100 to-amber-50 rounded-2xl p-6 border border-amber-200 hover:border-amber-400 transition-all duration-500 hover:shadow-2xl hover:shadow-amber-500/20 hover:-translate-y-1">
              <div className="flex items-start gap-3">
                <div className="text-3xl group-hover:scale-110 transition-transform duration-300">📍</div>
                <div>
                  <h3 className="text-amber-700 font-semibold text-sm uppercase tracking-wider">Our Location</h3>
                  <p className="text-amber-900 font-medium mt-1">Aazhi Clothing</p>
                  <p className="text-amber-700 text-sm">Ammapalayam, Tiruppur - 641652</p>
                  <p className="text-amber-600 text-xs mt-1">Tamil Nadu, India</p>
                </div>
              </div>
            </div>
          </div>

          {/* Location Details & Hours - Dark Theme */}
          <div className="mt-6 grid sm:grid-cols-2 gap-4 animate-fadeIn">
            <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10 hover:border-purple-500/30 transition-all duration-500">
              <h3 className="text-purple-300 font-semibold text-sm uppercase tracking-wider mb-3">📍 Location Details</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                We operate right out of the textile capital of India, keeping us close to the source to ensure you get the absolute best quality and prices.
              </p>
              <div className="mt-3 p-3 bg-black/20 rounded-xl border border-white/5">
                <p className="text-gray-400 text-sm">
                  <span className="text-white font-medium">Aazhi Head Office:</span><br />
                  Aazhi Clothing<br />
                  Ammapalayam<br />
                  Tiruppur - 641652, Tamil Nadu, India
                </p>
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10 hover:border-blue-500/30 transition-all duration-500">
              <h3 className="text-blue-300 font-semibold text-sm uppercase tracking-wider mb-3">🕐 Business Hours</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center p-2 border-b border-white/5">
                  <span className="text-gray-400 text-sm">Monday - Friday</span>
                  <span className="text-white text-sm font-medium">9:00 AM - 6:00 PM</span>
                </div>
                <div className="flex justify-between items-center p-2 border-b border-white/5">
                  <span className="text-gray-400 text-sm">Saturday</span>
                  <span className="text-white text-sm font-medium">10:00 AM - 6:00 PM</span>
                </div>
                <div className="flex justify-between items-center p-2">
                  <span className="text-gray-400 text-sm">Sunday</span>
                  <span className="text-red-400 text-sm font-medium">Closed</span>
                </div>
              </div>
            </div>
          </div>

          {/* FAQ Quick Links */}
          <div className="mt-12 text-center animate-fadeIn">
            <div className="inline-block mb-4">
              <div className="h-0.5 w-16 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full mx-auto"></div>
            </div>
            <h3 className="text-white font-semibold text-lg mb-2">Frequently Asked Questions</h3>
            <p className="text-gray-400 text-sm mb-6">Before reaching out, your answer might just be a click away!</p>
            <div className="flex flex-wrap justify-center gap-3">
              
              <a href="/ShippingPolicy" className="group px-6 py-3 bg-white/5 backdrop-blur-sm hover:bg-white/10 text-white rounded-xl text-sm transition-all duration-300 border border-white/10 hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/10 flex items-center gap-2">
                <span>🚚</span>
                <span>Shipping & Delivery</span>
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </a>
              <a href="/help/return-policy" className="group px-6 py-3 bg-white/5 backdrop-blur-sm hover:bg-white/10 text-white rounded-xl text-sm transition-all duration-300 border border-white/10 hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/10 flex items-center gap-2">
                <span>🔄</span>
                <span>Returns & Exchange</span>
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </a>
            </div>
          </div>

        </div>
      </div>

      <Footer />

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes pulse {
          0%, 100% {
            opacity: 0.5;
          }
          50% {
            opacity: 1;
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.8s ease forwards;
          opacity: 0;
        }

        .animate-fadeIn:nth-child(2) {
          animation-delay: 0.1s;
        }
        .animate-fadeIn:nth-child(3) {
          animation-delay: 0.2s;
        }
        .animate-fadeIn:nth-child(4) {
          animation-delay: 0.3s;
        }
        .animate-fadeIn:nth-child(5) {
          animation-delay: 0.4s;
        }

        .delay-1000 {
          animation-delay: 1s;
        }
      `}</style>
    </>
  );
};

export default ContactUs;