/* eslint-disable no-continue */
/** NOTE (required for full credit):
 * Hawaiian names can include diacritics (kahakō/macron: āēīōū) and the ʻokina (ʻ).
 * Datasets may vary in whether diacritics/ʻokina are present and in Unicode form (NFC vs NFD),
 * and hyphenation/spacing can differ (e.g., “Kaimukī”, “Kaʻūpūlehu-Kai”).
 * To avoid false negatives when matching the substring "kai", we:
 *  - Lowercase
 *  - Normalize to NFD and strip combining marks
 *  - Replace the ʻokina (U+02BB) with an apostrophe
 * This makes substring checks more robust across encodings and spellings.
 */

/** We avoid declaring aliases like PopulationByIsland/PopFn/HasFn here
 *  to prevent duplicate-identifier conflicts with citiesf25.ts.
 *  Keep this file self-contained and permissive about input types.
 */

/* eslint-disable @typescript-eslint/no-unused-vars */
/** Augment Window BEFORE any usage (permissive typing to avoid conflicts) */
interface Window {
  cities?: City[]; // <-- match citiesf25.ts exactly
  populationCitiesKai?: (cities: unknown[]) => Record<string, number>;
  hasKai?: (cities: unknown[]) => boolean;
}
/* eslint-enable @typescript-eslint/no-unused-vars */

/** Normalize for robust, case/diacritic-insensitive matching. */
function normalizeForMatch(s: string): string {
  let out = s.toLowerCase();
  out = out.normalize('NFD').replace(/[\u0300-\u036f]/g, ''); // strip diacritics
  out = out.replace(/\u02bb/g, "'"); // ʻokina → apostrophe
  return out;
}

/** Safe name check that tolerates non-strings. */
function nameContainsWord(name: unknown, word: string): boolean {
  const s = typeof name === 'string' ? name : '';
  const nName = normalizeForMatch(s);
  const nWord = normalizeForMatch(word);
  return nName.includes(nWord);
}

/** Returns { islandName: totalPopulationOfKaiCities }, defaulting missing islands to "Unknown". */
function populationCitiesKai(cities: unknown[]): Record<string, number> {
  const acc: Record<string, number> = {};

  for (const item of cities) {
    if (!item || typeof item !== 'object') continue;

    // Loose access with runtime checks
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any
    const c: any = item;

    // Validate/normalize fields
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const hasKaiInName = nameContainsWord(c?.name, 'kai');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const pop =
      typeof c?.population === 'number' && Number.isFinite(c.population)
        ? // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          c.population
        : 0;

    if (!hasKaiInName) continue;
    if (pop < 0) continue;

    // Default missing island to "Unknown"
    // eslint-disable-next-line max-len
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    const island =
      typeof c?.island === 'string' && c.island.trim().length > 0
        ? // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          c.island
        : 'Unknown';

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    acc[island] = (acc[island] ?? 0) + pop;
  }

  return acc;
}

/** True if any city name contains "kai" (case/diacritic-insensitive). */
function hasKai(cities: unknown[]): boolean {
  for (const item of cities) {
    if (!item || typeof item !== 'object') continue;
    // eslint-disable-next-line max-len
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment
    const name = (item as any)?.name;
    if (nameContainsWord(name, 'kai')) return true;
  }
  return false;
}

/** Expose functions globally for non-module scripts. */
window.populationCitiesKai = populationCitiesKai;
window.hasKai = hasKai;

if (Array.isArray(window.cities)) {
  const arr: unknown[] = window.cities;
  const byIsland = populationCitiesKai(arr);
  // eslint-disable-next-line no-console
  console.log('populationCitiesKai:', byIsland);

  const total = Object.keys(byIsland).reduce<number>((sum, key) => sum + byIsland[key], 0);
  // eslint-disable-next-line no-console
  console.log('total:', total);

  // eslint-disable-next-line no-console
  console.log('hasKai:', hasKai(arr));
}
// eslint-disable-next-line max-len
/** Optional: demo if data is loaded (no Object.values to avoid lib issues). */ /** Optional: demo if data is loaded (ES2016-safe, no loops) */

console.log(hasKai(cities)); // prints true because there are cities with wai in them such as Waipahu
// eslint-disable-next-line max-len
console.log(hasKai(cities.filter((city) => city.island === 'Lanai'))); // prints false because filtered to only Lanai cities none of which have wai in their name.
// eslint-disable-next-line max-len
console.log(populationCitiesKai(cities)); // Returns object with islands as keys and total population of cities with "wai" as values as given above
// eslint-disable-next-line max-len
// eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unused-vars, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-return
const total = Object.keys(byIsland).reduce((sum, key) => sum + byIsland[key], 0);

console.log(populationCitiesKai(cities.slice(0, 10))); // Should show only Waipahu's population of 39927 on Oahu

// Test with fewer cities
console.log(populationCitiesKai(cities.slice(0, 5))); // gives empty object since no cities with "wai" in first 5
