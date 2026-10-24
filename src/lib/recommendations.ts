export interface RecommendationCandidate {
  id: string;
  title: string;
  raag: string;
  taal: string;
  lay?: string[] | string | null;
  composer?: string | null;
  tradition?: string | null;
  youtube_renditions?: Array<{ artist?: string }> | null;
}

export interface RecommendationResult {
  bandish: RecommendationCandidate;
  score: number;
  reasonBadge: {
    icon: string;
    label: string;
  };
}

function normalizeStr(val?: string | null): string {
  return (val || "").trim().toLowerCase();
}

function isGeneric(val?: string | null): boolean {
  const norm = normalizeStr(val);
  return !norm || norm === "unknown" || norm === "traditional" || norm === "n/a" || norm === "none";
}

function normalizeLay(lay?: string[] | string | null): string[] {
  if (!lay) return [];
  const list = Array.isArray(lay) ? lay : [lay];
  return list.map((l) =>
    l.toLowerCase().replace(/dhrut/g, "drut").replace(/madhya\s*lay/g, "madhyalay").trim()
  );
}

export function getRecommendedBandishes(
  current: RecommendationCandidate,
  allBandishes: RecommendationCandidate[],
  raagToThaatMap: Record<string, string> = {},
  limit: number = 3
): RecommendationResult[] {
  const currentLay = normalizeLay(current.lay);
  const currentArtists = new Set(
    (current.youtube_renditions || [])
      .map((r) => normalizeStr(r?.artist))
      .filter((a) => a.length > 1)
  );

  const currentNormRaag = normalizeStr(current.raag);
  const currentThaat = normalizeStr(raagToThaatMap[currentNormRaag]);

  const candidates: RecommendationResult[] = [];

  for (const b of allBandishes) {
    if (b.id === current.id) continue;

    let score = 0;
    const reasons: { icon: string; label: string; weight: number }[] = [];

    const candNormRaag = normalizeStr(b.raag);
    const candThaat = normalizeStr(raagToThaatMap[candNormRaag]);

    // Give preference to compositions in DIFFERENT raags since recommendation
    // should be based on metrics other than raag
    if (candNormRaag && candNormRaag !== currentNormRaag) {
      score += 15;
    }

    // 1. Same Composer (high affinity)
    if (!isGeneric(current.composer) && !isGeneric(b.composer)) {
      if (normalizeStr(current.composer) === normalizeStr(b.composer)) {
        score += 60;
        reasons.push({
          icon: "music_note",
          label: `Same Composer: ${b.composer}`,
          weight: 60,
        });
      }
    }

    // 2. Same Tradition / Gharana
    if (!isGeneric(current.tradition) && !isGeneric(b.tradition)) {
      if (normalizeStr(current.tradition) === normalizeStr(b.tradition)) {
        score += 45;
        reasons.push({
          icon: "account_balance",
          label: `${b.tradition} Gharana`,
          weight: 45,
        });
      }
    }

    // 3. Rhythm: Taal & Lay
    const bLay = normalizeLay(b.lay);
    const sameTaal = !isGeneric(current.taal) && !isGeneric(b.taal) && normalizeStr(current.taal) === normalizeStr(b.taal);
    const sharedLay = currentLay.some((l) => bLay.includes(l));

    if (sameTaal && sharedLay) {
      score += 40;
      const displayLay = Array.isArray(b.lay) ? b.lay.join(", ") : (b.lay || "");
      reasons.push({
        icon: "timer",
        label: `Same Taal & Tempo: ${b.taal}${displayLay ? ` (${displayLay})` : ""}`,
        weight: 40,
      });
    } else if (sameTaal) {
      score += 25;
      reasons.push({
        icon: "timer",
        label: `Same Rhythm: ${b.taal}`,
        weight: 25,
      });
    } else if (sharedLay && currentLay.length > 0) {
      score += 15;
      reasons.push({
        icon: "speed",
        label: `Shared Tempo: ${Array.isArray(b.lay) ? b.lay.join(", ") : b.lay}`,
        weight: 15,
      });
    }

    // 4. Same Thaat (Allied Raag modal structure)
    if (currentThaat && candThaat && currentThaat === candThaat && currentNormRaag !== candNormRaag) {
      score += 30;
      const displayThaat = raagToThaatMap[candNormRaag] || currentThaat;
      reasons.push({
        icon: "grain",
        label: `Shared Thaat: ${displayThaat}`,
        weight: 30,
      });
    }

    // 5. Shared Performing Artist
    if (currentArtists.size > 0 && b.youtube_renditions) {
      for (const r of b.youtube_renditions) {
        const artist = normalizeStr(r?.artist);
        if (artist && currentArtists.has(artist)) {
          score += 30;
          reasons.push({
            icon: "record_voice_over",
            label: `Performed by ${r.artist}`,
            weight: 30,
          });
          break;
        }
      }
    }

    // Select primary reason
    if (reasons.length > 0) {
      reasons.sort((a, b) => b.weight - a.weight);
      candidates.push({
        bandish: b,
        score,
        reasonBadge: {
          icon: reasons[0].icon,
          label: reasons[0].label,
        },
      });
    } else if (score > 0) {
      candidates.push({
        bandish: b,
        score,
        reasonBadge: {
          icon: "auto_awesome",
          label: "Recommended Composition",
        },
      });
    }
  }

  // Sort candidates by score descending
  candidates.sort((a, b) => b.score - a.score);

  return candidates.slice(0, limit);
}
