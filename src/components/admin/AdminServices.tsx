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

const iconOptions = ["Pen", "RefreshCw", "Sparkles", "MessageSquare", "Star", "Heart"];

const serviceSchema = z.object({
  title: z.string().min(1),
  description: z.string(),
  icon: z.string(),
  price: z.string(),
});

type ServiceFormValues = z.infer<typeof serviceSchema>;

export function AdminServices() {
  const { data, createService, updateService, deleteService } = useStudioData();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isCreate, setIsCreate] = useState(false);
  const { toast } = useToast();

  const form = useForm<ServiceFormValues>({
    resolver: zodResolver(serviceSchema),
    defaultValues: { title: "", description: "", icon: "Pen", price: "" },
  });

  const openEdit = (id: string) => {
    const svc = data.services.find((s) => s.id === id);
    if (svc) {
      form.reset({ title: svc.title, description: svc.description, icon: svc.icon, price: svc.price });
      setEditingId(id);
      setIsCreate(false);
    }
  };

  const openCreate = () => {
    form.reset({ title: "", description: "", icon: "Pen", price: "" });
    setEditingId("new");
    setIsCreate(true);
  };

  const onSave = form.handleSubmit((values) => {
    if (isCreate) {
      createService(values);
      toast({ title: "Değişiklikler kaydedildi" });
    } else if (editingId && editingId !== "new") {
      updateService(editingId, values);
      toast({ title: "Değişiklikler kaydedildi" });
    }
    setEditingId(null);
  });

  const handleDelete = (id: string) => {
    if (window.confirm("Bu hizmeti silmek istediğinize emin misiniz?")) {
      deleteService(id);
      toast({ title: "Hizmet silindi", variant: "destructive" });
      setEditingId(null);
    }
  };

  return (
    <div className="space-y-4">
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle>Hizmetlerimiz</CardTitle>
          <CardDescription>Hizmet kartları ve fiyat bilgileri</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {data.services.map((svc) => (
              <div
                key={svc.id}
                className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-800/50 p-4"
              >
                <div>
                  <p className="font-medium text-zinc-100">{svc.title}</p>
                  <p className="text-sm text-zinc-500">{svc.price}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="border-zinc-600" onClick={() => openEdit(svc.id)}>
                    Düzenle
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-red-900/50 text-red-400 hover:bg-red-950"
                    onClick={() => handleDelete(svc.id)}
                  >
                    Sil
                  </Button>
                </div>
              </div>
            ))}
          </div>
          <Button className="mt-4 bg-primary hover:bg-primary/90" onClick={openCreate}>
            Yeni Hizmet Ekle
          </Button>
        </CardContent>
      </Card>

      <Dialog
        open={!!editingId}
        onOpenChange={(open) => !open && setEditingId(null)}
      >
        <DialogContent className="max-w-lg bg-zinc-900 border-zinc-800 text-zinc-100">
          <DialogHeader>
            <DialogTitle>{isCreate ? "Yeni Hizmet" : "Hizmet Düzenle"}</DialogTitle>
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
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Açıklama</FormLabel>
                    <FormControl>
                      <Textarea className="bg-zinc-800 border-zinc-700" {...field} rows={3} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="icon"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>İkon</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-zinc-800 border-zinc-700">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {iconOptions.map((opt) => (
                          <SelectItem key={opt} value={opt}>
                            {opt}
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
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fiyat metni</FormLabel>
                    <FormControl>
                      <Input className="bg-zinc-800 border-zinc-700" {...field} placeholder="₺3.000'den" />
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
