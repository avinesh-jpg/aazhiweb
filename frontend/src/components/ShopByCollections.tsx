import { Link } from "react-router-dom";
import colJablas from "@/assets/col-jablas.jpg";
import colEssentials from "@/assets/col-essentials.jpg";
import colFrocks from "@/assets/col-frocks.jpg";
import colTowels from "@/assets/col-towels.jpg";
import colBooties from "@/assets/col-booties.jpg";
import colCoords from "@/assets/col-coords.jpg";

const collections = [
  { label: "Organic Jablas & Nappies", image: colJablas, category: "newborn" },
  { label: "Newborn Essential Kit", image: colEssentials, category: "newborn" },
  { label: "Frocks", image: colFrocks, category: "clothing" },
  { label: "Boys Co-Ord Sets", image: colCoords, category: "clothing" },
  { label: "Muslin Hooded Towels", image: colTowels, category: "bathing" },
  { label: "Mittens & Booties", image: colBooties, category: "accessories" },
];

const ShopByCollections = () => {
  return (
    <section
      id="collections"
      className="pt-6 pb-10 px-4 sm:px-6 lg:px-8 max-w-[1320px] mx-auto"
    >
      {/* Heading */}
      <div className="mb-8">
        <span className="text-xs uppercase tracking-widest text-gray-500">
          Curated for your little one
        </span>
        <h2 className="text-2xl md:text-3xl font-semibold mt-2">
          Shop by Collections
        </h2>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-5">
        {collections.map((col, i) => (
          <Link
            key={i}
            to={`/category/collection/${col.category}`} // ✅ correct navigation
            className="group relative overflow-hidden rounded-xl cursor-pointer"
          >
            {/* Image */}
            <img
              src={col.image}
              alt={col.label}
              loading="lazy"
              className="w-full h-full object-cover aspect-square transition-transform duration-500 group-hover:scale-105"
            />

            {/* Overlay */}
            <div className="absolute inset-0 flex flex-col justify-end p-4 bg-gradient-to-t from-black/60 to-transparent">
              <h3 className="text-white text-sm md:text-base font-medium">
                {col.label}
              </h3>

              <span className="mt-2 text-[10px] text-white border border-white/60 px-3 py-1 w-fit">
                Shop Now
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default ShopByCollections;