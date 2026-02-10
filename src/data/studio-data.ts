import tattoo1 from "@/assets/tattoo-1.jpg";
import tattoo2 from "@/assets/tattoo-2.jpg";
import tattoo3 from "@/assets/tattoo-3.jpg";
import tattoo4 from "@/assets/tattoo-4.jpg";
import tattoo6 from "@/assets/tattoo-6.jpg";
import artist1 from "@/assets/artist-1.jpg";
import artist2 from "@/assets/artist-2.jpg";
import artist3 from "@/assets/artist-3.jpg";

export interface TattooWork {
  id: string;
  image: string;
  title: string;
  artistName: string;
  artistId: string;
  category: "Dövme" | "Piercing" | "Sanat";
}

export interface Artist {
  id: string;
  name: string;
  /** URL dostu isim (örn: "Rıfat Can" -> "rifat-can"). Rota /sanatci/[slug] için kullanılır. */
  slug: string;
  specialty: string;
  image: string;
  /** Profil sayfası üst banner için video URL (studio-assets bucket). Boşsa görsel/fallback kullanılır. */
  bannerVideoUrl: string;
  bio: string;
  experience: string;
  email: string;
  phone: string;
  /** Used only for login simulation; not exposed in public API */
  password?: string;
  socials: { instagram?: string; twitter?: string; behance?: string };
  portfolio: TattooWork[];
}

/** Manager login (simulation). Use for full admin access. */
export const MANAGER_CREDENTIALS = {
  email: "manager@argox.studio",
  password: "manager123",
} as const;

export interface Testimonial {
  id: string;
  name: string;
  text: string;
  rating: number;
  artistName: string;
}

export type AppointmentStatus = "pending" | "confirmed" | "cancelled";

export interface BudgetCategory {
  id: string;
  artist_id: string;
  label: string;
  order_index: number;
}

export interface GameSetting {
  id: string;
  game_name: string;
  discount_rate: number;
  is_active: boolean;
  /** Çizim oyunu için gereken minimum isabet oranı (%). Yoksa null. */
  min_accuracy?: number | null;
  /** Oyun kazanıldığında verilecek indirim kodu. */
  promo_code: string;
  /** Kazanmak için gereken isabet/benzerlik oranı (%). */
  difficulty_target: number | null;
}

export interface Appointment {
  id: string;
  created_at: string;
  customer_name: string;
  email: string;
  phone: string;
  artist_id: string | null;
  tattoo_description: string;
  appointment_date: string;
  status: AppointmentStatus;
  /** Müşterinin seçtiği bütçe kategorisi etiketi (sanatçı seçildiyse) */
  budget_preference: string;
  /** Referans görsel URL'leri (randevu formunda yüklenen görseller) */
  reference_image_urls: string[];
  /** Oyunla kazanılan indirim kodu (örn. TATTOO2024) */
  discount_code: string;
}

export interface ServiceItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  price: string;
}

/** Piercing tanıtım ve görselleme (takı + model fotoğrafı) */
export type PiercingBodyRegion = "Kulak" | "Burun" | "Dudak" | "Kaş" | "Dil" | "Göbek" | "Diğer";

export interface Piercing {
  id: string;
  name: string;
  bodyPart: string;
  bodyRegion: PiercingBodyRegion;
  material: string;
  price: string;
  productImageUrl: string;
  modelImageUrl: string;
  description: string;
  /** WhatsApp ile bilgi al için numara (ülke koduyla). Boşsa stüdyo iletişim numarası kullanılır. */
  whatsappNumber?: string;
}

/** Tasarım Ürünler (Kıyafet / Aksesuar) koleksiyonu */
export type ProductCategory = "Kıyafet" | "Aksesuar";
export type ProductStockStatus = "Var" | "Yok";

export interface Product {
  id: string;
  name: string;
  description: string;
  price: string;
  imageUrl: string;
  category: ProductCategory;
  stockStatus: ProductStockStatus;
  /** Ürün için WhatsApp sipariş numarası (ülke koduyla, örn. 905XXXXXXXXX). Boşsa stüdyo iletişim numarası kullanılır. */
  whatsappNumber?: string;
}

// ——— Global content (admin-managed) ———

export interface HeroContent {
  tagline: string;
  titleLine1: string;
  titleLine2: string;
  subtitle: string;
  ctaGallery: string;
  ctaArtists: string;
}

export interface AboutContent {
  sectionLabel: string;
  sectionTitle: string;
  paragraph1: string;
  paragraph2: string;
  locationLabel: string;
  locationValue: string;
  hoursLabel: string;
  hoursValue: string;
  certificationLabel: string;
  certificationValue: string;
  statTattoos: string;
  statArtists: string;
  statYears: string;
  statAwards: string;
  moreLinkText: string;
}

export interface WorkingDayHours {
  day: string;
  hours: string;
  isClosed: boolean;
}

export interface ContactHoursContent {
  phone: string;
  address: string;
  email: string;
  mapEmbedUrl: string;
  workingHours: WorkingDayHours[];
  studioSectionTitle: string;
  studioSectionSubtitle: string;
  contactTitle: string;
  phoneLabel: string;
  locationLabel: string;
  emailLabel: string;
  hoursLabel: string;
  /** Stüdyo fotoğrafları (base64/data URL); en fazla 4. */
  studioPhotos?: string[];
}

export interface FooterContent {
  copyright: string;
}

/** Değerlerimiz (Values) — Hakkımızda sayfasındaki değer kartları */
export interface ValueItem {
  id: string;
  icon: string; // Lucide ikon adı (örn. Palette, Shield, Heart)
  title: string;
  description: string;
}

export const defaultValuesItems: ValueItem[] = [
  { id: "v1", icon: "Palette", title: "Sanat", description: "Her dövme bir sanat eseridir. Kişiye özel tasarım felsefemizle benzersiz eserler yaratıyoruz." },
  { id: "v2", icon: "Shield", title: "Güven", description: "ISO sertifikalı hijyen standartları ve şeffaf süreçlerle müşterilerimizin güvenini kazanıyoruz." },
  { id: "v3", icon: "Heart", title: "Tutku", description: "Dövme sanatına olan tutkumuz, her çalışmamıza yansır. Sürekli gelişim ve mükemmellik arayışındayız." },
];

export const tattooWorks: TattooWork[] = [
  { id: "1", image: tattoo1, title: "Ejderha Kol", artistName: "Kaan Vural", artistId: "kaan", category: "Dövme" },
  { id: "2", image: tattoo2, title: "Kutsal Geometri", artistName: "Elif Noir", artistId: "elif", category: "Dövme" },
  { id: "3", image: tattoo3, title: "Neo Geleneksel Gül", artistName: "Deniz Kara", artistId: "deniz", category: "Dövme" },
  { id: "4", image: tattoo4, title: "Botanik Blackwork", artistName: "Elif Noir", artistId: "elif", category: "Sanat" },
  { id: "5", image: tattoo6, title: "Mandala Sırt", artistName: "Kaan Vural", artistId: "kaan", category: "Dövme" },
  { id: "6", image: tattoo1, title: "Japon Irezumi", artistName: "Deniz Kara", artistId: "deniz", category: "Dövme" },
  { id: "7", image: tattoo3, title: "Kafatası & Güller", artistName: "Kaan Vural", artistId: "kaan", category: "Sanat" },
  { id: "8", image: tattoo2, title: "Geometrik Yıldız", artistName: "Elif Noir", artistId: "elif", category: "Dövme" },
];

export const artists: Artist[] = [
  {
    id: "kaan",
    name: "Kaan Vural",
    slug: "kaan-vural",
    specialty: "Japon & Blackwork",
    image: artist1,
    bannerVideoUrl: "",
    bio: "12 yılı aşkın deneyimiyle Kaan, Japon Irezumi ve cesur blackwork sanatında ustalaşmıştır. Eserleri dinamik kompozisyonlar ve derin kültürel hikâye anlatımlarıyla karakterize edilir. Avrupa ve Asya'daki uluslararası dövme konvansiyonlarında yer almıştır.",
    experience: "12+ yıl",
    email: "kaan@argox.studio",
    phone: "+90 555 100 2001",
    password: "artist1",
    socials: { instagram: "kaanvural.ink", twitter: "kaanvural", behance: "kaanvural" },
    portfolio: [],
  },
  {
    id: "elif",
    name: "Elif Noir",
    slug: "elif-noir",
    specialty: "İnce Çizgi & Geometrik",
    image: artist2,
    bannerVideoUrl: "",
    bio: "Elif, deri sanatına matematiksel bir hassasiyet getiriyor. İnce çizgi ve kutsal geometri konusunda uzmanlaşmış eserleri, desen ve simetrinin karmaşık keşifleridir. Berlin Dövme Sanatı Okulu'nda eğitim almış ve Avrupa estetiğini sanatına yansıtmaktadır.",
    experience: "8+ yıl",
    email: "elif@argox.studio",
    phone: "+90 555 100 2002",
    password: "artist2",
    socials: { instagram: "elifnoir.ink", behance: "elifnoir" },
    portfolio: [],
  },
  {
    id: "deniz",
    name: "Deniz Kara",
    slug: "deniz-kara",
    specialty: "Neo Geleneksel & Renkli",
    image: artist3,
    bannerVideoUrl: "",
    bio: "Deniz, neo-geleneksel dövme sanatının sınırlarını zorlayan cesur bir renk ustasıdır. Canlı paletleri ve dramatik kompozisyonlarıyla tanınır; klasik motifleri çağdaş başyapıtlara dönüştürür. İstanbul Dövme Konvansiyonu'nda birçok ödül kazanmıştır.",
    experience: "10+ yıl",
    email: "deniz@argox.studio",
    phone: "+90 555 100 2003",
    password: "artist3",
    socials: { instagram: "denizkara.ink", twitter: "denizkara" },
    portfolio: [],
  },
];

// Assign portfolios after tattooWorks is defined
artists[0].portfolio = tattooWorks.filter((w) => w.artistId === "kaan");
artists[1].portfolio = tattooWorks.filter((w) => w.artistId === "elif");
artists[2].portfolio = tattooWorks.filter((w) => w.artistId === "deniz");

export const testimonials: Testimonial[] = [
  { id: "t1", name: "Alex M.", text: "Kaan vizyonumu mükemmel anladı. Ejderha kol dövmem hayal ettiğimin çok ötesinde. Gerçek bir sanat.", rating: 5, artistName: "Kaan Vural" },
  { id: "t2", name: "Sara K.", text: "Elif'in ince çizgi işçiliği nefes kesici. Tasarladığı geometrik mandala hassas ve büyüleyici.", rating: 5, artistName: "Elif Noir" },
  { id: "t3", name: "Mert D.", text: "Deniz neo-geleneksel çalışmama inanılmaz renk ve hayat kattı. Stüdyo atmosferi eşsiz.", rating: 5, artistName: "Deniz Kara" },
  { id: "t4", name: "Julia R.", text: "Danışmanlıktan bakıma kadar ArgoX standardı belirliyor. Sadece burada dövme yaptırmak için Berlin'den geldim.", rating: 5, artistName: "Kaan Vural" },
  { id: "t5", name: "Can B.", text: "ArgoX'un detaylara ve hijyene verdiği önem dünya standartlarında. Blackwork çalışmam mükemmel iyileşti.", rating: 5, artistName: "Elif Noir" },
];

export const services: ServiceItem[] = [
  { id: "s1", title: "Özel Dövme", description: "Hikâyenize özel tasarımlar. Konsept çizimden son mürekkebe kadar her parça benzersizdir.", icon: "Pen", price: "₺3.000'den" },
  { id: "s2", title: "Kapatma & Düzeltme", description: "Eski veya istenmeyen dövmeleri çarpıcı yeni eserlere dönüştürün. Uzman renk eşleştirme ve tasarım entegrasyonu.", icon: "RefreshCw", price: "₺5.000'den" },
  { id: "s3", title: "Piercing", description: "Medikal sınıf titanyum takılarla profesyonel piercing hizmeti. Kulak, burun, septum ve vücut piercingleri.", icon: "Sparkles", price: "₺500'den" },
  { id: "s4", title: "Danışmanlık", description: "Seçtiğiniz sanatçıyla birebir ücretsiz görüşme. Yerleşim, boyut, stil ve özel fiyat teklifi.", icon: "MessageSquare", price: "Ücretsiz" },
];

export const marqueeImages = [tattoo1, tattoo2, tattoo3, tattoo4, tattoo6, tattoo1, tattoo3, tattoo2];

export const getArtistById = (id: string): Artist | undefined => artists.find((a) => a.id === id);

/** Tarihçe sayfası timeline öğesi (Supabase history_timeline ile senkron) */
export interface HistoryTimelineItem {
  id: string;
  year: string;
  title: string;
  description: string;
  imageUrl: string;
  orderIndex: number;
}

/** Varsayılan timeline (DB boşken veya fallback; artık TarihcePage context'ten order_index ile çeker) */
export const defaultHistoryTimeline: HistoryTimelineItem[] = [
  { id: "h1", year: "MÖ 3300", title: "İlk İzler", description: "Ötzi Buzul Adamı'nda bulunan 61 dövme, bilinen en eski deri sanatı örnekleridir.", imageUrl: tattoo1, orderIndex: 0 },
  { id: "h2", year: "MÖ 2000", title: "Mısır Geleneği", description: "Antik Mısır'da kadın mumyalarda bulunan dövmeler, doğurganlık ve koruma ritüelleriyle ilişkilendirilmiştir.", imageUrl: tattoo2, orderIndex: 1 },
  { id: "h3", year: "300", title: "Polinezya Kökenleri", description: "Tiki kültürü ve kabile gelenekleri, dövmeyi toplumsal statü ve ruhani güç sembolü olarak kullanmıştır.", imageUrl: tattoo3, orderIndex: 2 },
  { id: "h4", year: "1700", title: "Japon Irezumi", description: "Edo dönemi Japonya'sında dövme sanatı, ahşap baskı ustalarının tekniklerinden esinlenerek doruk noktasına ulaşmıştır.", imageUrl: tattoo4, orderIndex: 3 },
  { id: "h5", year: "1891", title: "Elektrikli Makine", description: "Samuel O'Reilly'nin ilk elektrikli dövme makinesi patenti, modern dövme çağını başlatmıştır.", imageUrl: tattoo6, orderIndex: 4 },
  { id: "h6", year: "2020+", title: "Dijital Çağ", description: "Sosyal medya ve dijital tasarım araçları, dövme sanatını küresel bir ifade biçimine dönüştürmüştür.", imageUrl: tattoo1, orderIndex: 5 },
];

export const quizQuestions = [
  {
    question: "Hangi sanat akımı sana daha yakın?",
    options: [
      { label: "Minimalizm", style: "İnce Çizgi" },
      { label: "Ekspresyonizm", style: "Neo Geleneksel" },
      { label: "Geometrik Soyut", style: "Geometrik" },
      { label: "Japon Sanatı", style: "Japon" },
    ],
  },
  {
    question: "Bir dövmede en çok neye önem verirsin?",
    options: [
      { label: "Anlam & Hikâye", style: "Japon" },
      { label: "Estetik & Simetri", style: "Geometrik" },
      { label: "Cesur Renkler", style: "Neo Geleneksel" },
      { label: "Zarafet & İncelik", style: "İnce Çizgi" },
    ],
  },
  {
    question: "Hayalindeki dövme nerede olsun?",
    options: [
      { label: "Kol veya Bacak", style: "Japon" },
      { label: "Bilek veya Ayak Bileği", style: "İnce Çizgi" },
      { label: "Sırt veya Göğüs", style: "Neo Geleneksel" },
      { label: "Parmak veya Kulak Arkası", style: "Geometrik" },
    ],
  },
];

// ——— Default global content (used by admin / initial state) ———

export const defaultHeroContent: HeroContent = {
  tagline: "Premium Dövme Stüdyosu",
  titleLine1: "Senin Hikâyeni",
  titleLine2: "Mürekkeple Yazıyoruz",
  subtitle: "Sanat ile derinin buluştuğu yer. İstanbul'un kalbinde dünya standartlarında sanatçılarla özel tasarımlar.",
  ctaGallery: "GALERİYİ KEŞFET",
  ctaArtists: "SANATÇILAR",
};

export const defaultAboutContent: AboutContent = {
  sectionLabel: "Hikâyemiz",
  sectionTitle: "Stüdyo Hakkında",
  paragraph1:
    "2018'de İstanbul'un Kadıköy ilçesinin kalbinde kurulan ArgoX, kolektif bir vizyondan doğdu: dövme sanatının süslemeden öteye geçerek kişisel hikâye anlatımı için bir araç haline geldiği bir mekân yaratmak.",
  paragraph2:
    "Stüdyomuz hem sanatçılar hem de müşteriler için bir sığınaktır. Medikal sınıf hijyen standartları, özel kabinler ve endüstriyel sertliği modern konforla harmanlayan küratörlü bir atmosfer ile ArgoX, dünya çapında mürekkep tutkunları için bir destinasyona dönüştü.",
  locationLabel: "Konum",
  locationValue: "Kadıköy, İstanbul",
  hoursLabel: "Çalışma Saatleri",
  hoursValue: "Sal–Cum, 11–20",
  certificationLabel: "Sertifikalı",
  certificationValue: "ISO 9001 Hijyen",
  statTattoos: "5K+",
  statArtists: "3",
  statYears: "7+",
  statAwards: "15+",
  moreLinkText: "Daha Fazla",
};

export const defaultContactHoursContent: ContactHoursContent = {
  phone: "+90 555 100 2000",
  address: "Tomtom Mah. Boğazkesen Cad. No: 27, Beyoğlu / İstanbul",
  email: "studio@argox.studio",
  mapEmbedUrl:
    "https://www.google.com/maps?q=Tomtom+Mah.+Bo%C4%9Fazkesen+Cad.+No:+27+Beyo%C4%9Fu+%C4%B0stanbul&output=embed",
  studioSectionTitle: "Stüdyo",
  studioSectionSubtitle: "Beton, ışık ve mürekkep arasında",
  contactTitle: "İletişim Bilgileri",
  phoneLabel: "Telefon",
  locationLabel: "Konum",
  emailLabel: "E-posta",
  hoursLabel: "Çalışma Saatleri",
  workingHours: [
    { day: "Pazartesi", hours: "10:00 - 20:00", isClosed: false },
    { day: "Salı", hours: "10:00 - 20:00", isClosed: false },
    { day: "Çarşamba", hours: "10:00 - 20:00", isClosed: false },
    { day: "Perşembe", hours: "10:00 - 20:00", isClosed: false },
    { day: "Cuma", hours: "10:00 - 20:00", isClosed: false },
    { day: "Cumartesi", hours: "10:00 - 20:00", isClosed: false },
    { day: "Pazar", hours: "10:00 - 20:00", isClosed: true },
  ],
  studioPhotos: [],
};

export const defaultFooterContent: FooterContent = {
  copyright: "© 2026 ArgoX Dövme Stüdyosu. Tüm hakları saklıdır.",
};

// Testimonials section labels (for admin)
export const defaultTestimonialsSectionContent = {
  sectionLabel: "Sesler",
  sectionTitle: "Müşterilerimiz Ne Diyor",
};

// Services section labels
export const defaultServicesSectionContent = {
  sectionLabel: "Neler Yapıyoruz",
  sectionTitle: "Hizmetlerimiz",
  moreLinkText: "Tümünü Keşfet",
};

// RecentlyInked section labels
export const defaultRecentlyInkedContent = {
  sectionLabel: "Son Çalışmalar",
  sectionTitle: "Yeni Tasarım & Piercing",
  viewAllText: "Tümünü Gör",
};
