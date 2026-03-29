import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const texts = [
  "We Turn Ideas Into Real Digital Products",
  "Design. Code. Deploy. Scale.",
  "Turning Ideas Into Deeds"
];

export function HorizontalTextScroll() {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      gsap.registerPlugin(ScrollTrigger);
    }
    
    const ctx = gsap.context(() => {
      const track = trackRef.current;
      if (!track) return;
      
      const getScrollAmount = () => {
        return (texts.length - 1) * window.innerWidth;
      };

      // The horizontal movement of the entire track
      const horizontalTween = gsap.to(track, {
        x: () => -getScrollAmount(),
        ease: "none",
      });

      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: "top top",
        end: () => `+=${getScrollAmount()}`,
        pin: true,
        animation: horizontalTween,
        scrub: 1,
        invalidateOnRefresh: true,
        anticipatePin: 1,
      });

    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="h-screen w-full bg-white relative overflow-hidden flex items-center z-40">
      <div ref={trackRef} className="flex h-full items-center w-max">
        {texts.map((text, i) => (
          <div 
            key={i} 
            className="w-screen h-full flex-shrink-0 flex flex-col items-center justify-center px-6 md:px-24"
          >
            <h2 
               className="text-5xl md:text-7xl lg:text-[7rem] xl:text-[9rem] font-black text-gray-950 tracking-tight text-center leading-[1.05] max-w-7xl mx-auto"
               style={{ fontFamily: 'Space Grotesk, sans-serif' }}
            >
              {text}
            </h2>
          </div>
        ))}
      </div>
    </section>
  );
}
