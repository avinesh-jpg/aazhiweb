// src/pages/ShippingPolicy.tsx
import React from 'react';
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const ShippingPolicy: React.FC = () => {
  return (
    <>
      <Navbar />
      
      <div className="min-h-screen bg-gradient-to-br from-[#1a1a2e] to-[#16213e] pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-[1320px] mx-auto">
          
          {/* Header Section */}
          <div className="text-center mb-12 animate-fadeIn">
            <div className="inline-flex items-center justify-center mb-4">
              <span className="text-4xl mr-2">🚚</span>
              <span className="text-4xl ml-2">📦</span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-['Cormorant_Garamond',serif] font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent mb-4">
              Shipping Policy
            </h1>
            <p className="text-gray-300 text-base sm:text-lg max-w-2xl mx-auto">
              100% Secure Delivery Across India
            </p>
          </div>

          {/* Main Content */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 mb-8 backdrop-blur-sm animate-fadeIn">
            
            {/* Delivery Information */}
            <div className="mb-8">
              <h2 className="text-xl sm:text-2xl font-semibold text-purple-400 mb-4 flex items-center">
                <span className="mr-2">📮</span> Delivery Information
              </h2>
              <p className="text-black-300 leading-relaxed mb-3">
                The orders for the user are delivered through registered domestic courier companies and/or speed post only. 
                We partner with trusted shipping partners to ensure your orders reach you safely and on time.
              </p>
              <p className="text-black-300 leading-relaxed">
                Orders are delivered within <span className="text-purple-400 font-semibold">12 days</span> from the date of the order and/or 
                payment or as per the delivery date agreed at the time of order confirmation and delivering of the shipment, 
                subject to courier company / post office norms.
              </p>
            </div>

            {/* Delivery Time Warning */}
            <div className="bg-yellow-500/10 border-l-4 border-yellow-500 p-4 mb-8 rounded-r-lg">
              <p className="text-yellow-400 text-sm">
                ⚠️ <span className="font-semibold">Note:</span> Platform Owner shall not be liable for any delay in delivery by the courier company / postal authority.
              </p>
            </div>

            {/* Address Information */}
            <div className="mb-8">
              <h2 className="text-xl sm:text-2xl font-semibold text-purple-400 mb-4 flex items-center">
                <span className="mr-2">📍</span> Delivery Address
              </h2>
              <p className="text-black-300 leading-relaxed">
                Delivery of all orders will be made to the address provided by the buyer at the time of purchase. 
                Please ensure that the shipping address provided is accurate and complete to avoid any delivery delays or issues.
              </p>
            </div>

            {/* Order Confirmation */}
            <div className="mb-8">
              <h2 className="text-xl sm:text-2xl font-semibold text-purple-400 mb-4 flex items-center">
                <span className="mr-2">📧</span> Order Confirmation
              </h2>
              <p className="text-black-300 leading-relaxed">
                Delivery of our services will be confirmed on your email ID as specified at the time of registration. 
                You will receive updates about your order status, tracking information, and delivery confirmation via email.
              </p>
            </div>

            {/* Shipping Costs */}
            <div className="mb-8">
              <h2 className="text-xl sm:text-2xl font-semibold text-purple-400 mb-4 flex items-center">
                <span className="mr-2">💰</span> Shipping Costs
              </h2>
              <p className="text-black-300 leading-relaxed">
                If there are any shipping cost(s) levied by the seller or the Platform Owner (as the case be), the same is not refundable. 
                Shipping charges, if applicable, will be displayed at the time of checkout.
              </p>
            </div>

            {/* Tracking Information */}
            <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-xl p-6 border border-purple-500/20">
              <h2 className="text-lg font-semibold text-purple-400 mb-3 flex items-center">
                <span className="mr-2">🔍</span> Track Your Order
              </h2>
              <p className="text-black-300 leading-relaxed mb-3">
                Once your order is shipped, you will receive a tracking number via email. You can track your order using:
              </p>
              <ul className="text-black-300 leading-relaxed list-disc list-inside space-y-1">
                <li>The tracking link sent to your registered email</li>
                <li>Your account dashboard under "My Orders"</li>
                <li>Contacting our customer support with your order ID</li>
              </ul>
            </div>
          </div>

          {/* Need Help Section */}
          <div className="text-center animate-fadeIn" style={{ animationDelay: "0.3s" }}>
            <div className="inline-block p-6 rounded-2xl bg-white from-purple-500/10 to-blue-500/10 border border-purple-500/30">
              <p className="text-black-300 mb-3">
                Have questions about your order delivery?
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

export default ShippingPolicy;