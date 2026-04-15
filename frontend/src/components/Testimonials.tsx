const testimonials = [
  { stars: 5, text: "The quality of the organic jablas is absolutely amazing. My newborn's skin is so sensitive and these are the only clothes that don't cause any irritation. Will definitely order again!", name: "Priya Ramesh", location: "Chennai, Tamil Nadu" },
  { stars: 5, text: "The Thottil from Aazhi is so beautifully made. My baby sleeps peacefully in it and the muslin fabric is so soft. Love the traditional yet modern design. Highly recommend!", name: "Anitha Krishnan", location: "Coimbatore, Tamil Nadu" },
  { stars: 5, text: "I got the newborn essential kit as a gift for my sister and she absolutely loves it! The packaging was beautiful and every single piece is top quality. Aazhi is our go-to brand now.", name: "Kavya Sundar", location: "Bengaluru, Karnataka" },
];

const Testimonials = () => (
  <section className="py-20 md:py-28 px-4 sm:px-6 lg:px-8">
    <div className="max-w-[1320px] mx-auto">
      <div className="text-center mb-12 reveal">
        <span className="section-label">Happy Families</span>
        <h2 className="section-heading">What Mamas Are Saying</h2>
      </div>
      <div className="grid md:grid-cols-3 gap-6">
        {testimonials.map((t, i) => (
          <div key={i} className={`bg-white rounded-2xl p-8 border border-border relative reveal reveal-d${i}`}>
            <div className="absolute top-2 left-5 font-['Cormorant_Garamond',serif] text-8xl leading-none text-accent/70">"</div>
            <div className="text-amber-400 tracking-wide mb-4 text-sm">{"★".repeat(t.stars)}</div>
            <p className="text-[0.88rem] leading-relaxed text-muted-foreground italic relative z-10">{t.text}</p>
            <div className="mt-5 pt-5 border-t border-border">
              <p className="text-[0.82rem] font-bold text-foreground">{t.name}</p>
              <p className="text-[0.72rem] text-muted-foreground mt-0.5">{t.location}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default Testimonials;
