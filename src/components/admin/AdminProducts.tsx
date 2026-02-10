import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useStudioData } from "@/hooks/useStudioData";
import type { Product, ProductCategory, ProductStockStatus } from "@/data/studio-data";
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

const categoryOptions: { value: ProductCategory; label: string }[] = [
  { value: "Kıyafet", label: "Kıyafet" },
  { value: "Aksesuar", label: "Aksesuar" },
];

const stockOptions: { value: ProductStockStatus; label: string }[] = [
  { value: "Var", label: "Var" },
  { value: "Yok", label: "Yok" },
];

const productSchema = z.object({
  name: z.string().min(1, "Ürün adı gerekli"),
  description: z.string(),
  price: z.string().min(1, "Fiyat gerekli"),
  imageUrl: z.string().min(1, "Görsel gerekli"),
  category: z.enum(["Kıyafet", "Aksesuar"]),
  stockStatus: z.enum(["Var", "Yok"]),
  whatsappNumber: z.string(),
});

type ProductFormValues = z.infer<typeof productSchema>;

export function AdminProducts() {
  const { data, createProduct, updateProduct, deleteProduct } = useStudioData();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isCreate, setIsCreate] = useState(false);
  const { toast } = useToast();

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      description: "",
      price: "",
      imageUrl: "",
      category: "Kıyafet",
      stockStatus: "Var",
      whatsappNumber: "",
    },
  });

  const openEdit = (id: string) => {
    const pr = data.products.find((p) => p.id === id);
    if (pr) {
      form.reset({
        name: pr.name,
        description: pr.description,
        price: pr.price,
        imageUrl: pr.imageUrl,
        category: pr.category,
        stockStatus: pr.stockStatus,
        whatsappNumber: pr.whatsappNumber ?? "",
      });
      setEditingId(id);
      setIsCreate(false);
    }
  };

  const openCreate = () => {
    form.reset({
      name: "",
      description: "",
      price: "",
      imageUrl: "",
      category: "Kıyafet",
      stockStatus: "Var",
      whatsappNumber: "",
    });
    setEditingId("new");
    setIsCreate(true);
  };

  const onSave = form.handleSubmit((values) => {
    if (isCreate) {
      createProduct({
        name: values.name,
        description: values.description,
        price: values.price,
        imageUrl: values.imageUrl,
        category: values.category,
        stockStatus: values.stockStatus,
        whatsappNumber: values.whatsappNumber?.trim() || undefined,
      });
      toast({ title: "Ürün eklendi" });
    } else if (editingId && editingId !== "new") {
      updateProduct(editingId, {
        name: values.name,
        description: values.description,
        price: values.price,
        imageUrl: values.imageUrl,
        category: values.category,
        stockStatus: values.stockStatus,
        whatsappNumber: values.whatsappNumber?.trim() || undefined,
      });
      toast({ title: "Ürün güncellendi" });
    }
    setEditingId(null);
  });

  const handleDelete = (id: string) => {
    if (window.confirm("Bu ürünü silmek istediğinize emin misiniz?")) {
      deleteProduct(id);
      toast({ title: "Ürün silindi", variant: "destructive" });
      setEditingId(null);
    }
  };

  return (
    <div className="space-y-4">
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle>Tasarım Ürünler (Kıyafet & Aksesuar)</CardTitle>
          <CardDescription>
            Koleksiyon sayfasında görünecek ürünleri ekleyin, fiyat ve stok durumunu güncelleyin.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {data.products.map((pr) => (
              <div
                key={pr.id}
                className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-800/50 p-4"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-14 h-14 rounded-lg overflow-hidden bg-zinc-700 flex-shrink-0">
                    {pr.imageUrl ? (
                      <img src={pr.imageUrl} alt={pr.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-zinc-500 text-xs">
                        Görsel yok
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-zinc-100 truncate">{pr.name}</p>
                    <p className="text-sm text-zinc-500">
                      {pr.category} · {pr.price} · Stok: {pr.stockStatus}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <Button variant="outline" size="sm" className="border-zinc-600" onClick={() => openEdit(pr.id)}>
                    Düzenle
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-red-900/50 text-red-400 hover:bg-red-950"
                    onClick={() => handleDelete(pr.id)}
                  >
                    Sil
                  </Button>
                </div>
              </div>
            ))}
          </div>
          <Button className="mt-4 bg-primary hover:bg-primary/90" onClick={openCreate}>
            Yeni Ürün Ekle
          </Button>
        </CardContent>
      </Card>

      <Dialog open={!!editingId} onOpenChange={(open) => !open && setEditingId(null)}>
        <DialogContent className="max-w-lg bg-zinc-900 border-zinc-800 text-zinc-100 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isCreate ? "Yeni Ürün" : "Ürün Düzenle"}</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSave)} className="space-y-4">
              <FormField
                control={form.control}
                name="imageUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <ImageFileInput label="Ürün görseli" value={field.value} onChange={field.onChange} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ürün adı</FormLabel>
                    <FormControl>
                      <Input className="bg-zinc-800 border-zinc-700" {...field} placeholder="Örn. ArgoX Logo Tişört" />
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
                      <Textarea className="bg-zinc-800 border-zinc-700" {...field} rows={2} placeholder="Kısa açıklama" />
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
                      <Input className="bg-zinc-800 border-zinc-700" {...field} placeholder="₺299" />
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
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-zinc-800 border-zinc-700">
                          <SelectValue />
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
                name="stockStatus"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stok durumu</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-zinc-800 border-zinc-700">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {stockOptions.map((opt) => (
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
                name="whatsappNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>WhatsApp Sipariş Numarası</FormLabel>
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
                <Button type="button" variant="outline" onClick={() => setEditingId(null)}>
                  İptal
                </Button>
                <Button type="submit" className="bg-primary hover:bg-primary/90">
                  {isCreate ? "Ekle" : "Kaydet"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
