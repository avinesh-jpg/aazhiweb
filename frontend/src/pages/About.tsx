// src/pages/About.tsx
import React from 'react';
import { Helmet } from 'react-helmet-async';
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Link } from 'react-router-dom';

const About: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>About Us | Aazhi – Premium Tiruppur Clothing for Kids</title>
        <meta name="description" content="Discover Aazhi's story - bridging the gap between Tiruppur's finest textile manufacturers and parents across India looking for premium, budget-friendly kids clothing." />
        <meta name="keywords" content="Aazhi about, Tiruppur clothing brand, kids cotton wear India, premium kids clothing, Tiruppur manufacturers, Indian textile hub" />
      </Helmet>

      <Navbar />
      
      <div className="min-h-screen bg-gradient-to-br from-[#0f0e1a] via-[#1a1a2e] to-[#16213e] pt-24 pb-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-400/5 rounded-full blur-3xl"></div>
          <div className="absolute top-1/4 right-1/4 w-60 h-60 bg-pink-500/5 rounded-full blur-3xl animate-pulse delay-2000"></div>
        </div>

        <div className="max-w-[1320px] mx-auto relative z-10">
          
          {/* Hero Section */}
          <div className="text-center mb-14 animate-fadeIn">
            <div className="inline-block mb-4">
              <div className="h-1 w-20 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full mx-auto"></div>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-['Cormorant_Garamond',serif] font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent mb-4">
              Welcome to Aazhi
            </h1>
            <p className="text-gray-300 text-base sm:text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
              Bridging the Gap: Premium Tiruppur Quality Meets Indian Classrooms & Playgrounds
            </p>
            <div className="mt-4 flex justify-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-purple-400"></span>
              <span className="h-1.5 w-1.5 rounded-full bg-blue-400"></span>
              <span className="h-1.5 w-1.5 rounded-full bg-purple-400"></span>
              <span className="h-1.5 w-1.5 rounded-full bg-blue-400"></span>
            </div>
          </div>

          {/* Block 1 - Brand Story Section (DARK) */}
          <div className="group bg-gradient-to-br from-purple-900/30 to-purple-700/10 backdrop-blur-sm rounded-2xl p-6 sm:p-8 md:p-10 mb-8 animate-fadeIn border border-purple-500/20 hover:border-purple-500/50 transition-all duration-500 hover:shadow-2xl hover:shadow-purple-500/10 hover:-translate-y-1" style={{ animationDelay: "0.1s" }}>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-1 h-8 bg-gradient-to-b from-purple-400 to-blue-400 rounded-full"></div>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-['Cormorant_Garamond',serif] font-semibold text-transparent bg-gradient-to-r from-purple-300 to-blue-300 bg-clip-text">
                Bringing Tiruppur's Finest to Your Doorstep
              </h2>
            </div>
            <p className="text-gray-300 leading-relaxed mb-4 text-sm sm:text-base">
              Welcome to <span className="text-purple-300 font-semibold">Aazhi</span>—where India's finest manufacturing hub meets every parent's search for premium, budget-friendly clothing.
            </p>
            <p className="text-gray-300 leading-relaxed mb-4 text-sm sm:text-base">
              For decades, <span className="text-blue-300 font-semibold">Tiruppur</span> has been recognized globally as the textile and knitwear capital of India. It's the birthplace of some of the most comfortable, durable, and highest-quality 100% cotton clothing. Yet, the best of Tiruppur's surplus and offline factory brands have remained a well-kept local secret.
            </p>
            <p className="text-gray-300 leading-relaxed text-sm sm:text-base">
              For parents living across India—from Mumbai to Guwahati, Delhi to Kochi—finding these high-value, durable clothes online has been nearly impossible. <span className="text-purple-300 font-semibold">Aazhi was born to change that.</span>
            </p>
          </div>

          {/* Block 2 - The Problem We're Solving (LIGHT) */}
          <div className="group bg-gradient-to-br from-purple-100 via-blue-50 to-purple-50 rounded-2xl p-6 sm:p-8 md:p-10 mb-8 animate-fadeIn border border-purple-200 hover:border-purple-400 transition-all duration-500 hover:shadow-2xl hover:shadow-purple-500/20 hover:-translate-y-1" style={{ animationDelay: "0.2s" }}>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-1 h-8 bg-gradient-to-b from-purple-600 to-blue-600 rounded-full"></div>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-['Cormorant_Garamond',serif] font-semibold text-transparent bg-gradient-to-r from-purple-700 to-blue-700 bg-clip-text">
                The Problem We're Solving
              </h2>
            </div>
            <p className="text-gray-700 leading-relaxed mb-4 text-sm sm:text-base">
              As parents, you shouldn't have to choose between overpriced premium brands or cheap, low-quality synthetic clothing that irritates your child's skin.
            </p>
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-5 border border-purple-200">
              <p className="text-gray-700 leading-relaxed text-sm sm:text-base">
                Right now, hundreds of offline manufacturers and local brands in Tiruppur are creating extraordinary, export-grade garments that offer immense <span className="text-purple-600 font-semibold">value for money</span>. But because they operate purely offline, millions of Indian households miss out on them.
              </p>
            </div>
          </div>

          {/* Block 3 - Our Mission Section (DARK) */}
          <div className="group bg-gradient-to-br from-blue-900/30 to-purple-700/10 backdrop-blur-sm rounded-2xl p-6 sm:p-8 md:p-10 mb-8 animate-fadeIn border border-blue-500/20 hover:border-blue-500/50 transition-all duration-500 hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-1" style={{ animationDelay: "0.3s" }}>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-1 h-8 bg-gradient-to-b from-blue-400 to-purple-400 rounded-full"></div>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-['Cormorant_Garamond',serif] font-semibold text-transparent bg-gradient-to-r from-blue-300 to-purple-300 bg-clip-text">
                Our Mission: Opening the Tiruppur Market to India
              </h2>
            </div>
            <p className="text-gray-300 leading-relaxed mb-4 text-sm sm:text-base">
              <span className="text-purple-300 font-semibold">"Aazhi"</span> means the ocean. Just like the vast, deep blue sea, we aim to bring a boundless wave of premium, affordable fashion right to your doorstep.
            </p>
            <p className="text-gray-300 leading-relaxed mb-6 text-sm sm:text-base">
              We act as the digital bridge. Our team goes deep into the bustling textile lanes of Tiruppur, unearths the finest offline brands, curates the highest-quality surplus clothing, and brings them online.
            </p>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-5 border border-purple-500/20 hover:border-purple-500/40 transition-all duration-300 hover:bg-white/10">
                <div className="text-3xl mb-3">👨‍👩‍👧‍👦</div>
                <h3 className="text-lg font-semibold text-blue-300 mb-2">For Parents</h3>
                <p className="text-gray-300 text-sm leading-relaxed">
                  You gain direct access to ultra-soft, export-quality cotton garments that are incredibly <span className="text-purple-300 font-medium">value-for-money</span>, helping you dress your kids beautifully without stretching your budget.
                </p>
              </div>
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-5 border border-purple-500/20 hover:border-purple-500/40 transition-all duration-300 hover:bg-white/10">
                <div className="text-3xl mb-3">🏭</div>
                <h3 className="text-lg font-semibold text-blue-300 mb-2">For Tiruppur's Makers</h3>
                <p className="text-gray-300 text-sm leading-relaxed">
                  We give hard-working, top-tier local manufacturers a voice and a national platform to showcase their incredible craftsmanship.
                </p>
              </div>
            </div>
          </div>

          {/* Block 4 - The Aazhi Promise (LIGHT) */}
          <div className="group bg-gradient-to-br from-blue-100 via-purple-50 to-blue-50 rounded-2xl p-6 sm:p-8 md:p-10 mb-8 animate-fadeIn border border-blue-200 hover:border-blue-400 transition-all duration-500 hover:shadow-2xl hover:shadow-blue-500/20 hover:-translate-y-1" style={{ animationDelay: "0.4s" }}>
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="h-0.5 w-12 bg-gradient-to-r from-transparent to-purple-400"></div>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-['Cormorant_Garamond',serif] font-semibold text-transparent bg-gradient-to-r from-purple-700 to-blue-700 bg-clip-text text-center">
                The Aazhi Promise
              </h2>
              <div className="h-0.5 w-12 bg-gradient-to-l from-transparent to-purple-400"></div>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center p-5 rounded-xl bg-white/70 backdrop-blur-sm hover:bg-white transition-all duration-300 border border-purple-200 hover:border-purple-400 hover:shadow-lg hover:-translate-y-1">
                <div className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-300">💰</div>
                <h3 className="font-semibold text-blue-700 mb-2">100% Value for Money</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  We bypass the fancy middlemen, expensive retail markups, and excessive marketing costs to pass the savings directly to you.
                </p>
              </div>
              
              <div className="text-center p-5 rounded-xl bg-white/70 backdrop-blur-sm hover:bg-white transition-all duration-300 border border-purple-200 hover:border-purple-400 hover:shadow-lg hover:-translate-y-1">
                <div className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-300">✅</div>
                <h3 className="font-semibold text-blue-700 mb-2">Uncompromised Quality</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Every garment featured on Aazhi undergoes a rigorous check to ensure it meets the comfort and durability standards your family deserves.
                </p>
              </div>
              
              <div className="text-center p-5 rounded-xl bg-white/70 backdrop-blur-sm hover:bg-white transition-all duration-300 border border-purple-200 hover:border-purple-400 hover:shadow-lg hover:-translate-y-1">
                <div className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-300">🏭</div>
                <h3 className="font-semibold text-blue-700 mb-2">Direct from the Hub</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  No imitation goods. Everything is sourced straight from the heart of <span className="text-purple-600 font-medium">Tiruppur, Tamil Nadu</span>.
                </p>
              </div>
            </div>
          </div>

          {/* Block 5 - Closing Message (DARK) */}
          <div className="group bg-gradient-to-br from-purple-900/20 to-blue-900/10 backdrop-blur-sm rounded-2xl p-6 sm:p-8 md:p-10 mb-8 animate-fadeIn border border-purple-500/20 hover:border-purple-500/50 transition-all duration-500 hover:shadow-2xl hover:shadow-purple-500/10 hover:-translate-y-1" style={{ animationDelay: "0.5s" }}>
            <div className="flex items-center justify-center gap-3 mb-4">
              <span className="text-2xl">💙</span>
              <span className="text-2xl">🌟</span>
              <span className="text-2xl">💙</span>
            </div>
            <p className="text-gray-300 leading-relaxed text-center text-base sm:text-lg">
              Thank you for choosing <span className="text-purple-300 font-semibold">Aazhi</span>. By shopping with us, you aren't just buying premium clothing for your family; you are supporting local textile communities and unlocking the true potential of Made-in-India manufacturing.
            </p>
          </div>

          {/* Block 6 - Quote Section (LIGHT) */}
          <div className="text-center py-6 animate-fadeIn" style={{ animationDelay: "0.6s" }}>
            <div className="inline-block p-8 rounded-2xl bg-gradient-to-br from-purple-100 via-blue-50 to-purple-50 border border-purple-200 hover:border-purple-400 transition-all duration-500 hover:shadow-2xl hover:shadow-purple-500/20 hover:-translate-y-1">
              <div className="text-5xl text-purple-300 mb-2">"</div>
              <p className="text-xl sm:text-2xl md:text-3xl text-gray-700 italic font-['Cormorant_Garamond',serif] leading-relaxed">
                We find India's finest independent labels so you don't have to.
                <br />
                <span className="text-purple-600">Dressing your little ones in ultimate everyday comfort.</span>
              </p>
              <div className="text-5xl text-purple-300 mt-2 text-right">"</div>
              <div className="mt-4 flex justify-center gap-2">
                <span className="h-1.5 w-8 rounded-full bg-gradient-to-r from-purple-400 to-blue-400"></span>
              </div>
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
        .animate-fadeIn:nth-child(6) {
          animation-delay: 0.5s;
        }
        .animate-fadeIn:nth-child(7) {
          animation-delay: 0.6s;
        }

        .delay-1000 {
          animation-delay: 1s;
        }
        .delay-2000 {
          animation-delay: 2s;
        }
      `}</style>
    </>
  );
};

export default About;