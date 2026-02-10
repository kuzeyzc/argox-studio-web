import { useState, useCallback } from "react";
import Cropper, { type Area } from "react-easy-crop";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { getCroppedImageDataUrl } from "@/lib/cropImage";

interface ImageCropModalProps {
  open: boolean;
  imageSrc: string;
  onComplete: (croppedDataUrl: string) => void;
  onCancel: () => void;
}

/** Zorunlu 1:1 (kare) kırpma modalı. Kullanıcı kırpmayı tamamlamadan görsel kaydedilmez. */
export function ImageCropModal({
  open,
  imageSrc,
  onComplete,
  onCancel,
}: ImageCropModalProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const onCropComplete = useCallback((_: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleComplete = useCallback(async () => {
    if (!croppedAreaPixels) return;
    setIsProcessing(true);
    try {
      const dataUrl = await getCroppedImageDataUrl(imageSrc, croppedAreaPixels);
      onComplete(dataUrl);
    } catch (e) {
      console.error("Kırpma işlenirken hata:", e);
    } finally {
      setIsProcessing(false);
    }
  }, [imageSrc, croppedAreaPixels, onComplete]);

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="max-w-lg bg-zinc-900 border-zinc-800 text-zinc-100 p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle>Görseli Kırp (1:1 Kare)</DialogTitle>
        </DialogHeader>
        <div className="relative w-full bg-zinc-950" style={{ height: "min(60vw, 400px)" }}>
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={1}
            onCropChange={setCrop}
            onCropComplete={onCropComplete}
            onZoomChange={setZoom}
            cropShape="rect"
            showGrid={true}
            objectFit="contain"
          />
        </div>
        <div className="px-6 py-4 space-y-3">
          <p className="text-sm text-zinc-400">Yakınlaştır</p>
          <Slider
            value={[zoom]}
            min={1}
            max={3}
            step={0.1}
            onValueChange={([v]) => setZoom(v ?? 1)}
            className="w-full"
          />
        </div>
        <DialogFooter className="px-6 pb-6 pt-2 border-t border-zinc-800">
          <Button type="button" variant="outline" onClick={onCancel} className="border-zinc-600">
            İptal
          </Button>
          <Button
            type="button"
            className="bg-primary hover:bg-primary/90"
            onClick={handleComplete}
            disabled={!croppedAreaPixels || isProcessing}
          >
            {isProcessing ? "İşleniyor…" : "Kırpmayı Tamamla"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
