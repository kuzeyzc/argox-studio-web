import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useStudioData } from "@/hooks/useStudioData";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Star, Quote } from "lucide-react";

const testimonialSchema = z.object({
  name: z.string().min(1, "Ad Soyad gerekli"),
  text: z.string().min(1, "Yorum metni gerekli"),
  artistName: z.string().min(1, "Sanatçı seçiniz"),
  rating: z.number().min(1).max(5),
});

type TestimonialFormValues = z.infer<typeof testimonialSchema>;

function StarRating({
  value,
  onChange,
  disabled,
}: {
  value: number;
  onChange: (n: number) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          disabled={disabled}
          onClick={() => onChange(n)}
          className="p-0.5 rounded focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-zinc-900 disabled:opacity-50 transition-transform hover:scale-110"
          aria-label={`${n} yıldız`}
        >
          <Star
            size={28}
            className={n <= value ? "text-primary fill-primary" : "text-zinc-500"}
          />
        </button>
      ))}
    </div>
  );
}

export function AdminTestimonials() {
  const { data, createTestimonial, updateTestimonial, deleteTestimonial } = useStudioData();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isCreate, setIsCreate] = useState(false);
  const { toast } = useToast();

  const form = useForm<TestimonialFormValues>({
    resolver: zodResolver(testimonialSchema),
    defaultValues: {
      name: "",
      text: "",
      artistName: "",
      rating: 5,
    },
  });

  const openEdit = (id: string) => {
    const t = data.testimonials.find((x) => x.id === id);
    if (t) {
      form.reset({
        name: t.name,
        text: t.text,
        artistName: t.artistName,
        rating: t.rating,
      });
      setEditingId(id);
      setIsCreate(false);
    }
  };

  const openCreate = () => {
    form.reset({
      name: "",
      text: "",
      artistName: data.artists[0]?.name ?? "",
      rating: 5,
    });
    setEditingId("new");
    setIsCreate(true);
  };

  const onSave = form.handleSubmit((values) => {
    if (isCreate) {
      createTestimonial({
        name: values.name,
        text: values.text,
        artistName: values.artistName,
        rating: values.rating,
      });
      toast({ title: "Yorum eklendi" });
    } else if (editingId && editingId !== "new") {
      updateTestimonial(editingId, {
        name: values.name,
        text: values.text,
        artistName: values.artistName,
        rating: values.rating,
      });
      toast({ title: "Değişiklikler kaydedildi" });
    }
    setEditingId(null);
  });

  const handleDelete = (id: string) => {
    if (window.confirm("Bu yorumu silmek istediğinize emin misiniz?")) {
      deleteTestimonial(id);
      toast({ title: "Yorum silindi", variant: "destructive" });
      setEditingId(null);
    }
  };

  return (
    <div className="space-y-4">
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle>Müşteri Yorumları</CardTitle>
          <CardDescription>
            Ana sayfadaki &quot;Müşterilerimiz Ne Diyor&quot; bölümünde görünen yorumları yönetin.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {data.testimonials.map((t) => (
              <div
                key={t.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-zinc-800 bg-zinc-800/50 p-4"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <Quote className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <p className="font-medium text-zinc-100">{t.name}</p>
                    <p className="text-sm text-zinc-500 line-clamp-1">&quot;{t.text}&quot;</p>
                    <p className="text-xs text-primary mt-1">{t.artistName}</p>
                    <div className="flex gap-0.5 mt-1">
                      {Array.from({ length: t.rating }).map((_, i) => (
                        <Star key={i} size={14} className="text-primary fill-primary" />
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-zinc-600"
                    onClick={() => openEdit(t.id)}
                  >
                    Düzenle
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-red-900/50 text-red-400 hover:bg-red-950"
                    onClick={() => handleDelete(t.id)}
                  >
                    Sil
                  </Button>
                </div>
              </div>
            ))}
          </div>
          <Button className="mt-4 bg-primary hover:bg-primary/90" onClick={openCreate}>
            Yorum Ekle
          </Button>
        </CardContent>
      </Card>

      <Dialog open={!!editingId} onOpenChange={(open) => !open && setEditingId(null)}>
        <DialogContent className="max-w-lg bg-zinc-900 border-zinc-800 text-zinc-100">
          <DialogHeader>
            <DialogTitle>{isCreate ? "Yeni Yorum" : "Yorum Düzenle"}</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                onSave(e);
              }}
              className="space-y-4"
            >
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ad Soyad</FormLabel>
                    <FormControl>
                      <Input
                        className="bg-zinc-800 border-zinc-700"
                        placeholder="Müşteri adı"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="text"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Yorum</FormLabel>
                    <FormControl>
                      <Textarea
                        className="bg-zinc-800 border-zinc-700"
                        placeholder="Müşteri yorumu..."
                        rows={4}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="artistName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sanatçı</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={data.artists.length === 0}
                    >
                      <FormControl>
                        <SelectTrigger className="bg-zinc-800 border-zinc-700">
                          <SelectValue placeholder="Sanatçı seçiniz" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {data.artists.map((a) => (
                          <SelectItem key={a.id} value={a.name}>
                            {a.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {data.artists.length === 0 && (
                      <p className="text-xs text-zinc-500">Önce sanatçı ekleyin.</p>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="rating"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Yıldız Seç</FormLabel>
                    <FormControl>
                      <StarRating
                        value={field.value}
                        onChange={field.onChange}
                        disabled={false}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setEditingId(null)}>
                  İptal
                </Button>
                <Button type="submit" className="bg-primary hover:bg-primary/90">
                  {isCreate ? "Yorum Ekle" : "Değişiklikleri Kaydet"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
