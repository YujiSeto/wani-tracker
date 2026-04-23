/**
 * Pure SRS utility functions.
 * No DB imports — safe to use in both Server and Client Components.
 */

/** Maps a numeric SRS stage to a WaniKani-style hex colour. */
export function srsColor(stage: number | null): string {
  if (stage === null) return '#3a3a3a'; // locked
  if (stage === 0)    return '#555';    // lesson
  if (stage <= 4)     return '#e32b2b'; // apprentice
  if (stage <= 6)     return '#882d9e'; // guru
  if (stage === 7)    return '#294ddb'; // master
  if (stage === 8)    return '#0093dd'; // enlightened
  return '#252525';                      // burned
}

/** Maps a stage to its TranslationKey (for use with t(locale, key)). */
export type SRSLabelKey =
  | 'srs.locked'
  | 'srs.lesson'
  | 'srs.apprentice'
  | 'srs.guru'
  | 'srs.master'
  | 'srs.enlightened'
  | 'srs.burned';

export function srsLabelKey(stage: number | null): SRSLabelKey {
  if (stage === null) return 'srs.locked';
  if (stage === 0)    return 'srs.lesson';
  if (stage <= 4)     return 'srs.apprentice';
  if (stage <= 6)     return 'srs.guru';
  if (stage === 7)    return 'srs.master';
  if (stage === 8)    return 'srs.enlightened';
  return 'srs.burned';
}
