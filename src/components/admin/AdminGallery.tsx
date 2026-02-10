import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useStudioData } from "@/hooks/useStudioData";
import type { TattooWork } from "@/data/studio-data";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ImageFileInput } from "@/components/admin/ImageFileInput";

const categoryOptions: { value: TattooWork["category"]; label: string }[] = [
  { value: "Dövme", label: "Dövme" },
  { value: "Piercing", label: "Piercing" },
  { value: "Sanat", label: "Tasarım" },
];

const uploadSchema = z.object({
  title: z.string().min(1, "Başlık gerekli"),
  category: z.enum(["Dövme", "Piercing", "Sanat"]),
  artistId: z.string().min(1, "Sanatçı seçin"),
  image: z.string().min(1, "Görsel gerekli"),
});

type UploadFormValues = z.infer<typeof uploadSchema>;

export function AdminGallery() {
  const { data, currentUser, createTattooWork, deleteTattooWork } = useStudioData();
  const [uploadOpen, setUploadOpen] = useState(false);
  const { toast } = useToast();

  const isManager = currentUser.role === "MANAGER";
  const works = isManager
    ? data.tattooWorks
    : data.tattooWorks.filter((w) => w.artistId === currentUser.artistId);

  const artistsForSelect = isManager
    ? data.artists
    : data.artists.filter((a) => a.id === currentUser.artistId);

  const form = useForm<UploadFormValues>({
    resolver: zodResolver(uploadSchema),
    defaultValues: {
      title: "",
      category: "Dövme",
      artistId: isManager ? "" : (currentUser.artistId ?? ""),
      image: "",
    },
  });

  const onSubmit = form.handleSubmit((values) => {
    const artist = data.artists.find((a) => a.id === values.artistId);
    try {
      createTattooWork({
        title: values.title,
        category: values.category,
        artistId: values.artistId,
        artistName: artist?.name ?? "",
        image: values.image,
      });
      toast({ title: "Yeni çalışma eklendi. Ana sayfa Yeni Mürekkepler ve sanatçı galerisinde görünecek." });
      form.reset({ title: "", category: "Dövme", artistId: values.artistId, image: "" });
      setUploadOpen(false);
    } catch (e) {
      toast({
        title: e instanceof Error ? e.message : "Yetkisiz Erişim",
        variant: "destructive",
      });
    }
  });

  const handleDelete = (work: TattooWork) => {
    if (!isManager && work.artistId !== currentUser.artistId) return;
    if (window.confirm(`"${work.title}" silinsin mi?`)) {
      deleteTattooWork(work.id);
      toast({ title: "Çalışma silindi", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Galeri</CardTitle>
            <CardDescription>
              Yeni yükleme hem ana sayfadaki &quot;Yeni Mürekkepler&quot; akışına hem de ilgili sanatçı sayfasına düşer.
            </CardDescription>
          </div>
          <Button
            className="bg-primary hover:bg-primary/90"
            onClick={() => {
              form.reset({
                title: "",
                category: "Dövme",
                artistId: isManager ? "" : (currentUser.artistId ?? ""),
                image: "",
              });
              setUploadOpen(true);
            }}
          >
            Yeni Çalışma Ekle
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {works.map((work) => (
              <div
                key={work.id}
                className="rounded-lg border border-zinc-800 overflow-hidden bg-zinc-800/50 group"
              >
                <div className="aspect-square overflow-hidden">
                  <img
                    src={work.image}
                    alt={work.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                </div>
                <div className="p-3">
                  <p className="font-medium text-zinc-200 text-sm truncate">{work.title}</p>
                  <p className="text-xs text-zinc-500">{work.artistName} · {work.category}</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-2 text-red-400 hover:text-red-300 hover:bg-red-950/50"
                    onClick={() => handleDelete(work)}
                  >
                    Sil
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
        <DialogContent className="max-w-md bg-zinc-900 border-zinc-800 text-zinc-100">
          <DialogHeader>
            <DialogTitle>Yeni Çalışma Ekle</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                onSubmit(e);
              }}
              className="space-y-4"
            >
              <FormField
                control={form.control}
                name="image"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <ImageFileInput
                        label="Galeri görseli"
                        value={field.value}
                        onChange={field.onChange}
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
                      <Input className="bg-zinc-800 border-zinc-700" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kategori</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="bg-zinc-800 border-zinc-700">
                          <SelectValue placeholder="Kategori Seç" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categoryOptions.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
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
                name="artistId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sanatçı</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={!isManager}
                    >
                      <FormControl>
                        <SelectTrigger className="bg-zinc-800 border-zinc-700">
                          <SelectValue placeholder="Sanatçı seçin" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {artistsForSelect.map((a) => (
                          <SelectItem key={a.id} value={a.id}>
                            {a.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {!isManager && (
                      <p className="text-xs text-zinc-500">Kendi çalışmanız olarak eklenir.</p>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setUploadOpen(false)}>
                  İptal
                </Button>
                <Button type="submit" className="bg-primary hover:bg-primary/90">
                  Yeni Çalışma Ekle
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
