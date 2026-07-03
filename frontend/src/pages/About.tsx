// src/pages/About.tsx
import React from 'react';
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Link } from 'react-router-dom';

const About: React.FC = () => {
  return (
    <>
      <Navbar />
      
      <div className="min-h-screen bg-gradient-to-br from-[#1a1a2e] to-[#16213e] pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-[1320px] mx-auto">
          
          {/* Hero Section */}
          <div className="text-center mb-12 animate-fadeIn">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-['Cormorant_Garamond',serif] font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent mb-4">
              Welcome to Aazhi
            </h1>
            <p className="text-gray-300 text-base sm:text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
              Bridging the Gap: Premium Tiruppur Quality Meets Indian Classrooms & Playgrounds
            </p>
          </div>

          {/* Brand Story Section */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 sm:p-8 mb-8 animate-fadeIn border border-purple-500/20" style={{ animationDelay: "0.1s" }}>
            <h2 className="text-xl sm:text-2xl font-semibold text-purple-400 mb-4">Bringing Tiruppur's Finest to Your Doorstep</h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              Welcome to <span className="text-purple-300 font-semibold">Aazhi</span>—where India's finest manufacturing hub meets every parent's search for premium, budget-friendly clothing.
            </p>
            <p className="text-gray-300 leading-relaxed mb-4">
              For decades, <span className="text-blue-300 font-semibold">Tiruppur</span> has been recognized globally as the textile and knitwear capital of India. It's the birthplace of some of the most comfortable, durable, and highest-quality 100% cotton clothing. Yet, the best of Tiruppur's surplus and offline factory brands have remained a well-kept local secret.
            </p>
            <p className="text-gray-300 leading-relaxed">
              For parents living across India—from Mumbai to Guwahati, Delhi to Kochi—finding these high-value, durable clothes online has been nearly impossible. <span className="text-purple-300 font-semibold">Aazhi was born to change that.</span>
            </p>
          </div>

          {/* The Problem We're Solving */}
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 sm:p-8 mb-8 animate-fadeIn" style={{ animationDelay: "0.2s" }}>
            <h2 className="text-xl sm:text-2xl font-semibold text-purple-400 mb-4">The Problem We're Solving</h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              As parents, you shouldn't have to choose between overpriced premium brands or cheap, low-quality synthetic clothing that irritates your child's skin.
            </p>
            <p className="text-gray-300 leading-relaxed">
              Right now, hundreds of offline manufacturers and local brands in Tiruppur are creating extraordinary, export-grade garments that offer immense <span className="text-blue-300 font-semibold">value for money</span>. But because they operate purely offline, millions of Indian households miss out on them.
            </p>
          </div>

          {/* Our Mission Section */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 sm:p-8 mb-8 animate-fadeIn border border-purple-500/20" style={{ animationDelay: "0.3s" }}>
            <h2 className="text-xl sm:text-2xl font-semibold text-purple-400 mb-4">Our Mission: Opening the Tiruppur Market to India</h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              <span className="text-purple-300 font-semibold">"Aazhi"</span> means the ocean. Just like the vast, deep blue sea, we aim to bring a boundless wave of premium, affordable fashion right to your doorstep.
            </p>
            <p className="text-gray-300 leading-relaxed mb-4">
              We act as the digital bridge. Our team goes deep into the bustling textile lanes of Tiruppur, unearths the finest offline brands, curates the highest-quality surplus clothing, and brings them online.
            </p>
            <div className="grid md:grid-cols-2 gap-6 mt-6">
              <div className="bg-white/5 rounded-xl p-5">
                <h3 className="text-lg font-semibold text-blue-300 mb-2">For Parents</h3>
                <p className="text-gray-300 text-sm leading-relaxed">
                  You gain direct access to ultra-soft, export-quality cotton garments that are incredibly <span className="text-purple-300 font-medium">value-for-money</span>, helping you dress your kids beautifully without stretching your budget.
                </p>
              </div>
              <div className="bg-white/5 rounded-xl p-5">
                <h3 className="text-lg font-semibold text-blue-300 mb-2">For Tiruppur's Makers</h3>
                <p className="text-gray-300 text-sm leading-relaxed">
                  We give hard-working, top-tier local manufacturers a voice and a national platform to showcase their incredible craftsmanship.
                </p>
              </div>
            </div>
          </div>

          {/* The Aazhi Promise */}
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 sm:p-8 mb-8 animate-fadeIn" style={{ animationDelay: "0.4s" }}>
            <h2 className="text-xl sm:text-2xl font-semibold text-purple-400 mb-6 text-center">The Aazhi Promise</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all duration-300 border border-purple-500/10">
                <div className="text-3xl mb-3">💰</div>
                <h3 className="font-semibold text-blue-300 mb-2">100% Value for Money</h3>
                <p className="text-sm text-gray-400 leading-relaxed">
                  We bypass the fancy middlemen, expensive retail markups, and excessive marketing costs to pass the savings directly to you.
                </p>
              </div>
              
              <div className="text-center p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all duration-300 border border-purple-500/10">
                <div className="text-3xl mb-3">✅</div>
                <h3 className="font-semibold text-blue-300 mb-2">Uncompromised Quality</h3>
                <p className="text-sm text-gray-400 leading-relaxed">
                  Every garment featured on Aazhi undergoes a rigorous check to ensure it meets the comfort and durability standards your family deserves.
                </p>
              </div>
              
              <div className="text-center p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all duration-300 border border-purple-500/10">
                <div className="text-3xl mb-3">🏭</div>
                <h3 className="font-semibold text-blue-300 mb-2">Direct from the Hub</h3>
                <p className="text-sm text-gray-400 leading-relaxed">
                  No imitation goods. Everything is sourced straight from the heart of <span className="text-purple-300 font-medium">Tiruppur, Tamil Nadu</span>.
                </p>
              </div>
            </div>
          </div>

          {/* Closing Message */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 sm:p-8 mb-8 animate-fadeIn border border-purple-500/20" style={{ animationDelay: "0.5s" }}>
            <p className="text-gray-300 leading-relaxed text-center text-lg">
              Thank you for choosing <span className="text-purple-300 font-semibold">Aazhi</span>. By shopping with us, you aren't just buying premium clothing for your family; you are supporting local textile communities and unlocking the true potential of Made-in-India manufacturing.
            </p>
          </div>

          {/* Quote Section */}
          <div className="text-center py-6 animate-fadeIn" style={{ animationDelay: "0.6s" }}>
            <div className="inline-block p-6 rounded-2xl bg-white/5 border border-purple-500/20">
              <p className="text-lg sm:text-xl md:text-2xl text-gray-300 italic font-['Cormorant_Garamond',serif]">
                "We find India's finest independent labels so you don't have to. 
                <br />
                Dressing your little ones in ultimate everyday comfort."
              </p>
            </div>
          </div>

          
        </div>
      </div>

      <Footer />

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.6s ease forwards;
          opacity: 0;
        }
      `}</style>
    </>
  );
};

export default About;