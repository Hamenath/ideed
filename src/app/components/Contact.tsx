import { useRef, useState } from "react";
import { motion, useInView } from "motion/react";
import { Send, Mail, MapPin, Phone } from "lucide-react";
import { db } from "../lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import emailjs from "@emailjs/browser";

const sendEmail = async (formData: any) => {
  try {
    await emailjs.send(
      "service_kn6z198",
      "template_ua382qf",
      {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        service: formData.projectType,
        message: formData.message,
      },
      "IhfZK-dOg8HkPlms_"
    );
  } catch (error) {
    console.error("Email error:", error);
  }
};

export function Contact() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-80px" });
  const [form, setForm] = useState({ name: "", email: "", phone: "", projectType: "Website Development", budget: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await sendEmail(form);
      
      await addDoc(collection(db, "contacts"), {
        name: form.name,
        email: form.email,
        phone: form.phone,
        projectType: form.projectType,
        budget: form.budget,
        message: form.message,
        status: "New",
        createdAt: serverTimestamp(),
      });

      // Log notification for Admin
      await addDoc(collection(db, "notifications"), {
        text: `New project inquiry from ${form.name}: ${form.projectType}`,
        unread: true,
        createdAt: serverTimestamp(),
        type: 'contact',
        emailStatus: 'pending' // For internal tracking
      });


      alert("Message sent successfully!");
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setForm({ name: "", email: "", phone: "", projectType: "Website Development", budget: "", message: "" });
      }, 3500);
    } catch (error) {
      console.log(error);
      alert("Error sending message");
    } finally {
      setIsSubmitting(false);
    }
  };

  const projectTypes = [
    "Website Development",
    "Mobile App Development",
    "UI/UX Design",
    "Logo & Branding",
    "Digital Marketing",
    "IoT Solutions",
    "Custom Software",
    "Maintenance & Support",
    "Other"
  ];

  return (
    <section id="contact" ref={sectionRef} className="py-16 md:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          {/* Left: Info */}
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="w-12 h-1 bg-blue-600 rounded-full" />
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6 }}
                className="text-3xl md:text-4xl lg:text-5xl font-black text-gray-950 leading-tight"
                style={{ fontFamily: 'Space Grotesk, sans-serif' }}
              >
                Let’s Turn Your Idea Into a Real Product
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-gray-500 text-base leading-relaxed max-w-lg"
              >
                Have an idea, project, or business that needs a website, app, design, IoT system, or digital solution?
                We help startups, businesses, and individuals turn ideas into real digital products.
                Contact iDEED and let’s start building something amazing.
              </motion.p>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="p-8 rounded-[2rem] bg-[#F8FAFC] border border-gray-100 space-y-6"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-2">Contact Information</h3>
              <div className="space-y-5">
                {[
                  { icon: Mail, label: "Email", value: "ideed.support@gmail.com" },
                  { icon: Phone, label: "Phone", value: "+91 8778 70 70 86" },
                  { icon: MapPin, label: "Location", value: "Madurai, Tamil Nadu, India" },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center border border-gray-100 flex-shrink-0">
                      <item.icon size={18} className="text-blue-600" strokeWidth={1.5} />
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase text-gray-400 tracking-wider mb-0.5">{item.label}</p>
                      <p className="text-gray-900 font-medium">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Right: Form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="p-6 md:p-8 rounded-[2.5rem] bg-white border border-gray-100 shadow-2xl shadow-gray-200/50"
          >
            {submitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="h-full min-h-[350px] flex flex-col items-center justify-center text-center space-y-4"
              >
                <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mb-2">
                  <Send size={24} className="text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Message Sent Successfully!</h3>
                <p className="text-gray-500 max-w-xs text-sm">
                  We've received your request and will properly review your project. We'll be in touch soon.
                </p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                      placeholder="John Doe"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Email Address *</label>
                    <input
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                      placeholder="john@example.com"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Phone Number *</label>
                    <input
                      type="tel"
                      required
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                      placeholder="+91 XXXXX XXXXX"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Budget (Optional)</label>
                    <input
                      type="text"
                      value={form.budget}
                      onChange={(e) => setForm({ ...form, budget: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                      placeholder="$5k - $10k"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Project Type *</label>
                  <select
                    required
                    value={form.projectType}
                    onChange={(e) => setForm({ ...form, projectType: e.target.value })}
                    className="w-full px-4 py-2.5 text-sm rounded-xl bg-gray-50 border border-gray-200 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer appearance-none"
                  >
                    {projectTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Project Description *</label>
                  <textarea
                    required
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none"
                    placeholder="Tell us about your project goals, timeline, and requirements..."
                  />
                </div>

                <motion.button
                  type="submit"
                  disabled={isSubmitting}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-3 rounded-xl bg-blue-600 text-white font-bold text-base hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/30 mt-2 disabled:opacity-75 disabled:cursor-not-allowed flex items-center justify-center min-h-[48px]"
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    "Submit Form"
                  )}
                </motion.button>
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
