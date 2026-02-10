import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useStudioData } from "@/hooks/useStudioData";
import type { Piercing, PiercingBodyRegion } from "@/data/studio-data";
import { uploadPiercingImage } from "@/lib/supabaseStudio";
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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ImageFileInput } from "@/components/admin/ImageFileInput";

const BODY_REGIONS: { value: PiercingBodyRegion; label: string }[] = [
  { value: "Kulak", label: "Kulak" },
  { value: "Burun", label: "Burun" },
  { value: "Dudak", label: "Dudak" },
  { value: "Kaş", label: "Kaş" },
  { value: "Dil", label: "Dil" },
  { value: "Göbek", label: "Göbek" },
  { value: "Diğer", label: "Diğer" },
];

const piercingSchema = z.object({
  name: z.string().min(1, "Takı adı gerekli"),
  bodyPart: z.string().min(1, "Bölge adı gerekli (örn: Tragus, Helix, Septum)"),
  bodyRegion: z.enum(["Kulak", "Burun", "Dudak", "Kaş", "Dil", "Göbek", "Diğer"]),
  material: z.string().min(1, "Malzeme gerekli"),
  price: z.string(),
  productImageUrl: z.string().min(1, "Ürün fotoğrafı gerekli"),
  modelImageUrl: z.string().min(1, "Model fotoğrafı gerekli"),
  description: z.string(),
  whatsappNumber: z.string(),
});

type PiercingFormValues = z.infer<typeof piercingSchema>;

function nextId(prefix: string, existing: { id: string }[]): string {
  const nums = existing
    .map((x) => {
      const n = parseInt(x.id.replace(/\D/g, ""), 10);
      return isNaN(n) ? 0 : n;
    })
    .filter((n) => n > 0);
  const max = nums.length ? Math.max(...nums) : 0;
  return `${prefix}${max + 1}`;
}

export function AdminPiercings() {
  const { data, createPiercing, updatePiercing, deletePiercing } = useStudioData();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isCreate, setIsCreate] = useState(false);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const form = useForm<PiercingFormValues>({
    resolver: zodResolver(piercingSchema),
    defaultValues: {
      name: "",
      bodyPart: "",
      bodyRegion: "Kulak",
      material: "",
      price: "",
      productImageUrl: "",
      modelImageUrl: "",
      description: "",
      whatsappNumber: "",
    },
  });

  const openEdit = (id: string) => {
    const pc = data.piercings.find((p) => p.id === id);
    if (pc) {
      form.reset({
        name: pc.name,
        bodyPart: pc.bodyPart,
        bodyRegion: pc.bodyRegion,
        material: pc.material,
        price: pc.price ?? "",
        productImageUrl: pc.productImageUrl,
        modelImageUrl: pc.modelImageUrl,
        description: pc.description,
        whatsappNumber: pc.whatsappNumber ?? "",
      });
      setEditingId(id);
      setIsCreate(false);
    }
  };

  const openCreate = () => {
    form.reset({
      name: "",
      bodyPart: "",
      bodyRegion: "Kulak",
      material: "",
      price: "",
      productImageUrl: "",
      modelImageUrl: "",
      description: "",
      whatsappNumber: "",
    });
    setEditingId("new");
    setIsCreate(true);
  };

  const onSave = form.handleSubmit(async (values) => {
    setSaving(true);
    try {
      const id = isCreate ? nextId("pc", data.piercings) : editingId!;
      let productUrl = values.productImageUrl;
      let modelUrl = values.modelImageUrl;
      if (productUrl.startsWith("data:")) {
        productUrl = await uploadPiercingImage(id, productUrl, "product");
      }
      if (modelUrl.startsWith("data:")) {
        modelUrl = await uploadPiercingImage(id, modelUrl, "model");
      }
      const payload = {
        name: values.name,
        bodyPart: values.bodyPart,
        bodyRegion: values.bodyRegion as PiercingBodyRegion,
        material: values.material,
        price: values.price?.trim() ?? "",
        productImageUrl: productUrl,
        modelImageUrl: modelUrl,
        description: values.description,
        whatsappNumber: values.whatsappNumber?.trim() || undefined,
      };
      if (isCreate) {
        createPiercing({ ...payload, id });
        toast({ title: "Piercing eklendi" });
      } else {
        updatePiercing(editingId!, payload);
        toast({ title: "Piercing güncellendi" });
      }
      setEditingId(null);
    } catch (e) {
      toast({
        title: e instanceof Error ? e.message : "Yükleme hatası",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  });

  const handleDelete = (id: string) => {
    if (window.confirm("Bu piercing kaydını silmek istediğinize emin misiniz?")) {
      deletePiercing(id);
      toast({ title: "Piercing silindi", variant: "destructive" });
      setEditingId(null);
    }
  };

  return (
    <div className="space-y-4">
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle>Piercing Tanıtım ve Görselleme</CardTitle>
          <CardDescription>
            Takı adı, vücut bölgesi, malzeme ve iki fotoğraf (ürün + modelde) girin. Fotoğraflar studio-assets bucket’ına yüklenir.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {data.piercings.map((pc) => (
              <div
                key={pc.id}
                className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-800/50 p-4"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="flex gap-2 flex-shrink-0">
                    <div className="w-14 h-14 rounded-lg overflow-hidden bg-zinc-700">
                      {pc.productImageUrl ? (
                        <img src={pc.productImageUrl} alt={pc.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-zinc-500 text-xs">Ürün</div>
                      )}
                    </div>
                    <div className="w-14 h-14 rounded-lg overflow-hidden bg-zinc-700">
                      {pc.modelImageUrl ? (
                        <img src={pc.modelImageUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-zinc-500 text-xs">Model</div>
                      )}
                    </div>
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-zinc-100 truncate">{pc.name}</p>
                    <p className="text-sm text-zinc-500">
                      {pc.bodyPart} · {pc.bodyRegion} · {pc.material}
                      {pc.price ? ` · ${pc.price}` : ""}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <Button variant="outline" size="sm" className="border-zinc-600" onClick={() => openEdit(pc.id)}>
                    Düzenle
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-red-900/50 text-red-400 hover:bg-red-950"
                    onClick={() => handleDelete(pc.id)}
                  >
                    Sil
                  </Button>
                </div>
              </div>
            ))}
          </div>
          <Button className="mt-4 bg-primary hover:bg-primary/90" onClick={openCreate}>
            Yeni Piercing Ekle
          </Button>
        </CardContent>
      </Card>

      <Dialog open={!!editingId} onOpenChange={(open) => !open && setEditingId(null)}>
        <DialogContent className="max-w-lg bg-zinc-900 border-zinc-800 text-zinc-100 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isCreate ? "Yeni Piercing" : "Piercing Düzenle"}</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSave)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Takı adı</FormLabel>
                    <FormControl>
                      <Input className="bg-zinc-800 border-zinc-700" {...field} placeholder="Örn: Helix Halka" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="bodyPart"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bölge (piercing noktası)</FormLabel>
                    <FormControl>
                      <Input className="bg-zinc-800 border-zinc-700" {...field} placeholder="Tragus, Helix, Septum, vb." />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="bodyRegion"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vücut bölgesi (filtre)</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-zinc-800 border-zinc-700">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {BODY_REGIONS.map((r) => (
                          <SelectItem key={r.value} value={r.value}>
                            {r.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="material"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Malzeme</FormLabel>
                    <FormControl>
                      <Input className="bg-zinc-800 border-zinc-700" {...field} placeholder="Titanyum, Cerrahi Çelik, vb." />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fiyat</FormLabel>
                    <FormControl>
                      <Input className="bg-zinc-800 border-zinc-700" {...field} placeholder="₺150" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="productImageUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ürün fotoğrafı (takının fotoğrafı)</FormLabel>
                    <FormControl>
                      <ImageFileInput label="" value={field.value} onChange={field.onChange} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="modelImageUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Model fotoğrafı (vücuttaki duruşu)</FormLabel>
                    <FormControl>
                      <ImageFileInput label="" value={field.value} onChange={field.onChange} />
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
                      <Textarea className="bg-zinc-800 border-zinc-700" {...field} rows={2} placeholder="Kısa açıklama (sayfada kartın altında görünür)" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="whatsappNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>WhatsApp Bilgi Numarası</FormLabel>
                    <FormControl>
                      <Input
                        className="bg-zinc-800 border-zinc-700"
                        {...field}
                        placeholder="905XXXXXXXXX"
                      />
                    </FormControl>
                    <FormDescription>
                      Numarayı ülke koduyla birlikte giriniz (Örn: 905XXXXXXXXX). Boş bırakırsanız stüdyonun iletişim numarası kullanılır.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setEditingId(null)} disabled={saving}>
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
