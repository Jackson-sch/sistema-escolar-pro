export type SizeEntry = {
  size: string;
  ageMin: number;
  ageMax: number;
  heightMin: number;
  heightMax: number;
  weightMin: number;
  weightMax: number;
};

export type Confidence = "alta" | "media" | "baja";

export type SizerResult = {
  primary: string;
  fallback: string | null;
  confidence: Confidence;
  signals: string[];
  note: string | null;
};

export const SIZE_CHART: SizeEntry[] = [
  {
    size: "4",
    ageMin: 3,
    ageMax: 3,
    heightMin: 95,
    heightMax: 105,
    weightMin: 13,
    weightMax: 16,
  },
  {
    size: "6",
    ageMin: 4,
    ageMax: 5,
    heightMin: 106,
    heightMax: 116,
    weightMin: 17,
    weightMax: 21,
  },
  {
    size: "8",
    ageMin: 6,
    ageMax: 7,
    heightMin: 117,
    heightMax: 128,
    weightMin: 22,
    weightMax: 27,
  },
  {
    size: "10",
    ageMin: 8,
    ageMax: 9,
    heightMin: 129,
    heightMax: 140,
    weightMin: 28,
    weightMax: 34,
  },
  {
    size: "12",
    ageMin: 10,
    ageMax: 11,
    heightMin: 141,
    heightMax: 152,
    weightMin: 35,
    weightMax: 43,
  },
  {
    size: "14/16",
    ageMin: 12,
    ageMax: 12,
    heightMin: 153,
    heightMax: 160,
    weightMin: 44,
    weightMax: 50,
  },
  {
    size: "16 / XS",
    ageMin: 13,
    ageMax: 14,
    heightMin: 161,
    heightMax: 168,
    weightMin: 51,
    weightMax: 58,
  },
  {
    size: "S",
    ageMin: 15,
    ageMax: 16,
    heightMin: 169,
    heightMax: 175,
    weightMin: 59,
    weightMax: 67,
  },
  {
    size: "S / M",
    ageMin: 17,
    ageMax: 99,
    heightMin: 176,
    heightMax: 999,
    weightMin: 68,
    weightMax: 999,
  },
];

export function computeSize(
  age: number | null,
  height: number | null,
  weight: number | null,
): SizerResult | null {
  if (age === null && height === null && weight === null) return null;

  // Score each size entry based on how many signals match
  const scored = SIZE_CHART.map((entry) => {
    let score = 0;
    const signals: string[] = [];

    if (height !== null) {
      if (height >= entry.heightMin && height <= entry.heightMax) {
        score += 3; // Height is the most reliable signal
        signals.push("estatura");
      } else if (
        Math.abs(height - entry.heightMin) <= 5 ||
        Math.abs(height - entry.heightMax) <= 5
      ) {
        score += 1;
      }
    }

    if (age !== null) {
      if (age >= entry.ageMin && age <= entry.ageMax) {
        score += 2;
        signals.push("edad");
      } else if (
        Math.abs(age - entry.ageMin) <= 1 ||
        Math.abs(age - entry.ageMax) <= 1
      ) {
        score += 0.5;
      }
    }

    if (weight !== null) {
      if (weight >= entry.weightMin && weight <= entry.weightMax) {
        score += 2;
        signals.push("peso");
      } else if (
        Math.abs(weight - entry.weightMin) <= 3 ||
        Math.abs(weight - entry.weightMax) <= 3
      ) {
        score += 0.5;
      }
    }

    return { entry, score, signals };
  });

  const sorted = scored.sort((a, b) => b.score - a.score);
  const best = sorted[0];
  const runnerUp = sorted[1];

  if (best.score === 0) return null;

  const maxPossibleScore =
    (height !== null ? 3 : 0) +
    (age !== null ? 2 : 0) +
    (weight !== null ? 2 : 0);

  const ratio = best.score / maxPossibleScore;
  const confidence: Confidence =
    ratio >= 0.7 ? "alta" : ratio >= 0.4 ? "media" : "baja";

  const fallback =
    runnerUp && runnerUp.score >= best.score * 0.6 ? runnerUp.entry.size : null;

  let note: string | null = null;
  if (height !== null && age !== null) {
    const heightEntry = scored.find(
      (s) => height >= s.entry.heightMin && height <= s.entry.heightMax,
    );
    const ageEntry = scored.find(
      (s) => age >= s.entry.ageMin && age <= s.entry.ageMax,
    );
    if (
      heightEntry &&
      ageEntry &&
      heightEntry.entry.size !== ageEntry.entry.size
    ) {
      note = `La estatura sugiere ${heightEntry.entry.size}, la edad sugiere ${ageEntry.entry.size}. Priorizamos estatura.`;
    }
  }

  return {
    primary: best.entry.size,
    fallback,
    confidence,
    signals: best.signals,
    note,
  };
}
