import React from 'react';
import { InstagramEmbed } from 'react-social-media-embed';

// Replace this with your actual Instagram post/reel URLs
const instagramContent = [
  { url: "https://www.instagram.com/reel/DZ9LSMywD53/" },
  { url: "https://www.instagram.com/reel/DZPA49nRGEP/" },
  { url: "https://www.instagram.com/reel/DZg5SYsuBa-/" },
];

const InstagramFeed = () => {
  return (
    <section className="py-12 md:py-16 bg-gradient-to-b from-white to-gray-50/50">
      <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-10">
          <span className="text-xs md:text-sm uppercase tracking-[0.2em] text-primary/70 font-semibold mb-2 inline-block">
            Follow Us
          </span>
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-light text-foreground font-heading max-w-2xl mx-auto">
            On Instagram
          </h2>
          <div className="w-16 h-0.5 bg-primary/30 mx-auto mt-3"></div>
        </div>

        {/* Instagram Grid */}
        <div className="grid md:grid-cols-3 gap-6 md:gap-8">
          {instagramContent.map((item, index) => (
            <div
              key={index}
              className="group relative bg-white rounded-2xl p-4 border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden"
            >
              <div className="aspect-square relative rounded-xl overflow-hidden bg-gray-50 flex items-center justify-center">
                <InstagramEmbed
                  url={item.url}
                  width="100%"
                  captioned={false}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Follow Link */}
        <div className="text-center mt-6">
          <a
            href="https://www.instagram.com/aazhi_clothing/reels/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block text-sm text-primary hover:text-primary/80 transition-colors"
          >
            @aazhi_Clothing 👈 Follow us for more
          </a>
        </div>

        {/* Follow Button */}
        <div className="text-center mt-8">
          <a
            href="https://www.instagram.com/aazhi_clothing/reels/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full hover:shadow-lg transition-all duration-300 hover:scale-105"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
            </svg>
            Follow @aazhi_clothing
          </a>
        </div>
      </div>
    </section>
  );
};

export default InstagramFeed;