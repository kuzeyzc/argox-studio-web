import { useState, useMemo } from "react";
import { Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { getValueIcon, VALUE_ICON_NAMES } from "@/lib/valueIcons";

interface IconPickerProps {
  value: string;
  onChange: (iconName: string) => void;
  /** Önizlemede gösterilecek başlık (örn. değer başlığı) */
  previewTitle?: string;
  label?: string;
}

/** Görsel ızgara ile Lucide ikon seçici: arama, grid, aktif vurgu, önizleme. */
export function IconPicker({
  value,
  onChange,
  previewTitle,
  label = "İkon",
}: IconPickerProps) {
  const [search, setSearch] = useState("");

  const filteredNames = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return [...VALUE_ICON_NAMES];
    return VALUE_ICON_NAMES.filter((name) => name.toLowerCase().includes(q));
  }, [search]);

  const PreviewIcon = getValueIcon(value);

  return (
    <div className="space-y-3">
      {label && <p className="text-sm font-medium text-zinc-300">{label}</p>}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Sol: Arama + Grid */}
        <div className="flex-1 space-y-2">
          <Input
            placeholder="İkon ara (örn. Star, Heart)"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-zinc-800 border-zinc-700 h-9 text-sm"
          />
          <div className="grid grid-cols-5 sm:grid-cols-6 gap-2 max-h-48 overflow-y-auto p-1 border border-zinc-800 rounded-lg bg-zinc-900/50">
            {filteredNames.map((name) => {
              const Icon = getValueIcon(name);
              const isSelected = value === name;
              return (
                <button
                  key={name}
                  type="button"
                  onClick={() => onChange(name)}
                  className={cn(
                    "relative flex items-center justify-center w-10 h-10 rounded-lg border-2 transition-colors",
                    "hover:bg-zinc-700/50 hover:border-zinc-600",
                    isSelected
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-zinc-700 bg-zinc-800/50 text-zinc-300"
                  )}
                  title={name}
                >
                  <Icon className="h-5 w-5" />
                  {isSelected && (
                    <span className="absolute top-0.5 right-0.5 rounded-full bg-primary p-0.5">
                      <Check className="h-3 w-3 text-primary-foreground" strokeWidth={3} />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          {filteredNames.length === 0 && (
            <p className="text-xs text-zinc-500">Arama ile eşleşen ikon yok.</p>
          )}
        </div>
        {/* Sağ: Önizleme (Hakkımızda’da nasıl görüneceği) */}
        <div className="w-full sm:w-36 flex-shrink-0 rounded-lg border border-zinc-700 bg-zinc-800/50 p-4 flex flex-col items-center justify-center gap-2 min-h-[100px]">
          <span className="text-xs text-zinc-500 uppercase tracking-wider">Önizleme</span>
          <div className="rounded-lg border border-border bg-card/60 p-4 text-center w-full">
            <PreviewIcon className="h-8 w-8 mx-auto mb-2 text-primary" />
            <p className="text-sm font-medium text-zinc-200 truncate">
              {previewTitle || "Değer başlığı"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
