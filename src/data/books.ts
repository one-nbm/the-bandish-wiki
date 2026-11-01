export interface BookPurchaseLink {
  label: string;
  url: string;
  vendor: "amazon" | "chaukhambha" | "exoticindia" | "publisher" | "general";
  isAvailable: boolean;
}

export interface BookCoverTheme {
  primaryBg: string;       // Gradient / color for front & back covers
  spineBg: string;         // Spine background
  pagesBg: string;         // Page block color
  goldTrim: string;        // Foil border color
  textColor: string;       // Main title text
  subtextColor: string;    // Subtitle / author text
  accentBadge: string;     // Color badge on spine/cover
  glowColor?: string;      // Dedicated atmospheric ambient glow color
}

export interface BookMetadata {
  slug: string;
  title: string;
  originalTitleDevanagari: string;
  authors: string[];
  publisher?: string;
  publicationYear?: string | number;
  edition?: string;
  isbn?: string;
  volumes?: string;
  language: string;
  notationSystem: string;
  description: string;
  historicalSignificance?: string;
  citation?: string;
  coverImage?: string;
  coverTheme: BookCoverTheme;
  purchaseLinks: BookPurchaseLink[];
}

export const CURATED_BOOKS: Record<string, BookMetadata> = {
  "raag-sarita": {
    slug: "raag-sarita",
    title: "Raag Sarita",
    originalTitleDevanagari: "राग सरिता",
    authors: ["Pt. C. R. Vyas 'Gunijan'"],
    publisher: "Sanskar Prakashan, Mumbai",
    publicationYear: "1984 (1st Ed.) / 1999 (2nd Ed.)",
    edition: "2nd Expanded Edition (159 Bandishes in 74 Ragas)",
    isbn: "978-81-93970-22-5",
    language: "Hindi & Braj Bhasha",
    notationSystem: "Standardized Swarlipi Notations",
    description:
      "Composed under his revered nom de plume 'Gunijan' (गुणीजन) by Agra-Gwalior maestro Pandit Chintaman Raghunath Vyas (Pt. C. R. Vyas, 1924–2002). Published by Sanskar Prakashan, this landmark compendium compiles 159 vocal bandishes (vilambit, madhya, and drut khayals alongside taranas) across 74 traditional and self-created ragas (such as Dhankoni Kalyan, Sanjogiya, and Shiv-Abhogi) with complete swarlipi notations.",
    historicalSignificance:
      "Inaugurated by international Tabla maestro Ustad Zakir Hussain in the presence of Pt. Yashwant Mahale, Swami Shree Chaitanya Swaroopdas ji, and Pt. Satyasheel Deshpande, Raag Sarita stands as an authoritative repertoire vault uniting the vocal architectures of the Gwalior, Agra, and Kirana gharanas.",
    citation: "Sanskar Prakashan (ISBN 978-81-93970-22-5) & Pt. C. R. Vyas Archival Trust",
    coverImage: "/books/raag-sarita.jpg",
    coverTheme: {
      primaryBg: "linear-gradient(135deg, #A8203E 0%, #6E1226 100%)", // Matching ruby red / wine from real cover
      spineBg: "#540D1D",
      pagesBg: "#FFF8ED",
      goldTrim: "#C8234D",
      textColor: "#FFF9E6",
      subtextColor: "#FCD5DC",
      accentBadge: "#C8234D",
      glowColor: "#C8234D", // Saturated ruby red glow
    },
    purchaseLinks: [
      {
        label: "Sanskar Prakashan (Official Publisher)",
        url: "https://www.sanskarprakashanmusic.com/products/raag-sarita-bandish-notations",
        vendor: "publisher",
        isAvailable: true,
      },
      {
        label: "Amazon India",
        url: "https://www.amazon.in/s?k=Raag+Sarita+C+R+Vyas",
        vendor: "amazon",
        isAvailable: true,
      },
      {
        label: "Exotic India Art",
        url: "https://www.exoticindiaart.com/book/search/?q=Raag+Sarita",
        vendor: "exoticindia",
        isAvailable: true,
      },
    ],
  },

  "sangita-raga-kalpadruma": {
    slug: "sangita-raga-kalpadruma",
    title: "Sangita Raga-Kalpadruma",
    originalTitleDevanagari: "सङ्गीत राग कल्पद्रुम",
    authors: ["Krishnanand Vyas Deva"],
    publisher: "Calcutta (Kolkata) / Sangeet Natak Akademi",
    publicationYear: "1842",
    volumes: "3 Volumes",
    language: "Braj Bhasha, Sanskrit, Hindi, Bengali",
    notationSystem: "Traditional Archival Lyrics & Metric Classifications",
    description:
      "A monumental encyclopedic masterpiece compiled by Krishnanand Vyas Deva in 1842. It serves as one of the largest treasuries of traditional Dhrupad, Dhamar, Sadra, and early Khayal bandishes from historic court masters (Tansen, Baiju Bawra, Swami Haridas).",
    historicalSignificance:
      "Cited by musicologists worldwide as a primary archival monument bridging ancient Prabandha traditions to modern Khayal practice.",
    citation: "Sangeet Natak Akademi Archives & The Asiatic Society (Calcutta)",
    coverTheme: {
      primaryBg: "linear-gradient(135deg, #1A2E26 0%, #0E1A15 100%)", // Antique imperial emerald
      spineBg: "#0C1713",
      pagesBg: "#FFF7EB",
      goldTrim: "#E5C158",
      textColor: "#F4F8F5",
      subtextColor: "#C5D8CD",
      accentBadge: "#E5C158",
      glowColor: "#10B981", // Saturated emerald green aura
    },
    purchaseLinks: [
      {
        label: "Exotic India Art",
        url: "https://www.exoticindiaart.com/book/search/?q=Sangita+Raga+Kalpadruma",
        vendor: "exoticindia",
        isAvailable: true,
      },
      {
        label: "Amazon (Rare Reprint Editions)",
        url: "https://www.amazon.in/s?k=Sangita+Raga+Kalpadruma",
        vendor: "amazon",
        isAvailable: true,
      },
    ],
  },

  "kramik-pustak-malika": {
    slug: "kramik-pustak-malika",
    title: "Kramik Pustak Malika",
    originalTitleDevanagari: "क्रमिक पुस्तक मालिका",
    authors: ["Pt. Vishnu Narayan Bhatkhande"],
    publisher: "Sangeet Karyalaya, Hathras",
    publicationYear: "1919–1937",
    volumes: "6 Volumes (Parts 1–6)",
    language: "Hindi & Marathi",
    notationSystem: "Bhatkhande Notation System (Standardized)",
    description:
      "The magnum opus of Pt. V. N. Bhatkhande, standardizing hundreds of traditional compositions collected from gharana ustads across India. It serves as the primary canon for all academic curricula in Indian classical vocal music.",
    historicalSignificance:
      "Single-handedly modernized Indian classical music education by committing centuries of oral bandish traditions to standardized notation.",
    citation: "Sangeet Karyalaya (Hathras) & Bhatkhande Music Institute University",
    coverTheme: {
      primaryBg: "linear-gradient(135deg, #1B243B 0%, #0E1424 100%)", // Midnight sapphire
      spineBg: "#0A0F1C",
      pagesBg: "#FFF9F0",
      goldTrim: "#DFBA54",
      textColor: "#F5F8FF",
      subtextColor: "#BFCEE8",
      accentBadge: "#DFBA54",
      glowColor: "#3B82F6", // Saturated sapphire blue aura
    },
    purchaseLinks: [
      {
        label: "Sangeet Karyalaya",
        url: "https://www.amazon.in/s?k=Kramik+Pustak+Malika+Bhatkhande",
        vendor: "amazon",
        isAvailable: true,
      },
      {
        label: "Chaukhambha Books",
        url: "https://www.chaukhambhapustak.com/index.php?route=product/search&search=Kramik%20Pustak%20Malika",
        vendor: "chaukhambha",
        isAvailable: true,
      },
    ],
  },

  "raga-parichay": {
    slug: "raga-parichay",
    title: "Raga Parichay",
    originalTitleDevanagari: "राग परिचय",
    authors: ["Pt. Harishchandra Srivastava"],
    publisher: "Sangeet Sadan Prakashan, Prayagraj",
    publicationYear: "Multiple Editions",
    volumes: "4 Parts",
    language: "Hindi",
    notationSystem: "Bhatkhande Swarlipi",
    description:
      "A widely consulted 4-part treatise organizing ragas systematically by difficulty, theoretical depth, and tonal affinities. Contains pristine compositions and comprehensive lakshan-geets.",
    historicalSignificance:
      "Standard textbook for diploma and degree programs in Hindustani vocal music across India.",
    citation: "Sangeet Sadan Prakashan, Prayagraj",
    coverTheme: {
      primaryBg: "linear-gradient(135deg, #3A2312 0%, #201309 100%)", // Antique warm Havana brown
      spineBg: "#190F07",
      pagesBg: "#FFF6E8",
      goldTrim: "#DCAE5A",
      textColor: "#FFFBF2",
      subtextColor: "#E6D1AB",
      accentBadge: "#DCAE5A",
      glowColor: "#D97706", // Saturated warm amber / terracotta aura
    },
    purchaseLinks: [
      {
        label: "Amazon India",
        url: "https://www.amazon.in/s?k=Raga+Parichay+Harishchandra+Srivastava",
        vendor: "amazon",
        isAvailable: true,
      },
    ],
  },

  "abhinav-geetanjali": {
    slug: "abhinav-geetanjali",
    title: "Abhinav Geetanjali",
    originalTitleDevanagari: "अभिनव गीतांजलि",
    authors: ["Pt. Ramashreya Jha 'Ramrang'"],
    publisher: "Sangeet Sadan Prakashan, Prayagraj",
    publicationYear: "1977–2004",
    volumes: "5 Volumes",
    language: "Braj Bhasha & Hindi",
    notationSystem: "Bhatkhande Swarlipi",
    description:
      "A monumental collection of original bandishes composed by the legendary vaggeyakara Pt. Ramashreya Jha 'Ramrang'. Renowned for poetic brilliance, intricate rhythmic architecture, and deep ranga-bhav.",
    historicalSignificance:
      "One of the greatest modern contributions to the Hindustani khayal repertoire, sung by top-tier concert vocalists.",
    citation: "Allahabad University Department of Music & Sangeet Sadan Prakashan",
    coverTheme: {
      primaryBg: "linear-gradient(135deg, #2E1A47 0%, #170C26 100%)", // Imperial plum / violet
      spineBg: "#130920",
      pagesBg: "#FFF8F2",
      goldTrim: "#D0BCFF",
      textColor: "#FBF7FF",
      subtextColor: "#DAC7FF",
      accentBadge: "#D0BCFF",
      glowColor: "#8B5CF6", // Saturated royal plum aura
    },
    purchaseLinks: [
      {
        label: "Amazon India",
        url: "https://www.amazon.in/s?k=Abhinav+Geetanjali+Ramashreya+Jha",
        vendor: "amazon",
        isAvailable: true,
      },
    ],
  },

  "sangeetanjali": {
    slug: "sangeetanjali",
    title: "Sangeetanjali",
    originalTitleDevanagari: "संगीतांजलि",
    authors: ["Pt. Omkarnath Thakur"],
    publisher: "Banaras Hindu University / Sangeetanjali Trust",
    publicationYear: "1938–1962",
    volumes: "6 Volumes",
    language: "Hindi & Gujarati",
    notationSystem: "Omkarnath Swarlipi",
    description:
      "A masterwork exploring the emotive essence (Rasa and Bhava) of classical ragas through the unique musical philosophy and vocal genius of Pt. Omkarnath Thakur.",
    historicalSignificance:
      "A vital bridge connecting aesthetic philosophy with performance practice in twentieth-century Hindustani music.",
    citation: "Banaras Hindu University Faculty of Performing Arts & Sangeetanjali Trust",
    coverTheme: {
      primaryBg: "linear-gradient(135deg, #2D2718 0%, #17140B 100%)", // Aged bronze / dark umber
      spineBg: "#121008",
      pagesBg: "#FFF9EE",
      goldTrim: "#E5C07B",
      textColor: "#FAF6EB",
      subtextColor: "#D6C6A1",
      accentBadge: "#E5C07B",
      glowColor: "#F59E0B", // Saturated aged golden bronze aura
    },
    purchaseLinks: [
      {
        label: "Amazon India",
        url: "https://www.amazon.in/s?k=Sangeetanjali+Omkarnath+Thakur",
        vendor: "amazon",
        isAvailable: true,
      },
    ],
  },
};

export function slugifyBookTitle(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

// 8 Rich Classical Leather & Cloth Bindings for Any Future Uncatalogued Books
export const DYNAMIC_COVER_PALETTES: BookCoverTheme[] = [
  // 0. Imperial Crimson / Wine
  {
    primaryBg: "linear-gradient(135deg, #7F1D1D 0%, #450A0A 100%)",
    spineBg: "#3A0707",
    pagesBg: "#FFF8ED",
    goldTrim: "#F59E0B",
    textColor: "#FFF9E6",
    subtextColor: "#FECACA",
    accentBadge: "#EF4444",
    glowColor: "#EF4444",
  },
  // 1. Classical Emerald
  {
    primaryBg: "linear-gradient(135deg, #064E3B 0%, #022C22 100%)",
    spineBg: "#02221A",
    pagesBg: "#FFF7EB",
    goldTrim: "#E5C158",
    textColor: "#F4F8F5",
    subtextColor: "#A7F3D0",
    accentBadge: "#10B981",
    glowColor: "#10B981",
  },
  // 2. Royal Midnight Sapphire
  {
    primaryBg: "linear-gradient(135deg, #1E3A8A 0%, #0F172A 100%)",
    spineBg: "#0A1128",
    pagesBg: "#FFF9F0",
    goldTrim: "#DFBA54",
    textColor: "#F5F8FF",
    subtextColor: "#BFDBFE",
    accentBadge: "#3B82F6",
    glowColor: "#3B82F6",
  },
  // 3. Royal Plum / Amethyst
  {
    primaryBg: "linear-gradient(135deg, #4C1D95 0%, #2E1065 100%)",
    spineBg: "#1F0A44",
    pagesBg: "#FFF8F2",
    goldTrim: "#D0BCFF",
    textColor: "#FBF7FF",
    subtextColor: "#DDD6FE",
    accentBadge: "#8B5CF6",
    glowColor: "#8B5CF6",
  },
  // 4. Warm Terracotta / Amber
  {
    primaryBg: "linear-gradient(135deg, #78350F 0%, #451A03 100%)",
    spineBg: "#2B1102",
    pagesBg: "#FFF6E8",
    goldTrim: "#FBBF24",
    textColor: "#FFFBF2",
    subtextColor: "#FDE68A",
    accentBadge: "#F59E0B",
    glowColor: "#D97706",
  },
  // 5. Deep Indigo
  {
    primaryBg: "linear-gradient(135deg, #312E81 0%, #1E1B4B 100%)",
    spineBg: "#141238",
    pagesBg: "#FFF9F5",
    goldTrim: "#E0C37B",
    textColor: "#FFFFFF",
    subtextColor: "#C7D2FE",
    accentBadge: "#6366F1",
    glowColor: "#6366F1",
  },
  // 6. Peacock Teal
  {
    primaryBg: "linear-gradient(135deg, #134E4A 0%, #042F2E 100%)",
    spineBg: "#02201F",
    pagesBg: "#FFF8EE",
    goldTrim: "#E5C07B",
    textColor: "#F0FDFA",
    subtextColor: "#99F6E4",
    accentBadge: "#14B8A6",
    glowColor: "#14B8A6",
  },
  // 7. Aged Mahogany Umber
  {
    primaryBg: "linear-gradient(135deg, #422006 0%, #1C0A00 100%)",
    spineBg: "#130700",
    pagesBg: "#FFF7ED",
    goldTrim: "#F59E0B",
    textColor: "#FFFAF0",
    subtextColor: "#FED7AA",
    accentBadge: "#EA580C",
    glowColor: "#EA580C",
  },
];

/**
 * Deterministically picks a harmonious classical cover theme from a book's title or slug.
 */
export function getDeterministicBookTheme(seed: string): BookCoverTheme {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % DYNAMIC_COVER_PALETTES.length;
  return DYNAMIC_COVER_PALETTES[index];
}

/**
 * Universal helper that retrieves the dedicated atmospheric glow color for any book,
 * ensuring the glow always perfectly adapts to the physical book cover color.
 */
export function getBookGlowColor(book: BookMetadata): string {
  if (book?.coverTheme?.glowColor) {
    return book.coverTheme.glowColor;
  }
  if (book?.coverTheme?.accentBadge) {
    return book.coverTheme.accentBadge;
  }
  if (book?.coverTheme?.goldTrim) {
    return book.coverTheme.goldTrim;
  }
  return "#6750A4"; // Bandish Wiki M3 primary fallback
}

export function getBookBySlug(slug: string, fallbackTitle?: string): BookMetadata {
  const normalizedSlug = slugifyBookTitle(slug);
  if (CURATED_BOOKS[normalizedSlug]) {
    return CURATED_BOOKS[normalizedSlug];
  }

  // Handle book volumes and editions mapping to curated treatises (e.g. "sangita-raga-kalpadruma-vol-1")
  const baseCuratedSlug = Object.keys(CURATED_BOOKS).find(
    (curatedKey) => normalizedSlug.startsWith(curatedKey)
  );
  if (baseCuratedSlug) {
    return {
      ...CURATED_BOOKS[baseCuratedSlug],
      slug: normalizedSlug,
      title: fallbackTitle || CURATED_BOOKS[baseCuratedSlug].title,
    };
  }

  // Dynamic deterministic generation for any uncatalogued book added in Supabase
  const displayTitle = fallbackTitle || slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  const generatedTheme = getDeterministicBookTheme(normalizedSlug);

  return {
    slug: normalizedSlug,
    title: displayTitle,
    originalTitleDevanagari: displayTitle,
    authors: ["Traditional Anthology / Archival Compilation"],
    publisher: "Hindustani Classical Music Archival Publication",
    language: "Hindi & Sanskrit",
    notationSystem: "Traditional Hindustani Notation",
    description: `A celebrated repository of Hindustani classical compositions preserved in the canonical literature of "${displayTitle}".`,
    coverTheme: generatedTheme,
    purchaseLinks: [
      {
        label: `Search "${displayTitle}" on Amazon`,
        url: `https://www.amazon.in/s?k=${encodeURIComponent(displayTitle)}`,
        vendor: "amazon",
        isAvailable: true,
      },
      {
        label: `Search on Exotic India`,
        url: `https://www.exoticindiaart.com/book/search/?q=${encodeURIComponent(displayTitle)}`,
        vendor: "exoticindia",
        isAvailable: true,
      },
    ],
  };
}

export function getAllKnownBookSlugs(): string[] {
  return Object.keys(CURATED_BOOKS);
}
