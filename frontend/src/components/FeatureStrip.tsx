import { Truck, ShieldCheck, Heart, RefreshCw } from "lucide-react";

const features = [
  { icon: Truck, title: "Free Shipping", desc: "On orders above Rs.3000" },
  { icon: ShieldCheck, title: "100% Organic", desc: "Safe, soft & skin-friendly" },
  { icon: Heart, title: "Made with Love", desc: "Crafted by mothers, for babies" },
  { icon: RefreshCw, title: "Easy Returns", desc: "Hassle-free 7-day returns" },
];

const FeatureStrip = () => (
  <div className="bg-accent/40 border-y border-border py-8">
    <div className="max-w-[1320px] mx-auto px-4 sm:px-8 grid grid-cols-2 md:grid-cols-4 gap-6">
      {features.map(({ icon: Icon, title, desc }, i) => (
        <div key={i} className={`reveal reveal-d${i} flex items-center gap-3.5`}>
          <div className="w-11 h-11 rounded-full bg-primary flex items-center justify-center text-primary-foreground flex-shrink-0">
            <Icon size={18} />
          </div>
          <div>
            <h4 className="text-[0.8rem] font-bold text-foreground">{title}</h4>
            <p className="text-[0.72rem] text-muted-foreground mt-0.5">{desc}</p>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default FeatureStrip;
