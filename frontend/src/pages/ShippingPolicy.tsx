// src/pages/ShippingPolicy.tsx
import React from 'react';
import { Helmet } from 'react-helmet-async';
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const ShippingPolicy: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>Shipping Policy | Aazhi – Secure Delivery Across India</title>
        <meta name="description" content="Learn about Aazhi's shipping policy. We deliver across India within 12 days with 100% secure delivery. Track your order easily with our trusted courier partners." />
        <meta name="keywords" content="Aazhi shipping policy, delivery policy, Tiruppur clothing shipping, India delivery, order tracking, secure delivery" />
      </Helmet>

      <Navbar />
      
      <div className="min-h-screen bg-gradient-to-br from-[#0f0e1a] via-[#1a1a2e] to-[#16213e] pt-24 pb-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-400/5 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-[1320px] mx-auto relative z-10">
          
          {/* Header Section */}
          <div className="text-center mb-12 animate-fadeIn">
            <div className="inline-block mb-4">
              <div className="h-1 w-20 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full mx-auto"></div>
            </div>
            <div className="inline-flex items-center justify-center mb-4">
              <span className="text-5xl mr-3 animate-bounce">🚚</span>
              <span className="text-5xl ml-3 animate-bounce delay-100">📦</span>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-['Cormorant_Garamond',serif] font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent mb-4">
              Shipping Policy
            </h1>
            <p className="text-gray-300 text-base sm:text-lg max-w-2xl mx-auto">
              100% Secure Delivery Across India
            </p>
          </div>

          {/* Block 1 - Delivery Information (DARK) */}
          <div className="group bg-gradient-to-br from-purple-900/30 to-purple-700/10 backdrop-blur-sm rounded-2xl p-6 sm:p-8 md:p-10 mb-8 animate-fadeIn border border-purple-500/20 hover:border-purple-500/50 transition-all duration-500 hover:shadow-2xl hover:shadow-purple-500/10 hover:-translate-y-1" style={{ animationDelay: "0.1s" }}>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-1 h-8 bg-gradient-to-b from-purple-400 to-blue-400 rounded-full"></div>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-['Cormorant_Garamond',serif] font-semibold text-transparent bg-gradient-to-r from-purple-300 to-blue-300 bg-clip-text">
                <span className="mr-2">📮</span> Delivery Information
              </h2>
            </div>
            <div className="bg-black/20 backdrop-blur-sm rounded-xl p-5 border border-purple-500/10">
              <p className="text-gray-300 leading-relaxed mb-3 text-sm sm:text-base">
                The orders for the user are delivered through registered domestic courier companies and/or speed post only. 
                We partner with trusted shipping partners to ensure your orders reach you safely and on time.
              </p>
              <p className="text-gray-300 leading-relaxed text-sm sm:text-base">
                Orders are delivered within <span className="text-purple-400 font-semibold">12 days</span> from the date of the order and/or 
                payment or as per the delivery date agreed at the time of order confirmation and delivering of the shipment, 
                subject to courier company / post office norms.
              </p>
            </div>
          </div>

          {/* Block 2 - Delivery Time Warning (LIGHT) */}
          <div className="group bg-gradient-to-br from-yellow-50 to-amber-50 rounded-2xl p-6 sm:p-8 md:p-10 mb-8 animate-fadeIn border border-yellow-200 hover:border-yellow-400 transition-all duration-500 hover:shadow-2xl hover:shadow-yellow-500/20 hover:-translate-y-1" style={{ animationDelay: "0.2s" }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-1 h-8 bg-gradient-to-b from-yellow-500 to-amber-500 rounded-full"></div>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-['Cormorant_Garamond',serif] font-semibold text-transparent bg-gradient-to-r from-yellow-600 to-amber-600 bg-clip-text">
                <span className="mr-2">⚠️</span> Important Note
              </h2>
            </div>
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-5 border border-yellow-200">
              <p className="text-yellow-700 text-sm sm:text-base leading-relaxed">
                <span className="font-semibold">Note:</span> Platform Owner shall not be liable for any delay in delivery by the courier company / postal authority.
              </p>
            </div>
          </div>

          {/* Block 3 - Delivery Address (DARK) */}
          <div className="group bg-gradient-to-br from-blue-900/30 to-purple-700/10 backdrop-blur-sm rounded-2xl p-6 sm:p-8 md:p-10 mb-8 animate-fadeIn border border-blue-500/20 hover:border-blue-500/50 transition-all duration-500 hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-1" style={{ animationDelay: "0.3s" }}>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-1 h-8 bg-gradient-to-b from-blue-400 to-purple-400 rounded-full"></div>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-['Cormorant_Garamond',serif] font-semibold text-transparent bg-gradient-to-r from-blue-300 to-purple-300 bg-clip-text">
                <span className="mr-2">📍</span> Delivery Address
              </h2>
            </div>
            <div className="bg-black/20 backdrop-blur-sm rounded-xl p-5 border border-blue-500/10">
              <p className="text-gray-300 leading-relaxed text-sm sm:text-base">
                Delivery of all orders will be made to the address provided by the buyer at the time of purchase. 
                Please ensure that the shipping address provided is accurate and complete to avoid any delivery delays or issues.
              </p>
            </div>
          </div>

          {/* Block 4 - Order Confirmation (LIGHT) */}
          <div className="group bg-gradient-to-br from-purple-100 via-blue-50 to-purple-50 rounded-2xl p-6 sm:p-8 md:p-10 mb-8 animate-fadeIn border border-purple-200 hover:border-purple-400 transition-all duration-500 hover:shadow-2xl hover:shadow-purple-500/20 hover:-translate-y-1" style={{ animationDelay: "0.4s" }}>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-1 h-8 bg-gradient-to-b from-purple-600 to-blue-600 rounded-full"></div>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-['Cormorant_Garamond',serif] font-semibold text-transparent bg-gradient-to-r from-purple-700 to-blue-700 bg-clip-text">
                <span className="mr-2">📧</span> Order Confirmation
              </h2>
            </div>
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-5 border border-purple-200">
              <p className="text-gray-700 leading-relaxed text-sm sm:text-base">
                Delivery of our services will be confirmed on your email ID as specified at the time of registration. 
                You will receive updates about your order status, tracking information, and delivery confirmation via email.
              </p>
            </div>
          </div>

          {/* Block 5 - Shipping Costs (DARK) */}
          <div className="group bg-gradient-to-br from-purple-900/20 to-blue-900/10 backdrop-blur-sm rounded-2xl p-6 sm:p-8 md:p-10 mb-8 animate-fadeIn border border-purple-500/20 hover:border-purple-500/50 transition-all duration-500 hover:shadow-2xl hover:shadow-purple-500/10 hover:-translate-y-1" style={{ animationDelay: "0.5s" }}>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-1 h-8 bg-gradient-to-b from-purple-400 to-blue-400 rounded-full"></div>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-['Cormorant_Garamond',serif] font-semibold text-transparent bg-gradient-to-r from-purple-300 to-blue-300 bg-clip-text">
                <span className="mr-2">💰</span> Shipping Costs
              </h2>
            </div>
            <div className="bg-black/20 backdrop-blur-sm rounded-xl p-5 border border-purple-500/10">
              <p className="text-gray-300 leading-relaxed text-sm sm:text-base">
                If there are any shipping cost(s) levied by the seller or the Platform Owner (as the case be), the same is not refundable. 
                Shipping charges, if applicable, will be displayed at the time of checkout.
              </p>
            </div>
          </div>

          {/* Block 6 - Tracking Information (LIGHT) */}
          <div className="group bg-gradient-to-br from-blue-100 via-purple-50 to-blue-50 rounded-2xl p-6 sm:p-8 md:p-10 mb-8 animate-fadeIn border border-blue-200 hover:border-blue-400 transition-all duration-500 hover:shadow-2xl hover:shadow-blue-500/20 hover:-translate-y-1" style={{ animationDelay: "0.6s" }}>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-1 h-8 bg-gradient-to-b from-blue-600 to-purple-600 rounded-full"></div>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-['Cormorant_Garamond',serif] font-semibold text-transparent bg-gradient-to-r from-blue-700 to-purple-700 bg-clip-text">
                <span className="mr-2">🔍</span> Track Your Order
              </h2>
            </div>
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-5 border border-blue-200">
              <p className="text-gray-700 leading-relaxed mb-4 text-sm sm:text-base">
                Once your order is shipped, you will receive a tracking number via email. You can track your order using:
              </p>
              <ul className="space-y-3">
                <li className="flex items-center gap-3 bg-white/40 backdrop-blur-sm rounded-lg p-3 border border-purple-100 hover:bg-white/60 transition-all duration-300">
                  <span className="text-2xl">📧</span>
                  <span className="text-gray-700 text-sm sm:text-base">The tracking link sent to your registered email</span>
                </li>
                <li className="flex items-center gap-3 bg-white/40 backdrop-blur-sm rounded-lg p-3 border border-purple-100 hover:bg-white/60 transition-all duration-300">
                  <span className="text-2xl">📱</span>
                  <span className="text-gray-700 text-sm sm:text-base">Your account dashboard under "My Orders"</span>
                </li>
                <li className="flex items-center gap-3 bg-white/40 backdrop-blur-sm rounded-lg p-3 border border-purple-100 hover:bg-white/60 transition-all duration-300">
                  <span className="text-2xl">💬</span>
                  <span className="text-gray-700 text-sm sm:text-base">Contacting our customer support with your order ID</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Block 7 - Need Help Section (DARK) */}
          <div className="text-center animate-fadeIn" style={{ animationDelay: "0.7s" }}>
            <div className="inline-block p-8 rounded-2xl bg-gradient-to-br from-purple-900/20 to-blue-900/10 backdrop-blur-sm border border-purple-500/20 hover:border-purple-500/50 transition-all duration-500 hover:shadow-2xl hover:shadow-purple-500/10 hover:-translate-y-1">
              <div className="flex items-center justify-center gap-3 mb-3">
                <span className="text-3xl animate-pulse">💬</span>
                <span className="text-3xl animate-pulse delay-100">🚚</span>
              </div>
              <p className="text-gray-300 text-lg font-medium mb-3">
                Have questions about your order delivery?
              </p>
              <div className="mt-4 flex flex-wrap justify-center gap-3">
  <a
    href="/contact"
    className="px-6 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:text-black hover:from-purple-200 hover:to-blue-200 rounded-lg hover:shadow-lg hover:shadow-purple-500/30 transition-all duration-300 text-sm font-medium hover:-translate-y-0.5"
  >
    Contact Support
  </a>
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

        @keyframes bounce {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.8s ease forwards;
          opacity: 0;
        }

        .animate-bounce {
          animation: bounce 2s ease-in-out infinite;
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
        .animate-fadeIn:nth-child(8) {
          animation-delay: 0.7s;
        }

        .delay-100 {
          animation-delay: 0.1s;
        }
        .delay-1000 {
          animation-delay: 1s;
        }
      `}</style>
    </>
  );
};

export default ShippingPolicy;