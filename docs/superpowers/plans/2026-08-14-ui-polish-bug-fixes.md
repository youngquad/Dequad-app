# UI Polish & Bug Fixes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix 6 bugs (including a security leak) and apply a full visual polish to both the light auth theme and dark main-app theme, unifying the accent colour throughout.

**Architecture:** Surgical edits across 6 files — no new files, no new dependencies, no screen rewrites. All colour/spacing changes stay within each screen's existing `StyleSheet.create` block.

**Tech Stack:** React Native, Expo Router, TypeScript, expo-linear-gradient, expo-notifications

---

## File Map

| File | Changes |
|---|---|
| `frontend/src/services/api.ts` | Remove CRA env var; remove token console.log |
| `frontend/src/contexts/AuthContext.tsx` | Remove 6x debug console.log |
| `frontend/app/(main)/profile.tsx` | Fix push notification projectId |
| `frontend/app/(main)/_layout.tsx` | Remove BlurView import; unify accent colour; improve tab bar sizing |
| `frontend/app/(auth)/login.tsx` | Fix fontFamily; fix Android keyboard; remove 5 dead styles |
| `frontend/app/(main)/mood.tsx` | Unify accent colour; improve history card style |
| `frontend/app/(main)/feedback.tsx` | Unify accent colour; improve card + empty state style |

---

### Task 1: Security & Debug Fixes — api.ts

**Files:**
- Modify: `frontend/src/services/api.ts`

- [ ] **Step 1: Remove the dead CRA env var and the token console.log**

In `frontend/src/services/api.ts`, replace lines 7–11 and line 84:

```typescript
// BEFORE (lines 7-11):
const BACKEND_URL =
  process.env.REACT_APP_BACKEND_URL ||
  process.env.EXPO_PUBLIC_BACKEND_URL ||
  Constants.expoConfig?.extra?.backendUrl ||
  '';

// AFTER:
const BACKEND_URL =
  process.env.EXPO_PUBLIC_BACKEND_URL ||
  Constants.expoConfig?.extra?.backendUrl ||
  '';
```

Then remove the token log inside the `request` method (around line 84):

```typescript
// REMOVE this line entirely:
console.log(`API ${method} ${endpoint} - Token:`, authToken.substring(0, 25) + '...');
```

- [ ] **Step 2: Verify**

The `request` method should now look like:

```typescript
if (authToken) {
  headers['Authorization'] = `Bearer ${authToken}`;
}
```

No `console.log` between those two statements.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/services/api.ts
git commit -m "fix: remove CRA env var and auth token console leak"
```

---

### Task 2: Debug Console.log Cleanup — AuthContext.tsx

**Files:**
- Modify: `frontend/src/contexts/AuthContext.tsx`

- [ ] **Step 1: Remove all debug console.log statements**

There are 6 debug logs to remove. Remove these lines:

```typescript
// In processSessionId (~line 44):
console.log('Processing session_id:', sessionId);

// In processSessionId (~line 60):
console.log('Auth successful, user:', response.user.name);

// In checkExistingSession (~line 80):
console.log('Restored session for:', userData.name);

// In handleUrl (~line 109):
console.log('Parsed session_id:', sessionId);

// In the web platform block (~lines 132-133):
console.log('Web URL check - Full URL:', fullUrl);
console.log('Hash:', hash, 'Search:', search);
```

Keep all `console.error(...)` lines — those are legitimate error reporting.

- [ ] **Step 2: Commit**

```bash
git add frontend/src/contexts/AuthContext.tsx
git commit -m "fix: remove debug console.log from AuthContext"
```

---

### Task 3: Fix Push Notification ProjectId — profile.tsx

**Files:**
- Modify: `frontend/app/(main)/profile.tsx`

- [ ] **Step 1: Replace placeholder projectId**

Find this block (~line 153):

```typescript
const token = (await Notifications.getExpoPushTokenAsync({
  projectId: 'dequad-app'
})).data;
```

Replace with the real EAS project ID from `app.json`:

```typescript
const token = (await Notifications.getExpoPushTokenAsync({
  projectId: '0ad6a13c-845f-4ab4-9177-ba5031d2462d'
})).data;
```

- [ ] **Step 2: Commit**

```bash
git add frontend/app/(main)/profile.tsx
git commit -m "fix: use correct EAS projectId for push notifications"
```

---

### Task 4: Auth Screen Polish — login.tsx

**Files:**
- Modify: `frontend/app/(auth)/login.tsx`

- [ ] **Step 1: Fix Android KeyboardAvoidingView**

Find (~line 104):

```typescript
<KeyboardAvoidingView
  behavior={Platform.OS === 'ios' ? 'padding' : undefined}
  style={styles.flex}
>
```

Change to:

```typescript
<KeyboardAvoidingView
  behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
  style={styles.flex}
>
```

- [ ] **Step 2: Remove invalid fontFamily from styles.title**

Find in `StyleSheet.create`:

```typescript
title: {
  color: '#0F2942', fontSize: 36, fontWeight: '700',
  fontFamily: 'Playfair Display, Georgia, serif',
  lineHeight: 42, marginBottom: 14, letterSpacing: -0.5,
},
```

Replace with:

```typescript
title: {
  color: '#0F2942', fontSize: 36, fontWeight: '700',
  lineHeight: 42, marginBottom: 14, letterSpacing: -0.5,
},
```

- [ ] **Step 3: Remove 5 dead style definitions**

Remove these entire style entries from `StyleSheet.create` (they reference a Google button that no longer exists in the JSX):

```typescript
// DELETE all of these:
googleBtn: {
  flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
  backgroundColor: '#0F2942', paddingVertical: 14, borderRadius: 999, minHeight: 52,
},
googleBtnText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700', letterSpacing: 0.4 },
divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 18 },
dividerLine: { flex: 1, height: 1, backgroundColor: '#DDE8F2' },
dividerText: {
  color: '#4F6076', fontSize: 11, marginHorizontal: 12,
  fontWeight: '600', letterSpacing: 1.6, textTransform: 'uppercase',
},
```

- [ ] **Step 4: Commit**

```bash
git add frontend/app/(auth)/login.tsx
git commit -m "fix: repair Android keyboard, remove dead styles and invalid fontFamily in login"
```

---

### Task 5: Tab Bar Visual Refresh — _layout.tsx

**Files:**
- Modify: `frontend/app/(main)/_layout.tsx`

- [ ] **Step 1: Remove unused BlurView import**

Find at the top of the file:

```typescript
import { BlurView } from 'expo-blur';
```

Delete that line entirely.

- [ ] **Step 2: Unify accent colour**

Find in `screenOptions`:

```typescript
tabBarActiveTintColor: '#6366F1',
```

Change to:

```typescript
tabBarActiveTintColor: '#5B9BD5',
```

- [ ] **Step 3: Improve Android tab bar sizing**

Find in `StyleSheet.create`:

```typescript
tabBar: {
  backgroundColor: 'rgba(15, 23, 42, 0.95)',
  borderTopWidth: 1,
  borderTopColor: 'rgba(148, 163, 184, 0.1)',
  paddingTop: 8,
  paddingBottom: Platform.OS === 'ios' ? 24 : 12,
  height: Platform.OS === 'ios' ? 88 : 70,
  position: 'absolute',
  elevation: 0,
},
```

Replace with:

```typescript
tabBar: {
  backgroundColor: 'rgba(15, 23, 42, 0.95)',
  borderTopWidth: 1,
  borderTopColor: 'rgba(148, 163, 184, 0.1)',
  paddingTop: 8,
  paddingBottom: Platform.OS === 'ios' ? 24 : 16,
  height: Platform.OS === 'ios' ? 88 : 76,
  position: 'absolute',
  elevation: 0,
},
```

- [ ] **Step 4: Commit**

```bash
git add frontend/app/(main)/_layout.tsx
git commit -m "fix: remove BlurView import; unify tab accent to blue; improve Android tap targets"
```

---

### Task 6: Mood Screen Visual Refresh — mood.tsx

**Files:**
- Modify: `frontend/app/(main)/mood.tsx`

- [ ] **Step 1: Fix RefreshControl tint colour**

Find (~line 259):

```typescript
tintColor="#6366F1"
```

Change to:

```typescript
tintColor="#5B9BD5"
```

- [ ] **Step 2: Update submit button gradient to app blue**

Find (~line 359):

```typescript
colors={selectedMood ? ['#6366F1', '#8B5CF6'] : ['#374151', '#4B5563']}
```

Change to:

```typescript
colors={selectedMood ? ['#5B9BD5', '#4A90C2'] : ['#374151', '#4B5563']}
```

- [ ] **Step 3: Update "View All" link colour**

Find in `StyleSheet.create`:

```typescript
viewAllText: {
  fontSize: 14,
  color: '#6366F1',
  fontWeight: '600',
},
```

Change to:

```typescript
viewAllText: {
  fontSize: 14,
  color: '#5B9BD5',
  fontWeight: '600',
},
```

- [ ] **Step 4: Polish history card style**

Find in `StyleSheet.create`:

```typescript
historyItem: {
  flexDirection: 'row',
  backgroundColor: 'rgba(30, 41, 59, 0.6)',
  borderRadius: 16,
  padding: 14,
  marginBottom: 10,
  borderWidth: 1,
  borderColor: 'rgba(148, 163, 184, 0.08)',
},
```

Replace with:

```typescript
historyItem: {
  flexDirection: 'row',
  backgroundColor: 'rgba(30, 41, 59, 0.7)',
  borderRadius: 20,
  padding: 16,
  marginBottom: 12,
  borderWidth: 1,
  borderColor: 'rgba(255, 255, 255, 0.06)',
},
```

- [ ] **Step 5: Update mood badge to use app blue tint**

Find in `StyleSheet.create`:

```typescript
moodBadge: {
  backgroundColor: 'rgba(99, 102, 241, 0.15)',
  paddingHorizontal: 8,
  paddingVertical: 3,
  borderRadius: 8,
},
```

Replace with:

```typescript
moodBadge: {
  backgroundColor: 'rgba(91, 155, 213, 0.15)',
  paddingHorizontal: 8,
  paddingVertical: 3,
  borderRadius: 8,
},
```

- [ ] **Step 6: Commit**

```bash
git add frontend/app/(main)/mood.tsx
git commit -m "polish: unify mood screen accent to blue; refine history card style"
```

---

### Task 7: Feedback Screen Visual Refresh — feedback.tsx

**Files:**
- Modify: `frontend/app/(main)/feedback.tsx`

- [ ] **Step 1: Update header icon colour**

Find in JSX (~line 136):

```typescript
<Ionicons name="chatbox-ellipses" size={32} color="#6366F1" />
```

Change to:

```typescript
<Ionicons name="chatbox-ellipses" size={32} color="#5B9BD5" />
```

- [ ] **Step 2: Update info box icon colour**

Find in JSX (~line 215):

```typescript
<Ionicons name="information-circle" size={20} color="#6366F1" />
```

Change to:

```typescript
<Ionicons name="information-circle" size={20} color="#5B9BD5" />
```

- [ ] **Step 3: Update loading spinner colour**

Find (~line 226):

```typescript
<ActivityIndicator color="#6366F1" style={{ marginTop: 20 }} />
```

Change to:

```typescript
<ActivityIndicator color="#5B9BD5" style={{ marginTop: 20 }} />
```

- [ ] **Step 4: Update styles — header card, submit button, info box, history card, empty state**

Find and update each style in `StyleSheet.create`:

```typescript
// headerCard — change tint from indigo to blue:
headerCard: {
  backgroundColor: 'rgba(91, 155, 213, 0.1)',  // was rgba(99, 102, 241, 0.1)
  borderRadius: 16,
  padding: 20,
  alignItems: 'center',
  marginBottom: 24,
},

// submitButton — change from indigo to blue:
submitButton: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: '#5B9BD5',  // was #6366F1
  paddingVertical: 16,
  borderRadius: 12,
  gap: 8,
},

// infoBox — change tint from indigo to blue:
infoBox: {
  flexDirection: 'row',
  alignItems: 'flex-start',
  backgroundColor: 'rgba(91, 155, 213, 0.1)',  // was rgba(99, 102, 241, 0.1)
  borderRadius: 12,
  padding: 16,
  marginBottom: 24,
},

// historyItem — rounder corners, stronger contrast, blue tint on badge:
historyItem: {
  backgroundColor: 'rgba(255, 255, 255, 0.06)',  // was 0.05
  borderRadius: 20,                               // was 12
  padding: 16,
  marginBottom: 12,
  borderWidth: 1,
  borderColor: 'rgba(255, 255, 255, 0.06)',
},

// emptyState — rounder corners:
emptyState: {
  alignItems: 'center',
  paddingVertical: 32,
  backgroundColor: 'rgba(255, 255, 255, 0.03)',
  borderRadius: 20,  // was 12
},
```

- [ ] **Step 5: Commit**

```bash
git add frontend/app/(main)/feedback.tsx
git commit -m "polish: unify feedback screen accent to blue; refine card and empty state style"
```

---

### Task 8: Final Verification

- [ ] **Step 1: Start the dev server**

```bash
cd frontend && npx expo start
```

- [ ] **Step 2: Open on Android (press `a`) or web (press `w`) and verify**

Check list:
- [ ] Login screen: keyboard lifts the form on Android when typing in password field
- [ ] Login screen: title still renders bold without the invalid fontFamily
- [ ] Main app: active tab icon is blue (`#5B9BD5`), not indigo
- [ ] Main app: Android tab bar is tall enough to tap comfortably (76px height)
- [ ] Mood screen: pull-to-refresh spinner is blue
- [ ] Mood screen: "Log My Mood" button gradient is blue
- [ ] Mood screen: history cards have rounded corners and subtle border
- [ ] Feedback screen: submit button is blue; header/info icons are blue
- [ ] Feedback screen: history cards have rounded corners
- [ ] No console.log output visible for auth token or session info in browser devtools

- [ ] **Step 3: Push to remote**

```bash
git push origin main
```
