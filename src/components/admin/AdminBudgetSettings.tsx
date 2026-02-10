import { useEffect, useState } from "react";
import { useStudioData } from "@/hooks/useStudioData";
import { useAuth } from "@/hooks/useAuth";
import {
  fetchBudgetCategories,
  createBudgetCategory,
  deleteBudgetCategory,
  updateBudgetCategory,
} from "@/lib/supabaseStudio";
import type { BudgetCategory } from "@/data/studio-data";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2, Loader2, Banknote, Pencil, Check, X } from "lucide-react";
import { toast } from "sonner";

const MIN_LABEL_LENGTH = 2;

export function AdminBudgetSettings() {
  const { data, currentUser } = useStudioData();
  const { isManager } = useAuth();
  const [categories, setCategories] = useState<BudgetCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedArtistId, setSelectedArtistId] = useState<string | null>(null);
  const [newLabel, setNewLabel] = useState("");
  const [adding, setAdding] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState("");
  const [savingId, setSavingId] = useState<string | null>(null);

  const artistId = isManager ? selectedArtistId : currentUser.artistId ?? null;
  const artists = data.artists;

  useEffect(() => {
    if (!artistId) {
      setCategories([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    fetchBudgetCategories(artistId)
      .then(setCategories)
      .catch((e) => {
        console.error(e);
        toast.error("Kategoriler yüklenemedi.");
        setCategories([]);
      })
      .finally(() => setLoading(false));
  }, [artistId]);

  const handleAdd = async () => {
    const label = newLabel.trim();
    if (!label || !artistId) return;
    setAdding(true);
    try {
      const created = await createBudgetCategory(artistId, label);
      setCategories((prev) => [...prev, created].sort((a, b) => a.order_index - b.order_index));
      setNewLabel("");
      toast.success("Kategori eklendi.");
    } catch (e) {
      console.error(e);
      toast.error("Kategori eklenemedi.");
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await deleteBudgetCategory(id);
      setCategories((prev) => prev.filter((c) => c.id !== id));
      toast.success("Kategori silindi.");
    } catch (e) {
      console.error(e);
      toast.error("Kategori silinemedi.");
    } finally {
      setDeletingId(null);
    }
  };

  const startEdit = (c: BudgetCategory) => {
    setEditingId(c.id);
    setEditLabel(c.label);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditLabel("");
  };

  const handleSaveEdit = async (id: string) => {
    const trimmed = editLabel.trim();
    if (trimmed.length < MIN_LABEL_LENGTH) {
      toast.error(`Etiket en az ${MIN_LABEL_LENGTH} karakter olmalıdır.`);
      return;
    }
    setSavingId(id);
    try {
      const updated = await updateBudgetCategory(id, trimmed);
      setCategories((prev) =>
        prev.map((c) => (c.id === id ? updated : c)).sort((a, b) => a.order_index - b.order_index)
      );
      setEditingId(null);
      setEditLabel("");
      toast.success("Kategori güncellendi.");
    } catch (e) {
      console.error(e);
      toast.error("Kategori güncellenemedi.");
    } finally {
      setSavingId(null);
    }
  };

  if (!artistId && !isManager) {
    return (
      <Card className="bg-zinc-900 border-zinc-800">
        <CardContent className="py-8 text-center text-zinc-500">
          Sanatçı profiliniz bulunamadı. Sadece sanatçı hesapları bütçe kategorilerini yönetebilir.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Banknote className="h-5 w-5 text-zinc-500" />
            Bütçe Ayarları
          </CardTitle>
          <CardDescription>
            Randevu formunda müşterilere sunulacak bütçe kategorilerini buradan ekleyip kaldırabilirsiniz. (Örn: &quot;Küçük Boy: 1.500₺ - 2.500₺&quot;, &quot;Tam Kol: 10.000₺+&quot;)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isManager && (
            <div className="space-y-2">
              <Label className="text-zinc-400">Sanatçı seçin</Label>
              <Select
                value={selectedArtistId ?? ""}
                onValueChange={(v) => setSelectedArtistId(v || null)}
              >
                <SelectTrigger className="bg-zinc-800 border-zinc-700 w-full max-w-xs">
                  <SelectValue placeholder="Sanatçı seçin" />
                </SelectTrigger>
                <SelectContent>
                  {artists.map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {!artistId && isManager && (
            <p className="text-sm text-zinc-500">Yukarıdan bir sanatçı seçin.</p>
          )}

          {artistId && (
            <>
              <div className="flex gap-2 flex-wrap">
                <Input
                  placeholder='Örn: Küçük Boy: 1.500₺ - 2.500₺'
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                  className="bg-zinc-800 border-zinc-700 max-w-sm"
                />
                <Button
                  onClick={handleAdd}
                  disabled={!newLabel.trim() || adding}
                  className="bg-primary hover:bg-primary/90"
                >
                  {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                  <span className="ml-2">Ekle</span>
                </Button>
              </div>

              {loading ? (
                <div className="flex items-center gap-2 text-zinc-500 py-4">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Yükleniyor...
                </div>
              ) : categories.length === 0 ? (
                <p className="text-sm text-zinc-500 py-4">Henüz bütçe kategorisi yok. Yukarıdan ekleyin.</p>
              ) : (
                <ul className="space-y-2">
                  {categories.map((c) => (
                    <li
                      key={c.id}
                      className="flex items-center justify-between gap-3 rounded-lg border border-zinc-800 bg-zinc-800/50 px-4 py-3"
                    >
                      {editingId === c.id ? (
                        <>
                          <Input
                            value={editLabel}
                            onChange={(e) => setEditLabel(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") handleSaveEdit(c.id);
                              if (e.key === "Escape") cancelEdit();
                            }}
                            placeholder="Bütçe etiketi"
                            className="flex-1 bg-zinc-900 border-primary text-zinc-100 placeholder:text-zinc-500 focus-visible:ring-primary focus-visible:ring-offset-zinc-900"
                            autoFocus
                            disabled={savingId === c.id}
                          />
                          <div className="flex items-center gap-1 shrink-0">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700"
                              onClick={cancelEdit}
                              disabled={savingId === c.id}
                            >
                              <X className="h-4 w-4" />
                              <span className="ml-1">İptal</span>
                            </Button>
                            <Button
                              variant="default"
                              size="sm"
                              className="bg-primary hover:bg-primary/90"
                              onClick={() => handleSaveEdit(c.id)}
                              disabled={editLabel.trim().length < MIN_LABEL_LENGTH || savingId === c.id}
                            >
                              {savingId === c.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Check className="h-4 w-4" />
                              )}
                              <span className="ml-1">Kaydet</span>
                            </Button>
                          </div>
                        </>
                      ) : (
                        <>
                          <span className="text-zinc-200 flex-1 min-w-0 truncate">{c.label}</span>
                          <div className="flex items-center gap-1 shrink-0">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-zinc-400 hover:text-primary hover:bg-primary/10"
                              onClick={() => startEdit(c)}
                              disabled={!!editingId}
                            >
                              <Pencil className="h-4 w-4" />
                              <span className="ml-1">Düzenle</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-400 hover:text-red-300 hover:bg-red-950/50"
                              onClick={() => handleDelete(c.id)}
                              disabled={deletingId === c.id}
                            >
                              {deletingId === c.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                              <span className="ml-1">Sil</span>
                            </Button>
                          </div>
                        </>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
