import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useStudioData } from "@/hooks/useStudioData";
import { Button } from "@/components/ui/button";
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
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { ImageFileInput } from "@/components/admin/ImageFileInput";
import { defaultContactHoursContent } from "@/data/studio-data";

const workingHoursItemSchema = z.object({
  day: z.string(),
  hours: z.string(),
  isClosed: z.boolean(),
});

const contactSchema = z.object({
  phone: z.string(),
  address: z.string(),
  email: z.string().email(),
  mapEmbedUrl: z.string(),
  studioSectionTitle: z.string(),
  studioSectionSubtitle: z.string(),
  contactTitle: z.string(),
  phoneLabel: z.string(),
  locationLabel: z.string(),
  emailLabel: z.string(),
  hoursLabel: z.string(),
  studioPhotos: z.array(z.string()).length(4),
  workingHours: z.array(workingHoursItemSchema).length(7),
});

const footerSchema = z.object({
  copyright: z.string(),
});

export function AdminContactHours() {
  const { data, updateContact, updateFooter } = useStudioData();
  const { toast } = useToast();

  const studioPhotos = data.contact.studioPhotos ?? [];
  const defaultHours = defaultContactHoursContent.workingHours;
  const contactForm = useForm<z.infer<typeof contactSchema>>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      ...data.contact,
      mapEmbedUrl: data.contact.mapEmbedUrl ?? "",
      studioPhotos: [
        studioPhotos[0] ?? "",
        studioPhotos[1] ?? "",
        studioPhotos[2] ?? "",
        studioPhotos[3] ?? "",
      ],
      workingHours: Array.from({ length: 7 }, (_, i) =>
        data.contact.workingHours[i]
          ? { day: data.contact.workingHours[i].day, hours: data.contact.workingHours[i].hours, isClosed: data.contact.workingHours[i].isClosed }
          : { day: defaultHours[i]?.day ?? "", hours: defaultHours[i]?.hours ?? "10:00 - 20:00", isClosed: defaultHours[i]?.isClosed ?? false }
      ),
    },
  });

  const footerForm = useForm<z.infer<typeof footerSchema>>({
    resolver: zodResolver(footerSchema),
    defaultValues: data.footer,
  });

  return (
    <div className="space-y-6">
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle>İletişim ve Saatler</CardTitle>
          <CardDescription>
            Stüdyo iletişim bilgileri ve çalışma saatleri. Harita embed URL’i Google Maps paylaşım linkinden alınabilir.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...contactForm}>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                contactForm.handleSubmit((values) => {
                  updateContact({
                    ...values,
                    mapEmbedUrl: values.mapEmbedUrl || undefined,
                    studioPhotos: values.studioPhotos,
                    workingHours: values.workingHours,
                  });
                  toast({ title: "Değişiklikler kaydedildi" });
                })(e);
              }}
              className="space-y-4"
            >
              <FormField
                control={contactForm.control}
                name="studioSectionTitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stüdyo bölüm başlığı</FormLabel>
                    <FormControl>
                      <Input className="bg-zinc-800 border-zinc-700" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={contactForm.control}
                name="studioSectionSubtitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stüdyo alt başlık</FormLabel>
                    <FormControl>
                      <Input className="bg-zinc-800 border-zinc-700" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="space-y-2">
                <p className="text-sm font-medium text-zinc-300">Stüdyo fotoğrafları (4 adet)</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {([0, 1, 2, 3] as const).map((i) => (
                    <FormField
                      key={i}
                      control={contactForm.control}
                      name={`studioPhotos.${i}`}
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <ImageFileInput
                              label={`Fotoğraf ${i + 1}`}
                              value={field.value}
                              onChange={field.onChange}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  ))}
                </div>
              </div>
              <FormField
                control={contactForm.control}
                name="contactTitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>İletişim kutusu başlığı</FormLabel>
                    <FormControl>
                      <Input className="bg-zinc-800 border-zinc-700" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={contactForm.control}
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
                control={contactForm.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Adres</FormLabel>
                    <FormControl>
                      <Textarea className="bg-zinc-800 border-zinc-700" {...field} rows={2} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={contactForm.control}
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
                control={contactForm.control}
                name="mapEmbedUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Harita embed URL</FormLabel>
                    <FormControl>
                      <Input className="bg-zinc-800 border-zinc-700" {...field} placeholder="https://..." />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="space-y-3">
                <p className="text-sm font-medium text-zinc-300">Çalışma saatleri (7 gün)</p>
                <div className="rounded-lg border border-zinc-800 bg-zinc-800/30 divide-y divide-zinc-800">
                  {([0, 1, 2, 3, 4, 5, 6] as const).map((i) => (
                    <div key={i} className="flex flex-wrap items-center gap-3 p-3">
                      <FormField
                        control={contactForm.control}
                        name={`workingHours.${i}.day`}
                        render={({ field }) => (
                          <FormItem className="w-28 flex-shrink-0">
                            <FormLabel className="text-xs text-zinc-400">Gün</FormLabel>
                            <FormControl>
                              <Input className="bg-zinc-900 border-zinc-700 text-zinc-300" {...field} readOnly />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={contactForm.control}
                        name={`workingHours.${i}.hours`}
                        render={({ field }) => (
                          <FormItem className="flex-1 min-w-[140px]">
                            <FormLabel className="text-xs text-zinc-400">Saatler</FormLabel>
                            <FormControl>
                              <Input
                                className="bg-zinc-800 border-zinc-700"
                                {...field}
                                placeholder="10:00 - 20:00"
                                disabled={contactForm.watch(`workingHours.${i}.isClosed`)}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={contactForm.control}
                        name={`workingHours.${i}.isClosed`}
                        render={({ field }) => (
                          <FormItem className="flex items-end gap-2 pb-2">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={(v) => field.onChange(v === true)}
                                className="border-zinc-600 data-[state=checked]:bg-primary"
                              />
                            </FormControl>
                            <FormLabel className="text-sm text-zinc-400 cursor-pointer">Kapalı</FormLabel>
                          </FormItem>
                        )}
                      />
                    </div>
                  ))}
                </div>
              </div>
              <Button type="submit" className="bg-primary hover:bg-primary/90">
                Değişiklikleri Kaydet
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle>Alt Bilgi</CardTitle>
          <CardDescription>Alt bilgi metni (telif)</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...footerForm}>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                footerForm.handleSubmit((values) => {
                  updateFooter(values);
                  toast({ title: "Değişiklikler kaydedildi" });
                })(e);
              }}
              className="space-y-4"
            >
              <FormField
                control={footerForm.control}
                name="copyright"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telif metni</FormLabel>
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
    </div>
  );
}
