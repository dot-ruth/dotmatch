export interface Deck {
  ids: string[];
  params: Record<string, unknown>;
  limit: number;
  total: number;
  kind?: "jobs" | "matched";
}

/* In-memory only: nothing is written to localStorage or sessionStorage.
   The deck survives client-side navigations within the tab; a full reload
   falls back to the job page's fresh-fetch path. */
let memoryDeck: Deck | null = null;

export function saveDeck(deck: Deck): void {
  memoryDeck = deck;
}

export function loadDeck(): Deck | null {
  const parsed = memoryDeck;
  if (!parsed || !Array.isArray(parsed.ids) || parsed.ids.length === 0) return null;
  return {
    ids: parsed.ids,
    params: parsed.params || {},
    limit: parsed.limit || 20,
    total: parsed.total || parsed.ids.length,
    kind: parsed.kind === "matched" ? "matched" : "jobs",
  };
}

export function deckFromJobs(
  ids: string[],
  params: Record<string, unknown>,
  total: number,
): Deck {
  const limit = Number(params.limit) || ids.length || 20;
  const baseParams = { ...params };
  delete baseParams.offset;
  delete baseParams.limit;
  return { ids, params: baseParams, limit, total, kind: "jobs" };
}

export function matchedDeck(ids: string[], total: number): Deck {
  return { ids, params: {}, limit: ids.length || 20, total, kind: "matched" };
}
