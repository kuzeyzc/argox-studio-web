import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  artists as initialArtists,
  tattooWorks as initialTattooWorks,
  testimonials as initialTestimonials,
  services as initialServices,
  defaultHeroContent,
  defaultAboutContent,
  defaultContactHoursContent,
  defaultFooterContent,
  defaultTestimonialsSectionContent,
  defaultServicesSectionContent,
  defaultRecentlyInkedContent,
  defaultValuesItems,
  defaultHistoryTimeline,
  type Artist,
  type TattooWork,
  type Testimonial,
  type ServiceItem,
  type HeroContent,
  type AboutContent,
  type ContactHoursContent,
  type FooterContent,
  type ValueItem,
  type HistoryTimelineItem,
  type Product,
  type Piercing,
} from "@/data/studio-data";
import { slugify } from "@/lib/slugify";
import {
  fetchAllStudioData,
  upsertHero as supabaseUpsertHero,
  upsertAbout as supabaseUpsertAbout,
  upsertContact as supabaseUpsertContact,
  upsertFooter as supabaseUpsertFooter,
  upsertSectionLabels as supabaseUpsertSectionLabels,
  upsertArtist as supabaseUpsertArtist,
  deleteArtist as supabaseDeleteArtist,
  upsertTattooWork as supabaseUpsertTattooWork,
  deleteTattooWork as supabaseDeleteTattooWork,
  upsertTestimonial as supabaseUpsertTestimonial,
  deleteTestimonial as supabaseDeleteTestimonial,
  upsertService as supabaseUpsertService,
  deleteService as supabaseDeleteService,
  upsertValue as supabaseUpsertValue,
  deleteValue as supabaseDeleteValue,
  fetchHistoryTimeline as supabaseFetchHistoryTimeline,
  upsertHistoryTimeline as supabaseUpsertHistoryTimeline,
  deleteHistoryTimeline as supabaseDeleteHistoryTimeline,
  fetchProducts as supabaseFetchProducts,
  upsertProduct as supabaseUpsertProduct,
  deleteProduct as supabaseDeleteProduct,
  fetchPiercings as supabaseFetchPiercings,
  upsertPiercing as supabaseUpsertPiercing,
  deletePiercing as supabaseDeletePiercing,
} from "@/lib/supabaseStudio";

export type AdminRole = "MANAGER" | "ARTIST";

export interface StudioUser {
  role: AdminRole;
  artistId?: string;
}

interface SectionLabels {
  testimonials: typeof defaultTestimonialsSectionContent;
  services: typeof defaultServicesSectionContent;
  recentlyInked: typeof defaultRecentlyInkedContent;
}

type ArtistRecord = Omit<Artist, "portfolio">;

interface StudioDataState {
  artists: ArtistRecord[];
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
  sectionLabels: SectionLabels;
}

const initialSectionLabels: SectionLabels = {
  testimonials: defaultTestimonialsSectionContent,
  services: defaultServicesSectionContent,
  recentlyInked: defaultRecentlyInkedContent,
};

function stripPortfolio(a: Artist): ArtistRecord {
  const { portfolio: _, ...rest } = a;
  return rest;
}

const initialState: StudioDataState = {
  artists: initialArtists.map(stripPortfolio),
  tattooWorks: [...initialTattooWorks],
  testimonials: [...initialTestimonials],
  services: [...initialServices],
  products: [],
  piercings: [],
  values: [...defaultValuesItems],
  historyTimeline: [...defaultHistoryTimeline],
  hero: { ...defaultHeroContent },
  about: { ...defaultAboutContent },
  contact: { ...defaultContactHoursContent },
  footer: { ...defaultFooterContent },
  sectionLabels: initialSectionLabels,
};

export interface StudioDataContextValue {
  artists: Artist[];
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
  sectionLabels: SectionLabels;
  currentUser: StudioUser;
  setCurrentUser: (user: StudioUser) => void;
  isLoading: boolean;
  error: Error | null;

  updateHero: (data: Partial<HeroContent>) => void;
  updateAbout: (data: Partial<AboutContent>) => void;
  updateContact: (data: Partial<ContactHoursContent>) => void;
  updateFooter: (data: Partial<FooterContent>) => void;
  updateSectionLabels: (key: keyof SectionLabels, data: Record<string, string>) => void;

  createValue: (item: Omit<ValueItem, "id"> & { id?: string }) => ValueItem;
  updateValue: (id: string, data: Partial<ValueItem>) => void;
  deleteValue: (id: string) => void;

  getArtistsForLogin: () => { id: string; email: string; name: string }[];
  createArtist: (artist: Omit<ArtistRecord, "id"> & { id?: string }) => void;
  updateArtist: (id: string, data: Partial<ArtistRecord>) => void;
  deleteArtist: (id: string) => void;

  createTattooWork: (work: Omit<TattooWork, "id"> & { id?: string }) => TattooWork;
  updateTattooWork: (id: string, data: Partial<TattooWork>) => void;
  deleteTattooWork: (id: string) => void;

  createTestimonial: (t: Omit<Testimonial, "id"> & { id?: string }) => Testimonial;
  updateTestimonial: (id: string, data: Partial<Testimonial>) => void;
  deleteTestimonial: (id: string) => void;

  createService: (s: Omit<ServiceItem, "id"> & { id?: string }) => ServiceItem;
  updateService: (id: string, data: Partial<ServiceItem>) => void;
  deleteService: (id: string) => void;

  createProduct: (p: Omit<Product, "id"> & { id?: string }) => Product;
  updateProduct: (id: string, data: Partial<Product>) => void;
  deleteProduct: (id: string) => void;

  createPiercing: (p: Omit<Piercing, "id"> & { id?: string }) => Piercing;
  updatePiercing: (id: string, data: Partial<Piercing>) => void;
  deletePiercing: (id: string) => void;

  createHistoryItem: (item: Omit<HistoryTimelineItem, "id"> & { id?: string }) => Promise<HistoryTimelineItem>;
  updateHistoryItem: (id: string, data: Partial<HistoryTimelineItem>) => Promise<void>;
  deleteHistoryItem: (id: string) => void;
  refreshHistoryTimeline: () => Promise<void>;
}

export const StudioDataContext = React.createContext<StudioDataContextValue | null>(null);

function nextId(prefix: string, existing: { id: string }[]): string {
  const nums = existing
    .map((x) => {
      const n = parseInt(x.id.replace(/\D/g, ""), 10);
      return isNaN(n) ? 0 : n;
    })
    .filter((n) => n > 0);
  const max = nums.length ? Math.max(...nums) : 0;
  return `${prefix}${max + 1}`;
}

export function StudioDataProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<StudioDataState>(initialState);
  const [currentUser, setCurrentUser] = useState<StudioUser>({ role: "MANAGER" });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Tek seferlik fetch; bağımlılık dizisi bilerek boş - değişirse sonsuz döngü oluşur.
  useEffect(() => {
    let cancelled = false;
    setError(null);
    fetchAllStudioData()
      .then((data) => {
        if (cancelled) return;
        // Hydration fallback: Supabase'den boş gelen dizilerde studio-data varsayılanlarını kullan
        setState({
          artists: data.artists.length > 0 ? data.artists : initialArtists.map(stripPortfolio),
          tattooWorks: data.tattooWorks.length > 0 ? data.tattooWorks : [...initialTattooWorks],
          testimonials: data.testimonials.length > 0 ? data.testimonials : [...initialTestimonials],
          services: data.services.length > 0 ? data.services : [...initialServices],
          products: data.products ?? [],
          piercings: data.piercings ?? [],
          values: data.values.length > 0 ? data.values : [...defaultValuesItems],
          historyTimeline: data.historyTimeline?.length > 0 ? data.historyTimeline : [...defaultHistoryTimeline],
          hero: { ...defaultHeroContent, ...data.hero },
          about: { ...defaultAboutContent, ...data.about },
          contact: {
            ...defaultContactHoursContent,
            ...data.contact,
            workingHours: (data.contact.workingHours?.length ? data.contact.workingHours : defaultContactHoursContent.workingHours) as typeof defaultContactHoursContent.workingHours,
          },
          footer: { ...defaultFooterContent, ...data.footer },
          sectionLabels: {
            testimonials: { ...defaultTestimonialsSectionContent, ...(data.sectionLabels as SectionLabels).testimonials },
            services: { ...defaultServicesSectionContent, ...(data.sectionLabels as SectionLabels).services },
            recentlyInked: { ...defaultRecentlyInkedContent, ...(data.sectionLabels as SectionLabels).recentlyInked },
          },
        });
      })
      .catch((err) => {
        if (!cancelled) {
          const e = err instanceof Error ? err : new Error(String(err));
          console.error("[StudioDataContext] Supabase fetch hatası:", e);
          setError(e);
          setState(initialState);
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const artistsWithPortfolio = useMemo<Artist[]>(() => {
    return state.artists.map((a) => ({
      ...a,
      portfolio: state.tattooWorks.filter((w) => w.artistId === a.id),
    }));
  }, [state.artists, state.tattooWorks]);

  const updateHero = useCallback(async (data: Partial<HeroContent>) => {
    setState((s) => ({ ...s, hero: { ...s.hero, ...data } }));
    try {
      await supabaseUpsertHero(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      console.error("[StudioDataContext] updateHero Supabase hatası:", e);
      setError(e);
    }
  }, []);

  const updateAbout = useCallback(async (data: Partial<AboutContent>) => {
    setState((s) => ({ ...s, about: { ...s.about, ...data } }));
    try {
      await supabaseUpsertAbout(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      console.error("[StudioDataContext] updateAbout Supabase hatası:", e);
      setError(e);
    }
  }, []);

  const updateContact = useCallback(async (data: Partial<ContactHoursContent>) => {
    setState((s) => ({ ...s, contact: { ...s.contact, ...data } }));
    try {
      await supabaseUpsertContact(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      console.error("[StudioDataContext] updateContact Supabase hatası:", e);
      setError(e);
    }
  }, []);

  const updateFooter = useCallback(async (data: Partial<FooterContent>) => {
    setState((s) => ({ ...s, footer: { ...s.footer, ...data } }));
    try {
      await supabaseUpsertFooter(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      console.error("[StudioDataContext] updateFooter Supabase hatası:", e);
      setError(e);
    }
  }, []);

  const updateSectionLabels = useCallback((key: keyof SectionLabels, data: Record<string, string>) => {
    const dbKey = key === "recentlyInked" ? "recentlyInked" : key;
    setState((s) => ({
      ...s,
      sectionLabels: { ...s.sectionLabels, [key]: { ...s.sectionLabels[key], ...data } },
    }));
    supabaseUpsertSectionLabels(dbKey, data).catch((err) => {
      const e = err instanceof Error ? err : new Error(String(err));
      console.error("[StudioDataContext] updateSectionLabels Supabase hatası:", e);
      setError(e);
    });
  }, []);

  const createValue = useCallback((item: Omit<ValueItem, "id"> & { id?: string }): ValueItem => {
    if (currentUser.role !== "MANAGER") throw new Error("Sadece yönetici ekleyebilir");
    const newItem: ValueItem = { ...item, id: item.id ?? nextId("v", state.values) };
    setState((s) => ({ ...s, values: [...s.values, newItem] }));
    supabaseUpsertValue(newItem).catch((err) => {
      const e = err instanceof Error ? err : new Error(String(err));
      console.error("[StudioDataContext] createValue Supabase hatası:", e);
      setError(e);
    });
    return newItem;
  }, [currentUser, state.values]);

  const updateValue = useCallback((id: string, data: Partial<ValueItem>) => {
    if (currentUser.role !== "MANAGER") return;
    setState((s) => ({
      ...s,
      values: s.values.map((v) => (v.id === id ? { ...v, ...data } : v)),
    }));
    const updated = state.values.find((v) => v.id === id);
    if (updated) supabaseUpsertValue({ ...updated, ...data }).catch((err) => {
      const e = err instanceof Error ? err : new Error(String(err));
      console.error("[StudioDataContext] updateValue Supabase hatası:", e);
      setError(e);
    });
  }, [currentUser, state.values]);

  const deleteValue = useCallback((id: string) => {
    if (currentUser.role !== "MANAGER") return;
    setState((s) => ({ ...s, values: s.values.filter((v) => v.id !== id) }));
    supabaseDeleteValue(id).catch((err) => {
      const e = err instanceof Error ? err : new Error(String(err));
      console.error("[StudioDataContext] deleteValue Supabase hatası:", e);
      setError(e);
    });
  }, [currentUser]);

  const getArtistsForLogin = useCallback(() => {
    return state.artists.map((a) => ({ id: a.id, email: a.email, name: a.name }));
  }, [state.artists]);

  const ensureUniqueSlug = useCallback((baseSlug: string, excludeId: string | null): string => {
    let slug = baseSlug || "sanatci";
    const exists = (s: string) => state.artists.some((a) => a.slug === s && a.id !== excludeId);
    if (exists(slug)) {
      const suffix = excludeId ? excludeId.slice(0, 8) : String(Date.now()).slice(-6);
      slug = `${slug}-${suffix}`;
    }
    return slug;
  }, [state.artists]);

  const createArtist = useCallback((input: Omit<ArtistRecord, "id"> & { id?: string }) => {
    if (currentUser.role !== "MANAGER") throw new Error("Sadece yönetici sanatçı ekleyebilir");
    const id = input.id ?? nextId("a", state.artists);
    const baseSlug = slugify(input.name);
    const slug = ensureUniqueSlug(baseSlug || "sanatci", null);
    const artist: ArtistRecord = {
      id,
      name: input.name,
      slug: input.slug ?? slug,
      specialty: input.specialty ?? "",
      image: input.image ?? "",
      bannerVideoUrl: input.bannerVideoUrl ?? "",
      bio: input.bio ?? "",
      experience: input.experience ?? "",
      email: input.email,
      phone: input.phone ?? "",
      socials: input.socials ?? {},
    };
    setState((s) => ({ ...s, artists: [...s.artists, artist] }));
    supabaseUpsertArtist(artist).catch((err) => {
      const e = err instanceof Error ? err : new Error(String(err));
      console.error("[StudioDataContext] createArtist Supabase hatası:", e);
      setError(e);
    });
  }, [currentUser, state.artists, ensureUniqueSlug]);

  const updateArtist = useCallback((id: string, data: Partial<ArtistRecord>) => {
    if (currentUser.role === "ARTIST" && currentUser.artistId !== id) return;
    const updated = state.artists.find((a) => a.id === id);
    if (!updated) return;
    const merged: ArtistRecord = { ...updated, ...data };
    if (data.name !== undefined) {
      merged.slug = ensureUniqueSlug(slugify(data.name) || merged.slug || "sanatci", id);
    }
    setState((s) => ({
      ...s,
      artists: s.artists.map((a) => (a.id === id ? merged : a)),
    }));
    supabaseUpsertArtist(merged).catch((err) => {
      const e = err instanceof Error ? err : new Error(String(err));
      console.error("[StudioDataContext] updateArtist Supabase hatası:", e);
      setError(e);
    });
  }, [currentUser, state.artists, ensureUniqueSlug]);

  const deleteArtist = useCallback((id: string) => {
    if (currentUser.role !== "MANAGER") return;
    setState((s) => ({
      ...s,
      artists: s.artists.filter((a) => a.id !== id),
      tattooWorks: s.tattooWorks.filter((w) => w.artistId !== id),
    }));
    supabaseDeleteArtist(id).catch((err) => {
      const e = err instanceof Error ? err : new Error(String(err));
      console.error("[StudioDataContext] deleteArtist Supabase hatası:", e);
      setError(e);
    });
  }, [currentUser]);

  const createTattooWork = useCallback(
    (work: Omit<TattooWork, "id"> & { id?: string }): TattooWork => {
      if (currentUser.role === "ARTIST" && work.artistId !== currentUser.artistId) {
        throw new Error("Artist can only add works to their own gallery");
      }
      const artist = state.artists.find((a) => a.id === work.artistId);
      const newWork: TattooWork = {
        ...work,
        id: work.id ?? nextId("", state.tattooWorks),
        artistName: artist?.name ?? work.artistName,
      };
      setState((s) => ({ ...s, tattooWorks: [newWork, ...s.tattooWorks] }));
      supabaseUpsertTattooWork(newWork).catch((err) => {
        const e = err instanceof Error ? err : new Error(String(err));
        console.error("[StudioDataContext] createTattooWork Supabase hatası:", e);
        setError(e);
      });
      return newWork;
    },
    [currentUser, state.artists, state.tattooWorks]
  );

  const updateTattooWork = useCallback((id: string, data: Partial<TattooWork>) => {
    setState((s) => ({
      ...s,
      tattooWorks: s.tattooWorks.map((w) => (w.id === id ? { ...w, ...data } : w)),
    }));
    const work = state.tattooWorks.find((w) => w.id === id);
    if (work && (currentUser.role === "MANAGER" || work.artistId === currentUser.artistId)) {
      supabaseUpsertTattooWork({ ...work, ...data }).catch((err) => {
        const e = err instanceof Error ? err : new Error(String(err));
        console.error("[StudioDataContext] updateTattooWork Supabase hatası:", e);
        setError(e);
      });
    }
  }, [currentUser, state.tattooWorks]);

  const deleteTattooWork = useCallback((id: string) => {
    const work = state.tattooWorks.find((w) => w.id === id);
    if (!work || (currentUser.role === "ARTIST" && work.artistId !== currentUser.artistId)) return;
    setState((s) => ({ ...s, tattooWorks: s.tattooWorks.filter((w) => w.id !== id) }));
    supabaseDeleteTattooWork(id).catch((err) => {
      const e = err instanceof Error ? err : new Error(String(err));
      console.error("[StudioDataContext] deleteTattooWork Supabase hatası:", e);
      setError(e);
    });
  }, [currentUser, state.tattooWorks]);

  const createTestimonial = useCallback((t: Omit<Testimonial, "id"> & { id?: string }): Testimonial => {
    if (currentUser.role !== "MANAGER") throw new Error("Only manager can add testimonials");
    const newT = { ...t, id: t.id ?? nextId("t", state.testimonials) } as Testimonial;
    setState((s) => ({ ...s, testimonials: [...s.testimonials, newT] }));
    supabaseUpsertTestimonial(newT).catch((err) => {
      const e = err instanceof Error ? err : new Error(String(err));
      console.error("[StudioDataContext] createTestimonial Supabase hatası:", e);
      setError(e);
    });
    return newT;
  }, [currentUser, state.testimonials]);

  const updateTestimonial = useCallback((id: string, data: Partial<Testimonial>) => {
    if (currentUser.role !== "MANAGER") return;
    setState((s) => ({
      ...s,
      testimonials: s.testimonials.map((t) => (t.id === id ? { ...t, ...data } : t)),
    }));
    const t = state.testimonials.find((x) => x.id === id);
    if (t) supabaseUpsertTestimonial({ ...t, ...data }).catch((err) => {
      const e = err instanceof Error ? err : new Error(String(err));
      console.error("[StudioDataContext] updateTestimonial Supabase hatası:", e);
      setError(e);
    });
  }, [currentUser, state.testimonials]);

  const deleteTestimonial = useCallback((id: string) => {
    if (currentUser.role !== "MANAGER") return;
    setState((s) => ({ ...s, testimonials: s.testimonials.filter((t) => t.id !== id) }));
    supabaseDeleteTestimonial(id).catch((err) => {
      const e = err instanceof Error ? err : new Error(String(err));
      console.error("[StudioDataContext] deleteTestimonial Supabase hatası:", e);
      setError(e);
    });
  }, [currentUser]);

  const createService = useCallback((s: Omit<ServiceItem, "id"> & { id?: string }): ServiceItem => {
    if (currentUser.role !== "MANAGER") throw new Error("Only manager can add services");
    const newS = { ...s, id: s.id ?? nextId("s", state.services) } as ServiceItem;
    setState((prev) => ({ ...prev, services: [...prev.services, newS] }));
    supabaseUpsertService(newS).catch((err) => {
      const e = err instanceof Error ? err : new Error(String(err));
      console.error("[StudioDataContext] createService Supabase hatası:", e);
      setError(e);
    });
    return newS;
  }, [currentUser, state.services]);

  const updateService = useCallback((id: string, data: Partial<ServiceItem>) => {
    if (currentUser.role !== "MANAGER") return;
    setState((s) => ({
      ...s,
      services: s.services.map((sv) => (sv.id === id ? { ...sv, ...data } : sv)),
    }));
    const sv = state.services.find((x) => x.id === id);
    if (sv) supabaseUpsertService({ ...sv, ...data }).catch((err) => {
      const e = err instanceof Error ? err : new Error(String(err));
      console.error("[StudioDataContext] updateService Supabase hatası:", e);
      setError(e);
    });
  }, [currentUser, state.services]);

  const deleteService = useCallback((id: string) => {
    if (currentUser.role !== "MANAGER") return;
    setState((s) => ({ ...s, services: s.services.filter((sv) => sv.id !== id) }));
    supabaseDeleteService(id).catch((err) => {
      const e = err instanceof Error ? err : new Error(String(err));
      console.error("[StudioDataContext] deleteService Supabase hatası:", e);
      setError(e);
    });
  }, [currentUser]);

  const createProduct = useCallback((p: Omit<Product, "id"> & { id?: string }): Product => {
    const newP: Product = {
      ...p,
      id: p.id ?? nextId("p", state.products),
      imageUrl: p.imageUrl ?? "",
      category: p.category ?? "Kıyafet",
      stockStatus: p.stockStatus ?? "Var",
    };
    setState((s) => ({ ...s, products: [...s.products, newP] }));
    supabaseUpsertProduct(newP).catch((err) => {
      const e = err instanceof Error ? err : new Error(String(err));
      console.error("[StudioDataContext] createProduct Supabase hatası:", e);
      setError(e);
    });
    return newP;
  }, [state.products]);

  const updateProduct = useCallback((id: string, data: Partial<Product>) => {
    setState((s) => ({
      ...s,
      products: s.products.map((pr) => (pr.id === id ? { ...pr, ...data } : pr)),
    }));
    const pr = state.products.find((x) => x.id === id);
    if (pr) supabaseUpsertProduct({ ...pr, ...data }).catch((err) => {
      const e = err instanceof Error ? err : new Error(String(err));
      console.error("[StudioDataContext] updateProduct Supabase hatası:", e);
      setError(e);
    });
  }, [state.products]);

  const deleteProduct = useCallback((id: string) => {
    setState((s) => ({ ...s, products: s.products.filter((pr) => pr.id !== id) }));
    supabaseDeleteProduct(id).catch((err) => {
      const e = err instanceof Error ? err : new Error(String(err));
      console.error("[StudioDataContext] deleteProduct Supabase hatası:", e);
      setError(e);
    });
  }, []);

  const createPiercing = useCallback((p: Omit<Piercing, "id"> & { id?: string }): Piercing => {
    const newP: Piercing = {
      ...p,
      id: p.id ?? nextId("pc", state.piercings),
      bodyPart: p.bodyPart ?? "",
      bodyRegion: p.bodyRegion ?? "Kulak",
      material: p.material ?? "",
      price: p.price ?? "",
      productImageUrl: p.productImageUrl ?? "",
      modelImageUrl: p.modelImageUrl ?? "",
      description: p.description ?? "",
      whatsappNumber: p.whatsappNumber,
    };
    setState((s) => ({ ...s, piercings: [...s.piercings, newP] }));
    supabaseUpsertPiercing(newP).catch((err) => {
      const e = err instanceof Error ? err : new Error(String(err));
      console.error("[StudioDataContext] createPiercing Supabase hatası:", e);
      setError(e);
    });
    return newP;
  }, [state.piercings]);

  const updatePiercing = useCallback((id: string, data: Partial<Piercing>) => {
    setState((s) => ({
      ...s,
      piercings: s.piercings.map((pc) => (pc.id === id ? { ...pc, ...data } : pc)),
    }));
    const pc = state.piercings.find((x) => x.id === id);
    if (pc) supabaseUpsertPiercing({ ...pc, ...data }).catch((err) => {
      const e = err instanceof Error ? err : new Error(String(err));
      console.error("[StudioDataContext] updatePiercing Supabase hatası:", e);
      setError(e);
    });
  }, [state.piercings]);

  const deletePiercing = useCallback((id: string) => {
    setState((s) => ({ ...s, piercings: s.piercings.filter((pc) => pc.id !== id) }));
    supabaseDeletePiercing(id).catch((err) => {
      const e = err instanceof Error ? err : new Error(String(err));
      console.error("[StudioDataContext] deletePiercing Supabase hatası:", e);
      setError(e);
    });
  }, []);

  const createHistoryItem = useCallback(
    async (item: Omit<HistoryTimelineItem, "id"> & { id?: string }): Promise<HistoryTimelineItem> => {
      if (currentUser.role !== "MANAGER") throw new Error("Sadece yönetici tarihçe ekleyebilir");
      const id = item.id ?? nextId("h", state.historyTimeline);
      const orderIndex = item.orderIndex ?? state.historyTimeline.length;
      const newItem: HistoryTimelineItem = { ...item, id, orderIndex };
      setState((s) => ({
        ...s,
        historyTimeline: [...s.historyTimeline, newItem].sort((a, b) => a.orderIndex - b.orderIndex),
      }));
      await supabaseUpsertHistoryTimeline(newItem);
      return newItem;
    },
    [currentUser, state.historyTimeline]
  );

  const updateHistoryItem = useCallback(async (id: string, data: Partial<HistoryTimelineItem>) => {
    if (currentUser.role !== "MANAGER") return;
    const dataClean = Object.fromEntries(
      Object.entries(data).filter(([, v]) => v !== undefined)
    ) as Partial<HistoryTimelineItem>;
    let merged: HistoryTimelineItem | null = null;
    setState((s) => {
      const item = s.historyTimeline.find((h) => h.id === id);
      if (!item) return s;
      merged = { ...item, ...dataClean };
      return {
        ...s,
        historyTimeline: s.historyTimeline
          .map((h) => (h.id === id ? merged! : h))
          .sort((a, b) => a.orderIndex - b.orderIndex),
      };
    });
    if (merged) await supabaseUpsertHistoryTimeline(merged);
  }, [currentUser]);

  const deleteHistoryItem = useCallback((id: string) => {
    if (currentUser.role !== "MANAGER") return;
    setState((s) => ({
      ...s,
      historyTimeline: s.historyTimeline.filter((h) => h.id !== id),
    }));
    supabaseDeleteHistoryTimeline(id).catch((err) => {
      const e = err instanceof Error ? err : new Error(String(err));
      console.error("[StudioDataContext] deleteHistoryItem Supabase hatası:", e);
      setError(e);
    });
  }, [currentUser]);

  const refreshHistoryTimeline = useCallback(async () => {
    try {
      const list = await supabaseFetchHistoryTimeline();
      setState((s) => ({
        ...s,
        historyTimeline: Array.isArray(list) ? list : s.historyTimeline,
      }));
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      console.error("[StudioDataContext] refreshHistoryTimeline hatası:", e);
      setError(e);
    }
  }, []);

  const value = useMemo<StudioDataContextValue>(
    () => ({
      artists: artistsWithPortfolio,
      tattooWorks: state.tattooWorks,
      testimonials: state.testimonials,
      services: state.services,
      products: state.products,
      piercings: state.piercings,
      values: state.values,
      historyTimeline: state.historyTimeline,
      hero: state.hero,
      about: state.about,
      contact: state.contact,
      footer: state.footer,
      sectionLabels: state.sectionLabels,
      currentUser,
      setCurrentUser,
      isLoading,
      error,
      updateHero,
      updateAbout,
      updateContact,
      updateFooter,
      updateSectionLabels,
      createValue,
      updateValue,
      deleteValue,
      getArtistsForLogin,
      createArtist,
      updateArtist,
      deleteArtist,
      createTattooWork,
      updateTattooWork,
      deleteTattooWork,
      createTestimonial,
      updateTestimonial,
      deleteTestimonial,
      createService,
      updateService,
      deleteService,
      createProduct,
      updateProduct,
      deleteProduct,
      createPiercing,
      updatePiercing,
      deletePiercing,
      createHistoryItem,
      updateHistoryItem,
      deleteHistoryItem,
      refreshHistoryTimeline,
    }),
    [
      artistsWithPortfolio,
      state,
      currentUser,
      isLoading,
      error,
      updateHero,
      updateAbout,
      updateContact,
      updateFooter,
      updateSectionLabels,
      createValue,
      updateValue,
      deleteValue,
      getArtistsForLogin,
      createArtist,
      updateArtist,
      deleteArtist,
      createTattooWork,
      updateTattooWork,
      deleteTattooWork,
      createTestimonial,
      updateTestimonial,
      deleteTestimonial,
      createService,
      updateService,
      deleteService,
      createProduct,
      updateProduct,
      deleteProduct,
      createPiercing,
      updatePiercing,
      deletePiercing,
      createHistoryItem,
      updateHistoryItem,
      deleteHistoryItem,
      refreshHistoryTimeline,
    ]
  );

  return <StudioDataContext.Provider value={value}>{children}</StudioDataContext.Provider>;
}

export function useStudioDataContext(): StudioDataContextValue {
  const ctx = React.useContext(StudioDataContext);
  if (!ctx) throw new Error("useStudioDataContext must be used within StudioDataProvider");
  return ctx;
}
