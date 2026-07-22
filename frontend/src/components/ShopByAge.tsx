import { Link } from "react-router-dom";
import age03 from "@/assets/age-0-3.jpg";
import age36 from "@/assets/age-3-6.jpg";
import age612 from "@/assets/age-6-12.jpg";
import age110 from "@/assets/age-1-10.jpg";

const ages = [
  { label: "0–3 Months", sub: "Newborn essentials", image: age03, ageRange: "0-24", path: "/category/collection/newborn" },
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
  className="group relative overflow-hidden rounded-3xl bg-gray-100"
  style={{ aspectRatio: "3/4" }}
>
  {/* Image */}
  <img
    src={age.image}
    alt={age.label}
    loading="lazy"
    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
  />

  {/* Permanent Gradient Overlay */}
  <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/15 to-transparent"></div>

  {/* Content - Always Visible */}
  <div className="absolute bottom-0 left-0 w-full p-5">
    <span className="inline-block -ml-5 bg-gradient-to-r from-violet-600/90 to-indigo-600/90 px-3 py-2 text-sm md:text-base font-bold text-white shadow-xl">
      {age.label}
    </span>

    <div className="mt-2 flex items-center gap-2">
      <span className="text-sm -ml-5 font-medium text-white border-b border-white/50 transition-all duration-300 group-hover:border-white">
        {age.sub}
      </span>

      <span className="text-white transition-all duration-300 group-hover:translate-x-2">
        →
      </span>
    </div>

  
  </div>

  {/* Hover Glow */}
  <div className="absolute inset-0 rounded-3xl ring-0 ring-purple-400/30 transition-all duration-500 group-hover:ring-4"></div>
</Link>
      ))}
    </div>
  </section>
);

export default ShopByAge;
