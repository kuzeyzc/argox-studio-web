import { useMemo } from "react";
import {
  marqueeImages,
  quizQuestions,
} from "@/data/studio-data";
import {
  useStudioDataContext,
  type StudioUser,
  type AdminRole,
} from "@/context/StudioDataContext";
import type { Artist, TattooWork, Testimonial, ServiceItem, ValueItem, HistoryTimelineItem, Product, Piercing } from "@/data/studio-data";
import type {
  HeroContent,
  AboutContent,
  ContactHoursContent,
  FooterContent,
} from "@/data/studio-data";

export type { StudioUser, AdminRole };

export interface StudioData {
  artists: Artist[];
  tattooWorks: TattooWork[];
  testimonials: Testimonial[];
  services: ServiceItem[];
  products: Product[];
  piercings: Piercing[];
  values: ValueItem[];
  marqueeImages: string[];
  historyTimeline: HistoryTimelineItem[];
  quizQuestions: typeof quizQuestions;
  hero: HeroContent;
  about: AboutContent;
  contact: ContactHoursContent;
  footer: FooterContent;
  sectionLabels: {
    testimonials: { sectionLabel: string; sectionTitle: string };
    services: { sectionLabel: string; sectionTitle: string; moreLinkText: string };
    recentlyInked: { sectionLabel: string; sectionTitle: string; viewAllText: string };
  };
}

export interface UseStudioDataResult {
  data: StudioData;
  isLoading: boolean;
  error: Error | null;
  // CRUD (for admin panel)
  currentUser: StudioUser;
  setCurrentUser: (user: StudioUser) => void;
  updateHero: (data: Partial<HeroContent>) => void;
  updateAbout: (data: Partial<AboutContent>) => void;
  updateContact: (data: Partial<ContactHoursContent>) => void;
  updateFooter: (data: Partial<FooterContent>) => void;
  updateSectionLabels: (
    key: "testimonials" | "services" | "recentlyInked",
    data: Record<string, string>
  ) => void;
  createValue: (item: Omit<ValueItem, "id"> & { id?: string }) => ValueItem;
  updateValue: (id: string, data: Partial<ValueItem>) => void;
  deleteValue: (id: string) => void;
  createArtist: (artist: Omit<Artist, "portfolio" | "id"> & { id?: string }) => void;
  updateArtist: (id: string, data: Partial<Omit<Artist, "portfolio">>) => void;
  deleteArtist: (id: string) => void;
  createTattooWork: (
    work: Omit<TattooWork, "id"> & { id?: string }
  ) => TattooWork;
  updateTattooWork: (id: string, data: Partial<TattooWork>) => void;
  deleteTattooWork: (id: string) => void;
  createTestimonial: (
    t: Omit<Testimonial, "id"> & { id?: string }
  ) => Testimonial;
  updateTestimonial: (id: string, data: Partial<Testimonial>) => void;
  deleteTestimonial: (id: string) => void;
  createService: (
    s: Omit<ServiceItem, "id"> & { id?: string }
  ) => ServiceItem;
  updateService: (id: string, data: Partial<ServiceItem>) => void;
  deleteService: (id: string) => void;
  createProduct: (p: Omit<Product, "id"> & { id?: string }) => Product;
  updateProduct: (id: string, data: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  createPiercing: (p: Omit<Piercing, "id"> & { id?: string }) => Piercing;
  updatePiercing: (id: string, data: Partial<Piercing>) => void;
  deletePiercing: (id: string) => void;
  createHistoryItem: (
    item: Omit<HistoryTimelineItem, "id"> & { id?: string }
  ) => Promise<HistoryTimelineItem>;
  updateHistoryItem: (id: string, data: Partial<HistoryTimelineItem>) => Promise<void>;
  deleteHistoryItem: (id: string) => void;
  refreshHistoryTimeline: () => Promise<void>;
}

/**
 * useStudioData
 *
 * Merkezi stüdyo verilerini ve (admin panelinde kullanılmak üzere) CRUD işlemlerini sağlar.
 * StudioDataProvider ile sarılı uygulamada kullanılmalıdır.
 */
export function useStudioData(): UseStudioDataResult {
  const ctx = useStudioDataContext();

  const data = useMemo<StudioData>(
    () => ({
      artists: ctx.artists,
      tattooWorks: ctx.tattooWorks,
      testimonials: ctx.testimonials,
      services: ctx.services,
      products: ctx.products,
      piercings: ctx.piercings,
      values: ctx.values,
      marqueeImages,
      historyTimeline: ctx.historyTimeline,
      quizQuestions,
      hero: ctx.hero,
      about: ctx.about,
      contact: ctx.contact,
      footer: ctx.footer,
      sectionLabels: ctx.sectionLabels,
    }),
    [ctx]
  );

  return {
    data,
    isLoading: ctx.isLoading,
    error: ctx.error,
    currentUser: ctx.currentUser,
    setCurrentUser: ctx.setCurrentUser,
    updateHero: ctx.updateHero,
    updateAbout: ctx.updateAbout,
    updateContact: ctx.updateContact,
    updateFooter: ctx.updateFooter,
    updateSectionLabels: ctx.updateSectionLabels,
    createValue: ctx.createValue,
    updateValue: ctx.updateValue,
    deleteValue: ctx.deleteValue,
    createArtist: ctx.createArtist,
    updateArtist: ctx.updateArtist,
    deleteArtist: ctx.deleteArtist,
    createTattooWork: ctx.createTattooWork,
    updateTattooWork: ctx.updateTattooWork,
    deleteTattooWork: ctx.deleteTattooWork,
    createTestimonial: ctx.createTestimonial,
    updateTestimonial: ctx.updateTestimonial,
    deleteTestimonial: ctx.deleteTestimonial,
    createService: ctx.createService,
    updateService: ctx.updateService,
    deleteService: ctx.deleteService,
    createProduct: ctx.createProduct,
    updateProduct: ctx.updateProduct,
    deleteProduct: ctx.deleteProduct,
    createPiercing: ctx.createPiercing,
    updatePiercing: ctx.updatePiercing,
    deletePiercing: ctx.deletePiercing,
    createHistoryItem: ctx.createHistoryItem,
    updateHistoryItem: ctx.updateHistoryItem,
    deleteHistoryItem: ctx.deleteHistoryItem,
    refreshHistoryTimeline: ctx.refreshHistoryTimeline,
  };
}

/** Hook: get artist by id from current studio data (for ArtistPage etc.) */
export function useArtistById(id: string | undefined): Artist | undefined {
  const ctx = useStudioDataContext();
  return useMemo(
    () => (id ? ctx.artists.find((a) => a.id === id) : undefined),
    [ctx.artists, id]
  );
}

/**
 * Hook: get artist by slug or id from URL (slug öncelikli; eski /sanatci/id linkleri de çalışır).
 * Sanatçı bulunamazsa undefined döner (sayfa redirect için kullanılır).
 */
export function useArtistBySlug(slugOrId: string | undefined): Artist | undefined {
  const ctx = useStudioDataContext();
  return useMemo(() => {
    if (!slugOrId) return undefined;
    const bySlug = ctx.artists.find((a) => a.slug === slugOrId);
    if (bySlug) return bySlug;
    return ctx.artists.find((a) => a.id === slugOrId) ?? undefined;
  }, [ctx.artists, slugOrId]);
}
