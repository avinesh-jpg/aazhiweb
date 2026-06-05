// src/pages/ReturnPolicy.tsx
import React from 'react';
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const ReturnPolicy: React.FC = () => {
  return (
    <>
      <Navbar />
      
      <div className="min-h-screen bg-gradient-to-br from-[#1a1a2e] to-[#16213e] pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-[1320px] mx-auto">
          
          {/* Header Section */}
          <div className="text-center mb-12 animate-fadeIn">
            <div className="inline-flex items-center justify-center mb-4">
              <span className="text-4xl mr-2">🔄</span>
              <span className="text-4xl ml-2">❌</span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-['Cormorant_Garamond',serif] font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent mb-4">
              Return & Refund Policy
            </h1>
            <p className="text-white text-base sm:text-lg max-w-2xl mx-auto">
              Please read our policy carefully before making a purchase
            </p>
          </div>

          {/* Main Content */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 mb-8 backdrop-blur-sm animate-fadeIn">
            
            {/* No Refund Policy */}
            <div className="mb-8 pb-8 border-b border-white/10">
              <h2 className="text-xl sm:text-2xl font-semibold text-purple-400 mb-4 flex items-center">
                <span className="mr-2">🚫</span> No Refund Policy
              </h2>
              <p className="text-black-300 leading-relaxed">
                At Aazhi Clothing, we do not offer any refunds under any circumstances once an order has been placed. 
                We highly encourage customers to review their orders carefully before confirming the purchase. 
                Please ensure that you are fully satisfied with your selection before completing the transaction.
              </p>
            </div>

            {/* No Return Policy */}
            <div className="mb-8 pb-8 border-b border-white/10">
              <h2 className="text-xl sm:text-2xl font-semibold text-purple-400 mb-4 flex items-center">
                <span className="mr-2">📦</span> No Return Policy
              </h2>
              <p className="text-black-300 leading-relaxed mb-3">
                We also have a strict no-return policy in place. Once a product has been purchased, we do not accept any returns. 
                Please ensure that you check all details regarding size, color, and design before placing your order.
              </p>
              <p className="text-black-300 leading-relaxed">
                If you are unsure about any product, feel free to contact our support team for more information before completing your purchase.
              </p>
            </div>

            {/* Exceptions to the Policy */}
            <div className="mb-8 pb-8 border-b border-white/10">
              <h2 className="text-xl sm:text-2xl font-semibold text-purple-400 mb-4 flex items-center">
                <span className="mr-2">⭐</span> Exceptions to the Policy
              </h2>
              <p className="text-black-300 leading-relaxed mb-4">
                Although we do not offer returns or refunds in most cases, we may consider exceptions in the following instances:
              </p>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <span className="text-purple-400 mr-2">•</span>
                  <span className="text-black-300 leading-relaxed">
                    <span className="font-semibold text-purple-300">Damaged or Defective Products:</span> If the product you received is damaged or defective, 
                    you must report the issue within <span className="text-purple-400 font-semibold">10 days</span> of receiving your order. 
                    We will assess the situation and may offer a replacement or credit depending on the nature of the issue.
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-400 mr-2">•</span>
                  <span className="text-black-300 leading-relaxed">
                    <span className="font-semibold text-purple-300">Wrong Product Received:</span> If the product you received is not as described on our website 
                    (wrong color, size, or product), please report it to us within <span className="text-purple-400 font-semibold">10 days</span> of delivery, 
                    and we may offer a resolution.
                  </span>
                </li>
              </ul>
            </div>

            {/* Process for Reporting Issues */}
            <div className="mb-8 pb-8 border-b border-white/10">
              <h2 className="text-xl sm:text-2xl font-semibold text-purple-400 mb-4 flex items-center">
                <span className="mr-2">📝</span> Process for Reporting Issues
              </h2>
              <p className="text-black-300 leading-relaxed mb-4">
                If you encounter any issues with your order, please get in touch with our customer service team immediately. 
                Please provide:
              </p>
              <ul className="space-y-2 mb-4">
                <li className="flex items-start">
                  <span className="text-purple-400 mr-2">✓</span>
                  <span className="text-black-300">Your order number</span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-400 mr-2">✓</span>
                  <span className="text-black-300">Photos of the product (if applicable)</span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-400 mr-2">✓</span>
                  <span className="text-black-300">A detailed description of the issue</span>
                </li>
              </ul>
              <p className="text-black-300 leading-relaxed">
                Our team will evaluate your request and work with you to find the best solution.
              </p>
            </div>

            {/* Final Notes */}
            <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-xl p-6 border border-purple-500/20">
              <h2 className="text-lg font-semibold text-purple-400 mb-3 flex items-center">
                <span className="mr-2">📌</span> Final Notes
              </h2>
              <p className="text-black-300 leading-relaxed mb-3">
                Please review your orders thoroughly before confirming your purchase, as we will not accept returns or offer refunds 
                unless the product is defective or not as described.
              </p>
              <p className="text-black-300 leading-relaxed font-medium">
                By placing an order with Aazhi Clothing, you agree to these terms and conditions.
              </p>
            </div>
          </div>

          {/* Need Help Section */}
          <div className="text-center animate-fadeIn" style={{ animationDelay: "0.3s" }}>
            <div className="inline-block p-6 rounded-2xl bg-white from-purple-500/10 to-blue-500/10 border border-purple-500/30">
              <p className="text-black-300 mb-3">
                Have questions about our return policy?
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

export default ReturnPolicy;