// src/pages/ReturnPolicy.tsx
import React from 'react';
import { Helmet } from 'react-helmet-async';
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const ReturnPolicy: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>Return & Refund Policy | Aazhi Clothing</title>
        <meta name="description" content="Read Aazhi's return and refund policy. We offer no refunds or returns, except for damaged or defective products. Learn more about our policy terms and conditions." />
        <meta name="keywords" content="Aazhi return policy, refund policy, kids clothing return, Tiruppur clothing policy, no return policy, defective product replacement" />
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
              <span className="text-5xl mr-3 animate-bounce">🔄</span>
              <span className="text-5xl ml-3 animate-bounce delay-100">❌</span>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-['Cormorant_Garamond',serif] font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent mb-4">
              Return & Refund Policy
            </h1>
            <p className="text-gray-300 text-base sm:text-lg max-w-2xl mx-auto">
              Please read our policy carefully before making a purchase
            </p>
          </div>

          {/* Block 1 - No Refund Policy (DARK) */}
          <div className="group bg-gradient-to-br from-purple-900/30 to-purple-700/10 backdrop-blur-sm rounded-2xl p-6 sm:p-8 md:p-10 mb-8 animate-fadeIn border border-purple-500/20 hover:border-purple-500/50 transition-all duration-500 hover:shadow-2xl hover:shadow-purple-500/10 hover:-translate-y-1" style={{ animationDelay: "0.1s" }}>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-1 h-8 bg-gradient-to-b from-purple-400 to-blue-400 rounded-full"></div>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-['Cormorant_Garamond',serif] font-semibold text-transparent bg-gradient-to-r from-purple-300 to-blue-300 bg-clip-text">
                <span className="mr-2">🚫</span> No Refund Policy
              </h2>
            </div>
            <div className="bg-black/20 backdrop-blur-sm rounded-xl p-5 border border-purple-500/10">
              <p className="text-gray-300 leading-relaxed text-sm sm:text-base">
                At Aazhi Clothing, we do not offer any refunds under any circumstances once an order has been placed. 
                We highly encourage customers to review their orders carefully before confirming the purchase. 
                Please ensure that you are fully satisfied with your selection before completing the transaction.
              </p>
            </div>
          </div>

          {/* Block 2 - No Return Policy (LIGHT) */}
          <div className="group bg-gradient-to-br from-purple-100 via-blue-50 to-purple-50 rounded-2xl p-6 sm:p-8 md:p-10 mb-8 animate-fadeIn border border-purple-200 hover:border-purple-400 transition-all duration-500 hover:shadow-2xl hover:shadow-purple-500/20 hover:-translate-y-1" style={{ animationDelay: "0.2s" }}>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-1 h-8 bg-gradient-to-b from-purple-600 to-blue-600 rounded-full"></div>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-['Cormorant_Garamond',serif] font-semibold text-transparent bg-gradient-to-r from-purple-700 to-blue-700 bg-clip-text">
                <span className="mr-2">📦</span> No Return Policy
              </h2>
            </div>
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-5 border border-purple-200">
              <p className="text-gray-700 leading-relaxed mb-3 text-sm sm:text-base">
                We also have a strict no-return policy in place. Once a product has been purchased, we do not accept any returns. 
                Please ensure that you check all details regarding size, color, and design before placing your order.
              </p>
              <p className="text-gray-700 leading-relaxed text-sm sm:text-base">
                If you are unsure about any product, feel free to contact our support team for more information before completing your purchase.
              </p>
            </div>
          </div>

          {/* Block 3 - Exceptions to the Policy (DARK) */}
          <div className="group bg-gradient-to-br from-blue-900/30 to-purple-700/10 backdrop-blur-sm rounded-2xl p-6 sm:p-8 md:p-10 mb-8 animate-fadeIn border border-blue-500/20 hover:border-blue-500/50 transition-all duration-500 hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-1" style={{ animationDelay: "0.3s" }}>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-1 h-8 bg-gradient-to-b from-blue-400 to-purple-400 rounded-full"></div>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-['Cormorant_Garamond',serif] font-semibold text-transparent bg-gradient-to-r from-blue-300 to-purple-300 bg-clip-text">
                <span className="mr-2">⭐</span> Exceptions to the Policy
              </h2>
            </div>
            <p className="text-gray-300 leading-relaxed mb-5 text-sm sm:text-base">
              Although we do not offer returns or refunds in most cases, we may consider exceptions in the following instances:
            </p>
            <div className="space-y-4">
              <div className="bg-black/20 backdrop-blur-sm rounded-xl p-5 border border-purple-500/10 hover:border-purple-500/30 transition-all duration-300">
                <div className="flex items-start gap-3">
                  <span className="text-purple-400 text-xl mt-0.5">•</span>
                  <div>
                    <p className="text-gray-300 leading-relaxed text-sm sm:text-base">
                      <span className="text-purple-300 font-semibold">Damaged or Defective Products:</span> If the product you received is damaged or defective, 
                      you must report the issue within <span className="text-purple-400 font-semibold">10 days</span> of receiving your order. 
                      We will assess the situation and may offer a replacement or credit depending on the nature of the issue.
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-black/20 backdrop-blur-sm rounded-xl p-5 border border-blue-500/10 hover:border-blue-500/30 transition-all duration-300">
                <div className="flex items-start gap-3">
                  <span className="text-blue-400 text-xl mt-0.5">•</span>
                  <div>
                    <p className="text-gray-300 leading-relaxed text-sm sm:text-base">
                      <span className="text-blue-300 font-semibold">Wrong Product Received:</span> If the product you received is not as described on our website 
                      (wrong color, size, or product), please report it to us within <span className="text-blue-400 font-semibold">10 days</span> of delivery, 
                      and we may offer a resolution.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Block 4 - Process for Reporting Issues (LIGHT) */}
          <div className="group bg-gradient-to-br from-blue-100 via-purple-50 to-blue-50 rounded-2xl p-6 sm:p-8 md:p-10 mb-8 animate-fadeIn border border-blue-200 hover:border-blue-400 transition-all duration-500 hover:shadow-2xl hover:shadow-blue-500/20 hover:-translate-y-1" style={{ animationDelay: "0.4s" }}>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-1 h-8 bg-gradient-to-b from-blue-600 to-purple-600 rounded-full"></div>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-['Cormorant_Garamond',serif] font-semibold text-transparent bg-gradient-to-r from-blue-700 to-purple-700 bg-clip-text">
                <span className="mr-2">📝</span> Process for Reporting Issues
              </h2>
            </div>
            <p className="text-gray-700 leading-relaxed mb-5 text-sm sm:text-base">
              If you encounter any issues with your order, please get in touch with our customer service team immediately. 
              Please provide:
            </p>
            <div className="grid sm:grid-cols-2 gap-4 mb-5">
              <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-purple-200 flex items-center gap-3 hover:bg-white/80 transition-all duration-300">
                <span className="text-2xl">🆔</span>
                <span className="text-gray-700 font-medium">Your order number</span>
              </div>
              <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-purple-200 flex items-center gap-3 hover:bg-white/80 transition-all duration-300">
                <span className="text-2xl">📸</span>
                <span className="text-gray-700 font-medium">Photos of the product (if applicable)</span>
              </div>
              <div className="sm:col-span-2 bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-purple-200 flex items-center gap-3 hover:bg-white/80 transition-all duration-300">
                <span className="text-2xl">📋</span>
                <span className="text-gray-700 font-medium">A detailed description of the issue</span>
              </div>
            </div>
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-5 border border-blue-200">
              <p className="text-gray-700 leading-relaxed text-sm sm:text-base">
                Our team will evaluate your request and work with you to find the best solution.
              </p>
            </div>
          </div>

          {/* Block 5 - Final Notes (DARK) */}
          <div className="group bg-gradient-to-br from-purple-900/20 to-blue-900/10 backdrop-blur-sm rounded-2xl p-6 sm:p-8 md:p-10 mb-8 animate-fadeIn border border-purple-500/20 hover:border-purple-500/50 transition-all duration-500 hover:shadow-2xl hover:shadow-purple-500/10 hover:-translate-y-1" style={{ animationDelay: "0.5s" }}>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-1 h-8 bg-gradient-to-b from-purple-400 to-blue-400 rounded-full"></div>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-['Cormorant_Garamond',serif] font-semibold text-transparent bg-gradient-to-r from-purple-300 to-blue-300 bg-clip-text">
                <span className="mr-2">📌</span> Final Notes
              </h2>
            </div>
            <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-xl p-5 border border-purple-500/20">
              <p className="text-gray-300 leading-relaxed mb-4 text-sm sm:text-base">
                Please review your orders thoroughly before confirming your purchase, as we will not accept returns or offer refunds 
                unless the product is defective or not as described.
              </p>
              <div className="bg-black/20 backdrop-blur-sm rounded-lg p-4 border border-purple-500/10">
                <p className="text-gray-200 leading-relaxed text-sm sm:text-base font-medium text-center">
                  ⚖️ By placing an order with <span className="text-purple-300 font-semibold">Aazhi Clothing</span>, you agree to these terms and conditions.
                </p>
              </div>
            </div>
          </div>

          {/* Block 6 - Need Help Section (LIGHT) */}
          <div className="text-center animate-fadeIn" style={{ animationDelay: "0.6s" }}>
            <div className="inline-block p-8 rounded-2xl bg-gradient-to-br from-purple-100 via-blue-50 to-purple-50 border border-purple-200 hover:border-purple-400 transition-all duration-500 hover:shadow-2xl hover:shadow-purple-500/20 hover:-translate-y-1">
              <div className="flex items-center justify-center gap-3 mb-3">
                <span className="text-3xl animate-pulse">💬</span>
                <span className="text-3xl animate-pulse delay-100">❤️</span>
              </div>
              <p className="text-gray-700 text-lg font-medium mb-3">
                Have questions about our return policy?
              </p>
              <p className="text-gray-600 text-sm">
                Our team is here to help you!
              </p>
              <div className="mt-4 flex justify-center gap-4">
  <a
    href="/contact"
    className="px-6 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:text-black hover:from-purple-200 hover:to-blue-200 rounded-lg hover:shadow-lg hover:shadow-purple-500/30 transition-all duration-300 text-sm font-medium hover:-translate-y-0.5"
  >
    Contact Us
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

export default ReturnPolicy;