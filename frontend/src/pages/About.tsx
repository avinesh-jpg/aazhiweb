// src/pages/About.tsx
import React from 'react';
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer"; // Adjust path as needed

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
              India's Destination for Independent Kids Casual & Nightwear Brands
            </p>
          </div>

          {/* The Problem Section */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 mb-8 backdrop-blur-sm animate-fadeIn" style={{ animationDelay: "0.1s" }}>
            <h2 className="text-xl sm:text-2xl font-semibold text-purple-400 mb-4">The Problem We Solved</h2>
            <p className="text-black-300 leading-relaxed mb-4">
              If you are looking to buy kids daily wear and nightwear online in India, you've likely run into the same frustrating problem. 
              The big marketplaces are flooded with mass-produced, stiff clothes that lose their shape after two washes. And finding ultra-soft, 
              breathable pajamas or playwear that doesn't look generic feels almost impossible.
            </p>
            <p className="text-black-300 leading-relaxed">
              At Aazhi, we believe that the clothes your children spend the most time in—the outfits they sleep in, play in, and explore 
              the world in—deserve the absolute highest quality.
            </p>
          </div>

          {/* Our Solution Section */}
          <div className="bg-white to-blue-500/10 rounded-2xl p-6 sm:p-8 mb-8 backdrop-blur-sm animate-fadeIn border border-purple-500/20" style={{ animationDelay: "0.2s" }}>
            <h2 className="text-xl sm:text-2xl font-semibold text-purple-400 mb-4">Our Solution</h2>
            <p className="text-black-300 leading-relaxed mb-4 text-lg font-medium">
              That is why we built Aazhi—India's only curated multi-brand online store for kids casual wear and nightwear, sourcing exclusively from premium, independent homegrown Indian kidswear labels.
            </p>
          </div>

          {/* Discover Section */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 mb-8 backdrop-blur-sm animate-fadeIn" style={{ animationDelay: "0.3s" }}>
            <h2 className="text-xl sm:text-2xl font-semibold text-purple-400 mb-4">Discover the Softest Everyday Kids Clothing Online</h2>
            <p className="text-black-300 leading-relaxed mb-4">
              All across India—from the historic textile hubs of Coimbatore and Tirupur to independent design houses nationwide—talented 
              creators are making incredible children's clothes. They specialize in the softest pure cottons, tagless comfort, and playful, modern prints.
            </p>
            <p className="text-black-300 leading-relaxed mb-4">
              But because they operate as small, local businesses, they remain hidden gems.
            </p>
            <p className="text-black-300 leading-relaxed font-medium text-black-300">
              Aazhi is their bridge to you. We scout the country to handpick the finest independent children's apparel brands. We bring them 
              under one digital roof, making premium kids nightwear, cotton pajama sets, breathable co-ord sets, and everyday casuals 
              accessible to conscious parents all over India.
            </p>
          </div>

          {/* Why Parents Trust Aazhi */}
          <div className="bg-white/5 rounded-2xl p-6 sm:p-8 mb-8 backdrop-blur-sm animate-fadeIn" style={{ animationDelay: "0.4s" }}>
            <h2 className="text-xl sm:text-2xl font-semibold text-purple-400 mb-6 text-center">Why Parents Trust Aazhi for Kids Everyday Wear</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center p-4 rounded-xl bg-white from-purple-500/5 to-blue-500/5 hover:scale-105 transition-transform duration-300">
                <div className="text-3xl mb-3">🌿</div>
                <h3 className="font-semibold text-black-300 mb-2">Premium, Kid-Approved Fabrics</h3>
                <p className="text-sm text-black-400 leading-relaxed">
                  Kids are sensitive to rough seams and scratchy prints. Our independent partners prioritize hypoallergenic, pure combed cotton 
                  and breathable fabrics that get softer with every single wash.
                </p>
              </div>
              
              <div className="text-center p-4 rounded-xl bg-white from-purple-500/5 to-blue-500/5 hover:scale-105 transition-transform duration-300">
                <div className="text-3xl mb-3">🎨</div>
                <h3 className="font-semibold text-black-300 mb-2">Unique Prints & Designs</h3>
                <p className="text-sm text-black-400 leading-relaxed">
                  Say goodbye to the same old repetitive cartoon characters. Our brands offer fresh, minimal, and playful aesthetic designs 
                  that make everyday dressing fun.
                </p>
              </div>
              
              <div className="text-center p-4 rounded-xl bg-white from-purple-500/5 to-blue-500/5 hover:scale-105 transition-transform duration-300">
                <div className="text-3xl mb-3">💤</div>
                <h3 className="font-semibold text-black-300 mb-2">Built for Play and Sleep</h3>
                <p className="text-sm text-black-400 leading-relaxed">
                  Whether it is a cozy unisex nightsuit for a peaceful sleep or a durable cotton t-shirt and shorts set for playground adventures, 
                  our curated collections are designed for ultimate movement and comfort.
                </p>
              </div>
            </div>
          </div>

          {/* Quote Section */}
          <div className="text-center py-8 animate-fadeIn" style={{ animationDelay: "0.5s" }}>
            <div className="inline-block p-6 rounded-2xl bg-white border-purple-500/30">
              <p className="text-lg sm:text-xl md:text-2xl text-black-300 italic font-['Cormorant_Garamond',serif]">
                "We find India's finest independent labels so you don't have to. 
                <br />
                Dressing your little ones in ultimate everyday comfort."
              </p>
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center mt-8 animate-fadeIn" style={{ animationDelay: "0.6s" }}>
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