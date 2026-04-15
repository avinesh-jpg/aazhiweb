import AnnouncementBar from "@/components/AnnouncementBar";
import Navbar from "@/components/Navbar";
import HeroSlideshow from "@/components/HeroSlideshow";
import FeatureStrip from "@/components/FeatureStrip";
import ShopByAge from "@/components/ShopByAge";
import ShopByCollections from "@/components/ShopByCollections";
import Bestsellers from "@/components/Bestsellers";
import ThottilHighlight from "@/components/ThottilHighlight";
import OurStory from "@/components/OurStory";
import Testimonials from "@/components/Testimonials";
import InstagramStrip from "@/components/InstagramStrip";
import Newsletter from "@/components/Newsletter";
import Footer from "@/components/Footer";
import BackToTop from "@/components/BackToTop";
import useScrollReveal from "@/hooks/useScrollReveal";

const Index = () => {
  useScrollReveal();

  return (
    <div className="min-h-screen bg-background">
      <AnnouncementBar />
      <Navbar />
      <main>
        <HeroSlideshow />
        <FeatureStrip />
        <ShopByAge />
        <ShopByCollections />
        <ThottilHighlight />
        <OurStory />
        <Testimonials />
        <InstagramStrip />
        <Newsletter />
      </main>
      <Footer />
      <BackToTop />
    </div>
  );
};

export default Index;
