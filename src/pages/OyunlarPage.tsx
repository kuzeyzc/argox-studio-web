import { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useStudioData } from "@/hooks/useStudioData";
import { fetchGameSettings } from "@/lib/supabaseStudio";
import type { GameSetting } from "@/data/studio-data";
import type { TattooWork } from "@/data/studio-data";
import confetti from "canvas-confetti";
import { Loader2, Gamepad2, ArrowLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { PrecisionGame } from "@/components/games/PrecisionGame";
import { InkMixGame } from "@/components/games/InkMixGame";
const FALLBACK_IMAGES = ["/tattoo-1.jpg", "/tattoo-2.jpg", "/tattoo-3.jpg", "/tattoo-4.jpg", "/tattoo-6.jpg", "/tattoo-1.jpg"];

const STORAGE_DISCOUNT_KEY = "argox_discount";
/** Aynı oyundan tekrar kod almayı engellemek için kullanılan oyun id listesi */
const STORAGE_CLAIMED_GAMES_KEY = "argox_claimed_games";

/** Oyun katalog bilgisi: id veritabanındaki game_name ile eşleşir. */
const MEMORY_GAME_KEY = "memory_cards";
const PRECISION_GAME_KEY = "precision_trace";
const INK_MIX_GAME_KEY = "ink_mix_master";

const GAME_CATALOG: { id: string; name: string; description: string }[] = [
  {
    id: MEMORY_GAME_KEY,
    name: "Dövme Hafıza Kartları",
    description: "Portfolyomuzdaki dövme görselleriyle 6 çifti eşleştir, indirim kodu kazan. Kartlara tıklayarak aç.",
  },
  {
    id: INK_MIX_GAME_KEY,
    name: "Renk Karıştırma",
    description: "Hedef rengi tutturmak için kırmızı, mavi, sarı, siyah ve beyaz tüplere tıklayarak karıştırın. 10 saniyede %95 benzerliğe ulaşın.",
  },
  {
    id: PRECISION_GAME_KEY,
    name: "Dövme Çizim Oyunu",
    description: "Dövme çizim oyunu: Portfolyodan seçilen taslağın çizgilerinin üzerinden geç. %90 ve üzeri hassasiyetle indirim kodu kazan.",
  },
];

/** 6 çift = 12 kart. Portfolyodan 6 dövme görseli seçilir; yoksa fallback kullanılır. */
function buildDeck(tattooWorks: TattooWork[]): { id: string; imageUrl: string; pairId: string }[] {
  const withImage = tattooWorks.filter((w) => w.image?.trim());
  const need = 6;
  const imageUrls: string[] = [];
  if (withImage.length >= need) {
    const shuffled = [...withImage].sort(() => Math.random() - 0.5);
    for (let i = 0; i < need; i++) imageUrls.push(shuffled[i].image);
  } else if (withImage.length > 0) {
    for (let i = 0; i < need; i++) imageUrls.push(withImage[i % withImage.length].image);
  } else {
    for (let i = 0; i < need; i++) imageUrls.push(FALLBACK_IMAGES[i % FALLBACK_IMAGES.length]);
  }
  const pairs: { id: string; imageUrl: string; pairId: string }[] = [];
  imageUrls.forEach((imageUrl, idx) => {
    const pairId = `p-${idx}`;
    pairs.push({ id: `a-${idx}`, imageUrl, pairId });
    pairs.push({ id: `b-${idx}`, imageUrl, pairId });
  });
  return pairs.sort(() => Math.random() - 0.5);
}

type CardState = "closed" | "open" | "matched";

function MemoryGame({
  tattooWorks,
  gameSetting,
  onWin,
}: {
  tattooWorks: TattooWork[];
  gameSetting: GameSetting | null;
  onWin: (discountRate: number, code: string) => void;
}) {
  const deck = useMemo(() => buildDeck(tattooWorks), [tattooWorks]);
  const [cards, setCards] = useState<{ state: CardState }[]>(() => deck.map(() => ({ state: "closed" as CardState })));
  const [openIndices, setOpenIndices] = useState<number[]>([]);
  const [locked, setLocked] = useState(false);
  const wonFired = useRef(false);

  const allMatched = cards.every((c) => c.state === "matched");

  useEffect(() => {
    if (allMatched && gameSetting && !wonFired.current) {
      wonFired.current = true;
      onWin(gameSetting.discount_rate, gameSetting.promo_code?.trim() || "TATTOO2024");
    }
  }, [allMatched, gameSetting, onWin]);

  const handleCardClick = (index: number) => {
    if (locked || cards[index].state !== "closed" || openIndices.length >= 2) return;
    const nextOpen = [...openIndices, index];
    setOpenIndices(nextOpen);
    setCards((prev) => prev.map((c, i) => (i === index ? { ...c, state: "open" as CardState } : c)));

    if (nextOpen.length === 2) {
      setLocked(true);
      const [i, j] = nextOpen;
      const match = deck[i].pairId === deck[j].pairId;
      if (match) {
        setCards((prev) =>
          prev.map((c, idx) => (idx === i || idx === j ? { ...c, state: "matched" as CardState } : c))
        );
        setOpenIndices([]);
        setLocked(false);
      } else {
        setTimeout(() => {
          setCards((prev) =>
            prev.map((c, idx) => (idx === i || idx === j ? { ...c, state: "closed" as CardState } : c))
          );
          setOpenIndices([]);
          setLocked(false);
        }, 600);
      }
    }
  };

  if (!gameSetting) return null;

  return (
    <div className="grid w-full max-w-[100vw] grid-cols-2 md:grid-cols-3 gap-[10px] sm:gap-3 md:gap-4">
      {deck.map((card, index) => (
        <CardCell
          key={card.id + index}
          imageUrl={card.imageUrl}
          state={cards[index].state}
          onClick={() => handleCardClick(index)}
        />
      ))}
    </div>
  );
}

function CardCell({
  imageUrl,
  state,
  onClick,
}: {
  imageUrl: string;
  state: CardState;
  onClick: () => void;
}) {
  const isFlipped = state === "open" || state === "matched";
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={state === "matched"}
      className="relative min-h-[44px] min-w-[44px] w-full aspect-square rounded-xl overflow-hidden border-2 border-primary/30 bg-card shadow-lg transition-all duration-300 hover:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:pointer-events-none [perspective:600px] touch-manipulation"
      style={{ touchAction: "manipulation" }}
    >
      <div
        className="absolute inset-0 transition-transform duration-300 rounded-xl"
        style={{
          transformStyle: "preserve-3d",
          transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
        }}
      >
        {/* Arka yüz - stüdyo logosu */}
        <div
          className="absolute inset-0 flex items-center justify-center bg-zinc-800/95 border border-primary/20 rounded-xl"
          style={{ backfaceVisibility: "hidden", transform: "rotateY(0deg)" }}
        >
          <span className="font-heading font-bold text-lg sm:text-xl tracking-widest text-primary/90">
            ARGO<span className="text-primary">X</span>
          </span>
        </div>
        {/* Ön yüz - dövme görseli */}
        <div
          className="absolute inset-0 rounded-xl overflow-hidden"
          style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
        >
          {imageUrl ? (
            <img src={imageUrl} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-muted flex items-center justify-center text-muted-foreground">?</div>
          )}
        </div>
      </div>
    </button>
  );
}

type GameWithInfo = GameSetting & { name: string; description: string };

export default function OyunlarPage() {
  const { data } = useStudioData();
  const [allSettings, setAllSettings] = useState<GameSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const [selectedGameId, setSelectedGameId] = useState<string | null>(null);
  const [won, setWon] = useState<{ discountRate: number; code: string; gameName: string } | null>(null);
  const [, setResizeKey] = useState(0);

  const tattooWorks = data.tattooWorks ?? [];

  useEffect(() => {
    const onResize = () => setResizeKey((k) => k + 1);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    setFetchError(false);
    fetchGameSettings()
      .then((settings) => {
        setAllSettings(settings);
        setFetchError(false);
      })
      .catch(() => {
        setAllSettings([]);
        setFetchError(true);
      })
      .finally(() => setLoading(false));
  }, []);

  const activeGames: GameWithInfo[] = useMemo(() => {
    const active = allSettings.filter((s) => s.is_active);
    return active
      .map((s) => {
        const catalog = GAME_CATALOG.find((c) => c.id === s.game_name);
        return catalog ? { ...s, name: catalog.name, description: catalog.description } : null;
      })
      .filter((g): g is GameWithInfo => g !== null);
  }, [allSettings]);

  const selectedGame = selectedGameId
    ? activeGames.find((g) => g.game_name === selectedGameId) ?? null
    : null;

  const handleWin = (discountRate: number, code: string) => {
    const gameId = selectedGameId ?? "";
    try {
      const raw = localStorage.getItem(STORAGE_CLAIMED_GAMES_KEY);
      const claimed: string[] = raw ? (JSON.parse(raw) as string[]) : [];
      if (claimed.includes(gameId)) {
        return;
      }
      claimed.push(gameId);
      localStorage.setItem(STORAGE_CLAIMED_GAMES_KEY, JSON.stringify(claimed));
    } catch {
      // localStorage unavailable or parse error — allow win UI
    }
    setWon({ discountRate, code, gameName: selectedGame?.name ?? "Oyun" });
    try {
      confetti({ particleCount: 120, spread: 70, origin: { y: 0.6 } });
      setTimeout(() => confetti({ particleCount: 80, angle: 60, spread: 55, origin: { x: 0 } }), 200);
      setTimeout(() => confetti({ particleCount: 80, angle: 120, spread: 55, origin: { x: 1 } }), 400);
    } catch {
      // confetti not available
    }
    const payload = JSON.stringify({ code, discountRate });
    try {
      localStorage.setItem(STORAGE_DISCOUNT_KEY, payload);
    } catch {
      // localStorage unavailable
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="container py-16 px-4">
        <div className="max-w-md mx-auto text-center rounded-2xl border border-zinc-800 bg-card/50 p-8">
          <Gamepad2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="font-heading text-xl text-foreground mb-2">Oyunlar yüklenemedi</h2>
          <p className="text-muted-foreground text-sm mb-4">İnternet bağlantınızı kontrol edip tekrar deneyin.</p>
          <Button
            variant="outline"
            onClick={() => {
              setLoading(true);
              setFetchError(false);
              fetchGameSettings()
                .then((s) => {
                  setAllSettings(s);
                  setFetchError(false);
                })
                .catch(() => {
                  setAllSettings([]);
                  setFetchError(true);
                })
                .finally(() => setLoading(false));
            }}
          >
            Yeniden dene
          </Button>
        </div>
      </div>
    );
  }

  if (activeGames.length === 0) {
    return (
      <div className="container py-16 px-4">
        <div className="max-w-md mx-auto text-center rounded-2xl border border-zinc-800 bg-card/50 p-8">
          <Gamepad2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="font-heading text-xl text-foreground mb-2">Oyunlar şu an kapalı</h2>
          <p className="text-muted-foreground text-sm">Minigame ayarlarından oyun tekrar açıldığında burada görünecek.</p>
        </div>
      </div>
    );
  }

  if (selectedGame) {
    return (
      <div
        className="container max-w-[100vw] overflow-x-hidden mx-auto"
        style={{ padding: "clamp(1rem, 2vw, 2rem)" }}
      >
        <div className="max-w-2xl mx-auto w-full">
          <div
            className="rounded-2xl border-2 border-primary bg-card/80 shadow-xl ring-2 ring-primary/30 w-full"
            style={{
              padding: "clamp(1rem, 2vw, 2rem)",
              boxShadow: "0 0 24px hsl(var(--primary) / 0.25), 0 0 48px hsl(var(--primary) / 0.1)",
            }}
          >
            <button
              type="button"
              onClick={() => { setSelectedGameId(null); setWon(null); }}
              className="flex items-center gap-2 min-h-[44px] min-w-[44px] py-2 text-sm text-muted-foreground hover:text-primary mb-6 transition-colors touch-manipulation"
              style={{ touchAction: "manipulation" }}
            >
              <ArrowLeft className="h-4 w-4" /> Oyunlara dön
            </button>
            <div className="flex items-center gap-2 mb-2">
              <Gamepad2 className="h-6 w-6 text-primary" />
              <h1 className="font-heading font-bold text-2xl text-foreground">{selectedGame.name}</h1>
            </div>
            <p className="text-muted-foreground text-sm mb-8">
              {selectedGame.game_name === INK_MIX_GAME_KEY
                ? `Hedef rengi tutturmak için kırmızı, mavi, sarı, siyah ve beyaz tüplere tıklayarak karıştırın. 10 saniyede %${selectedGame.difficulty_target ?? 95} benzerliğe ulaşın.`
                : selectedGame.description}
            </p>

            <AnimatePresence mode="wait">
              {won ? (
                <motion.div
                  key="won"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center py-8 px-4 rounded-xl bg-primary/10 border border-primary/30"
                >
                  <h2 className="font-heading font-bold text-xl sm:text-2xl text-primary mb-2">TEBRİKLER!</h2>
                  <p className="text-foreground mb-4">Tebrikler! {won.gameName} uzmanısın. İşte kodun: <span className="font-mono font-bold text-primary tracking-widest">{won.code}</span></p>
                  <p className="text-sm text-muted-foreground mb-6">%{won.discountRate} indirim kazandınız. Bu kodu randevu formunda &quot;İndirim Kodunuz&quot; alanına yazabilirsiniz.</p>
                  <p className="text-xs text-muted-foreground mb-6">
                    Bu kodu randevu formunda &quot;İndirim Kodunuz&quot; alanına yazabilirsiniz.
                  </p>
                  <Link to="/#iletisim">
                    <Button className="bg-primary text-primary-foreground hover:bg-primary/90 min-h-[44px] min-w-[44px] touch-manipulation" style={{ touchAction: "manipulation" }}>Randevu Al</Button>
                  </Link>
                </motion.div>
              ) : selectedGame.game_name === MEMORY_GAME_KEY ? (
                <motion.div key="game" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <MemoryGame
                    tattooWorks={tattooWorks}
                    gameSetting={selectedGame}
                    onWin={handleWin}
                  />
                </motion.div>
              ) : selectedGame.game_name === PRECISION_GAME_KEY ? (
                <motion.div key="precision" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <PrecisionGame
                    tattooWorks={tattooWorks}
                    gameSetting={selectedGame}
                    onWin={handleWin}
                  />
                </motion.div>
              ) : selectedGame.game_name === INK_MIX_GAME_KEY ? (
                <motion.div key="inkmix" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <InkMixGame gameSetting={selectedGame} onWin={handleWin} />
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="container mx-auto w-full max-w-5xl"
      style={{ padding: "clamp(1rem, 2vw, 2rem)" }}
    >
      <div className="w-full">
        <div className="flex items-center gap-2 mb-6 md:mb-8">
          <Gamepad2 className="h-6 w-6 text-primary" />
          <h1 className="font-heading font-bold text-2xl text-foreground">Oyna-Kazan</h1>
        </div>
        <p className="text-muted-foreground text-sm mb-6 md:mb-8">
          Bir oyun seçin, tamamlayın ve indirim kodu kazanın. Kodu randevu formunda kullanabilirsiniz.
        </p>
        <div className="grid w-full grid-cols-2 md:grid-cols-3 gap-[10px] sm:gap-3 md:gap-4">
          <AnimatePresence>
            {activeGames.map((game, i) => (
              <motion.button
                key={game.game_name}
                type="button"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => setSelectedGameId(game.game_name)}
                className="group text-left rounded-2xl border-2 border-primary/40 bg-card/80 p-4 sm:p-5 md:p-6 shadow-lg transition-all duration-300 hover:border-primary hover:shadow-primary/10 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-primary/50 min-h-[44px] touch-manipulation w-full"
                style={{ touchAction: "manipulation", boxShadow: "0 0 20px hsl(var(--primary) / 0.08)" }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <h2 className="font-heading font-bold text-lg text-foreground group-hover:text-primary transition-colors">
                      {game.name}
                    </h2>
                    <p className="mt-2 text-sm text-muted-foreground line-clamp-3">{game.description}</p>
                    <span className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-primary">
                      Oyna <ChevronRight className="h-4 w-4" />
                    </span>
                  </div>
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Gamepad2 className="h-6 w-6" />
                  </div>
                </div>
              </motion.button>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
