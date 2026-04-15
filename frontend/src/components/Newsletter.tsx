import { useState } from "react";

const Newsletter = () => {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) { setSubmitted(true); setEmail(""); }
  };

  return (
    <section className="bg-primary py-16 md:py-20 px-4 text-center">
      <div className="max-w-xl mx-auto reveal">
        <span className="block text-[0.68rem] font-bold uppercase tracking-[0.2em] text-primary-foreground/70 mb-1">Stay in the loop</span>
        <h2 className="font-['Cormorant_Garamond',serif] text-3xl md:text-4xl font-light text-primary-foreground mb-3">Join the Aazhi Family</h2>
        <p className="text-primary-foreground/75 text-[0.88rem] mb-7">Subscribe for exclusive offers, new arrivals, parenting tips & early access to seasonal collections.</p>
        {submitted ? (
          <div className="bg-white/15 rounded-lg px-6 py-4 text-primary-foreground font-semibold">
            🎉 Thank you for subscribing! Welcome to the family.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex max-w-md mx-auto overflow-hidden rounded-sm border-2 border-white/40">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              className="flex-1 bg-white/12 text-primary-foreground placeholder-primary-foreground/55 px-4 py-3 text-[0.85rem] outline-none border-none"
              required
            />
            <button type="submit" className="bg-white text-primary font-bold text-[0.7rem] uppercase tracking-[0.14em] px-5 hover:bg-primary-foreground/90 transition-colors flex-shrink-0">
              Subscribe
            </button>
          </form>
        )}
      </div>
    </section>
  );
};

export default Newsletter;
