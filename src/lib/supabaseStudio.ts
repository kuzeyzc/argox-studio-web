import { supabase } from "./supabaseClient";
import { slugify } from "./slugify";
import type {
  Artist,
  TattooWork,
  Testimonial,
  ServiceItem,
  ValueItem,
  Product,
  Piercing,
  HeroContent,
  AboutContent,
  ContactHoursContent,
  FooterContent,
  WorkingDayHours,
  HistoryTimelineItem,
  Appointment,
  AppointmentStatus,
  BudgetCategory,
  GameSetting,
} from "@/data/studio-data";

const HERO_ID = 1;
const ABOUT_ID = 1;
const CONTACT_ID = 1;
const FOOTER_ID = 1;
const SECTION_LABELS_ID = 1;

// —— Artists ——
export async function fetchArtists(): Promise<Omit<Artist, "portfolio">[]> {
  const { data, error } = await supabase.from("artists").select("*").order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []).map((row) => {
    const name = row.name ?? "";
    const slug = row.slug?.trim() || slugify(name) || row.id;
    return {
      id: row.id,
      name,
      slug,
      specialty: row.specialty ?? "",
      image: row.image ?? "",
      bannerVideoUrl: row.banner_video_url ?? "",
      bio: row.bio ?? "",
      experience: row.experience ?? "",
      email: row.email ?? "",
      phone: row.phone ?? "",
      socials: (row.socials as Artist["socials"]) ?? {},
    };
  });
}

export async function upsertArtist(row: Omit<Artist, "portfolio">): Promise<void> {
  const { error } = await supabase.from("artists").upsert(
    {
      id: row.id,
      name: row.name,
      slug: row.slug ?? "",
      specialty: row.specialty,
      image: row.image,
      banner_video_url: row.bannerVideoUrl ?? "",
      bio: row.bio,
      experience: row.experience,
      email: row.email,
      phone: row.phone,
      socials: row.socials ?? {},
      updated_at: new Date().toISOString(),
    },
    { onConflict: "id" }
  );
  if (error) throw error;
}

export async function deleteArtist(id: string): Promise<void> {
  const { error } = await supabase.from("artists").delete().eq("id", id);
  if (error) throw error;
}

const STUDIO_ASSETS_BUCKET = "studio-assets";

/**
 * Sanatçı banner videosunu studio-assets bucket'ına yükler.
 * Yol: artists/{artistId}/banner.{ext}
 * Bucket'ın public olması ve Storage > Policies'de yükleme izni tanımlı olması gerekir.
 */
export async function uploadArtistBannerVideo(artistId: string, file: File): Promise<string> {
  const ext = file.name.split(".").pop()?.toLowerCase() || "mp4";
  const path = `artists/${artistId}/banner.${ext}`;
  const { error } = await supabase.storage.from(STUDIO_ASSETS_BUCKET).upload(path, file, {
    cacheControl: "3600",
    upsert: true,
  });
  if (error) throw error;
  const { data } = supabase.storage.from(STUDIO_ASSETS_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

/** Tarihçe timeline görseli — studio-assets bucket'ında history/{id} veya history/{id}-{ts}.{ext}. Her yüklemede benzersiz URL (timestamp) kullanılır ki mevcut kayıtta foto değişince site güncellensin. */
export async function uploadHistoryImage(recordId: string, file: File): Promise<string> {
  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `history/${recordId}-${Date.now()}.${ext}`;
  const { error } = await supabase.storage.from(STUDIO_ASSETS_BUCKET).upload(path, file, {
    cacheControl: "3600",
    upsert: false,
  });
  if (error) throw error;
  const { data } = supabase.storage.from(STUDIO_ASSETS_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

// —— Budget categories ——
export async function fetchBudgetCategories(artistId: string): Promise<BudgetCategory[]> {
  const { data, error } = await supabase
    .from("budget_categories")
    .select("*")
    .eq("artist_id", artistId)
    .order("order_index", { ascending: true });
  if (error) throw error;
  return (data ?? []).map((row) => ({
    id: row.id as string,
    artist_id: row.artist_id as string,
    label: (row.label as string) ?? "",
    order_index: (row.order_index as number) ?? 0,
  }));
}

export async function createBudgetCategory(artistId: string, label: string): Promise<BudgetCategory> {
  const { data: existing } = await supabase
    .from("budget_categories")
    .select("order_index")
    .eq("artist_id", artistId)
    .order("order_index", { ascending: false })
    .limit(1)
    .maybeSingle();
  const orderIndex = (existing?.order_index ?? -1) + 1;
  const { data, error } = await supabase
    .from("budget_categories")
    .insert({ artist_id: artistId, label: label.trim(), order_index: orderIndex })
    .select()
    .single();
  if (error) throw error;
  return {
    id: data.id as string,
    artist_id: data.artist_id as string,
    label: (data.label as string) ?? "",
    order_index: (data.order_index as number) ?? 0,
  };
}

export async function deleteBudgetCategory(id: string): Promise<void> {
  const { error } = await supabase.from("budget_categories").delete().eq("id", id);
  if (error) throw error;
}

export async function updateBudgetCategory(id: string, label: string): Promise<BudgetCategory> {
  const { data, error } = await supabase
    .from("budget_categories")
    .update({ label: label.trim() })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return {
    id: data.id as string,
    artist_id: data.artist_id as string,
    label: (data.label as string) ?? "",
    order_index: (data.order_index as number) ?? 0,
  };
}

/** Randevu formu için: birden fazla sanatçının kategorilerini tek seferde alır (artistId -> kategoriler). */
export async function fetchBudgetCategoriesByArtistIds(artistIds: string[]): Promise<Record<string, BudgetCategory[]>> {
  if (artistIds.length === 0) return {};
  const { data, error } = await supabase
    .from("budget_categories")
    .select("*")
    .in("artist_id", artistIds)
    .order("order_index", { ascending: true });
  if (error) throw error;
  const byArtist: Record<string, BudgetCategory[]> = {};
  for (const id of artistIds) byArtist[id] = [];
  for (const row of data ?? []) {
    const a = row.artist_id as string;
    if (!byArtist[a]) byArtist[a] = [];
    byArtist[a].push({
      id: row.id as string,
      artist_id: a,
      label: (row.label as string) ?? "",
      order_index: (row.order_index as number) ?? 0,
    });
  }
  return byArtist;
}

// —— Game settings (minigame indirim oranları) ——
export async function fetchGameSettings(): Promise<GameSetting[]> {
  const { data, error } = await supabase.from("game_settings").select("*").order("game_name", { ascending: true });
  if (error) throw error;
  return (data ?? []).map((row) => ({
    id: row.id as string,
    game_name: (row.game_name as string) ?? "",
    discount_rate: Number(row.discount_rate) ?? 0,
    is_active: Boolean(row.is_active),
    min_accuracy: row.min_accuracy != null ? Number(row.min_accuracy) : null,
    promo_code: (row.promo_code as string) ?? "",
    difficulty_target: row.difficulty_target != null ? Number(row.difficulty_target) : null,
  }));
}

/** Aktif minigame ayarını game_name ile getirir (oyun sayfası için). */
export async function fetchActiveGameSetting(gameName: string): Promise<GameSetting | null> {
  const { data, error } = await supabase
    .from("game_settings")
    .select("*")
    .eq("game_name", gameName)
    .eq("is_active", true)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return {
    id: data.id as string,
    game_name: (data.game_name as string) ?? "",
    discount_rate: Number(data.discount_rate) ?? 0,
    is_active: Boolean(data.is_active),
    min_accuracy: data.min_accuracy != null ? Number(data.min_accuracy) : null,
    promo_code: (data.promo_code as string) ?? "",
    difficulty_target: data.difficulty_target != null ? Number(data.difficulty_target) : null,
  };
}

export async function upsertGameSetting(row: GameSetting): Promise<void> {
  const { error } = await supabase.from("game_settings").upsert(
    {
      id: row.id,
      game_name: row.game_name,
      discount_rate: row.discount_rate,
      is_active: row.is_active,
      min_accuracy: row.min_accuracy ?? null,
      promo_code: row.promo_code ?? "",
      difficulty_target: row.difficulty_target ?? null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "game_name" }
  );
  if (error) throw error;
}

/** Sanatçı kayıt (şifre oluşturma) için: bu e-posta Artists tablosunda var mı? */
export async function checkArtistEmailExists(email: string): Promise<boolean> {
  const e = email.trim().toLowerCase();
  if (!e) return false;
  const { data, error } = await supabase
    .from("artists")
    .select("id")
    .ilike("email", e)
    .limit(1)
    .maybeSingle();
  if (error) return false;
  return !!data;
}

// —— Appointments ——
const APPOINTMENT_REFS_PREFIX = "appointment-refs";

function mapAppointmentRow(row: Record<string, unknown>): Appointment {
  const urls = row.reference_image_urls;
  return {
    id: row.id as string,
    created_at: row.created_at as string,
    customer_name: (row.customer_name as string) ?? "",
    email: (row.email as string) ?? "",
    phone: (row.phone as string) ?? "",
    artist_id: (row.artist_id as string) ?? null,
    tattoo_description: (row.tattoo_description as string) ?? "",
    appointment_date: row.appointment_date as string,
    status: (row.status as AppointmentStatus) ?? "pending",
    budget_preference: (row.budget_preference as string) ?? "",
    reference_image_urls: Array.isArray(urls) ? (urls as string[]) : [],
    discount_code: (row.discount_code as string) ?? "",
  };
}

export async function fetchAppointmentsAll(): Promise<Appointment[]> {
  const { data, error } = await supabase
    .from("appointments")
    .select("*")
    .order("appointment_date", { ascending: true })
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(mapAppointmentRow);
}

/** Sanatçı için: kendi artist_id'si ile eşleşen + artist_id null (Tercihim Yok) randevular */
export async function fetchAppointmentsForArtist(artistId: string): Promise<Appointment[]> {
  const { data, error } = await supabase
    .from("appointments")
    .select("*")
    .or(`artist_id.eq.${artistId},artist_id.is.null`)
    .order("appointment_date", { ascending: true })
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(mapAppointmentRow);
}

export async function insertAppointment(params: {
  customer_name: string;
  email: string;
  phone: string;
  artist_id: string | null;
  tattoo_description: string;
  appointment_date: string;
  budget_preference?: string;
  discount_code?: string;
}): Promise<Appointment> {
  const { data, error } = await supabase
    .from("appointments")
    .insert({
      customer_name: params.customer_name,
      email: params.email,
      phone: params.phone,
      artist_id: params.artist_id,
      tattoo_description: params.tattoo_description,
      appointment_date: params.appointment_date,
      budget_preference: params.budget_preference ?? "",
      discount_code: params.discount_code ?? "",
      status: "pending",
    })
    .select()
    .single();
  if (error) throw error;
  return mapAppointmentRow(data as Record<string, unknown>);
}

export async function updateAppointmentStatus(id: string, status: AppointmentStatus): Promise<void> {
  const { error } = await supabase.from("appointments").update({ status }).eq("id", id);
  if (error) throw error;
}

/** Randevu referans görsellerini studio-assets bucket'a yükler; public URL listesi döner. */
export async function uploadAppointmentReferenceImages(appointmentId: string, files: File[]): Promise<string[]> {
  if (files.length === 0) return [];
  const bucket = STUDIO_ASSETS_BUCKET;
  const urls: string[] = [];
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const path = `${APPOINTMENT_REFS_PREFIX}/${appointmentId}/${Date.now()}-${i}.${ext}`;
    const { error } = await supabase.storage.from(bucket).upload(path, file, {
      cacheControl: "3600",
      upsert: false,
    });
    if (error) throw error;
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    urls.push(data.publicUrl);
  }
  return urls;
}

export async function updateAppointmentReferenceImages(id: string, referenceImageUrls: string[]): Promise<void> {
  const { error } = await supabase
    .from("appointments")
    .update({ reference_image_urls: referenceImageUrls })
    .eq("id", id);
  if (error) throw error;
}

export function subscribeAppointments(callback: (payload: { new?: Record<string, unknown>; old?: Record<string, unknown> }) => void) {
  return supabase
    .channel("appointments-changes")
    .on("postgres_changes", { event: "*", schema: "public", table: "appointments" }, callback)
    .subscribe();
}

// —— Tattoo works ——
export async function fetchTattooWorks(): Promise<TattooWork[]> {
  const { data, error } = await supabase.from("tattoo_works").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((row) => ({
    id: row.id,
    image: row.image ?? "",
    title: row.title ?? "",
    artistName: row.artist_name ?? "",
    artistId: row.artist_id ?? "",
    category: (row.category as TattooWork["category"]) ?? "Dövme",
  }));
}

export async function upsertTattooWork(row: TattooWork): Promise<void> {
  const { error } = await supabase.from("tattoo_works").upsert(
    {
      id: row.id,
      image: row.image,
      title: row.title,
      artist_name: row.artistName,
      artist_id: row.artistId,
      category: row.category,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "id" }
  );
  if (error) throw error;
}

export async function deleteTattooWork(id: string): Promise<void> {
  const { error } = await supabase.from("tattoo_works").delete().eq("id", id);
  if (error) throw error;
}

// —— Testimonials ——
export async function fetchTestimonials(): Promise<Testimonial[]> {
  const { data, error } = await supabase.from("testimonials").select("*").order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []).map((row) => ({
    id: row.id,
    name: row.name ?? "",
    text: row.text ?? "",
    rating: Number(row.rating) ?? 5,
    artistName: row.artist_name ?? "",
  }));
}

export async function upsertTestimonial(row: Testimonial): Promise<void> {
  const { error } = await supabase.from("testimonials").upsert(
    {
      id: row.id,
      name: row.name,
      text: row.text,
      rating: row.rating,
      artist_name: row.artistName,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "id" }
  );
  if (error) throw error;
}

export async function deleteTestimonial(id: string): Promise<void> {
  const { error } = await supabase.from("testimonials").delete().eq("id", id);
  if (error) throw error;
}

// —— Services ——
export async function fetchServices(): Promise<ServiceItem[]> {
  const { data, error } = await supabase.from("services").select("*").order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []).map((row) => ({
    id: row.id,
    title: row.title ?? "",
    description: row.description ?? "",
    icon: row.icon ?? "",
    price: row.price ?? "",
  }));
}

export async function upsertService(row: ServiceItem): Promise<void> {
  const { error } = await supabase.from("services").upsert(
    {
      id: row.id,
      title: row.title,
      description: row.description,
      icon: row.icon,
      price: row.price,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "id" }
  );
  if (error) throw error;
}

export async function deleteService(id: string): Promise<void> {
  const { error } = await supabase.from("services").delete().eq("id", id);
  if (error) throw error;
}

// —— Products (Tasarım Ürünler: Kıyafet / Aksesuar) ——
export async function fetchProducts(): Promise<Product[]> {
  const { data, error } = await supabase.from("products").select("*").order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []).map((row) => ({
    id: row.id,
    name: row.name ?? "",
    description: row.description ?? "",
    price: row.price ?? "",
    imageUrl: row.image_url ?? "",
    category: (row.category as Product["category"]) ?? "Kıyafet",
    stockStatus: (row.stock_status as Product["stockStatus"]) ?? "Var",
    whatsappNumber: (row.whatsapp_number as string)?.trim() || undefined,
  }));
}

export async function upsertProduct(row: Product): Promise<void> {
  const { error } = await supabase.from("products").upsert(
    {
      id: row.id,
      name: row.name,
      description: row.description,
      price: row.price,
      image_url: row.imageUrl,
      category: row.category,
      stock_status: row.stockStatus,
      whatsapp_number: row.whatsappNumber?.trim() ?? "",
      updated_at: new Date().toISOString(),
    },
    { onConflict: "id" }
  );
  if (error) throw error;
}

export async function deleteProduct(id: string): Promise<void> {
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) throw error;
}

/** Ürün görseli — studio-assets/products/{productId}-{ts}.{ext} */
export async function uploadProductImage(productId: string, file: File): Promise<string> {
  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `products/${productId}-${Date.now()}.${ext}`;
  const { error } = await supabase.storage.from(STUDIO_ASSETS_BUCKET).upload(path, file, {
    cacheControl: "3600",
    upsert: false,
  });
  if (error) throw error;
  const { data } = supabase.storage.from(STUDIO_ASSETS_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

// —— Piercings ——
export async function fetchPiercings(): Promise<Piercing[]> {
  const { data, error } = await supabase.from("piercings").select("*").order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []).map((row) => ({
    id: row.id,
    name: row.name ?? "",
    bodyPart: row.body_part ?? "",
    bodyRegion: (row.body_region as Piercing["bodyRegion"]) ?? "Kulak",
    material: row.material ?? "",
    price: row.price ?? "",
    productImageUrl: row.product_image_url ?? "",
    modelImageUrl: row.model_image_url ?? "",
    description: row.description ?? "",
    whatsappNumber: (row.whatsapp_number as string)?.trim() || undefined,
  }));
}

export async function upsertPiercing(row: Piercing): Promise<void> {
  const { error } = await supabase.from("piercings").upsert(
    {
      id: row.id,
      name: row.name,
      body_part: row.bodyPart,
      body_region: row.bodyRegion,
      material: row.material,
      price: row.price ?? "",
      product_image_url: row.productImageUrl,
      model_image_url: row.modelImageUrl,
      description: row.description,
      whatsapp_number: row.whatsappNumber?.trim() ?? "",
      updated_at: new Date().toISOString(),
    },
    { onConflict: "id" }
  );
  if (error) throw error;
}

export async function deletePiercing(id: string): Promise<void> {
  const { error } = await supabase.from("piercings").delete().eq("id", id);
  if (error) throw error;
}

/** Data URL'i File'a çevirir (upload için). */
function dataUrlToFile(dataUrl: string, fileName: string): File {
  const arr = dataUrl.split(",");
  const mime = arr[0].match(/:(.*?);/)?.[1] ?? "image/jpeg";
  const bstr = atob(arr[1] ?? "");
  let n = bstr.length;
  const u8 = new Uint8Array(n);
  while (n--) u8[n] = bstr.charCodeAt(n);
  return new File([u8], fileName, { type: mime });
}

/** Piercing görseli — studio-assets/piercings/{id}-{product|model}-{ts}.{ext}. fileOrDataUrl: File veya data URL. */
export async function uploadPiercingImage(
  piercingId: string,
  fileOrDataUrl: File | string,
  type: "product" | "model"
): Promise<string> {
  const file =
    typeof fileOrDataUrl === "string" && fileOrDataUrl.startsWith("data:")
      ? dataUrlToFile(fileOrDataUrl, `${type}.jpg`)
      : fileOrDataUrl;
  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `piercings/${piercingId}-${type}-${Date.now()}.${ext}`;
  const { error } = await supabase.storage.from(STUDIO_ASSETS_BUCKET).upload(path, file, {
    cacheControl: "3600",
    upsert: false,
  });
  if (error) throw error;
  const { data } = supabase.storage.from(STUDIO_ASSETS_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

// —— Values ——
export async function fetchValues(): Promise<ValueItem[]> {
  const { data, error } = await supabase.from("value_items").select("*").order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []).map((row) => ({
    id: row.id,
    icon: row.icon ?? "",
    title: row.title ?? "",
    description: row.description ?? "",
  }));
}

export async function upsertValue(row: ValueItem): Promise<void> {
  const { error } = await supabase.from("value_items").upsert(
    {
      id: row.id,
      icon: row.icon,
      title: row.title,
      description: row.description,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "id" }
  );
  if (error) throw error;
}

export async function deleteValue(id: string): Promise<void> {
  const { error } = await supabase.from("value_items").delete().eq("id", id);
  if (error) throw error;
}

// —— History timeline ——
export async function fetchHistoryTimeline(): Promise<HistoryTimelineItem[]> {
  const { data, error } = await supabase
    .from("history_timeline")
    .select("*")
    .order("order_index", { ascending: true });
  if (error) throw error;
  return (data ?? []).map((row) => ({
    id: row.id,
    year: row.year ?? "",
    title: row.title ?? "",
    description: row.description ?? "",
    imageUrl: row.image_url ?? "",
    orderIndex: Number(row.order_index) ?? 0,
  }));
}

export async function upsertHistoryTimeline(row: HistoryTimelineItem): Promise<void> {
  const { error } = await supabase.from("history_timeline").upsert(
    {
      id: row.id,
      year: row.year,
      title: row.title,
      description: row.description,
      image_url: row.imageUrl,
      order_index: row.orderIndex,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "id" }
  );
  if (error) throw error;
}

export async function deleteHistoryTimeline(id: string): Promise<void> {
  const { error } = await supabase.from("history_timeline").delete().eq("id", id);
  if (error) throw error;
}

// —— Hero ——
export async function fetchHero(): Promise<HeroContent> {
  const { data, error } = await supabase.from("hero").select("*").eq("id", HERO_ID).single();
  if (error && error.code !== "PGRST116") throw error;
  const row = data ?? {};
  return {
    tagline: row.tagline ?? "",
    titleLine1: row.title_line_1 ?? "",
    titleLine2: row.title_line_2 ?? "",
    subtitle: row.subtitle ?? "",
    ctaGallery: row.cta_gallery ?? "",
    ctaArtists: row.cta_artists ?? "",
  };
}

export async function upsertHero(row: Partial<HeroContent>): Promise<void> {
  const payload: Record<string, unknown> = { id: HERO_ID, updated_at: new Date().toISOString() };
  if (row.tagline !== undefined) payload.tagline = row.tagline;
  if (row.titleLine1 !== undefined) payload.title_line_1 = row.titleLine1;
  if (row.titleLine2 !== undefined) payload.title_line_2 = row.titleLine2;
  if (row.subtitle !== undefined) payload.subtitle = row.subtitle;
  if (row.ctaGallery !== undefined) payload.cta_gallery = row.ctaGallery;
  if (row.ctaArtists !== undefined) payload.cta_artists = row.ctaArtists;
  const { error } = await supabase.from("hero").upsert(payload, { onConflict: "id" });
  if (error) throw error;
}

// —— About ——
export async function fetchAbout(): Promise<AboutContent> {
  const { data, error } = await supabase.from("about").select("*").eq("id", ABOUT_ID).single();
  if (error && error.code !== "PGRST116") throw error;
  const row = data ?? {};
  return {
    sectionLabel: row.section_label ?? "",
    sectionTitle: row.section_title ?? "",
    paragraph1: row.paragraph_1 ?? "",
    paragraph2: row.paragraph_2 ?? "",
    locationLabel: row.location_label ?? "",
    locationValue: row.location_value ?? "",
    hoursLabel: row.hours_label ?? "",
    hoursValue: row.hours_value ?? "",
    certificationLabel: row.certification_label ?? "",
    certificationValue: row.certification_value ?? "",
    statTattoos: row.stat_tattoos ?? "",
    statArtists: row.stat_artists ?? "",
    statYears: row.stat_years ?? "",
    statAwards: row.stat_awards ?? "",
    moreLinkText: row.more_link_text ?? "",
  };
}

export async function upsertAbout(row: Partial<AboutContent>): Promise<void> {
  const payload: Record<string, unknown> = { id: ABOUT_ID, updated_at: new Date().toISOString() };
  if (row.sectionLabel !== undefined) payload.section_label = row.sectionLabel;
  if (row.sectionTitle !== undefined) payload.section_title = row.sectionTitle;
  if (row.paragraph1 !== undefined) payload.paragraph_1 = row.paragraph1;
  if (row.paragraph2 !== undefined) payload.paragraph_2 = row.paragraph2;
  if (row.locationLabel !== undefined) payload.location_label = row.locationLabel;
  if (row.locationValue !== undefined) payload.location_value = row.locationValue;
  if (row.hoursLabel !== undefined) payload.hours_label = row.hoursLabel;
  if (row.hoursValue !== undefined) payload.hours_value = row.hoursValue;
  if (row.certificationLabel !== undefined) payload.certification_label = row.certificationLabel;
  if (row.certificationValue !== undefined) payload.certification_value = row.certificationValue;
  if (row.statTattoos !== undefined) payload.stat_tattoos = row.statTattoos;
  if (row.statArtists !== undefined) payload.stat_artists = row.statArtists;
  if (row.statYears !== undefined) payload.stat_years = row.statYears;
  if (row.statAwards !== undefined) payload.stat_awards = row.statAwards;
  if (row.moreLinkText !== undefined) payload.more_link_text = row.moreLinkText;
  const { error } = await supabase.from("about").upsert(payload, { onConflict: "id" });
  if (error) throw error;
}

// —— Contact ——
function mapWorkingHours(raw: unknown): WorkingDayHours[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((w: unknown) => {
    const x = w as Record<string, unknown>;
    return {
      day: String(x.day ?? ""),
      hours: String(x.hours ?? ""),
      isClosed: Boolean(x.isClosed),
    };
  });
}

export async function fetchContact(): Promise<ContactHoursContent> {
  const { data, error } = await supabase.from("contact").select("*").eq("id", CONTACT_ID).single();
  if (error && error.code !== "PGRST116") throw error;
  const row = data ?? {};
  return {
    phone: row.phone ?? "",
    address: row.address ?? "",
    email: row.email ?? "",
    mapEmbedUrl: row.map_embed_url ?? "",
    workingHours: mapWorkingHours(row.working_hours),
    studioSectionTitle: row.studio_section_title ?? "",
    studioSectionSubtitle: row.studio_section_subtitle ?? "",
    contactTitle: row.contact_title ?? "",
    phoneLabel: row.phone_label ?? "",
    locationLabel: row.location_label ?? "",
    emailLabel: row.email_label ?? "",
    hoursLabel: row.hours_label ?? "",
    studioPhotos: Array.isArray(row.studio_photos) ? (row.studio_photos as string[]) : [],
  };
}

export async function upsertContact(row: Partial<ContactHoursContent>): Promise<void> {
  const payload: Record<string, unknown> = {
    id: CONTACT_ID,
    updated_at: new Date().toISOString(),
  };
  if (row.phone !== undefined) payload.phone = row.phone;
  if (row.address !== undefined) payload.address = row.address;
  if (row.email !== undefined) payload.email = row.email;
  if (row.mapEmbedUrl !== undefined) payload.map_embed_url = row.mapEmbedUrl;
  if (row.workingHours !== undefined) payload.working_hours = row.workingHours;
  if (row.studioSectionTitle !== undefined) payload.studio_section_title = row.studioSectionTitle;
  if (row.studioSectionSubtitle !== undefined) payload.studio_section_subtitle = row.studioSectionSubtitle;
  if (row.contactTitle !== undefined) payload.contact_title = row.contactTitle;
  if (row.phoneLabel !== undefined) payload.phone_label = row.phoneLabel;
  if (row.locationLabel !== undefined) payload.location_label = row.locationLabel;
  if (row.emailLabel !== undefined) payload.email_label = row.emailLabel;
  if (row.hoursLabel !== undefined) payload.hours_label = row.hoursLabel;
  if (row.studioPhotos !== undefined) payload.studio_photos = row.studioPhotos;
  const { error } = await supabase.from("contact").upsert(payload, { onConflict: "id" });
  if (error) throw error;
}

// —— Footer ——
export async function fetchFooter(): Promise<FooterContent> {
  const { data, error } = await supabase.from("footer").select("*").eq("id", FOOTER_ID).single();
  if (error && error.code !== "PGRST116") throw error;
  return { copyright: (data?.copyright as string) ?? "" };
}

export async function upsertFooter(row: Partial<FooterContent>): Promise<void> {
  const { error } = await supabase.from("footer").upsert(
    { id: FOOTER_ID, copyright: row.copyright ?? "", updated_at: new Date().toISOString() },
    { onConflict: "id" }
  );
  if (error) throw error;
}

// —— Section labels ——
interface SectionLabelsRow {
  testimonials: { sectionLabel: string; sectionTitle: string };
  services: { sectionLabel: string; sectionTitle: string; moreLinkText: string };
  recentlyInked: { sectionLabel: string; sectionTitle: string; viewAllText: string };
}

export async function fetchSectionLabels(): Promise<SectionLabelsRow> {
  const { data, error } = await supabase.from("section_labels").select("*").eq("id", SECTION_LABELS_ID).single();
  if (error && error.code !== "PGRST116") throw error;
  const row = data ?? {};
  return {
    testimonials: (row.testimonials as SectionLabelsRow["testimonials"]) ?? { sectionLabel: "", sectionTitle: "" },
    services: (row.services as SectionLabelsRow["services"]) ?? { sectionLabel: "", sectionTitle: "", moreLinkText: "" },
    recentlyInked: (row.recently_inked as SectionLabelsRow["recentlyInked"]) ?? { sectionLabel: "", sectionTitle: "", viewAllText: "" },
  };
}

export async function upsertSectionLabels(
  key: "testimonials" | "services" | "recentlyInked",
  payload: Record<string, string>
): Promise<void> {
  const col = key === "recentlyInked" ? "recently_inked" : key;
  const { data: current } = await supabase.from("section_labels").select(col).eq("id", SECTION_LABELS_ID).single();
  const existing = (current ?? {}) as Record<string, unknown>;
  const merged = { ...(existing[col] as object), ...payload };
  const update: Record<string, unknown> = { id: SECTION_LABELS_ID, updated_at: new Date().toISOString(), [col]: merged };
  const { error } = await supabase.from("section_labels").upsert(update, { onConflict: "id" });
  if (error) throw error;
}

// —— Full studio fetch ——
export interface StudioDataFromSupabase {
  artists: Awaited<ReturnType<typeof fetchArtists>>;
  tattooWorks: TattooWork[];
  testimonials: Testimonial[];
  services: ServiceItem[];
  products: Product[];
  piercings: Piercing[];
  values: ValueItem[];
  historyTimeline: HistoryTimelineItem[];
  hero: HeroContent;
  about: AboutContent;
  contact: ContactHoursContent;
  footer: FooterContent;
  sectionLabels: SectionLabelsRow;
}

export async function fetchAllStudioData(): Promise<StudioDataFromSupabase> {
  const [
    artists,
    tattooWorks,
    testimonials,
    services,
    products,
    piercings,
    values,
    historyTimeline,
    hero,
    about,
    contact,
    footer,
    sectionLabels,
  ] = await Promise.all([
    fetchArtists(),
    fetchTattooWorks(),
    fetchTestimonials(),
    fetchServices(),
    fetchProducts(),
    fetchPiercings(),
    fetchValues(),
    fetchHistoryTimeline(),
    fetchHero(),
    fetchAbout(),
    fetchContact(),
    fetchFooter(),
    fetchSectionLabels(),
  ]);
  return {
    artists,
    tattooWorks,
    testimonials,
    services,
    products,
    piercings,
    values,
    historyTimeline,
    hero,
    about,
    contact,
    footer,
    sectionLabels,
  };
}
