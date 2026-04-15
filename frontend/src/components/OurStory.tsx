import storyImg from "@/assets/our-story.jpg";

const OurStory = () => (
  <section className="bg-secondary py-20 md:py-28 px-4 sm:px-6 lg:px-8">
    <div className="max-w-[1320px] mx-auto grid md:grid-cols-2 gap-12 md:gap-20 items-center">
      <div className="relative reveal">
        <div className="rounded-2xl overflow-hidden">
          <img src={storyImg} alt="Our Story" loading="lazy" className="w-full object-cover" style={{ height: 560 }} />
        </div>
        <div className="absolute -bottom-4 -right-4 md:bottom-8 md:-right-6 bg-primary text-primary-foreground px-5 py-4 rounded-xl shadow-xl">
          <span className="block text-[0.6rem] uppercase tracking-[0.1em] opacity-80 mb-0.5">Est.</span>
          <span className="font-['Cormorant_Garamond',serif] text-xl font-semibold">Since 2023</span>
        </div>
      </div>
      <div className="reveal reveal-d2">
        <span className="section-label">Our Journey</span>
        <h2 className="section-heading mb-6">Our Story</h2>
        <p className="font-body text-muted-foreground leading-relaxed mb-4 text-[0.92rem]">
          Aazhi grew from a mother's relentless pursuit of perfection in baby fashion. With the arrival of our second little miracle, finding exquisitely crafted, cozy clothing became an obsession. Dissatisfied with the choices, we decided to create our own.
        </p>
        <p className="font-body text-muted-foreground leading-relaxed mb-4 text-[0.92rem]">
          Nurtured with love and dedication, Aazhi emerged, offering a collection designed for ages 0 to 5. Each piece embodies our belief that every baby and toddler deserves to be wrapped in comfort and dressed in elegance.
        </p>
        <p className="font-body text-muted-foreground leading-relaxed mb-8 text-[0.92rem]">
          Every stitch is guided by a mother's instinct — safe, soft, sustainable, and simply beautiful.
        </p>
        <p className="font-['Cormorant_Garamond',serif] text-foreground font-medium italic text-lg mb-8">
          "Where love, comfort, and style unite to dress your little ones in nothing but the finest."
        </p>
        <a href="#" className="inline-block px-8 py-3.5 bg-primary text-primary-foreground text-[0.72rem] font-bold uppercase tracking-[0.16em] rounded-sm hover:bg-primary/85 transition-all hover:-translate-y-0.5">
          Read Our Story
        </a>
      </div>
    </div>
  </section>
);

export default OurStory;
