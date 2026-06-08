import { Truck, ShieldCheck, Heart, RefreshCw } from "lucide-react";

const features = [
  { icon: Truck, title: "Free Shipping", desc: "On orders above Rs.2000" },
  { icon: ShieldCheck, title: "100% Premium Cotton", desc: "Safe, soft & skin-friendly" },
  { icon: Heart, title: "Made with Love", desc: "Crafted by mothers, for babies" },
  { icon: RefreshCw, title: "Express 3 Days Delivery", desc: "Get your order in 3 days" },
];

const FeatureStrip = () => (
  <div className="bg-gradient-to-r from-purple-50/50 via-white to-blue-50/50 border-y border-purple-100 py-8">
    <div className="max-w-[1320px] mx-auto px-4 sm:px-8 grid grid-cols-2 md:grid-cols-4 gap-6">
      {features.map(({ icon: Icon, title, desc }, i) => (
        <div 
          key={i} 
          className="group flex items-center gap-3.5 transition-all duration-300 hover:-translate-y-1 animate-fadeIn"
          style={{ animationDelay: `${i * 0.1}s` }}
        >
          <div className="w-11 h-11 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center text-white flex-shrink-0 shadow-md transition-all duration-300 group-hover:scale-110 group-hover:shadow-purple-300/30">
            <Icon size={18} />
          </div>
          <div>
            <h4 className="text-[0.8rem] font-bold text-[#1e1b4b] group-hover:text-purple-600 transition-colors duration-300">
              {title}
            </h4>
            <p className="text-[0.72rem] text-gray-500 mt-0.5 group-hover:text-gray-600 transition-colors duration-300">
              {desc}
            </p>
          </div>
        </div>
      ))}
    </div>

    <style>{`
      @keyframes fadeIn {
        from {
          opacity: 0;
          transform: translateY(10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      
      .animate-fadeIn {
        animation: fadeIn 0.4s ease forwards;
        opacity: 0;
      }
    `}</style>
  </div>
);

export default FeatureStrip;