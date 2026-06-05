// src/pages/ContactUs.tsx (Single Column)
import React from 'react';
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const ContactUs: React.FC = () => {
  return (
    <>
      <Navbar />
      
      <div className="min-h-screen bg-gradient-to-b from-[#1a1a2e] to-[#16213e] pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-[800px] mx-auto">
          
          <div className="text-center mb-10 animate-fadeIn">
            <h1 className="text-3xl sm:text-4xl font-['Cormorant_Garamond',serif] font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent mb-3">
              Contact Us
            </h1>
            <p className="text-white">We'd love to hear from you</p>
          </div>

          <div className="space-y-4 animate-fadeIn">
            <div className="bg-white rounded-xl p-5 flex items-center">
              <span className="text-2xl mr-4">📧</span>
              <div>
                <h3 className="text-purple-400 font-semibold">Email</h3>
                <p className="text-black-400">support@aazhi.com</p>
              </div>
            </div>

            <div className="bg-white rounded-xl p-5 flex items-center">
              <span className="text-2xl mr-4">📞</span>
              <div>
                <h3 className="text-purple-400 font-semibold">Phone</h3>
                <p className="text-black-400">+91 79048 41486 </p>
                <p className="text-black-500 text-sm">Mon-Sat, 10 AM - 7 PM</p>
              </div>
            </div>

            <div className="bg-white rounded-xl p-5 flex items-center">
              <span className="text-2xl mr-4">💬</span>
              <div>
                <h3 className="text-purple-400 font-semibold">WhatsApp</h3>
                <p className="text-black-400">+91 79048 41486 </p>
              </div>
            </div>

            <div className="bg-white rounded-xl p-5 flex items-start">
              <span className="text-2xl mr-4">📍</span>
              <div>
                <h3 className="text-purple-400 font-semibold">Address</h3>
                <p className="text-black-300">
                  Aazhi Clothing<br />
                  Ammapalayam<br />
                  Tirupur - 641652, Tamil Nadu
                </p>
              </div>
            </div>

            <div className="bg-white rounded-xl p-5 text-center">
              <h3 className="text-purple-400 font-semibold mb-2">Business Hours</h3>
              <p className="text-black-400">Mon-Fri: 9 AM - 6 PM</p>
              <p className="text-black-400">Sat: 10 AM - 6 PM</p>
              <p className="text-black-500">Sun: Closed</p>
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

export default ContactUs;