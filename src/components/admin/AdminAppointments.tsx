import { useEffect, useState, useCallback } from "react";
import { useStudioData } from "@/hooks/useStudioData";
import {
  fetchAppointmentsAll,
  fetchAppointmentsForArtist,
  updateAppointmentStatus,
  subscribeAppointments,
} from "@/lib/supabaseStudio";
import type { Appointment, AppointmentStatus } from "@/data/studio-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, X, Loader2, Calendar, ImageIcon } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface AdminAppointmentsProps {
  /** "all" = yönetici tüm randevular, "artist" = sadece bu sanatçının + Tercihim Yok */
  mode: "all" | "artist";
  artistId?: string;
  /** Dashboard içinde kompakt başlık için */
  compact?: boolean;
}

const statusLabels: Record<AppointmentStatus, string> = {
  pending: "Beklemede",
  confirmed: "Onaylandı",
  cancelled: "İptal",
};

const statusVariant: Record<AppointmentStatus, "secondary" | "default" | "destructive"> = {
  pending: "secondary",
  confirmed: "default",
  cancelled: "destructive",
};

export function AdminAppointments({ mode, artistId, compact }: AdminAppointmentsProps) {
  const { data } = useStudioData();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [previewUrls, setPreviewUrls] = useState<string[] | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      if (mode === "all") {
        const list = await fetchAppointmentsAll();
        setAppointments(list);
      } else if (artistId) {
        const list = await fetchAppointmentsForArtist(artistId);
        setAppointments(list);
      } else {
        setAppointments([]);
      }
    } catch (e) {
      console.error(e);
      toast.error("Randevular yüklenemedi.");
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  }, [mode, artistId]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const channel = subscribeAppointments(() => {
      load();
    });
    return () => {
      channel.unsubscribe();
    };
  }, [load]);

  const getArtistName = (aid: string | null) => {
    if (!aid) return "Tercihim Yok";
    const a = data.artists.find((x) => x.id === aid);
    return a?.name ?? aid;
  };

  const setStatus = async (id: string, status: AppointmentStatus) => {
    setUpdatingId(id);
    try {
      await updateAppointmentStatus(id, status);
      setAppointments((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));
      toast.success(status === "confirmed" ? "Randevu onaylandı." : "Randevu iptal edildi.");
    } catch (e) {
      console.error(e);
      toast.error("Durum güncellenemedi.");
    } finally {
      setUpdatingId(null);
    }
  };

  const formatDate = (d: string) => {
    const parsed = new Date(d);
    if (Number.isNaN(parsed.getTime())) return d;
    return parsed.toLocaleDateString("tr-TR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <Card className="bg-zinc-900 border-zinc-800">
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-zinc-500" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-zinc-900 border-zinc-800">
      <CardHeader className={compact ? "pb-2" : ""}>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Calendar className="h-5 w-5 text-zinc-500" />
          {compact ? "Tüm Randevular" : mode === "all" ? "Tüm Randevular" : "Randevularım"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {appointments.length === 0 ? (
          <p className="text-sm text-zinc-500 py-6 text-center">Henüz randevu yok.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-zinc-800 hover:bg-transparent">
                <TableHead className="text-zinc-400">Müşteri</TableHead>
                <TableHead className="text-zinc-400">İletişim</TableHead>
                <TableHead className="text-zinc-400">Tarih</TableHead>
                {mode === "all" && <TableHead className="text-zinc-400">Sanatçı</TableHead>}
                <TableHead className="text-zinc-400">Açıklama</TableHead>
                <TableHead className="text-zinc-400">Bütçe</TableHead>
                <TableHead className="text-zinc-400 w-[100px]">Referans</TableHead>
                <TableHead className="text-zinc-400">Durum</TableHead>
                <TableHead className="text-zinc-400 text-right">İşlem</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {appointments.map((a) => (
                <TableRow key={a.id} className="border-zinc-800">
                  <TableCell className="font-medium text-zinc-200">{a.customer_name}</TableCell>
                  <TableCell className="text-zinc-400 text-sm">
                    {a.email}
                    <br />
                    <span className="text-xs">{a.phone}</span>
                  </TableCell>
                  <TableCell className="text-zinc-300">{formatDate(a.appointment_date)}</TableCell>
                  {mode === "all" && (
                    <TableCell className="text-zinc-400">{getArtistName(a.artist_id)}</TableCell>
                  )}
                  <TableCell className="text-zinc-400 text-sm max-w-[200px] truncate" title={a.tattoo_description}>
                    {a.tattoo_description || "—"}
                  </TableCell>
                  <TableCell className="text-zinc-400 text-sm max-w-[140px] truncate" title={a.budget_preference}>
                    {a.budget_preference || "—"}
                  </TableCell>
                  <TableCell className="w-[100px]">
                    {a.reference_image_urls?.length > 0 ? (
                      <button
                        type="button"
                        onClick={() => setPreviewUrls(a.reference_image_urls)}
                        className="flex items-center gap-1.5 text-xs text-primary hover:underline"
                      >
                        <ImageIcon className="h-4 w-4 shrink-0" />
                        <span className="flex gap-0.5">
                          {a.reference_image_urls.slice(0, 2).map((url, i) => (
                            <img
                              key={url}
                              src={url}
                              alt={`Referans ${i + 1}`}
                              className="h-8 w-8 rounded object-cover border border-zinc-700"
                            />
                          ))}
                          {a.reference_image_urls.length > 2 && (
                            <span className="flex h-8 w-8 items-center justify-center rounded bg-zinc-800 text-[10px] text-zinc-400">
                              +{a.reference_image_urls.length - 2}
                            </span>
                          )}
                        </span>
                      </button>
                    ) : (
                      <span className="text-xs text-zinc-600">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusVariant[a.status]}>{statusLabels[a.status]}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {a.status === "pending" && (
                      <div className="flex justify-end gap-1">
                        <Button
                          size="sm"
                          variant="default"
                          className="h-8"
                          disabled={updatingId === a.id}
                          onClick={() => setStatus(a.id, "confirmed")}
                        >
                          {updatingId === a.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                          <span className="ml-1">Onayla</span>
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          className="h-8"
                          disabled={updatingId === a.id}
                          onClick={() => setStatus(a.id, "cancelled")}
                        >
                          <X className="h-4 w-4" />
                          <span className="ml-1">İptal</span>
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>

      <Dialog open={!!previewUrls} onOpenChange={(open) => !open && setPreviewUrls(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-auto bg-zinc-900 border-zinc-800">
          <DialogHeader>
            <DialogTitle className="text-zinc-200">Referans Görselleri</DialogTitle>
          </DialogHeader>
          {previewUrls && (
            <div className="grid grid-cols-2 gap-3 py-2">
              {previewUrls.map((url, i) => (
                <a
                  key={url}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block rounded-lg overflow-hidden border border-zinc-700 hover:border-primary transition-colors"
                >
                  <img
                    src={url}
                    alt={`Referans ${i + 1}`}
                    className="w-full h-48 object-cover"
                  />
                </a>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}
