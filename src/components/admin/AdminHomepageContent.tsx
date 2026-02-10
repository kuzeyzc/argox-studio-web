import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useStudioData } from "@/hooks/useStudioData";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import { AdminValues } from "@/components/admin/AdminValues";

const heroSchema = z.object({
  tagline: z.string(),
  titleLine1: z.string(),
  titleLine2: z.string(),
  subtitle: z.string(),
  ctaGallery: z.string(),
  ctaArtists: z.string(),
});

const aboutSchema = z.object({
  sectionLabel: z.string(),
  sectionTitle: z.string(),
  paragraph1: z.string(),
  paragraph2: z.string(),
  locationLabel: z.string(),
  locationValue: z.string(),
  hoursLabel: z.string(),
  hoursValue: z.string(),
  certificationLabel: z.string(),
  certificationValue: z.string(),
  statTattoos: z.string(),
  statArtists: z.string(),
  statYears: z.string(),
  statAwards: z.string(),
  moreLinkText: z.string(),
});

const testimonialsLabelsSchema = z.object({
  sectionLabel: z.string(),
  sectionTitle: z.string(),
});

const recentlyInkedLabelsSchema = z.object({
  sectionLabel: z.string(),
  sectionTitle: z.string(),
  viewAllText: z.string(),
});

export function AdminHomepageContent() {
  const { data, updateHero, updateAbout, updateSectionLabels } = useStudioData();
  const { toast } = useToast();

  const heroForm = useForm<z.infer<typeof heroSchema>>({
    resolver: zodResolver(heroSchema),
    defaultValues: data.hero,
  });

  const aboutForm = useForm<z.infer<typeof aboutSchema>>({
    resolver: zodResolver(aboutSchema),
    defaultValues: data.about,
  });

  useEffect(() => {
    aboutForm.reset(data.about);
  }, [data.about]);

  const testimonialsForm = useForm<z.infer<typeof testimonialsLabelsSchema>>({
    resolver: zodResolver(testimonialsLabelsSchema),
    defaultValues: data.sectionLabels.testimonials,
  });

  const recentlyInkedForm = useForm<z.infer<typeof recentlyInkedLabelsSchema>>({
    resolver: zodResolver(recentlyInkedLabelsSchema),
    defaultValues: data.sectionLabels.recentlyInked,
  });

  useEffect(() => {
    recentlyInkedForm.reset(data.sectionLabels.recentlyInked);
  }, [data.sectionLabels.recentlyInked]);

  return (
    <Tabs defaultValue="hero" className="space-y-4">
      <TabsList className="bg-zinc-800 border border-zinc-700">
        <TabsTrigger value="hero">Ana Başlık (Slogan)</TabsTrigger>
        <TabsTrigger value="about">Stüdyo Hakkında</TabsTrigger>
        <TabsTrigger value="values">Değerlerimiz</TabsTrigger>
        <TabsTrigger value="testimonials">Referanslar (etiketler)</TabsTrigger>
        <TabsTrigger value="recentlyInked">Yeni Tasarım & Piercing</TabsTrigger>
      </TabsList>
      <TabsContent value="hero">
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle>Ana Başlık (Slogan)</CardTitle>
            <CardDescription>Ana sayfa üst metinleri</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...heroForm}>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  heroForm.handleSubmit((values) => {
                    updateHero(values);
                    toast({ title: "Değişiklikler kaydedildi" });
                  })(e);
                }}
                className="space-y-4"
              >
                <FormField
                  control={heroForm.control}
                  name="tagline"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Üst etiket</FormLabel>
                      <FormControl>
                        <Input className="bg-zinc-800 border-zinc-700" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={heroForm.control}
                  name="titleLine1"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Başlık satır 1</FormLabel>
                      <FormControl>
                        <Input className="bg-zinc-800 border-zinc-700" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={heroForm.control}
                  name="titleLine2"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Başlık satır 2</FormLabel>
                      <FormControl>
                        <Input className="bg-zinc-800 border-zinc-700" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={heroForm.control}
                  name="subtitle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Alt Başlık / Açıklama</FormLabel>
                      <FormControl>
                        <Textarea className="bg-zinc-800 border-zinc-700" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={heroForm.control}
                  name="ctaGallery"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Galeri butonu metni</FormLabel>
                      <FormControl>
                        <Input className="bg-zinc-800 border-zinc-700" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={heroForm.control}
                  name="ctaArtists"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sanatçılar butonu metni</FormLabel>
                      <FormControl>
                        <Input className="bg-zinc-800 border-zinc-700" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="bg-primary hover:bg-primary/90">
                  Değişiklikleri Kaydet
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="about">
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle>Stüdyo Hakkında</CardTitle>
            <CardDescription>Stüdyo hakkında metinler ve istatistikler</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...aboutForm}>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  aboutForm.handleSubmit((values) => {
                    updateAbout(values);
                    toast({ title: "Değişiklikler kaydedildi" });
                  })(e);
                }}
                className="space-y-4"
              >
                <FormField
                  control={aboutForm.control}
                  name="sectionLabel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bölüm etiketi</FormLabel>
                      <FormControl>
                        <Input className="bg-zinc-800 border-zinc-700" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={aboutForm.control}
                  name="sectionTitle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bölüm başlığı</FormLabel>
                      <FormControl>
                        <Input className="bg-zinc-800 border-zinc-700" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={aboutForm.control}
                  name="paragraph1"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Paragraf 1</FormLabel>
                      <FormControl>
                        <Textarea className="bg-zinc-800 border-zinc-700" {...field} rows={3} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={aboutForm.control}
                  name="paragraph2"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Paragraf 2</FormLabel>
                      <FormControl>
                        <Textarea className="bg-zinc-800 border-zinc-700" {...field} rows={3} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={aboutForm.control}
                    name="locationLabel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Konum etiketi</FormLabel>
                        <FormControl>
                          <Input className="bg-zinc-800 border-zinc-700" placeholder="Konum" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={aboutForm.control}
                    name="locationValue"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Konum bilgisi</FormLabel>
                        <FormControl>
                          <Input className="bg-zinc-800 border-zinc-700" placeholder="Kadıköy, İstanbul" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={aboutForm.control}
                    name="hoursLabel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Çalışma saatleri etiketi</FormLabel>
                        <FormControl>
                          <Input className="bg-zinc-800 border-zinc-700" placeholder="Çalışma Saatleri" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={aboutForm.control}
                    name="hoursValue"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Çalışma saatleri özeti</FormLabel>
                        <FormControl>
                          <Input className="bg-zinc-800 border-zinc-700" placeholder="Sal–Cum, 11–20" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={aboutForm.control}
                    name="certificationLabel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sertifika etiketi</FormLabel>
                        <FormControl>
                          <Input className="bg-zinc-800 border-zinc-700" placeholder="Sertifikalı" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={aboutForm.control}
                    name="certificationValue"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sertifika / hijyen bilgisi</FormLabel>
                        <FormControl>
                          <Input className="bg-zinc-800 border-zinc-700" placeholder="ISO 9001 Hijyen" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={aboutForm.control}
                  name="moreLinkText"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Daha fazla link metni</FormLabel>
                      <FormControl>
                        <Input className="bg-zinc-800 border-zinc-700" placeholder="Daha Fazla" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  {(
                    [
                      { name: "statTattoos" as const, label: "Yapılan dövme (örn. 5K+)" },
                      { name: "statArtists" as const, label: "Usta sanatçı sayısı" },
                      { name: "statYears" as const, label: "Yıl tecrübe (örn. 7+)" },
                      { name: "statAwards" as const, label: "Kazanılan ödül (örn. 15+)" },
                    ] as const
                  ).map(({ name, label }) => (
                    <FormField
                      key={name}
                      control={aboutForm.control}
                      name={name}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{label}</FormLabel>
                          <FormControl>
                            <Input className="bg-zinc-800 border-zinc-700" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  ))}
                </div>
                <Button type="submit" className="bg-primary hover:bg-primary/90">
                  Değişiklikleri Kaydet
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="values">
        <AdminValues />
      </TabsContent>
      <TabsContent value="testimonials">
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle>Referanslar bölümü etiketleri</CardTitle>
            <CardDescription>Müşteri yorumları bölümü başlıkları</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...testimonialsForm}>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  testimonialsForm.handleSubmit((values) => {
                    updateSectionLabels("testimonials", values);
                    toast({ title: "Değişiklikler kaydedildi" });
                  })(e);
                }}
                className="space-y-4"
              >
                <FormField
                  control={testimonialsForm.control}
                  name="sectionLabel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bölüm etiketi</FormLabel>
                      <FormControl>
                        <Input className="bg-zinc-800 border-zinc-700" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={testimonialsForm.control}
                  name="sectionTitle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bölüm başlığı</FormLabel>
                      <FormControl>
                        <Input className="bg-zinc-800 border-zinc-700" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="bg-primary hover:bg-primary/90">
                  Değişiklikleri Kaydet
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="recentlyInked">
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle>Yeni Tasarım & Piercing bölümü etiketleri</CardTitle>
            <CardDescription>Ana sayfadaki son çalışmalar / yeni tasarımlar bölümünün başlık ve etiketleri</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...recentlyInkedForm}>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  recentlyInkedForm.handleSubmit((values) => {
                    updateSectionLabels("recentlyInked", values);
                    toast({ title: "Değişiklikler kaydedildi" });
                  })(e);
                }}
                className="space-y-4"
              >
                <FormField
                  control={recentlyInkedForm.control}
                  name="sectionLabel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bölüm etiketi</FormLabel>
                      <FormControl>
                        <Input className="bg-zinc-800 border-zinc-700" placeholder="Son Çalışmalar" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={recentlyInkedForm.control}
                  name="sectionTitle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bölüm başlığı</FormLabel>
                      <FormControl>
                        <Input className="bg-zinc-800 border-zinc-700" placeholder="Yeni Tasarım & Piercing" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={recentlyInkedForm.control}
                  name="viewAllText"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>“Tümünü gör” link metni</FormLabel>
                      <FormControl>
                        <Input className="bg-zinc-800 border-zinc-700" placeholder="Tümünü Gör" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="bg-primary hover:bg-primary/90">
                  Değişiklikleri Kaydet
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
