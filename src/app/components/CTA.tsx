import { motion } from "motion/react";

export function CTA() {
  return (
    <section className="py-24 md:py-32 bg-gray-950 relative overflow-hidden">
      {/* Background styling for depth */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,#2563eb30_0%,transparent_60%)]" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(circle, #ffffff 1px, transparent 1px)`,
            backgroundSize: "30px 30px",
          }}
        />
      </div>

      <div className="max-w-4xl mx-auto px-6 text-center relative z-10 flex flex-col items-center">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-4xl md:text-5xl lg:text-7xl font-black text-white tracking-tight mb-8"
          style={{ fontFamily: 'Space Grotesk, sans-serif' }}
        >
          Have an Idea? <br/> Let’s Build It Together.
        </motion.h2>
        
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-gray-400 text-lg md:text-xl lg:text-2xl leading-relaxed max-w-3xl border-b border-gray-800 pb-10 mb-10"
        >
          iDEED helps transform ideas into websites, mobile apps, digital products, and IoT solutions.
          Tell us about your project and we’ll help you build it.
        </motion.p>
        
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-5 w-full max-w-md mx-auto sm:max-w-none"
        >
          <button 
            onClick={() => {
              const el = document.getElementById("contact");
              if (el) el.scrollIntoView({ behavior: "smooth" });
            }}
            className="w-full sm:w-auto px-10 py-4 lg:text-lg rounded-full bg-blue-600 text-white font-bold hover:bg-blue-500 transition-colors shadow-lg shadow-blue-600/20"
          >
            Start a Project
          </button>
          <button 
            onClick={() => {
              const el = document.getElementById("contact");
              if (el) el.scrollIntoView({ behavior: "smooth" });
            }}
            className="w-full sm:w-auto px-10 py-4 lg:text-lg rounded-full bg-white/10 text-white font-bold hover:bg-white/20 hover:backdrop-blur-xl transition-all border border-transparent hover:border-gray-600"
          >
            Contact Us
          </button>
        </motion.div>
      </div>
    </section>
  );
}
