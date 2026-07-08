"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { CalendarDays, Scissors, Sparkles } from "lucide-react";

const steps = [
  {
    icon: CalendarDays,
    step: "01",
    title: "Randevu Seçin",
    desc: "Hizmet, berber, tarih ve saati online olarak birkaç tıkla belirleyin.",
  },
  {
    icon: Scissors,
    step: "02",
    title: "Salona Gelin",
    desc: "Sıra beklemeden, seçtiğiniz saatte profesyonel ekibimiz sizi karşılasın.",
  },
  {
    icon: Sparkles,
    step: "03",
    title: "Tarzınızı Yenileyin",
    desc: "Kişiye özel kesim ve bakımla salonumuzdan özgüvenle ayrılın.",
  },
];

export default function HowItWorks() {
  return (
    <section className="section-light py-28 relative border-y border-black/[0.06]">
      <div className="container mx-auto px-6 lg:px-14">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-2xl mx-auto mb-20"
        >
          <div className="flex items-center justify-center gap-3 mb-6">
            <span className="w-8 h-px bg-black/25" />
            <span className="text-[10px] font-bold tracking-[0.38em] uppercase text-black/45">
              Nasıl Çalışır?
            </span>
            <span className="w-8 h-px bg-black/25" />
          </div>
          <h2 className="text-4xl md:text-5xl font-serif font-light text-black tracking-tight">
            3 Adımda Randevu
          </h2>
          <p className="mt-5 text-black/45 font-light leading-relaxed">
            New Life deneyimi basit, hızlı ve konforlu. Randevunuzu alın, gerisini bize bırakın.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          {steps.map((item, i) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: i * 0.12 }}
                className="relative text-center group"
              >
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute top-12 left-[60%] w-[80%] h-px bg-black/10" />
                )}
                <div className="inline-flex flex-col items-center">
                  <span className="text-[10px] font-bold tracking-[0.35em] text-black/35 mb-4">
                    {item.step}
                  </span>
                  <div className="w-24 h-24 rounded-full border border-black/10 flex items-center justify-center mb-8 group-hover:border-black group-hover:bg-black/[0.03] transition-all duration-500">
                    <Icon size={28} className="text-black/55 group-hover:text-black transition-colors" />
                  </div>
                  <h3 className="text-xl font-serif font-light text-black mb-3">{item.title}</h3>
                  <p className="text-sm text-black/45 font-light leading-relaxed max-w-xs">{item.desc}</p>
                </div>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <Link
            href="/randevu"
            className="inline-flex items-center gap-3 bg-black text-white hover:bg-black/85 px-10 py-4 rounded-full text-[10px] font-bold tracking-[0.28em] uppercase transition-all duration-300"
          >
            Hemen Randevu Al
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
