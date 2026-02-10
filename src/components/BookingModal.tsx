import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronRight, ChevronLeft, Upload, Loader2, User, Check } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import type { Artist } from "@/data/studio-data";
import { useStudioData } from "@/hooks/useStudioData";
import {
  insertAppointment,
  uploadAppointmentReferenceImages,
  updateAppointmentReferenceImages,
  fetchBudgetCategoriesByArtistIds,
} from "@/lib/supabaseStudio";
import type { BudgetCategory } from "@/data/studio-data";
import { toast } from "sonner";

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  lockedArtist?: Artist | null;
}

/** Seçim: henüz yok | sanatçı | aklımda biri yok */
type ArtistChoice = undefined | Artist | null;

const BookingModal = ({ isOpen, onClose, lockedArtist }: BookingModalProps) => {
  const { data } = useStudioData();
  const artists = data.artists;
  const [step, setStep] = useState(0);
  const [selectedArtist, setSelectedArtist] = useState<ArtistChoice>(undefined);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [service, setService] = useState("Dövme");
  const [bodyLocation, setBodyLocation] = useState("");
  const [budgetCategoryLabel, setBudgetCategoryLabel] = useState("");
  const [appointmentDate, setAppointmentDate] = useState("");
  const [discountCode, setDiscountCode] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [categoriesByArtist, setCategoriesByArtist] = useState<Record<string, BudgetCategory[]>>({});
  const fileRef = useRef<HTMLInputElement>(null);

  const STORAGE_DISCOUNT_KEY = "argox_discount";

  const hasArtistSelected = selectedArtist !== undefined;
  const isNoPreference = selectedArtist === null;
  const chosenArtist = selectedArtist !== undefined && selectedArtist !== null ? selectedArtist : null;
  const budgetCategories = chosenArtist ? (categoriesByArtist[chosenArtist.id] ?? []) : [];
  const mustSelectBudget = chosenArtist && budgetCategories.length > 0;

  useEffect(() => {
    if (isOpen && lockedArtist) {
      setSelectedArtist(lockedArtist);
    } else if (!isOpen) {
      setSelectedArtist(undefined);
    }
  }, [isOpen, lockedArtist]);

  useEffect(() => {
    if (isOpen) {
      try {
        const raw = localStorage.getItem(STORAGE_DISCOUNT_KEY);
        if (raw) {
          const parsed = JSON.parse(raw) as { code?: string };
          if (parsed?.code) setDiscountCode(parsed.code);
        }
      } catch (_) {}
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || artists.length === 0) return;
    fetchBudgetCategoriesByArtistIds(artists.map((a) => a.id))
      .then(setCategoriesByArtist)
      .catch(() => setCategoriesByArtist({}));
  }, [isOpen, artists]);

  const handleClose = () => {
    onClose();
    setStep(0);
    setSelectedArtist(lockedArtist ?? undefined);
    setName("");
    setEmail("");
    setPhone("");
    setService("Dövme");
    setBodyLocation("");
    setBudgetCategoryLabel("");
    setAppointmentDate("");
    setDiscountCode("");
    setFiles([]);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setFiles(Array.from(e.target.files));
  };

  const handleSubmit = async () => {
    const artistId = chosenArtist?.id ?? null;
    const tattooDescription = chosenArtist
      ? [service, bodyLocation, budgetCategoryLabel].filter(Boolean).join(" | ") || "Belirtilmedi"
      : [service, bodyLocation].filter(Boolean).join(" | ") || "Belirtilmedi";
    const dateStr = appointmentDate || new Date().toISOString().slice(0, 10);
    setSubmitting(true);
    try {
      const appointment = await insertAppointment({
        customer_name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        artist_id: artistId,
        tattoo_description: tattooDescription,
        appointment_date: dateStr,
        budget_preference: budgetCategoryLabel || "",
        discount_code: discountCode.trim() || "",
      });
      if (files.length > 0) {
        const urls = await uploadAppointmentReferenceImages(appointment.id, files);
        if (urls.length > 0) {
          await updateAppointmentReferenceImages(appointment.id, urls);
        }
      }
      toast.success("Talebiniz alınmıştır, sanatçılarımız size dönüş yapacaktır.");
      handleClose();
    } catch (e) {
      console.error(e);
      toast.error("Randevu gönderilemedi. Lütfen tekrar deneyin.");
    } finally {
      setSubmitting(false);
    }
  };

  const canNextStep0 = hasArtistSelected;
  const canNextStep1 = name.trim() && email.trim() && phone.trim();
  const canNextStep2 =
    bodyLocation.trim() &&
    appointmentDate &&
    (!mustSelectBudget || budgetCategoryLabel.trim() !== "");

  const progressStep = step + 1;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[70] flex items-center justify-center p-4"
        >
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={handleClose} />

          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.95 }}
            className="relative z-10 bg-card border border-border w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 md:p-8"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-heading font-bold text-xl">Randevu Al</h2>
              <button onClick={handleClose} className="text-muted-foreground hover:text-foreground transition-colors">
                <X size={22} />
              </button>
            </div>

            <div className="flex gap-2 mb-8">
              {[1, 2, 3].map((s) => (
                <div
                  key={s}
                  className="h-1 flex-1 transition-colors duration-300"
                  style={{ backgroundColor: s <= progressStep ? "hsl(18 100% 56%)" : "hsl(var(--border))" }}
                />
              ))}
            </div>

            {/* Adım 0: Sanatçı seçimi */}
            {step === 0 && (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">Randevu almak istediğiniz sanatçıyı seçin veya fark etmez deyin.</p>
                <div className="grid grid-cols-2 gap-3">
                  {artists.map((a) => {
                    const isSelected = selectedArtist === a;
                    return (
                      <button
                        key={a.id}
                        type="button"
                        onClick={() => setSelectedArtist(a)}
                        className={`relative flex flex-col items-center rounded-xl border-2 p-4 transition-all text-left ${
                          isSelected
                            ? "border-primary bg-primary/10"
                            : "border-border hover:border-primary/50 bg-secondary/50"
                        }`}
                      >
                        <div className="h-20 w-20 rounded-full overflow-hidden bg-muted flex-shrink-0 mb-2">
                          {a.image ? (
                            <img src={a.image} alt="" className="h-full w-full object-cover" />
                          ) : (
                            <span className="h-full w-full flex items-center justify-center text-2xl font-heading text-muted-foreground">
                              {a.name.charAt(0)}
                            </span>
                          )}
                        </div>
                        <span className="font-heading font-medium text-sm text-foreground truncate w-full text-center">
                          {a.name}
                        </span>
                        {isSelected && (
                          <span className="absolute top-2 right-2 rounded-full bg-primary p-1">
                            <Check className="h-3 w-3 text-primary-foreground" />
                          </span>
                        )}
                      </button>
                    );
                  })}
                  <button
                    type="button"
                    onClick={() => setSelectedArtist(null)}
                    className={`relative flex flex-col items-center justify-center rounded-xl border-2 p-4 transition-all min-h-[120px] ${
                      isNoPreference
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/50 bg-secondary/50"
                    }`}
                  >
                    <User className="h-8 w-8 text-muted-foreground mb-2" />
                    <span className="font-heading font-medium text-sm text-foreground text-center">
                      Aklımda Biri Yok / Fark Etmez
                    </span>
                    {isNoPreference && (
                      <span className="absolute top-2 right-2 rounded-full bg-primary p-1">
                        <Check className="h-3 w-3 text-primary-foreground" />
                      </span>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Adım 1: İletişim */}
            {step === 1 && (
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-muted-foreground font-heading tracking-wider block mb-1.5">AD SOYAD</label>
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-secondary border border-border px-4 py-2.5 text-foreground text-sm focus:outline-none focus:border-primary transition-colors" placeholder="Adınız ve soyadınız" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground font-heading tracking-wider block mb-1.5">E-POSTA</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-secondary border border-border px-4 py-2.5 text-foreground text-sm focus:outline-none focus:border-primary transition-colors" placeholder="ornek@email.com" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground font-heading tracking-wider block mb-1.5">TELEFON</label>
                  <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full bg-secondary border border-border px-4 py-2.5 text-foreground text-sm focus:outline-none focus:border-primary transition-colors" placeholder="+90 555 123 4567" />
                </div>
              </div>
            )}

            {/* Adım 2: Tarih, hizmet, bölge, (bütçe kategorisi), referans */}
            {step === 2 && (
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-muted-foreground font-heading tracking-wider block mb-1.5">RANDEVU TARİHİ</label>
                  <input type="date" value={appointmentDate} onChange={(e) => setAppointmentDate(e.target.value)} min={new Date().toISOString().slice(0, 10)} className="w-full bg-secondary border border-border px-4 py-2.5 text-foreground text-sm focus:outline-none focus:border-primary transition-colors" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground font-heading tracking-wider block mb-1.5">HİZMET</label>
                  <select value={service} onChange={(e) => setService(e.target.value)} className="w-full bg-secondary border border-border px-4 py-2.5 text-foreground text-sm focus:outline-none focus:border-primary transition-colors">
                    <option value="Dövme">Dövme</option>
                    <option value="Piercing">Piercing</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground font-heading tracking-wider block mb-1.5">VÜCUT BÖLGESİ</label>
                  <input type="text" value={bodyLocation} onChange={(e) => setBodyLocation(e.target.value)} className="w-full bg-secondary border border-border px-4 py-2.5 text-foreground text-sm focus:outline-none focus:border-primary transition-colors" placeholder="Örn: Sol kol, sırt..." />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground font-heading tracking-wider block mb-1.5">İNDİRİM KODUNUZ</label>
                  <input type="text" value={discountCode} onChange={(e) => setDiscountCode(e.target.value)} className="w-full bg-secondary border border-border px-4 py-2.5 text-foreground text-sm focus:outline-none focus:border-primary transition-colors font-mono" placeholder="Örn: TATTOO2024 (oyundan kazanabilirsiniz)" />
                </div>
                {chosenArtist && budgetCategories.length > 0 && (
                  <div>
                    <label className="text-xs text-muted-foreground font-heading tracking-wider block mb-1.5">BÜTÇE KATEGORİSİ *</label>
                    <select
                      value={budgetCategoryLabel}
                      onChange={(e) => setBudgetCategoryLabel(e.target.value)}
                      className="w-full bg-secondary border border-border px-4 py-2.5 text-foreground text-sm focus:outline-none focus:border-primary transition-colors"
                      required
                    >
                      <option value="">Seçiniz</option>
                      {budgetCategories.map((c) => (
                        <option key={c.id} value={c.label}>
                          {c.label}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                {chosenArtist && budgetCategories.length === 0 && (
                  <p className="text-xs text-muted-foreground">Bu sanatçı henüz bütçe kategorisi tanımlamamış.</p>
                )}
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Referans görsel (isteğe bağlı)</p>
                  <div onClick={() => fileRef.current?.click()} className="border-2 border-dashed border-border hover:border-primary transition-colors flex flex-col items-center justify-center py-8 cursor-pointer rounded-lg">
                    <Upload size={28} className="text-muted-foreground mb-2" />
                    <span className="text-xs text-muted-foreground">Görsel yüklemek için tıklayın</span>
                  </div>
                  <input ref={fileRef} type="file" multiple accept="image/*" onChange={handleFileChange} className="hidden" />
                  {files.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {files.map((f, i) => (
                        <span key={i} className="text-xs bg-secondary border border-border px-3 py-1 text-muted-foreground rounded">
                          {f.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="flex justify-between mt-8">
              {step > 0 ? (
                <button type="button" onClick={() => setStep(step - 1)} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors font-heading">
                  <ChevronLeft size={16} /> Geri
                </button>
              ) : (
                <div />
              )}

              {step < 2 ? (
                <button
                  type="button"
                  onClick={() => {
                    if (step === 0 && canNextStep0) setStep(1);
                    if (step === 1 && canNextStep1) setStep(2);
                  }}
                  disabled={(step === 0 && !canNextStep0) || (step === 1 && !canNextStep1)}
                  className="flex items-center gap-1 bg-primary text-primary-foreground px-6 py-2.5 text-sm font-heading font-bold tracking-wider disabled:opacity-40 disabled:cursor-not-allowed hover:brightness-110 transition-all"
                >
                  İleri <ChevronRight size={16} />
                </button>
              ) : (
                <button type="button" onClick={handleSubmit} disabled={submitting || !canNextStep2} className="bg-primary text-primary-foreground px-6 py-2.5 text-sm font-heading font-bold tracking-wider hover:brightness-110 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2">
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  Gönder
                </button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default BookingModal;
