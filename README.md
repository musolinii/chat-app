# Chat App

A realtime, room-based chat app. Sign in with Google, join a room, and messages sync live to everyone else in that room. Built with React and Cloud Firestore; deployed on Vercel.

Live site: https://chat-app-beta-nine-55.vercel.app/

---

## Stack

| | |
|---|---|
| UI | React 18.2 |
| Build | Vite 4.3 |
| Backend | Firebase 9.23 (modular SDK) — Auth + Cloud Firestore |
| Routing | react-router-dom 6.14 |
| Styling | Plain CSS with custom properties |
| Linting | ESLint 8 + `eslint-plugin-react`, `-react-hooks`, `-react-refresh` |

No CSS framework and no component library. The whole stylesheet is one file (`src/App.css`).

---

## Getting started

```bash
npm ci
npm run dev
```

The app will fail to connect to Firebase until you point it at a project.

### Firebase configuration

`src/firebase/firebase-config.jsx` holds a hardcoded `firebaseConfig` object. Replace the values with your own project's (Firebase Console → Project settings → Your apps → SDK setup and configuration).

```js
const firebaseConfig = {
  apiKey: "...",
  authDomain: "...",
  projectId: "...",
  storageBucket: "...",
  messagingSenderId: "...",
  appId: "...",
};
```

**This config is not a secret.** Firebase web config is shipped to every visitor in the JS bundle by design. Your actual protection is Firestore security rules plus API key restrictions. Never put a service account key or admin credential in here.

### Enabling Google sign-in

Firebase Console → Authentication → Sign-in method → enable **Google**. Without this, sign-in fails with `auth/operation-not-allowed`.

---

## Firestore setup — the two things that will bite you

Both of these fail at *runtime*, not at build time. `npm run build` will pass with both missing.

### 1. Security rules

`firestore.rules` in this repo is the source of truth for what the rules *should* be. Publish it to the project via Firebase Console → Firestore Database → **Rules** tab, then **Publish**.

> **Read this before you trust a working app.** Firebase's default test ruleset is a hardcoded expiry, not an open door:
>
> ```js
> allow read, write: if request.time < timestamp.date(2024, 7, 28);
> ```
>
> That date passes, and from then on **every request is denied** — reads and writes, signed in or not. The app still loads and still looks like it works. See [The 796-day outage](#the-796-day-outage).

### 2. A composite index

The message query filters and orders in combination:

```js
query(messagesRef, where("room", "==", room), orderBy("createdAt", "desc"), limit(50))
```

That needs a composite index on **`room` (ascending) + `createdAt` (descending)**. Without it the read fails with `failed-precondition` and the browser console prints a link that creates it in one click.

Create it manually (Firestore → Indexes → Add index), or mirror `firestore.indexes.json` into the repo.

### Keeping rules in the repo

Right now the Console is authoritative and `firestore.rules` is a copy. That works, but the two can silently diverge — a CLI deploy (`firebase deploy --only firestore:rules`) overwrites whatever is in the Console. The clean setup is a `firebase.json` pointing at `firestore.rules` so `firebase deploy --only firestore:rules` is the normal path. That was deliberately not done here.

---

## Project structure

```
src/
├── App.jsx                     Auth gate, room selection, room slug + display label
├── App.css                     Entire stylesheet: tokens, layout, all components
├── main.jsx                    React root, router (single "/" route)
├── firebase/
│   └── firebase-config.jsx     initializeApp, exports auth / provider / db
├── lib/
│   └── errors.js               Firebase error code → human message
└── components/
    ├── Auth.jsx                Google sign-in
    ├── Chat.jsx                Subscription, send handler, layout shell
    ├── ChatMessage.jsx         One bubble: avatar, author, time, text
    ├── Navbar.jsx              Room name, sign out, leave room
    ├── Signout.jsx             Sign-out button + inline error
    └── TextBar.jsx             Composer: input + send button
```

---

## How it works

### Auth

`App.jsx` subscribes to `onAuthStateChanged(auth, ...)` and holds the user in state. While it resolves, it renders a loading screen. A null user renders `<Auth />`.

There is **no cookie and no page reload** involved. Firebase persists the session itself; the app just listens for it. The user is threaded down as a prop (`App → Chat → ChatMessage`) rather than read from the global `auth` object inside components, so each component's dependencies are visible in its signature.

### Reading messages

`Chat.jsx` opens one `onSnapshot` subscription per room:

```js
const q = query(messagesRef, where("room", "==", room), orderBy("createdAt", "desc"), limit(50));
const unsubscribe = onSnapshot(q, onDocs, onError);
```

Firestore returns newest-first because of the descending order; the array is reversed before rendering so the transcript reads oldest-at-top. The effect depends on `[room]` and returns `unsubscribe` as cleanup.

### Writing a message

```js
await addDoc(messagesRef, {
    text,
    createdAt: Date.now(),
    user: currentUser.displayName,
    room,                     // lowercased slug
    dp: currentUser.photoURL,
    senderEmail: currentUser.email,
});
```

### Document schema

Collection: `messages` (auto-generated document IDs).

| Field | Type | Notes |
|---|---|---|
| `text` | string | Message body, trimmed |
| `createdAt` | number | `Date.now()` — client clock. See limitations |
| `user` | string | `displayName`, purely for display |
| `room` | string | Lowercased room slug |
| `dp` | string | `photoURL`, may be null |
| `senderEmail` | string | **Security-relevant** — see below |

`senderEmail` is what distinguishes your own messages from everyone else's in the UI. It arrives in the request payload, which means any client can set it to anything — so the rules validate it against the auth token rather than trusting it. That's the whole reason that field exists rather than reusing the document ID.

---

## Code audit

Twelve defects found and fixed. Severity is about impact, not effort.

### Critical

**1. Sent/received alignment never worked.** `ChatMessage` decided ownership with `id === auth.currentUser.email`, but the reader did:

```js
messages.push({ ...doc.data(), id: doc.id });
```

The document stored `id: <email>`. The spread pulled that in, then `id: doc.id` **overwrote it** with the Firestore document ID. The comparison ran against a value that had already been destroyed, so it was always `false` and every message rendered as received. Your own messages were permanently grey.

*Fix:* store the sender as `senderEmail` and the document ID as `docId`. Using two distinct names makes the collision structurally impossible rather than merely unlikely — the original bug was not really the comparison, it was reusing one property name for two meanings.

**2. Chat froze after 50 messages.** `orderBy("createdAt")` (ascending) combined with `limit(50)` returns the **oldest** 50 documents. Once a room passed 50 messages, anything new sorted after those and was cut off by the limit — messages appeared to send but never displayed.

*Fix:* `orderBy("createdAt", "desc")` plus `limit(50)`, reversed for display.

**3. All Firestore access denied for 796 days.** See below.

### High

**4. Composer never cleared.** The input was uncontrolled — no `value` prop — so `setNewMessage("")` updated React state but left the DOM text in place. *Fix:* controlled input with `value` bound to state.

**5. Silent write failures.** `addDoc` had no `try/catch` and `onSnapshot` had no error callback. A rejected write became an unhandled promise rejection with zero user feedback. *Fix:* both wired up, with visible errors.

**6. Effect re-subscribed on every render.** `const messageRef = collection(db, "messages")` sat *inside* the component body, so it returned a fresh object each render — and it was in the `useEffect` dependency array. The effect therefore tore down and recreated the Firestore listener on every single render. The new listener fired immediately, `setMessages` got a new array reference, React re-rendered, and that re-triggered the effect. Self-sustaining. *Fix:* hoisted to module scope and dropped from the deps.

**7. Auth gated on a cookie.** `App.jsx` treated `cookies.get("auth-token")` as the auth check, and `Auth`/`Signout`/`Navbar` each forced a full page reload via `window.location.reload(false)`. The cookie held a refresh token that was never used to authenticate anything — Firebase was already persisting the session itself. It was an elaborate way to be less correct than `onAuthStateChanged`. *Fix:* deleted the cookie mechanism entirely.

**8. Array index as React key.** `key={index}` on a live-appending list. *Fix:* `key={message.docId}`.

### Medium

**9. Global CSS selectors leaked across components.** `p { border-radius: 25px; max-width: 500px; text-align: center }` applied to *every* paragraph — including error alerts, which rendered as centred chat bubbles rather than banners. `form { position: fixed; bottom: 0 }` meant any `<form>` anywhere in the app was pinned to the viewport bottom. *Fix:* every element selector replaced with classes; only `html`/`body` resets remain. 7 global rules → 2.

**10. No loading or empty states.** The chatbox rendered identically whether messages were loading or the room was genuinely empty.

**11. Room names weren't normalized.** `where("room", "==", room)` used the raw input, so `"General"`, `"general"` and `"general "` were three different rooms. *Fix:* `trim()` + `toLowerCase()` on the slug, with the original casing kept separately for display.

**12. Dead code.** Unused `setIsAuth`; commented-out leftovers in `Chat.jsx` and `ChatMessage.jsx`; unused `react-cookie` dependency; unused `src/assets/react.svg`.

### A regression worth recording

Pass 2 wrapped the room-name input in a `<form>` to make Enter submit. Because of defect 9, it immediately inherited `position: fixed` and inherited the 100px circular button styling — so fixing a small thing broke the room picker. Correct fix for the intended behaviour, wrong way to apply it. The CSS is now fully scoped, so the two can't collide again.

---

## The 796-day outage

The app looked functional but could not save a single message. `addDoc` was rejecting every write, and the old code had no `try/catch`, so each rejection was an invisible unhandled promise — no error, no feedback. The composer filled with text and nothing happened.

The root cause was one line in the Firestore rules:

```js
allow read, write: if request.time < timestamp.date(2024, 7, 28);
```

That is Firebase's default test ruleset, which ships with a hardcoded expiry. The date passed **796 days** before this was found. `request.time < deadline` is permanently `false`, so every request is denied.

Two lessons:

**An unauthenticated `403` has two very different meanings.** "This requires sign-in" and "this denies everything" look identical from outside. I read the `403 PERMISSION_DENIED` returned by an unauthenticated probe as evidence of an auth requirement, and spent the investigation downstream of that assumption. Before blaming application code for a Firebase error, establish which layer rejected it — rules, index, or client. The user-visible symptom is the same for all three.

**Renaming a field your client writes is a schema migration, not a local rename.** The `id → senderEmail` change was the prime suspect for the outage and it was innocent — the expiry broke it. But server-side rules are a contract with the client, and I changed one side of it without checking the other. A field name in a Firestore write is a cross-boundary concern the moment rules exist.

---

## Known limitations

- **`createdAt` uses the client clock** (`Date.now()`), so ordering can skew between devices with wrong times. The fix is Firestore's `serverTimestamp()` — but *not* a simple swap: it writes a `Timestamp` instead of a number, and Firestore sorts by type before value. Existing documents hold numbers, so a naive change makes old and new messages interleave incorrectly. It needs a migration or a fresh collection alongside the change.
- **Only the newest 50 messages load.** Older history is unreachable — there's no `startAfter` pagination yet.
- **Messages written before the `id → senderEmail` rename have no `senderEmail` field.** They render as received even when they were yours. A backfill script would fix them; it hasn't been written.
- **Firestore rules live only in the Console.** `firestore.rules` is a copy, and nothing prevents the two from drifting.
- **No `firestore.indexes.json`** is committed, so the required composite index isn't reproducible from the repo.
- **The bundle is one 624 kB chunk** (165 kB gzipped) — Firebase Auth and Firestore are most of it. No `manualChunks` split, so the warning Vite prints at build time is expected. Code-splitting would help if this ever mattered.
- **No test suite.** Changes were verified with lint, build, and manual exercise only.

---

## Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Dev server on port 5173 |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | ESLint. Uses `--max-warnings 0`, so warnings fail too |

Lint is currently clean (0 problems). It was at 10 problems — 9 errors, 1 warning — before this work, so if you reintroduce a `PropTypes` or unused-variable regression it will fail loudly.