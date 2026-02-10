import AboutSection from "@/components/AboutSection";
import { useStudioData } from "@/hooks/useStudioData";
import { getValueIcon } from "@/lib/valueIcons";
import { motion } from "framer-motion";

function ValueIcon({ name }: { name: string }) {
  const Icon = getValueIcon(name);
  return <Icon className="h-8 w-8 mx-auto mb-3 text-primary" />;
}

const HakkimizdaPage = () => {
  const { data } = useStudioData();

  return (
    <div className="pt-16">
      <section className="py-20 px-4 md:px-8 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-primary text-sm tracking-[0.3em] uppercase font-heading mb-2">Biz Kimiz</p>
          <h1 className="text-4xl md:text-6xl font-heading font-bold">Hakkımızda</h1>
          <p className="text-muted-foreground mt-4 max-w-xl mx-auto">
            Kadıköy'ün kalbinde, dövme sanatını tutkuyla yaşayan bir ekip.
          </p>
        </motion.div>
      </section>

      <AboutSection />

      <section className="py-16 px-4 md:px-8">
        <div className="container mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-2xl md:text-4xl font-heading font-bold mb-12 text-center"
          >
            Değerlerimiz
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {data.values.map((v, i) => (
              <motion.div
                key={v.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-card border border-border p-8 text-center hover:border-primary transition-colors"
              >
                <ValueIcon name={v.icon} />
                <h3 className="font-heading font-bold text-xl text-primary mb-3">{v.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{v.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default HakkimizdaPage;
