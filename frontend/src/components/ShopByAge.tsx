import { Link } from "react-router-dom";
import age03 from "@/assets/age-0-3.jpg";
import age36 from "@/assets/age-3-6.jpg";
import age612 from "@/assets/age-6-12.jpg";
import age110 from "@/assets/age-1-10.jpg";

const ages = [
  { label: "0–24 Months", sub: "Newborn essentials", image: age03, ageRange: "0-24", path: "/category/collection/newborn" },
  { label: "2–12 Years", sub: "Growing & exploring", image: age36, ageRange: "2-12",path: "/category/collection/boys" },
  { label: "6–12 Months", sub: "Active little ones", image: age612, ageRange: "6-12", path: "/category/collection/girls" },
  { label: "1–10 Years", sub: "Kids fashion & comfort", image: age110, ageRange: "1-10", path: "/category/collection/unisex" },
];

const ShopByAge = () => (
  <section className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 max-w-[1320px] mx-auto relative">
    
    {/* Soft background glow */}
    <div className="absolute top-20 right-0 w-64 h-64 bg-purple-200/20 rounded-full blur-3xl -z-10"></div>
    <div className="absolute bottom-20 left-0 w-80 h-80 bg-blue-200/20 rounded-full blur-3xl -z-10"></div>
    
    <div className="mb-10 md:mb-14 text-center md:text-left">
      <span className="inline-block text-xs md:text-sm uppercase tracking-[0.2em] font-semibold mb-3 bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
        Find the perfect fit
      </span>

      <h2 className="text-3xl md:text-4xl font-light font-heading text-gray-800">
        Shop by Age
      </h2>
    </div>
    
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5">
      {ages.map((age, i) => (
        <Link 
          key={age.label} 
          to={`/category/age/${age.ageRange}`}
          className="group relative overflow-hidden rounded-2xl cursor-pointer transition-all duration-500 hover:shadow-lg hover:-translate-y-1"
          style={{ aspectRatio: "3/4" }}
        >
          <img 
            src={age.image} 
            alt={age.label} 
            loading="lazy" 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
          />

          {/* TEXT WITHOUT OVERLAY */}
          <div className="absolute bottom-3 left-3 right-3">
            <h3 className="text-lg font-semibold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent drop-shadow-sm">
              {age.label}
            </h3>
            <p className="text-xs bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
              {age.sub}
            </p>
          </div>

        </Link>
      ))}
    </div>
  </section>
);

export default ShopByAge;
