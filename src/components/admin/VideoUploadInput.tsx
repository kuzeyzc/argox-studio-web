import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { uploadArtistBannerVideo } from "@/lib/supabaseStudio";
import { Video, Loader2 } from "lucide-react";

interface VideoUploadInputProps {
  value: string;
  onChange: (url: string) => void;
  artistId: string | null;
  label?: string;
  accept?: string;
  className?: string;
  previewClassName?: string;
}

/** Video seç → studio-assets bucket'a yükle → public URL'i form'a yaz. Sadece mevcut sanatçı için (artistId gerekli). */
export function VideoUploadInput({
  value,
  onChange,
  artistId,
  label = "Banner video",
  accept = "video/mp4,video/webm",
  className,
  previewClassName,
}: VideoUploadInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !file.type.startsWith("video/")) {
      setError("Lütfen bir video dosyası seçin (MP4 veya WebM).");
      return;
    }
    if (!artistId) {
      setError("Önce sanatçıyı kaydedin, ardından banner video yükleyebilirsiniz.");
      return;
    }
    setError(null);
    setUploading(true);
    try {
      const url = await uploadArtistBannerVideo(artistId, file);
      onChange(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Yükleme başarısız.");
    } finally {
      setUploading(false);
    }
  };

  const clear = () => onChange("");

  const canUpload = !!artistId;

  return (
    <div className={cn("space-y-2", className)}>
      {label && <p className="text-sm font-medium text-zinc-300">{label}</p>}
      <div className="flex flex-col gap-3">
        <div
          className={cn(
            "rounded-lg border border-zinc-700 bg-zinc-800/50 overflow-hidden flex items-center justify-center aspect-video max-h-32",
            previewClassName
          )}
        >
          {value ? (
            <video
              src={value}
              className="w-full h-full object-cover"
              muted
              playsInline
              preload="metadata"
            />
          ) : (
            <span className="text-xs text-zinc-500 flex items-center gap-2">
              <Video size={20} /> Önizleme yok
            </span>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <input
            ref={inputRef}
            type="file"
            accept={accept}
            className="hidden"
            onChange={handleFile}
            disabled={!canUpload || uploading}
            aria-label={label}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="border-zinc-600"
            onClick={() => inputRef.current?.click()}
            disabled={!canUpload || uploading}
          >
            {uploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Yükleniyor...
              </>
            ) : canUpload ? (
              "Video Seç ve Yükle"
            ) : (
              "Önce sanatçıyı kaydedin"
            )}
          </Button>
          {value && (
            <Button type="button" variant="ghost" size="sm" className="text-zinc-400" onClick={clear}>
              Videoyu Kaldır
            </Button>
          )}
          {error && <p className="text-xs text-red-400">{error}</p>}
        </div>
      </div>
    </div>
  );
}
