import { useState, useEffect, useMemo } from "react";
import { motion } from "motion/react";
import { Sparkles } from "lucide-react";

export function Hero() {
  const [titleNumber, setTitleNumber] = useState(0);
  const titles = useMemo(
    () => ["Digital Reality", "Scalable Products", "Future Ecosystems"],
    []
  );

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (titleNumber === titles.length - 1) {
        setTitleNumber(0);
      } else {
        setTitleNumber(titleNumber + 1);
      }
    }, 2000);
    return () => clearTimeout(timeoutId);
  }, [titleNumber, titles]);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16"
    >
      {/* Very subtle background */}
      <div className="absolute inset-0 -z-10">
        {/* Soft radial glow top */}
        <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[900px] h-[600px] rounded-full bg-gradient-radial from-blue-100/60 via-indigo-50/30 to-transparent blur-[80px]" />
        {/* Grid dots */}
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: `radial-gradient(circle, #94a3b8 1px, transparent 1px)`,
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      <div className="max-w-5xl mx-auto px-6 text-center relative">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-gray-200 bg-white/80 text-gray-500 text-xs font-medium tracking-widest uppercase mb-8 shadow-sm"
        >
          The Future of Digital Craft
        </motion.div>

        {/* Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="text-6xl md:text-7xl lg:text-8xl font-black text-gray-950 leading-tight tracking-tight mb-4"
        >
          We Build Ideas Into
        </motion.h1>
        
        {/* Animated Headline Words */}
        <div className="relative flex w-full justify-center overflow-hidden text-center h-[80px] md:h-[100px] lg:h-[120px] mb-10 pb-2">
          {titles.map((title, index) => (
            <motion.h1
              key={index}
              className="absolute text-6xl md:text-7xl lg:text-8xl font-black leading-tight tracking-tight"
              style={{
                background: "linear-gradient(135deg, #2563EB 0%, #7C3AED 60%, #C026D3 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
              initial={{ opacity: 0, y: -100 }}
              transition={{ type: "spring", stiffness: 50 }}
              animate={
                titleNumber === index
                  ? { y: 0, opacity: 1 }
                  : { y: titleNumber > index ? -150 : 150, opacity: 0 }
              }
            >
              {title}
            </motion.h1>
          ))}
        </div>

        {/* Subtext */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.28 }}
          className="max-w-lg mx-auto text-gray-500 text-base md:text-lg leading-relaxed mb-10"
        >
          Transforming ambitious visions into high-performance ecosystems.
          We bridge the gap between imagination and execution with ethereal
          design and architected precision.
        </motion.p>

        {/* Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.38 }}
          className="flex flex-wrap items-center justify-center gap-4"
        >
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => scrollTo("contact")}
            className="px-7 py-3.5 rounded-full bg-gray-950 text-white font-semibold text-sm hover:bg-gray-800 transition-colors shadow-lg"
          >
            Start Your Project
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => scrollTo("portfolio")}
            className="px-7 py-3.5 rounded-full text-gray-700 font-semibold text-sm hover:text-gray-900 transition-colors"
          >
            View Our Work
          </motion.button>
        </motion.div>
      </div>

      {/* Floating card — left */}
      <motion.div
        initial={{ opacity: 0, x: -30, y: 10 }}
        animate={{ opacity: 1, x: 0, y: 0 }}
        transition={{ duration: 0.8, delay: 0.6 }}
        className="absolute left-[4%] top-[38%] -translate-y-1/2 hidden lg:block"
      >
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
          className="w-[168px] p-4 rounded-2xl bg-white border border-gray-100 shadow-[0_8px_32px_rgba(0,0,0,0.08)]"
        >
          <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center mb-3">
            <Sparkles size={16} className="text-indigo-500" />
          </div>
          <p className="text-gray-900 text-sm font-semibold leading-tight mb-1">AI-Driven Design</p>
          <p className="text-gray-400 text-xs leading-snug">
            Intelligent layouts that adapt to user behavior in real-time.
          </p>
        </motion.div>
      </motion.div>

      {/* Floating card — right */}
      <motion.div
        initial={{ opacity: 0, x: 30, y: 10 }}
        animate={{ opacity: 1, x: 0, y: 0 }}
        transition={{ duration: 0.8, delay: 0.75 }}
        className="absolute right-[4%] bottom-[18%] hidden lg:block"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 4.5, ease: "easeInOut", delay: 0.5 }}
          className="w-[190px] p-4 rounded-2xl bg-white border border-gray-100 shadow-[0_8px_32px_rgba(0,0,0,0.08)]"
        >
          <div className="flex gap-1.5 mb-3">
            <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
            <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
          </div>
          <p className="text-gray-900 text-sm font-semibold leading-tight mb-1">Cloud Infrastructure</p>
          <p className="text-gray-400 text-xs leading-snug">
            Scaling from zero to millions with zero friction.
          </p>
        </motion.div>
      </motion.div>

      {/* Scroll hint */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ repeat: Infinity, duration: 1.6 }}
          className="w-5 h-8 rounded-full border-2 border-gray-300 flex items-start justify-center pt-1.5"
        >
          <div className="w-1 h-2 rounded-full bg-gray-400" />
        </motion.div>
      </motion.div>
    </section>
  );
}
