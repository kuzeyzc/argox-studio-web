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
import { IconPicker } from "@/components/admin/IconPicker";

const valueSchema = z.object({
  icon: z.string(),
  title: z.string().min(1, "Değer başlığı gerekli"),
  description: z.string(),
});

type ValueFormValues = z.infer<typeof valueSchema>;

export function AdminValues() {
  const { data, createValue, updateValue, deleteValue } = useStudioData();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isCreate, setIsCreate] = useState(false);
  const { toast } = useToast();

  const form = useForm<ValueFormValues>({
    resolver: zodResolver(valueSchema),
    defaultValues: { icon: "Palette", title: "", description: "" },
  });

  const openEdit = (id: string) => {
    const item = data.values.find((v) => v.id === id);
    if (item) {
      form.reset({ icon: item.icon, title: item.title, description: item.description });
      setEditingId(id);
      setIsCreate(false);
    }
  };

  const openCreate = () => {
    form.reset({ icon: "Palette", title: "", description: "" });
    setEditingId("new");
    setIsCreate(true);
  };

  const onSave = form.handleSubmit((values) => {
    if (isCreate) {
      createValue(values);
      toast({ title: "Değer eklendi" });
    } else if (editingId && editingId !== "new") {
      updateValue(editingId, values);
      toast({ title: "Değişiklikler kaydedildi" });
    }
    setEditingId(null);
  });

  const handleDelete = (id: string) => {
    if (window.confirm("Bu değeri silmek istediğinize emin misiniz?")) {
      deleteValue(id);
      toast({ title: "Değer silindi", variant: "destructive" });
      setEditingId(null);
    }
  };

  return (
    <div className="space-y-4">
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle>Değerlerimiz</CardTitle>
          <CardDescription>Hakkımızda sayfasındaki Değerlerimiz bölümü</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {data.values.map((v) => (
              <div
                key={v.id}
                className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-800/50 p-4"
              >
                <div>
                  <p className="font-medium text-zinc-100">{v.title}</p>
                  <p className="text-sm text-zinc-500 line-clamp-1">{v.description}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="border-zinc-600" onClick={() => openEdit(v.id)}>
                    Düzenle
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-red-900/50 text-red-400 hover:bg-red-950"
                    onClick={() => handleDelete(v.id)}
                  >
                    Sil
                  </Button>
                </div>
              </div>
            ))}
          </div>
          <Button className="mt-4 bg-primary hover:bg-primary/90" onClick={openCreate}>
            Yeni Değer Ekle
          </Button>
        </CardContent>
      </Card>

      <Dialog
        open={!!editingId}
        onOpenChange={(open) => !open && setEditingId(null)}
      >
        <DialogContent className="max-w-lg bg-zinc-900 border-zinc-800 text-zinc-100">
          <DialogHeader>
            <DialogTitle>{isCreate ? "Yeni Değer Ekle" : "Değer Düzenle"}</DialogTitle>
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
                name="icon"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <IconPicker
                        label="İkon"
                        value={field.value}
                        onChange={field.onChange}
                        previewTitle={form.watch("title") || "Değer başlığı"}
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
                    <FormLabel>Değer Başlığı</FormLabel>
                    <FormControl>
                      <Input className="bg-zinc-800 border-zinc-700" {...field} placeholder="Örn: Sanat" />
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
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setEditingId(null)}>
                  İptal
                </Button>
                <Button type="submit" className="bg-primary hover:bg-primary/90">
                  {isCreate ? "Ekle" : "Değişiklikleri Kaydet"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
