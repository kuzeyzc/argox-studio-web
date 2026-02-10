import ServicesSection from "@/components/ServicesSection";
import { motion } from "framer-motion";

const HizmetlerPage = () => {
  return (
    <div className="pt-16">
      <section className="py-20 px-4 md:px-8 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-primary text-sm tracking-[0.3em] uppercase font-heading mb-2">Neler Yapıyoruz</p>
          <h1 className="text-4xl md:text-6xl font-heading font-bold">Hizmetlerimiz</h1>
          <p className="text-muted-foreground mt-4 max-w-xl mx-auto">
            Özel dövme tasarımından profesyonel piercinge kadar tüm hizmetlerimizi keşfedin.
          </p>
        </motion.div>
      </section>

      <ServicesSection />

      {/* Extra info */}
      <section className="py-16 px-4 md:px-8">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-card border border-border p-8"
            >
              <h3 className="font-heading font-bold text-lg mb-4 text-primary">Süreç Nasıl İşliyor?</h3>
              <ol className="space-y-3 text-muted-foreground text-sm">
                <li className="flex gap-3"><span className="text-primary font-heading font-bold">01.</span> Ücretsiz danışmanlık görüşmesi</li>
                <li className="flex gap-3"><span className="text-primary font-heading font-bold">02.</span> Özel tasarım ve konsept onayı</li>
                <li className="flex gap-3"><span className="text-primary font-heading font-bold">03.</span> Steril ortamda profesyonel uygulama</li>
                <li className="flex gap-3"><span className="text-primary font-heading font-bold">04.</span> Detaylı bakım rehberi ve takip</li>
              </ol>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="bg-card border border-border p-8"
            >
              <h3 className="font-heading font-bold text-lg mb-4 text-primary">Hijyen & Güvenlik</h3>
              <ul className="space-y-3 text-muted-foreground text-sm">
                <li>✓ ISO 9001 sertifikalı hijyen standartları</li>
                <li>✓ Tek kullanımlık medikal malzemeler</li>
                <li>✓ Sterilizasyon raporları müşteriye açık</li>
                <li>✓ Sağlık Bakanlığı onaylı mürekkepler</li>
              </ul>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HizmetlerPage;
