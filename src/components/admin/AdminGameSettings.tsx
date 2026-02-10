import { useEffect, useState } from "react";
import { fetchGameSettings, upsertGameSetting } from "@/lib/supabaseStudio";
import type { GameSetting } from "@/data/studio-data";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Loader2, Gamepad2, Target, Droplets } from "lucide-react";
import { toast } from "sonner";

const MEMORY_GAME_NAME = "memory_cards";
const PRECISION_GAME_NAME = "precision_trace";
const INK_MIX_GAME_NAME = "ink_mix_master";
const DEFAULT_MIN_ACCURACY = 90;

export function AdminGameSettings() {
  const [settings, setSettings] = useState<GameSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [memoryDiscountRate, setMemoryDiscountRate] = useState(10);
  const [memoryActive, setMemoryActive] = useState(true);
  const [memoryPromoCode, setMemoryPromoCode] = useState("TATTOO2024");
  const [memoryDifficultyTarget, setMemoryDifficultyTarget] = useState(100);

  const [precisionDiscountRate, setPrecisionDiscountRate] = useState(10);
  const [precisionActive, setPrecisionActive] = useState(true);
  const [precisionMinAccuracy, setPrecisionMinAccuracy] = useState(DEFAULT_MIN_ACCURACY);
  const [precisionPromoCode, setPrecisionPromoCode] = useState("TATTOO15");
  const [precisionDifficultyTarget, setPrecisionDifficultyTarget] = useState(DEFAULT_MIN_ACCURACY);

  const [inkMixDiscountRate, setInkMixDiscountRate] = useState(10);
  const [inkMixActive, setInkMixActive] = useState(true);
  const [inkMixPromoCode, setInkMixPromoCode] = useState("INKMIX10");
  const [inkMixDifficultyTarget, setInkMixDifficultyTarget] = useState(95);

  useEffect(() => {
    setLoading(true);
    fetchGameSettings()
      .then((list) => {
        setSettings(list);
        const memory = list.find((g) => g.game_name === MEMORY_GAME_NAME);
        if (memory) {
          setMemoryDiscountRate(memory.discount_rate);
          setMemoryActive(memory.is_active);
          setMemoryPromoCode(memory.promo_code ?? "TATTOO2024");
          setMemoryDifficultyTarget(memory.difficulty_target ?? 100);
        }
        const precision = list.find((g) => g.game_name === PRECISION_GAME_NAME);
        if (precision) {
          setPrecisionDiscountRate(precision.discount_rate);
          setPrecisionActive(precision.is_active);
          setPrecisionMinAccuracy(precision.min_accuracy ?? DEFAULT_MIN_ACCURACY);
          setPrecisionPromoCode(precision.promo_code ?? "TATTOO15");
          setPrecisionDifficultyTarget(precision.difficulty_target ?? precision.min_accuracy ?? DEFAULT_MIN_ACCURACY);
        }
        const inkMix = list.find((g) => g.game_name === INK_MIX_GAME_NAME);
        if (inkMix) {
          setInkMixDiscountRate(inkMix.discount_rate);
          setInkMixActive(inkMix.is_active);
          setInkMixPromoCode(inkMix.promo_code ?? "INKMIX10");
          setInkMixDifficultyTarget(inkMix.difficulty_target ?? 95);
        }
      })
      .catch((e) => {
        console.error(e);
        toast.error("Oyun ayarları yüklenemedi.");
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSaveAll = async () => {
    setSaving(true);
    try {
      const memoryExisting = settings.find((g) => g.game_name === MEMORY_GAME_NAME);
      const precisionExisting = settings.find((g) => g.game_name === PRECISION_GAME_NAME);
      const inkMixExisting = settings.find((g) => g.game_name === INK_MIX_GAME_NAME);

      await Promise.all([
        upsertGameSetting({
          id: memoryExisting?.id ?? crypto.randomUUID(),
          game_name: MEMORY_GAME_NAME,
          discount_rate: Math.min(100, Math.max(0, memoryDiscountRate)),
          is_active: memoryActive,
          promo_code: (memoryPromoCode ?? "").trim() || "TATTOO2024",
          difficulty_target: Math.min(100, Math.max(0, memoryDifficultyTarget)),
        }),
        upsertGameSetting({
          id: precisionExisting?.id ?? crypto.randomUUID(),
          game_name: PRECISION_GAME_NAME,
          discount_rate: Math.min(100, Math.max(0, precisionDiscountRate)),
          is_active: precisionActive,
          min_accuracy: Math.min(100, Math.max(0, precisionMinAccuracy)),
          promo_code: (precisionPromoCode ?? "").trim() || "TATTOO15",
          difficulty_target: Math.min(100, Math.max(0, precisionDifficultyTarget)),
        }),
        upsertGameSetting({
          id: inkMixExisting?.id ?? crypto.randomUUID(),
          game_name: INK_MIX_GAME_NAME,
          discount_rate: Math.min(100, Math.max(0, inkMixDiscountRate)),
          is_active: inkMixActive,
          promo_code: (inkMixPromoCode ?? "").trim() || "INKMIX10",
          difficulty_target: Math.min(100, Math.max(0, inkMixDifficultyTarget)),
        }),
      ]);
      toast.success("Minigame ayarları kaydedildi.");
      const list = await fetchGameSettings();
      setSettings(list);
    } catch (e) {
      console.error(e);
      toast.error("Kaydedilemedi.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <Card className="border-zinc-800 bg-zinc-900/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-zinc-100">
            <Gamepad2 className="h-5 w-5 text-primary" />
            Minigame Ayarları
          </CardTitle>
          <CardDescription className="text-zinc-400">
            Her oyun için indirim oranı ve aktiflik. &quot;Dövme Çizim Oyunu&quot; için gereken minimum isabet oranını da ayarlayabilirsiniz.
          </CardDescription>
        </CardHeader>
      </Card>

      <Card className="border-zinc-800 bg-zinc-900/50">
        <CardHeader>
          <CardTitle className="text-zinc-100">Dövme Hafıza Kartları</CardTitle>
          <CardDescription className="text-zinc-400">6 çifti eşleştir, indirim kazan.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="memory_discount">İndirim oranı (%)</Label>
            <Input
              id="memory_discount"
              type="number"
              min={0}
              max={100}
              value={memoryDiscountRate}
              onChange={(e) => setMemoryDiscountRate(Number(e.target.value) || 0)}
              className="max-w-[120px] min-h-[44px] bg-zinc-800 border-zinc-700 text-zinc-100 touch-manipulation"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="memory_promo">İndirim kodu</Label>
            <Input
              id="memory_promo"
              type="text"
              value={memoryPromoCode}
              onChange={(e) => setMemoryPromoCode(e.target.value)}
              placeholder="Örn. TATTOO2024"
              className="max-w-[200px] min-h-[44px] bg-zinc-800 border-zinc-700 text-zinc-100 touch-manipulation"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="memory_difficulty">Zorluk hedefi (%)</Label>
            <Input
              id="memory_difficulty"
              type="number"
              min={0}
              max={100}
              value={memoryDifficultyTarget}
              onChange={(e) => setMemoryDifficultyTarget(Number(e.target.value) ?? 100)}
              className="max-w-[120px] min-h-[44px] bg-zinc-800 border-zinc-700 text-zinc-100 touch-manipulation"
            />
          </div>
          <div className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-800/50 p-4 min-h-[44px]">
            <Label className="text-zinc-300">Oyun aktif</Label>
            <Switch checked={memoryActive} onCheckedChange={setMemoryActive} />
          </div>
        </CardContent>
      </Card>

      <Card className="border-zinc-800 bg-zinc-900/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-zinc-100">
            <Target className="h-5 w-5 text-primary" />
            Dövme Çizim Oyunu
          </CardTitle>
          <CardDescription className="text-zinc-400">
            Çizgilerin üzerinden geçerek dövme boyama. Minimum isabet oranına ulaşan indirim kazanır.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="precision_discount">İndirim oranı (%)</Label>
            <Input
              id="precision_discount"
              type="number"
              min={0}
              max={100}
              value={precisionDiscountRate}
              onChange={(e) => setPrecisionDiscountRate(Number(e.target.value) || 0)}
              className="max-w-[120px] min-h-[44px] bg-zinc-800 border-zinc-700 text-zinc-100 touch-manipulation"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="precision_promo">İndirim kodu</Label>
            <Input
              id="precision_promo"
              type="text"
              value={precisionPromoCode}
              onChange={(e) => setPrecisionPromoCode(e.target.value)}
              placeholder="Örn. TATTOO15"
              className="max-w-[200px] min-h-[44px] bg-zinc-800 border-zinc-700 text-zinc-100 touch-manipulation"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="precision_min_accuracy">Gereken minimum isabet oranı (%)</Label>
            <Input
              id="precision_min_accuracy"
              type="number"
              min={0}
              max={100}
              value={precisionMinAccuracy}
              onChange={(e) => setPrecisionMinAccuracy(Number(e.target.value) ?? DEFAULT_MIN_ACCURACY)}
              className="max-w-[120px] min-h-[44px] bg-zinc-800 border-zinc-700 text-zinc-100 touch-manipulation"
            />
            <p className="text-xs text-zinc-500">Bu oranın üzerinde isabetle bitiren kullanıcı indirim kazanır (varsayılan %90).</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="precision_difficulty">Zorluk hedefi (%)</Label>
            <Input
              id="precision_difficulty"
              type="number"
              min={0}
              max={100}
              value={precisionDifficultyTarget}
              onChange={(e) => setPrecisionDifficultyTarget(Number(e.target.value) ?? DEFAULT_MIN_ACCURACY)}
              className="max-w-[120px] min-h-[44px] bg-zinc-800 border-zinc-700 text-zinc-100 touch-manipulation"
            />
          </div>
          <div className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-800/50 p-4 min-h-[44px]">
            <Label className="text-zinc-300">Oyun aktif</Label>
            <Switch checked={precisionActive} onCheckedChange={setPrecisionActive} />
          </div>
        </CardContent>
      </Card>

      <Card className="border-zinc-800 bg-zinc-900/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-zinc-100">
            <Droplets className="h-5 w-5 text-primary" />
            Renk Karıştırma
          </CardTitle>
          <CardDescription className="text-zinc-400">
            Hedef rengi 10 saniyede %95 benzerlikle tutturan indirim kazanır.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="inkmix_discount">İndirim oranı (%)</Label>
            <Input
              id="inkmix_discount"
              type="number"
              min={0}
              max={100}
              value={inkMixDiscountRate}
              onChange={(e) => setInkMixDiscountRate(Number(e.target.value) || 0)}
              className="max-w-[120px] min-h-[44px] bg-zinc-800 border-zinc-700 text-zinc-100 touch-manipulation"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="inkmix_promo">İndirim kodu</Label>
            <Input
              id="inkmix_promo"
              type="text"
              value={inkMixPromoCode}
              onChange={(e) => setInkMixPromoCode(e.target.value)}
              placeholder="Örn. INKMIX10"
              className="max-w-[200px] min-h-[44px] bg-zinc-800 border-zinc-700 text-zinc-100 touch-manipulation"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="inkmix_difficulty">Zorluk hedefi (%)</Label>
            <Input
              id="inkmix_difficulty"
              type="number"
              min={0}
              max={100}
              value={inkMixDifficultyTarget}
              onChange={(e) => setInkMixDifficultyTarget(Number(e.target.value) ?? 95)}
              className="max-w-[120px] min-h-[44px] bg-zinc-800 border-zinc-700 text-zinc-100 touch-manipulation"
            />
            <p className="text-xs text-zinc-500">Hedef rengi bu benzerlik oranına ulaşan kullanıcı indirim kazanır.</p>
          </div>
          <div className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-800/50 p-4 min-h-[44px]">
            <Label className="text-zinc-300">Oyun aktif</Label>
            <Switch checked={inkMixActive} onCheckedChange={setInkMixActive} />
          </div>
        </CardContent>
      </Card>

      <Button onClick={handleSaveAll} disabled={saving} className="bg-primary text-primary-foreground hover:bg-primary/90">
        {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
        Tüm ayarları kaydet
      </Button>
    </div>
  );
}
