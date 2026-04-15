const shopLinks = ["New Born", "Clothing", "Bathing", "Bedding", "Thottil", "Nursery & Accessories"];
const helpLinks = ["Contact Us", "Shipping Policy", "Return Policy", "Size Guide", "FAQs", "Track My Order"];
const companyLinks = ["About Us", "Our Story", "Sustainability", "Privacy Policy", "Terms of Service"];

const Footer = () => (
  <footer className="bg-foreground text-background/65 pt-16 pb-8 px-4 sm:px-6 lg:px-8">
    <div className="max-w-[1320px] mx-auto">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10 pb-10 border-b border-background/10">
        {/* Brand */}
        <div>
          <h3 className="font-['Cormorant_Garamond',serif] text-2xl font-semibold text-background mb-3">
            <span className="text-primary">Aazhi</span>
          </h3>
          <p className="text-[0.82rem] leading-relaxed text-background/55 max-w-[240px]">
            Where love, comfort, and style unite to dress your little ones in nothing but the finest organic clothing and baby essentials.
          </p>
          <div className="flex gap-2.5 mt-5">
            {["Ig", "Fb", "WA", "YT"].map((s) => (
              <a key={s} href="#" className="w-9 h-9 rounded-full border border-background/20 flex items-center justify-center text-[0.65rem] font-bold text-background/55 hover:border-primary hover:bg-primary hover:text-primary-foreground transition-all">
                {s}
              </a>
            ))}
          </div>
        </div>
        {/* Shop */}
        <div>
          <h4 className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-background mb-4">Shop</h4>
          <ul className="space-y-2.5">
            {shopLinks.map((l) => <li key={l}><a href="#" className="text-[0.82rem] hover:text-primary transition-colors">{l}</a></li>)}
          </ul>
        </div>
        {/* Help */}
        <div>
          <h4 className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-background mb-4">Help</h4>
          <ul className="space-y-2.5">
            {helpLinks.map((l) => <li key={l}><a href="#" className="text-[0.82rem] hover:text-primary transition-colors">{l}</a></li>)}
          </ul>
        </div>
        {/* Company */}
        <div>
          <h4 className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-background mb-4">Company</h4>
          <ul className="space-y-2.5">
            {companyLinks.map((l) => <li key={l}><a href="#" className="text-[0.82rem] hover:text-primary transition-colors">{l}</a></li>)}
          </ul>
          <div className="mt-6 pt-6 border-t border-background/10">
            <h4 className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-background mb-3">Secure Payments</h4>
            <div className="flex flex-wrap gap-1.5">
              {["UPI","Visa","MC","RuPay","Net Banking"].map((p) => (
                <span key={p} className="bg-background/10 text-background/60 text-[0.58rem] font-bold px-2 py-1 rounded">{p}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[0.72rem] text-background/35">
        <span>© 2024 Aazhi. All rights reserved. Made with ♥ for little ones.</span>
        <span>Designed & Developed with Love</span>
      </div>
    </div>
  </footer>
);

export default Footer;
