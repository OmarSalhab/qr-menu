# Working Hours & Open Status

## Goal
Display an accurate, localized Arabic label telling users if the store is open, and if not, when it opens (or how long until it closes) — without causing React hydration errors.

## Data Representation
`workingHours`: JSON array of objects:
```
[{ day: 0, open: "10:00", close: "23:00", closed: false }, ...]
```
- `day`: 0=Sunday … 6=Saturday
- `open` / `close`: 24h HH:mm local times
- `closed?`: optional boolean flag

## Computation (`computeOpenStatus`)
Returns:
```
{
  isOpen: boolean,
  label: string,           // Arabic human readable
  nextChangeMinutes: number
}
```
Label formats examples:
- `إغلاق بعد 2 ساعة 15 دقيقة`
- `فتح بعد 45 دقيقة`
- `سيفتح قريباً`
- `مغلق`

## Timezone Handling
- Uses `Intl.DateTimeFormat` with store timezone (default `Asia/Amman`) to obtain current local weekday + time.
- Avoids manual DST logic (delegated to JS engine / ICU data).

## Edge Conditions
| Condition | Behavior |
|-----------|----------|
| Open span crosses midnight | Not supported yet (assumes open < close same day). Future enhancement: treat close < open as wrap to next day. |
| All days closed | Returns `مغلق` permanently. |
| Missing schedule | Defaults to closed. |

## Hydration Stability
Issue: Client recomputation a minute later (or on different clock) produced mismatched label.
Mitigation strategies (ordered by robustness):
1. Server snapshot label passed via props; client defers recompute until after mount + aligned to next minute boundary.
2. Freeze initial client render to provided `label` (memo) and only update inside `useEffect`.
3. (Implemented interim) Keep SSR + client recompute but accept minor drift; resolved by moving toward snapshot approach.

## Future Improvements
| Improvement | Detail |
|------------|--------|
| Cross-midnight spans | Allow open > close meaning e.g., 18:00–02:00 next day. |
| Multiple intervals/day | Expand JSON to list intervals per day. |
| Holiday exceptions | Add `SpecialHours` table with date overrides. |
| Caching | Precompute next change timestamp server-side and embed as data attribute for progressive enhancement. |

---
Proceed to `images-storage.md` for asset pipeline.
