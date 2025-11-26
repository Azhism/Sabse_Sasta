import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { FeaturedProducts } from "@/components/FeaturedProducts";
import { HowItWorks } from "@/components/HowItWorks";
import { VendorShowcase } from "@/components/VendorShowcase";
import { Features } from "@/components/Features";
import { CTASection } from "@/components/CTASection";
import { Footer } from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <Hero />
        <FeaturedProducts />
        <HowItWorks />
        <VendorShowcase />
        <Features />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
