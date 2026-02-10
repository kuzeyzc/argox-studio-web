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
import { useToast } from "@/hooks/use-toast";
import { ImageFileInput } from "@/components/admin/ImageFileInput";
import { VideoUploadInput } from "@/components/admin/VideoUploadInput";

const artistSchema = z.object({
  name: z.string().min(1, "İsim gerekli"),
  specialty: z.string(),
  bio: z.string(),
  experience: z.string(),
  email: z.string().email("Geçerli e-posta girin"),
  phone: z.string(),
  image: z.string(),
  bannerVideoUrl: z.string(),
  instagram: z.string().optional(),
  twitter: z.string().optional(),
  behance: z.string().optional(),
});

type ArtistFormValues = z.infer<typeof artistSchema>;

const defaultFormValues: ArtistFormValues = {
  name: "",
  specialty: "",
  bio: "",
  experience: "",
  email: "",
  phone: "",
  image: "",
  bannerVideoUrl: "",
  instagram: "",
  twitter: "",
  behance: "",
};

export function AdminArtists() {
  const { data, currentUser, createArtist, updateArtist, deleteArtist } = useStudioData();
  const [editingId, setEditingId] = useState<string | null>(null);
  const { toast } = useToast();

  const isManager = currentUser.role === "MANAGER";
  const isCreate = editingId === "new";
  const artists = isManager
    ? data.artists
    : data.artists.filter((a) => a.id === currentUser.artistId);

  const form = useForm<ArtistFormValues>({
    resolver: zodResolver(artistSchema),
    defaultValues: defaultFormValues,
  });

  const openEdit = (artist: (typeof data.artists)[0]) => {
    form.reset({
      ...defaultFormValues,
      name: artist.name,
      specialty: artist.specialty,
      bio: artist.bio,
      experience: artist.experience,
      email: artist.email,
      phone: artist.phone,
      image: typeof artist.image === "string" ? artist.image : "",
      bannerVideoUrl: artist.bannerVideoUrl ?? "",
      instagram: artist.socials?.instagram ?? "",
      twitter: artist.socials?.twitter ?? "",
      behance: artist.socials?.behance ?? "",
    });
    setEditingId(artist.id);
  };

  const openCreate = () => {
    form.reset(defaultFormValues);
    setEditingId("new");
  };

  const onSave = form.handleSubmit((values) => {
    if (!editingId) return;
    if (isCreate) {
      try {
        createArtist({
          name: values.name,
          email: values.email,
          specialty: values.specialty,
          image: values.image || "",
          bannerVideoUrl: values.bannerVideoUrl || "",
          bio: values.bio || "",
          experience: values.experience || "",
          phone: values.phone || "",
          socials: {
            instagram: values.instagram || undefined,
            twitter: values.twitter || undefined,
            behance: values.behance || undefined,
          },
        });
        toast({
          title: "Sanatçı eklendi",
          description: "Giriş için sanatçı /sanatci-sifre sayfasından şifre oluşturabilir.",
        });
        setEditingId(null);
      } catch (e) {
        toast({ title: e instanceof Error ? e.message : "Yetkisiz", variant: "destructive" });
      }
      return;
    }
    updateArtist(editingId, {
      name: values.name,
      specialty: values.specialty,
      bio: values.bio,
      experience: values.experience,
      email: values.email,
      phone: values.phone,
      image: values.image || undefined,
      bannerVideoUrl: values.bannerVideoUrl || undefined,
      socials: {
        instagram: values.instagram || undefined,
        twitter: values.twitter || undefined,
        behance: values.behance || undefined,
      },
    });
    toast({ title: "Profil güncellendi" });
    setEditingId(null);
  });

  const handleDelete = (id: string) => {
    if (!isManager) return;
    if (window.confirm("Bu sanatçıyı silmek istediğinize emin misiniz?")) {
      deleteArtist(id);
      toast({ title: "Sanatçı silindi", variant: "destructive" });
      setEditingId(null);
    }
  };

  return (
    <div className="space-y-4">
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle>Sanatçılar</CardTitle>
          <CardDescription>
            {isManager ? "Tüm sanatçıları düzenleyebilirsiniz." : "Sadece kendi profilinizi düzenleyebilirsiniz."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isManager && (
            <Button className="mb-4 bg-primary hover:bg-primary/90" onClick={openCreate}>
              Yeni Sanatçı Ekle
            </Button>
          )}
          <div className="space-y-3">
            {artists.map((artist) => (
              <div
                key={artist.id}
                className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-800/50 p-4"
              >
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full overflow-hidden bg-zinc-700 flex items-center justify-center">
                    {typeof artist.image === "string" && artist.image ? (
                      <img src={artist.image} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-lg font-heading font-bold text-zinc-500">
                        {artist.name.charAt(0)}
                      </span>
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-zinc-100">{artist.name}</p>
                    <p className="text-sm text-zinc-500">{artist.specialty}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="border-zinc-600" onClick={() => openEdit(artist)}>
                    Düzenle
                  </Button>
                  {isManager && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-red-900/50 text-red-400 hover:bg-red-950"
                      onClick={() => handleDelete(artist.id)}
                    >
                      Sil
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!editingId} onOpenChange={(open) => !open && setEditingId(null)}>
        <DialogContent className="max-w-lg bg-zinc-900 border-zinc-800 text-zinc-100 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isCreate ? "Yeni Sanatçı Ekle" : "Sanatçı Düzenle"}</DialogTitle>
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
                    <FormLabel>Ad</FormLabel>
                    <FormControl>
                      <Input className="bg-zinc-800 border-zinc-700" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="specialty"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Branş / İlgi Alanları</FormLabel>
                    <FormControl>
                      <Input className="bg-zinc-800 border-zinc-700" {...field} placeholder="Örn: Japon & Blackwork" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {isCreate && (
                <p className="text-xs text-zinc-500 -mt-2">
                  Sanatçı girişi için e-posta kaydedildikten sonra <strong>/sanatci-sifre</strong> sayfasından şifre oluşturulur.
                </p>
              )}
              <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Biyografi</FormLabel>
                    <FormControl>
                      <Textarea className="bg-zinc-800 border-zinc-700" {...field} rows={4} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="experience"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Deneyim</FormLabel>
                    <FormControl>
                      <Input className="bg-zinc-800 border-zinc-700" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>E-posta</FormLabel>
                    <FormControl>
                      <Input className="bg-zinc-800 border-zinc-700" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefon</FormLabel>
                    <FormControl>
                      <Input className="bg-zinc-800 border-zinc-700" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="image"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <ImageFileInput
                        label="Profil fotoğrafı"
                        value={field.value}
                        onChange={field.onChange}
                        previewClassName="rounded-full w-24 h-24"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="bannerVideoUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <VideoUploadInput
                        label="Banner Video (profil sayfası üst alan)"
                        value={field.value}
                        onChange={field.onChange}
                        artistId={isCreate ? null : editingId}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-3 gap-2">
                <FormField
                  control={form.control}
                  name="instagram"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Instagram</FormLabel>
                      <FormControl>
                        <Input className="bg-zinc-800 border-zinc-700" {...field} placeholder="kullanici" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="twitter"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Twitter</FormLabel>
                      <FormControl>
                        <Input className="bg-zinc-800 border-zinc-700" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="behance"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Behance</FormLabel>
                      <FormControl>
                        <Input className="bg-zinc-800 border-zinc-700" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setEditingId(null)}>
                  İptal
                </Button>
                <Button type="submit" className="bg-primary hover:bg-primary/90">
                  Değişiklikleri Kaydet
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
