// src/pages/Index.tsx
import { Helmet } from 'react-helmet-async';
import AnnouncementBar from "@/components/AnnouncementBar";
import Navbar from "@/components/Navbar";
import HeroSlideshow from "@/components/HeroSlideshow";
import FeatureStrip from "@/components/FeatureStrip";
import ShopByAge from "@/components/ShopByAge";
import ShopByCollections from "@/components/ShopByCollections";
import Bestsellers from "@/components/Bestsellers";
import ComboOffers from "@/components/ComboOffers";
import ThottilHighlight from "@/components/ThottilHighlight";
import OurStory from "@/components/OurStory";
import Testimonials from "@/components/Testimonials";
import Newsletter from "@/components/Newsletter";
import Footer from "@/components/Footer";
import BackToTop from "@/components/BackToTop";
import useScrollReveal from "@/hooks/useScrollReveal";
import SocialFeed from "@/components/SocialFeed";
import { SEOUtils } from "@/lib/seo";

const Index = () => {
  useScrollReveal();

  return (
    <>
      <Helmet>
        <title>{SEOUtils.getHomeTitle()}</title>
        <meta name="description" content={SEOUtils.getHomeDescription()} />
        <meta name="keywords" content={SEOUtils.getHomeKeywords().join(', ')} />
        
        <meta property="og:title" content={SEOUtils.getHomeTitle()} />
        <meta property="og:description" content={SEOUtils.getHomeDescription()} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://aazhi.com" />
        
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={SEOUtils.getHomeTitle()} />
        <meta name="twitter:description" content={SEOUtils.getHomeDescription()} />
        
        <link rel="canonical" href="https://aazhi.com" />
      </Helmet>

      <div className="min-h-screen bg-background">
        <AnnouncementBar />
        <Navbar />
        <main>
          <HeroSlideshow />
          <FeatureStrip />
          <ShopByAge />
          <ShopByCollections />
          <Bestsellers />
          <ComboOffers />
          <ThottilHighlight />
          <OurStory />
          <SocialFeed />
          <Testimonials />
          <Newsletter />
        </main>
        <Footer />
        <BackToTop />
      </div>
    </>
  );
};

export default Index;