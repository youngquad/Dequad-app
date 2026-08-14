# UI Polish & Bug Fixes — Design Spec
**Date:** 2026-08-14  
**Scope:** Full app polish (Option C) — bug fixes + auth screen refinement + dark theme visual refresh

---

## Section 1: Bug Fixes

| File | Line | Bug | Fix |
|---|---|---|---|
| `frontend/src/services/api.ts` | 8 | `REACT_APP_BACKEND_URL` — CRA env var, always `undefined` in Expo | Remove the line |
| `frontend/src/services/api.ts` | 84 | Logs partial auth token to console — security leak | Remove the `console.log` |
| `frontend/src/contexts/AuthContext.tsx` | 44, 60, 80 | 3x `console.log` leaking session IDs, tokens, and user names | Remove all three |
| `frontend/app/(main)/profile.tsx` | 155 | `projectId: 'dequad-app'` — placeholder string, push tokens silently fail | Replace with `'0ad6a13c-845f-4ab4-9177-ba5031d2462d'` (from `app.json`) |
| `frontend/app/(main)/_layout.tsx` | top | `BlurView` imported but never used | Remove import |
| `frontend/app/(auth)/login.tsx` | styles | 5 dead style definitions from a removed Google button (`googleBtn`, `googleBtnText`, `divider`, `dividerLine`, `dividerText`) | Remove dead styles |
| `frontend/app/(auth)/login.tsx` | 105 | `KeyboardAvoidingView` passes `undefined` on Android — keyboard overlaps inputs | Change to `'height'` on Android |

---

## Section 2: Auth Screens — Light Theme Polish

**Files:** `frontend/app/(auth)/login.tsx`

- **Font family fix:** Remove `fontFamily: 'Playfair Display, Georgia, serif'` from `styles.title`. React Native ignores CSS font stacks silently. The existing `fontWeight: '700'` is sufficient.
- **Android keyboard:** Change `KeyboardAvoidingView` `behavior` from `Platform.OS === 'ios' ? 'padding' : undefined` to `Platform.OS === 'ios' ? 'padding' : 'height'` so the form scrolls up when the keyboard opens on Android.
- **Dead code removal:** Remove 5 unused style definitions left over from a removed Google sign-in button.

---

## Section 3: Main App — Dark Theme Visual Refresh

**Files:** `frontend/app/(main)/_layout.tsx`, `frontend/app/(main)/mood.tsx`, `frontend/app/(main)/feedback.tsx`

### Tab bar
- **Unified accent colour:** Change `tabBarActiveTintColor` from `#6366F1` (indigo) to `#5B9BD5` (app blue). Every other interactive element in the app — CTA buttons, links, notification badges — uses `#5B9BD5`. The indigo was inconsistent.
- **Android tap targets:** Increase Android tab bar `height` from `70` → `76` and `paddingBottom` from `12` → `16` for better thumb reachability.

### Mood screen
- **RefreshControl tint:** Change from `#6366F1` to `#5B9BD5` to match the unified accent.
- **History cards:** Add `borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)'`, increase `borderRadius` to `20`, tighten vertical padding for a crisper, modern card feel.

### Feedback screen
- **History cards:** Same card treatment — `borderRadius: 20`, subtle `rgba(255,255,255,0.06)` border, improved vertical spacing.
- **Empty state:** Add a centred icon + message when feedback history is empty, replacing the blank white space.

---

## Constraints

- No screen rewrites — surgical edits only.
- No new dependencies.
- Keep both light (auth) and dark (main) themes as-is; only refine within each.
- No changes to backend or API shape.
