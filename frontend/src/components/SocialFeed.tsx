const reviewsData = [
  { 
    stars: 5, 
    text: "The quality of the organic jablas is absolutely amazing. My newborn's skin is so sensitive and these are the only clothes that don't cause any irritation. Will definitely order again!", 
    name: "Priya Ramesh", 
    location: "Chennai, Tamil Nadu" 
  },
  { 
    stars: 5, 
    text: "The Thottil from Aazhi is so beautifully made. My baby sleeps peacefully in it and the muslin fabric is so soft. Love the traditional yet modern design. Highly recommend!", 
    name: "Anitha Krishnan", 
    location: "Coimbatore, Tamil Nadu" 
  },
  { 
    stars: 5, 
    text: "I got the newborn essential kit as a gift for my sister and she absolutely loves it! The packaging was beautiful and every single piece is top quality. Aazhi is our go-to brand now.", 
    name: "Kavya Sundar", 
    location: "Bengaluru, Karnataka" 
  },
];

const SocialFeed = () => (
  <section className="py-20 md:py-28 bg-gradient-to-b from-white to-gray-50/50">
    <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8">
      {/* Section Header */}
      <div className="text-center mb-12">
        <span className="text-xs md:text-sm uppercase tracking-[0.2em] text-primary/70 font-semibold mb-3 inline-block">
          Happy Families
        </span>
        <h2 className="text-2xl md:text-3xl lg:text-4xl font-light text-foreground font-heading max-w-2xl mx-auto">
          What Mamas Are Saying
        </h2>
        <div className="w-16 h-0.5 bg-primary/30 mx-auto mt-4"></div>
      </div>

      {/* Reviews Grid */}
      <div className="grid md:grid-cols-3 gap-6 md:gap-8">
        {reviewsData.map((review, i) => (
          <div 
            key={i} 
            className="group relative bg-transparent rounded-2xl p-6 md:p-8 border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
          >
            {/* Stars - Moved to Top */}
            <div className="flex gap-0.5 mb-4 relative z-10">
              {[...Array(5)].map((_, idx) => (
                <svg 
                  key={idx} 
                  className={`w-4 h-4 ${idx < review.stars ? 'text-amber-400' : 'text-gray-200'}`} 
                  fill="currentColor" 
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            
            {/* Large Quote Icon - Moved below stars */}
            <div className="absolute top-150 left-6 font-serif text-7xl text-primary/10 group-hover:text-primary/15 transition-colors">
              "
            </div>
            
            {/* Review Text */}
            <p className="text-sm md:text-base leading-relaxed text-gray-600 italic relative z-10 min-h-[100px]">
              "{review.text}"
            </p>
            
            {/* Divider */}
            <div className="my-5 pt-4 border-t border-gray-100">
              <p className="text-sm font-semibold text-gray-800">{review.name}</p>
              <div className="flex items-center gap-1 mt-1">
                <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <p className="text-xs text-gray-400">{review.location}</p>
              </div>
            </div>

            {/* Decorative bottom line */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 group-hover:w-1/3 h-0.5 bg-primary/30 transition-all duration-300 rounded-full"></div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default SocialFeed;