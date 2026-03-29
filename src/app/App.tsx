import { useEffect } from "react";
import { Navbar } from "./components/Navbar";
import { Hero } from "./components/Hero";
import { HorizontalTextScroll } from "./components/HorizontalTextScroll";
import { Story } from "./components/Story";
import { Solutions } from "./components/Solutions";
import { Process } from "./components/Process";
import { Portfolio } from "./components/Portfolio";
import { DigitalProductsGlobe } from "./components/DigitalProductsGlobe";
import { Stats } from "./components/Stats";
import { FAQ } from "./components/FAQ";
import { Contact } from "./components/Contact";
import { Footer } from "./components/Footer";

const PORTFOLIO_IMAGES = {
  project1:
    "https://images.unsplash.com/photo-1701056035581-9df3eec9fe02?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBwcmVtaXVtJTIwZGFyayUyMHByb2R1Y3QlMjBmaW50ZWNofGVufDF8fHx8MTc3NDgwNzkzMHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  project2:
    "https://images.unsplash.com/photo-1634836023845-eddbfe9937da?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtaW5pbWFsJTIwZGFyayUyMGNvbXB1dGVyJTIwbW9uaXRvciUyMGRlc2t0b3AlMjB3b3Jrc3BhY2V8ZW58MXx8fHwxNzc0ODA3OTMwfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  project3:
    "https://images.unsplash.com/photo-1720962158883-b0f2021fb51e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkYXJrJTIwdGVjaCUyMGFwcCUyMGludGVyZmFjZSUyMHNsZWVrJTIwZGVzaWdufGVufDF8fHx8MTc3NDgwNzkzNHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  project4:
    "https://images.unsplash.com/photo-1758598307153-f1c53d9db23e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjB0ZWNoJTIwc3RhcnR1cCUyMGRpZ2l0YWwlMjB3b3Jrc3BhY2V8ZW58MXx8fHwxNzc0ODA3MjExfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
};

export default function App() {
  useEffect(() => {
    document.body.style.fontFamily = "Inter, sans-serif";
  }, []);

  return (
    <div
      className="min-h-screen bg-[#F6F8FB]"
      style={{ fontFamily: "Inter, sans-serif" }}
    >
      <Navbar />
      <main>
        {/* Hero Section */}
        <div className="bg-[#F6F8FB]">
          <Hero />
        </div>
        
        {/* Horizontal Scroll Brand Story */}
        <HorizontalTextScroll />
        
        {/* About iDEED */}
        <Story />
        
        {/* Services */}
        <Solutions />
        
        {/* Process / Workflow */}
        <Process />

        {/* Projects */}
        <Portfolio images={PORTFOLIO_IMAGES} />
        <DigitalProductsGlobe />
        
        {/* Contact */}
        <Contact />
      </main>
      <Footer />
      
      {/* Scroll to top button */}
      <button
        onClick={() => {
          const el = document.getElementById("home");
          if (el) el.scrollIntoView({ behavior: "smooth" });
          else window.scrollTo({ top: 0, behavior: "smooth" });
        }}
        className="fixed bottom-6 right-6 z-50 p-3 bg-white/80 backdrop-blur-md rounded-full shadow-lg border border-gray-200 text-gray-500 hover:text-blue-600 hover:bg-white transition-all transform hover:scale-105 active:scale-95"
        aria-label="Scroll to top"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="m18 15-6-6-6 6" />
        </svg>
      </button>
    </div>
  );
}
