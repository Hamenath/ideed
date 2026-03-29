import { useEffect, useRef } from "react";
import { motion, useInView } from "motion/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Monitor, Pen, Wifi, Megaphone, ShoppingCart, Plus } from "lucide-react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const services = [
  {
    icon: Monitor,
    title: "Web/App Dev",
    description: "Ultra-fast, responsive ecosystems built with React, Vue, and high-performance backend architectures.",
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
  },
  {
    icon: Pen,
    title: "UI/UX Design",
    description: "Ethereal interfaces that prioritize human intuition and aesthetic depth through tonal layering.",
    iconBg: "bg-purple-100",
    iconColor: "text-purple-600",
  },
  {
    icon: Wifi,
    title: "IoT & Hardware",
    description: "Connecting physical reality with digital intelligence through seamless firmware integration.",
    iconBg: "bg-cyan-100",
    iconColor: "text-cyan-600",
  },
  {
    icon: Megaphone,
    title: "Marketing",
    description: "Narrative-driven growth strategies that leverage data to find your tribe in the digital noise.",
    iconBg: "bg-orange-100",
    iconColor: "text-orange-500",
  },
  {
    icon: ShoppingCart,
    title: "E-commerce",
    description: "Next-generation storefronts designed for conversion without compromising on luxury feel.",
    iconBg: "bg-emerald-100",
    iconColor: "text-emerald-600",
  },
  {
    icon: Plus,
    title: "Custom Request",
    description: "Looking for something incredibly specific? Tell us about your unique vision.",
    iconBg: "bg-gray-100",
    iconColor: "text-gray-600",
  }
];

export function Solutions() {
  const containerRef = useRef<HTMLElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-80px" });

  useEffect(() => {
    const ctx = gsap.context(() => {
      const cards = gsap.utils.toArray<HTMLElement>(".service-card");
      if (!cards.length) return;

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: `+=${cards.length * 40}%`, // Much shorter overall scroll duration
          pin: true,
          scrub: 0.5, // Faster, tighter scrub
          anticipatePin: 1
        }
      });

      // Animate cards sequentially sliding in from the right to form a stack
      cards.forEach((card, index) => {
        // Skip index 0 entirely as it is already the starting base card
        if (index === 0) return;

        gsap.set(card, { 
          x: "150%", 
          rotation: 15, 
          opacity: 0, 
          scale: 0.8
        });

        // Move the new card in
        tl.to(card, {
          x: "0%",
          rotation: (index % 2 === 0 ? 2 : -2) * (index * 0.5), // slight alternating rotations
          y: index * 6, // layer down slightly
          opacity: 1,
          scale: 1,
          ease: "back.out(1)", // A snappier entrance ease!
        });
        
        // Push all previously placed cards further back at the exact same time
        tl.to(cards.slice(0, index), {
          scale: "-=0.04",
          y: "-=12",
          // The bottom-most cards should fade slightly, but not completely
          opacity: "-=0.15",
          ease: "none"
        }, "<"); // sync with the incoming card animation
      });
      
    }, containerRef);
    
    return () => ctx.revert();
  }, []);

  return (
    <section id="solutions" ref={containerRef} className="h-screen bg-[#F8FAFC] relative overflow-hidden flex items-center">
      <div className="max-w-7xl mx-auto w-full px-6 md:px-12 flex flex-col md:flex-row h-full items-center justify-between">
        
        {/* Left Header Content */}
        <div className="w-full md:w-1/2 flex flex-col justify-center h-1/3 md:h-full z-10">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <h2 className="text-5xl md:text-6xl lg:text-7xl font-black text-gray-900 tracking-tight leading-tight">
              Our <br className="hidden md:block"/> Solutions
            </h2>
            <p className="mt-6 text-blue-600 font-medium text-lg lg:text-xl max-w-sm">
              Multidisciplinary expertise synthesized into a singular scalable execution engine.
            </p>
          </motion.div>
        </div>

        {/* Right Stacked Cards */}
        <div className="w-full md:w-1/2 h-2/3 md:h-full relative flex items-center justify-center md:justify-end lg:justify-center perspective-[1000px]">
          
          {services.map((service, i) => (
            <div
              key={i}
              className={`service-card absolute w-[90%] sm:w-[360px] md:w-[380px] lg:w-[420px] rounded-[2rem] p-8 lg:p-10 shadow-2xl transition-colors flex flex-col justify-between min-h-[300px] lg:min-h-[340px] ${
                i === services.length - 1 
                  ? "bg-gradient-to-br from-white to-gray-50 border-2 border-dashed border-gray-200 cursor-pointer hover:border-blue-400 group" 
                  : "bg-white border border-gray-100"
              }`}
              style={{ zIndex: i }}
            >
              <div
                className={`w-14 h-14 lg:w-16 lg:h-16 rounded-3xl ${service.iconBg} flex items-center justify-center mb-6 border ${i === services.length - 1 ? 'border-gray-200 group-hover:border-blue-300 group-hover:bg-blue-100 transition-colors' : 'border-transparent'}`}
              >
                <service.icon className={`w-7 h-7 lg:w-8 lg:h-8 ${i === services.length - 1 ? 'text-gray-400 group-hover:text-blue-600 transition-colors' : service.iconColor}`} strokeWidth={1.8} />
              </div>
              <div className="flex-1 flex flex-col justify-end">
                <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-3">
                  {service.title}
                </h3>
                <p className={`font-medium leading-relaxed ${i === services.length - 1 ? 'text-gray-400 text-sm md:text-base' : 'text-gray-500 text-base md:text-lg'}`}>
                  {service.description}
                </p>
              </div>
            </div>
          ))}

        </div>
      </div>
    </section>
  );
}
