import { motion } from "motion/react";
import { Linkedin, Instagram, Twitter, Github } from "lucide-react";

const footerLinks = {
  services: [
    "Web Development",
    "Mobile App Development",
    "UI/UX Design",
    "Logo & Branding",
    "Digital Marketing",
    "IoT Solutions",
    "Maintenance & Support"
  ],
  company: [
    "About Us",
    "Services",
    "Projects",
    "Our Process",
    "Contact",
    "Privacy Policy",
    "Terms & Conditions"
  ],
  socials: [
    { label: "LinkedIn", icon: Linkedin, link: "https://www.linkedin.com/company/ideedtech/" },
    { label: "Instagram", icon: Instagram, link: "#" },
    { label: "Twitter", icon: Twitter, link: "#" },
    { label: "GitHub", icon: Github, link: "#" },
    { label: "Behance", icon: undefined, link: "#" } 
  ]
};

export function Footer() {
  return (
    <footer className="relative bg-white border-t border-gray-100 overflow-hidden pt-20 pb-8 text-gray-600">
      
      {/* Premium Extras: Gradient Top Line Separator */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600 z-20" />

      {/* 1. Subtle Grid Pattern Background */}
      <div
        className="absolute inset-0 opacity-[0.03] z-0 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle, #000000 1px, transparent 1px)`,
          backgroundSize: "32px 32px",
        }}
      />

      {/* 2. Big Background Text */}
      <div 
        className="absolute -bottom-10 left-1/2 -translate-x-1/2 text-[18vw] font-black text-gray-900/[0.03] pointer-events-none select-none z-0 tracking-tighter w-full text-center whitespace-nowrap"
        style={{ fontFamily: 'Space Grotesk, sans-serif' }}
      >
        iDEED
      </div>

      <div className="relative max-w-7xl mx-auto px-6 md:px-12 z-10 font-sans">
        
        {/* 4 Columns Main Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 mb-16">
          
          {/* Column 1: Company Info */}
          <div className="space-y-6">
            <span
              className="text-3xl font-black text-gray-950 tracking-tight"
              style={{ fontFamily: "Space Grotesk, sans-serif" }}
            >
              iDEED
            </span>
            <p className="text-gray-500 text-sm leading-relaxed max-w-xs md:max-w-none">
              iDEED is a service-based technology startup that helps businesses, startups, and individuals build digital products, websites, mobile apps, IoT systems, and technology solutions.
            </p>
            <p className="text-blue-600 font-bold text-sm">Turning Ideas Into Deeds.</p>
          </div>

          {/* Column 2: Services */}
          <div>
            <h4 className="text-gray-950 font-bold mb-6 tracking-wide" style={{ fontFamily: "Space Grotesk, sans-serif" }}>Services</h4>
            <ul className="space-y-3">
              {footerLinks.services.map(link => (
                <li key={link}>
                  <a href="#" className="text-gray-500 hover:text-blue-600 font-medium transition-colors text-sm hover:translate-x-1 inline-block transform duration-300">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Company */}
          <div>
            <h4 className="text-gray-950 font-bold mb-6 tracking-wide" style={{ fontFamily: "Space Grotesk, sans-serif" }}>Company</h4>
            <ul className="space-y-3">
              {footerLinks.company.map(link => (
                <li key={link}>
                  <a href="#" className="text-gray-500 hover:text-blue-600 font-medium transition-colors text-sm hover:translate-x-1 inline-block transform duration-300">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Contact */}
          <div className="space-y-6">
            <h4 className="text-gray-950 font-bold tracking-wide" style={{ fontFamily: "Space Grotesk, sans-serif" }}>Contact</h4>
            <ul className="space-y-3">
              <li className="text-gray-500 text-sm">
                <span className="block text-gray-400 mb-0.5 text-xs uppercase font-bold tracking-widest">Email</span>
                <a href="mailto:ideed.support@gmail.com" className="hover:text-blue-600 transition-colors font-medium text-gray-700">ideed.support@gmail.com</a>
              </li>
              <li className="text-gray-500 text-sm">
                <span className="block text-gray-400 mb-0.5 text-xs uppercase font-bold tracking-widest">Phone</span>
                <span className="font-medium text-gray-700">+91 8778 70 70 86</span>
              </li>
              <li className="text-gray-500 text-sm">
                <span className="block text-gray-400 mb-0.5 text-xs uppercase font-bold tracking-widest">Location</span>
                <span className="font-medium text-gray-700">Madurai, Tamil Nadu, India</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Custom Divider */}
        <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent mb-8" />

        {/* Bottom Socials & Copyright Section */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6 pb-4">
          
          {/* Social Icons Hover Animation */}
          <div className="flex flex-wrap justify-center gap-3">
            {footerLinks.socials.map((social) => (
              <motion.a
                key={social.label}
                href={social.link}
                aria-label={social.label}
                whileHover={{ scale: 1.1, y: -4 }}
                whileTap={{ scale: 0.95 }}
                className="w-10 h-10 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-500 hover:text-white hover:bg-blue-600 hover:border-blue-600 transition-all shadow-sm"
              >
                {social.icon ? (
                  <social.icon size={18} strokeWidth={2} />
                ) : (
                  <span className="text-[10px] font-bold uppercase">{social.label.slice(0, 2)}</span>
                )}
              </motion.a>
            ))}
          </div>

          {/* Bottom Footer Line */}
          <div className="text-center lg:text-right space-y-1">
            <p className="text-gray-900 text-sm font-bold">
              © 2026 iDEED — Turning Ideas Into Deeds.
            </p>
            <p className="text-gray-500 text-xs tracking-wide font-medium">
              Web • Mobile • Design • IoT • Digital Solutions
            </p>
          </div>
          
        </div>
      </div>
    </footer>
  );
}
