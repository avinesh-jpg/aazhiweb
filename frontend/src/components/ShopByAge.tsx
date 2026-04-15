import { Link } from "react-router-dom";
import age03 from "@/assets/age-0-3.jpg";
import age36 from "@/assets/age-3-6.jpg";
import age612 from "@/assets/age-6-12.jpg";
import age110 from "@/assets/age-1-10.jpg";

const ages = [
  { label: "0–3 Months", sub: "Newborn essentials", image: age03, ageRange: "0-3" },
  { label: "3–6 Months", sub: "Growing & exploring", image: age36, ageRange: "3-6" },
  { label: "6–12 Months", sub: "Active little ones", image: age612, ageRange: "6-12" },
  { label: "1–10 Years", sub: "Kids fashion & comfort", image: age110, ageRange: "1-10" },
];

const ShopByAge = () => (
  <section className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 max-w-[1320px] mx-auto">
    <div className="mb-10 md:mb-14 reveal">
      <span className="section-label">Find the perfect fit</span>
      <h2 className="section-heading">Shop by Age</h2>
    </div>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5">
      {ages.map((age, i) => (
        <Link 
          key={age.label} 
          to={`/category/age/${age.ageRange}`}
          className={`group relative overflow-hidden rounded-xl cursor-pointer reveal reveal-d${i}`} 
          style={{ aspectRatio: "3/4" }}
        >
          <img src={age.image} alt={age.label} loading="lazy" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
          <div className="absolute inset-x-0 bottom-0 p-4 md:p-5" style={{ background: "linear-gradient(to top, rgba(44,58,53,0.75) 0%, transparent 100%)" }}>
            <h3 className="text-lg md:text-xl font-medium text-white" style={{ fontFamily: "'Cormorant Garamond', serif" }}>{age.label}</h3>
            <p className="text-white/75 text-[0.72rem] mt-0.5">{age.sub}</p>
          </div>
        </Link>
      ))}
    </div>
  </section>
);

export default ShopByAge;