/**
 * Türkçe karakterleri ASCII karşılıklarına çevirir (slug için).
 * ı->i, ğ->g, ü->u, ş->s, ö->o, ç->c, İ->i, I->i
 */
const TR_MAP: Record<string, string> = {
  ı: "i",
  ğ: "g",
  ü: "u",
  ş: "s",
  ö: "o",
  ç: "c",
  İ: "i",
  I: "i",
  Ğ: "g",
  Ü: "u",
  Ş: "s",
  Ö: "o",
  Ç: "c",
};

/**
 * Verilen metni URL dostu slug'a çevirir.
 * Türkçe karakter dönüşümü yapar, küçük harfe çevirir, boşlukları tire yapar.
 * Örn: "Rıfat Can" -> "rifat-can"
 */
export function slugify(text: string): string {
  if (!text || typeof text !== "string") return "";
  let s = text.trim();
  for (const [tr, en] of Object.entries(TR_MAP)) {
    s = s.split(tr).join(en);
  }
  return s
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "") || "";
}
