import { Link } from "react-router-dom";
import colJablas from "@/assets/towel.png";
import colEssentials from "@/assets/girls1.png";
import colFrocks from "@/assets/girls.png";
import colTowels from "@/assets/newborn.png";
import colBooties from "@/assets/unisex.png";
import colCoords from "@/assets/boys.png";

const collections = [
  { label: "Newborn", image: colJablas, type: "collection", value: "newborn" },
  { label: "Girls", image: colEssentials, type: "collection", value: "Girls" },
  { label: "Frocks", image: colFrocks, type: "subcategory", value: "frocks" },
  { label: "Boys", image: colCoords, type: "collection", value: "Boys" },
  { label: "Muslin Hooded Towels", image: colTowels, type: "collection", value: "bathing" },
  { label: "Unisex", image: colBooties, type: "collection", value: "UniSex" },
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
  to={`/category/${col.type}/${col.value}`}
  className="group relative overflow-hidden rounded-3xl bg-gray-100"
>
  {/* Image */}
  <img
    src={col.image}
    alt={col.label}
    loading="lazy"
    className="aspect-square w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
  />

  {/* Permanent Gradient Overlay */}
  <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/15 to-transparent"></div>

  {/* Content - Always Visible */}
  <div className="absolute bottom-0 left-0 w-full p-5">
<h3 className="inline-block -ml-5 bg-gradient-to-r from-violet-600/90 to-indigo-600/90 px-2 py-2 text-sm font-bold text-white shadow-xl">
  {col.label}
</h3>

    <div className="mt-2 flex items-center gap-2">
      <span className="text-sm -ml-3 font-medium text-white border-b border-white/50 transition-all duration-300 group-hover:border-white">
        Shop Now
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
};

export default ShopByCollections;
