import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useStudioData } from "@/hooks/useStudioData";
import { uploadHistoryImage } from "@/lib/supabaseStudio";
import { dataUrlToFile } from "@/lib/cropImage";
import { ImageFileInput } from "@/components/admin/ImageFileInput";
import type { HistoryTimelineItem } from "@/data/studio-data";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

const historySchema = z.object({
  year: z.string().min(1, "Tarih gerekli (örn. MÖ 3300)"),
  title: z.string().min(1, "Başlık gerekli"),
  description: z.string(),
});

type HistoryFormValues = z.infer<typeof historySchema>;

function nextHistoryId(existing: HistoryTimelineItem[]): string {
  const nums = existing
    .map((x) => {
      const n = parseInt(x.id.replace(/\D/g, ""), 10);
      return isNaN(n) ? 0 : n;
    })
    .filter((n) => n > 0);
  const max = nums.length ? Math.max(...nums) : 0;
  return `h${max + 1}`;
}

export function AdminHistory() {
  const { data, createHistoryItem, updateHistoryItem, deleteHistoryItem, refreshHistoryTimeline } = useStudioData();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isCreate, setIsCreate] = useState(false);
  /** Kırpılıp storage'a yüklendikten sonra dönen public URL */
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  /** Yeni ekleme modunda aynı id ile hem yükleme hem kayıt için kullanılır */
  const newItemIdRef = useRef<string>("");
  const { toast } = useToast();

  const form = useForm<HistoryFormValues>({
    resolver: zodResolver(historySchema),
    defaultValues: { year: "", title: "", description: "" },
  });

  const openEdit = (item: HistoryTimelineItem) => {
    form.reset({ year: item.year, title: item.title, description: item.description });
    setEditingId(item.id);
    setUploadedImageUrl(null);
    setIsCreate(false);
  };

  const openCreate = () => {
    form.reset({ year: "", title: "", description: "" });
    setEditingId("new");
    setUploadedImageUrl(null);
    newItemIdRef.current = nextHistoryId(data.historyTimeline);
    setIsCreate(true);
  };

  /** 1:1 kırpma tamamlandıktan sonra data URL'i storage'a yükle (ImageFileInput ile aynı kırpma sistemi). */
  const handleCroppedImage = async (dataUrlOrEmpty: string) => {
    if (!dataUrlOrEmpty) {
      setUploadedImageUrl(null);
      return;
    }
    const id = isCreate ? newItemIdRef.current : (editingId === "new" ? null : editingId);
    if (!id) {
      toast({ title: "Görsel yüklemek için önce kayıt açın veya düzenleme modunda olun", variant: "destructive" });
      return;
    }
    setUploading(true);
    try {
      const file = dataUrlToFile(dataUrlOrEmpty, "history.jpg");
      const url = await uploadHistoryImage(id, file);
      setUploadedImageUrl(url);
      toast({ title: "Görsel kırpıldı ve yüklendi (1:1)" });
    } catch (err) {
      console.error("[AdminHistory] Görsel yükleme hatası:", err);
      toast({
        title: err instanceof Error ? err.message : "Görsel yüklenemedi",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const onSave = form.handleSubmit(async (values) => {
    setSaving(true);
    try {
      if (isCreate) {
        const id = newItemIdRef.current || nextHistoryId(data.historyTimeline);
        const imageUrl = uploadedImageUrl ?? "";
        await createHistoryItem({
          id,
          year: values.year,
          title: values.title,
          description: values.description,
          imageUrl,
          orderIndex: data.historyTimeline.length,
        });
        await refreshHistoryTimeline();
        toast({ title: "Tarihçe olayı eklendi" });
      } else if (editingId && editingId !== "new") {
        const existing = data.historyTimeline.find((h) => h.id === editingId);
        const imageUrl = uploadedImageUrl ?? existing?.imageUrl ?? "";
        const payload = {
          year: values.year,
          title: values.title,
          description: values.description,
          imageUrl,
        };
        await updateHistoryItem(editingId, payload);
        await refreshHistoryTimeline();
        toast({ title: "Değişiklikler kaydedildi" });
      }
      setEditingId(null);
      setUploadedImageUrl(null);
    } catch (e) {
      console.error("[AdminHistory] Kaydet hatası:", e);
      toast({
        title: e instanceof Error ? e.message : "Kaydetme hatası",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  });

  const handleDelete = (id: string) => {
    if (window.confirm("Bu tarihçe olayını silmek istediğinize emin misiniz?")) {
      deleteHistoryItem(id);
      toast({ title: "Olay silindi", variant: "destructive" });
      setEditingId(null);
    }
  };

  const timeline = [...(data.historyTimeline || [])].sort((a, b) => a.orderIndex - b.orderIndex);
  const currentImageUrl = uploadedImageUrl ?? (editingId && editingId !== "new" ? data.historyTimeline.find((h) => h.id === editingId)?.imageUrl : null) ?? "";

  return (
    <div className="space-y-4">
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle>Tarihçe Yönetimi</CardTitle>
          <CardDescription>
            Tarihçe sayfasındaki timeline olayları. Sıra order_index ile belirlenir; zigzag düzeni otomatik uygulanır.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {timeline.map((item) => (
              <Card key={item.id} className="bg-zinc-800/50 border-zinc-700">
                <CardContent className="p-4 flex flex-row items-center gap-4">
                  <div className="w-20 h-14 rounded overflow-hidden flex-shrink-0 bg-zinc-800">
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-xs text-zinc-500 flex items-center justify-center h-full">Görsel yok</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-heading font-bold text-primary">{item.year}</p>
                    <p className="font-medium text-zinc-100">{item.title}</p>
                    <p className="text-sm text-zinc-500 line-clamp-1">{item.description}</p>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <Button variant="outline" size="sm" className="border-zinc-600" onClick={() => openEdit(item)}>
                      Düzenle
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-red-900/50 text-red-400 hover:bg-red-950"
                      onClick={() => handleDelete(item.id)}
                    >
                      Sil
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <Button className="mt-4 bg-primary hover:bg-primary/90" onClick={openCreate}>
            Yeni Olay Ekle
          </Button>
        </CardContent>
      </Card>

      <Dialog open={!!editingId} onOpenChange={(open) => !open && setEditingId(null)}>
        <DialogContent className="max-w-lg bg-zinc-900 border-zinc-800 text-zinc-100 max-h-[70vh] flex flex-col p-0 gap-0 overflow-hidden">
          <DialogHeader className="flex-shrink-0 px-6 pt-6 pb-2">
            <DialogTitle>{isCreate ? "Yeni Tarihçe Olayı" : "Olayı Düzenle"}</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form
              onSubmit={(e) => { e.preventDefault(); onSave(e); }}
              className="flex flex-col flex-1 min-h-0 overflow-hidden"
            >
              <div className="px-6 overflow-y-auto flex-1 min-h-0 space-y-4 max-h-[calc(70vh-8rem)]">
                <div className="min-w-0 space-y-4">
                  <FormField
                    control={form.control}
                    name="year"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tarih</FormLabel>
                        <FormControl>
                          <Input
                            className="w-full max-w-full bg-zinc-800 border-zinc-700 box-border"
                            {...field}
                            placeholder="MÖ 3300 veya 2020+"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Başlık</FormLabel>
                        <FormControl>
                          <Input
                            className="w-full max-w-full bg-zinc-800 border-zinc-700 box-border"
                            {...field}
                            placeholder="Örn: İlk İzler"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Açıklama</FormLabel>
                        <FormControl>
                          <Textarea
                            className="w-full max-w-full bg-zinc-800 border-zinc-700 box-border resize-y min-h-0"
                            {...field}
                            rows={3}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="space-y-2 min-w-0">
                    <p className="text-sm font-medium text-zinc-300">
                      Görsel (1:1 kare, kırpılır — studio-assets)
                      {uploading && <span className="ml-2 text-xs text-primary">Yükleniyor…</span>}
                    </p>
                    <ImageFileInput
                      value={currentImageUrl}
                      onChange={handleCroppedImage}
                      label=""
                      className="space-y-2"
                      previewClassName="w-24 h-24 rounded-lg border border-zinc-700 bg-zinc-800/50"
                    />
                  </div>
                </div>
              </div>
              <DialogFooter className="flex-shrink-0 px-6 py-4 border-t border-zinc-800 mt-4">
                <Button type="button" variant="outline" onClick={() => setEditingId(null)}>
                  İptal
                </Button>
                <Button type="submit" className="bg-primary hover:bg-primary/90" disabled={saving}>
                  {saving ? "Kaydediliyor…" : isCreate ? "Ekle" : "Kaydet"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
