import { Link } from "react-router-dom";
import colJablas from "@/assets/towel.png";
import colEssentials from "@/assets/girls1.png";
import colFrocks from "@/assets/girls.png";
import colTowels from "@/assets/newborn.png";
import colBooties from "@/assets/unisex.png";
import colCoords from "@/assets/boys.png";

const collections = [
  { label: "Newborn", image: colJablas, category: "newborn" },
  { label: "Girls", image: colEssentials, category: "newborn" },
  { label: "Frocks", image: colFrocks, category: "clothing" },
  { label: "Boys", image: colCoords, category: "clothing" },
  { label: "Muslin Hooded Towels", image: colTowels, category: "bathing" },
  { label: "Unisex", image: colBooties, category: "accessories" },
];

const ShopByCollections = () => {
  return (
    <section className="pt-6 pb-10 px-4 sm:px-6 lg:px-8 max-w-[1320px] mx-auto relative">

      {/* Background glow */}
      <div className="absolute top-10 left-0 w-48 h-48 bg-purple-200/20 rounded-full blur-2xl -z-10"></div>
      <div className="absolute bottom-10 right-0 w-56 h-56 bg-blue-200/20 rounded-full blur-2xl -z-10"></div>

      {/* Heading */}
      <div className="mb-8 text-center md:text-left">
        <span className="text-xs uppercase tracking-[0.2em] font-semibold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
          Curated for your little one
        </span>

        <h2 className="text-2xl md:text-3xl font-semibold mt-2 text-gray-800">
          Shop by Collections
        </h2>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-5">
        {collections.map((col, i) => (
          <Link
            key={i}
            to={`/category/collection/${col.category}`}
            className="relative overflow-hidden rounded-2xl cursor-pointer"
          >
            {/* Image (NO hover here) */}
            <img
              src={col.image}
              alt={col.label}
              loading="lazy"
              className="w-full h-full object-cover aspect-square"
            />

            {/* Text */}
            <div className="absolute bottom-3 left-3 right-3">
              <h3 className="text-sm md:text-base font-semibold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
                {col.label}
              </h3>

              {/* 🔥 Hover ONLY HERE */}
              <span className="mt-2 inline-block text-[10px] font-semibold px-3 py-1 rounded-full border border-purple-300 text-purple-600 transition-all duration-300 hover:bg-gradient-to-r hover:from-purple-500 hover:to-blue-500 hover:text-white hover:border-transparent hover:shadow-md">
                Shop Now →
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default ShopByCollections;
