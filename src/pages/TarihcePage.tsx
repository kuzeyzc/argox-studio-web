import { motion, useScroll, useTransform } from "framer-motion";
import { quizQuestions } from "@/data/studio-data";
import { useRef, useState } from "react";
import { Sparkles } from "lucide-react";
import { useStudioData } from "@/hooks/useStudioData";
import type { HistoryTimelineItem } from "@/data/studio-data";
import { Card, CardContent } from "@/components/ui/card";

const TarihcePage = () => {
  const { data } = useStudioData();
  const timeline = [...data.historyTimeline].sort((a, b) => a.orderIndex - b.orderIndex);

  return (
    <div className="pt-16">
      {/* Hero */}
      <section className="py-20 px-4 md:px-8 text-center relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
          <span className="outline-text text-[15vw] font-heading font-bold opacity-20">TARİHÇE</span>
        </div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative z-10">
          <p className="text-primary text-sm tracking-[0.3em] uppercase font-heading mb-2">Mürekkebin Yolculuğu</p>
          <h1 className="text-4xl md:text-6xl font-heading font-bold">Dövme'nin Tarihçesi</h1>
          <p className="text-muted-foreground mt-4 max-w-xl mx-auto">
            Binlerce yıllık bir geleneğin izinde, deriye işlenen hikâyelerin tarihini keşfedin.
          </p>
        </motion.div>
      </section>

      {/* Timeline — her tarih bir kart içinde; zigzag: çift = görsel sol, tek = görsel sağ */}
      <section className="py-12 px-4 md:px-8">
        <div className="container mx-auto max-w-4xl space-y-8">
          {timeline.map((item, index) => (
            <TimelineItem key={item.id} item={item} index={index} />
          ))}
        </div>
      </section>

      {/* Quiz */}
      <StyleQuiz />
    </div>
  );
};

const TimelineItem = ({ item, index }: { item: HistoryTimelineItem; index: number }) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "center center"],
  });
  const opacity = useTransform(scrollYProgress, [0, 1], [0, 1]);
  const y = useTransform(scrollYProgress, [0, 1], [60, 0]);
  const isEven = index % 2 === 0;

  return (
    <motion.div ref={ref} style={{ opacity, y }}>
      <Card className="overflow-hidden border-border bg-card/80 backdrop-blur-sm shadow-lg hover:shadow-xl hover:border-primary/20 transition-all duration-300">
        <CardContent className="p-0">
          <div className="flex flex-col md:flex-row md:min-h-[260px]">
            {/* Mobil: görsel üstte. Masaüstü: zigzag — çift = görsel sol, tek = görsel sağ */}
            <div
              className={`w-full md:w-1/2 shrink-0 aspect-[4/3] md:aspect-auto md:min-h-[260px] overflow-hidden ${isEven ? "md:order-1" : "md:order-2"}`}
            >
              {item.imageUrl ? (
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-muted flex items-center justify-center text-muted-foreground text-sm font-heading">
                  Görsel yok
                </div>
              )}
            </div>
            <div
              className={`flex flex-col justify-center p-6 md:p-8 w-full md:w-1/2 ${isEven ? "md:order-2" : "md:order-1"}`}
            >
              <span className="text-primary font-heading font-bold text-2xl md:text-4xl tracking-tight">
                {item.year}
              </span>
              <h3 className="font-heading font-bold text-xl md:text-2xl mt-2 text-foreground">
                {item.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed mt-3 text-sm md:text-base">
                {item.description}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const StyleQuiz = () => {
  const [currentQ, setCurrentQ] = useState(0);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [finished, setFinished] = useState(false);

  const handleAnswer = (style: string) => {
    const newScores = { ...scores, [style]: (scores[style] || 0) + 1 };
    setScores(newScores);

    if (currentQ < quizQuestions.length - 1) {
      setCurrentQ(currentQ + 1);
    } else {
      setFinished(true);
    }
  };

  const getResult = () => {
    const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
    return sorted[0]?.[0] || "İnce Çizgi";
  };

  const reset = () => {
    setCurrentQ(0);
    setScores({});
    setFinished(false);
  };

  return (
    <section className="py-24 px-4 md:px-8">
      <div className="container mx-auto max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <Sparkles className="text-primary mx-auto mb-4" size={32} />
          <h2 className="text-3xl md:text-4xl font-heading font-bold">Stilini Keşfet</h2>
          <p className="text-muted-foreground mt-2">Sana en uygun dövme stilini bulmak için kısa bir quiz!</p>
        </motion.div>

        <div className="bg-card border border-border p-8">
          {!finished ? (
            <motion.div key={currentQ} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <div className="flex gap-2 mb-6">
                {quizQuestions.map((_, i) => (
                  <div
                    key={i}
                    className="h-1 flex-1 transition-colors duration-300"
                    style={{ backgroundColor: i <= currentQ ? "hsl(18 100% 56%)" : "hsl(var(--border))" }}
                  />
                ))}
              </div>
              <p className="text-xs text-muted-foreground font-heading tracking-wider mb-2">
                Soru {currentQ + 1}/{quizQuestions.length}
              </p>
              <h3 className="font-heading font-bold text-lg mb-6">{quizQuestions[currentQ].question}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {quizQuestions[currentQ].options.map((opt) => (
                  <button
                    key={opt.label}
                    onClick={() => handleAnswer(opt.style)}
                    className="border border-border text-foreground px-4 py-3 text-sm font-heading tracking-wider hover:border-primary hover:text-primary transition-colors text-left"
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
              <p className="text-primary text-sm tracking-[0.3em] uppercase font-heading mb-3">Sonucun</p>
              <h3 className="text-3xl font-heading font-bold mb-4">{getResult()}</h3>
              <p className="text-muted-foreground mb-8">Bu stil sana çok yakışır! Sanatçılarımızla iletişime geçerek hayalindeki dövmeyi tasarlayabilirsin.</p>
              <button
                onClick={reset}
                className="border border-primary text-primary px-6 py-3 text-sm font-heading font-bold tracking-wider hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                Tekrar Dene
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
};

export default TarihcePage;
