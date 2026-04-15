import hero1 from "@/assets/hero-1.jpg";
import hero2 from "@/assets/hero-2.jpg";
import hero3 from "@/assets/hero-3.jpg";
import colJablas from "@/assets/col-jablas.jpg";
import colFrocks from "@/assets/col-frocks.jpg";
import colCoords from "@/assets/col-coords.jpg";

const photos = [hero1, hero2, hero3, colJablas, colFrocks, colCoords];

const InstagramStrip = () => (
  <div className="bg-secondary py-12 px-0 text-center">
    <div className="px-4 mb-8 reveal">
      <span className="section-label">Follow along</span>
      <div className="flex items-center justify-center gap-2 mt-1">
        <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
        <span className="font-['Cormorant_Garamond',serif] text-2xl text-primary">@Aazhi</span>
      </div>
    </div>
    <div className="flex gap-1.5 overflow-x-auto px-4 pb-1 scrollbar-hide">
      {photos.map((src, i) => (
        <div key={i} className="flex-shrink-0 w-44 h-44 md:w-56 md:h-56 rounded-xl overflow-hidden relative group cursor-pointer">
          <img src={src} alt={`Instagram ${i + 1}`} loading="lazy" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
          <div className="absolute inset-0 bg-primary/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <svg width="26" height="26" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default InstagramStrip;
