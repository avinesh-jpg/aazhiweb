import { useState, useEffect } from "react";
import { ArrowUp } from "lucide-react";

const BackToTop = () => {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return visible ? (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="fixed bottom-8 right-8 z-50 w-11 h-11 bg-primary text-primary-foreground rounded-full flex items-center justify-center shadow-lg hover:-translate-y-1 transition-all"
      aria-label="Back to top"
    >
      <ArrowUp size={18} />
    </button>
  ) : null;
};

export default BackToTop;
