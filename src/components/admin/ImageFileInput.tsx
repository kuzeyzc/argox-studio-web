import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ImageCropModal } from "@/components/admin/ImageCropModal";

interface ImageFileInputProps {
  value: string;
  onChange: (dataUrlOrUrl: string) => void;
  label?: string;
  accept?: string;
  className?: string;
  previewClassName?: string;
}

/** Dosya seçici → zorunlu 1:1 kırpma → önizleme ve base64 saklama. */
export function ImageFileInput({
  value,
  onChange,
  label = "Görsel",
  accept = "image/*",
  className,
  previewClassName,
}: ImageFileInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => {
      setImageToCrop(reader.result as string);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleCropComplete = (croppedDataUrl: string) => {
    onChange(croppedDataUrl);
    setImageToCrop(null);
  };

  const handleCropCancel = () => setImageToCrop(null);

  const clear = () => onChange("");

  return (
    <>
      <div className={cn("space-y-2", className)}>
        {label && <p className="text-sm font-medium text-zinc-300">{label}</p>}
        <div className="flex flex-col sm:flex-row gap-3 items-start">
          <div
            className={cn(
              "w-24 h-24 rounded-lg border border-zinc-700 bg-zinc-800/50 overflow-hidden flex items-center justify-center flex-shrink-0",
              previewClassName
            )}
          >
            {value ? (
              <img src={value} alt="" className="w-full h-full object-cover" />
            ) : (
              <span className="text-xs text-zinc-500">Önizleme</span>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <input
              ref={inputRef}
              type="file"
              accept={accept}
              className="hidden"
              onChange={handleFile}
              aria-label={label}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="border-zinc-600"
              onClick={() => inputRef.current?.click()}
            >
              Dosya Seç
            </Button>
            {value && (
              <Button type="button" variant="ghost" size="sm" className="text-zinc-400" onClick={clear}>
                Kaldır
              </Button>
            )}
          </div>
        </div>
      </div>

      <ImageCropModal
        open={!!imageToCrop}
        imageSrc={imageToCrop ?? ""}
        onComplete={handleCropComplete}
        onCancel={handleCropCancel}
      />
    </>
  );
}
