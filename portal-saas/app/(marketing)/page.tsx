import Navbar from "@/components/marketing/Navbar";
import HeroSection from "@/components/marketing/HeroSection";
import StatsBar from "@/components/marketing/StatsBar";
import AppsShowcase from "@/components/marketing/AppsShowcase";
import WhyUnikLabs from "@/components/marketing/WhyUnikLabs";
import FAQSection from "@/components/marketing/FAQSection";
import CTAFinal from "@/components/marketing/CTAFinal";
import Footer from "@/components/marketing/Footer";

export default function MarketingPage() {
    return (
        <main className="min-h-screen bg-[#0A0A0A] selection:bg-lime-500/30 selection:text-lime-200">
            <Navbar />
            <HeroSection />
            <StatsBar />
            <AppsShowcase />
            <WhyUnikLabs />
            <FAQSection />
            <CTAFinal />
            <Footer />
        </main>
    );
}
