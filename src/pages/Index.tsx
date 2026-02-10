import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { Methodology } from "@/components/Methodology";
import { Services } from "@/components/Services";
import { DiagnosticCTA } from "@/components/DiagnosticCTA";
import { GuidesCTA } from "@/components/GuidesCTA";
import { ArcadeCTA } from "@/components/ArcadeCTA";
import { Team } from "@/components/Team";
import { Contact } from "@/components/Contact";
import { Footer } from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <Hero />
        <Methodology />
        <Services />
        <DiagnosticCTA />
        <GuidesCTA />
        <ArcadeCTA />
        <Team />
        <Contact />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
